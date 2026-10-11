"""OpenAI-compatible inference gateway: /v1/models and /v1/chat/completions.

Existing apps switch to Antarik by changing base_url and api_key — nothing else.
"""

import asyncio
import time

import httpx
from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse, StreamingResponse

from app.config import get_settings
from app.db import SessionLocal
from app.deps import DB, GatewayPrincipal
from app.services import metering, upstream
from app.services.model_router import AUTO_MODEL, route

router = APIRouter(prefix="/v1", tags=["openai-compatible"])


@router.get("/models")
async def list_models(_: GatewayPrincipal):
    names = [AUTO_MODEL, *get_settings().model_map.keys()]
    return {
        "object": "list",
        "data": [{"id": n, "object": "model", "owned_by": "antarik"} for n in names],
    }


@router.post("/chat/completions")
async def chat_completions(request: Request, principal: GatewayPrincipal, db: DB):
    user, key = principal
    body = await request.json()
    requested = body.get("model") or AUTO_MODEL
    messages = body.get("messages") or []
    if not messages:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "`messages` is required")

    model_map = get_settings().model_map
    if requested != AUTO_MODEL and requested not in model_map:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Unknown model '{requested}'")

    if msg := await metering.check_quota(db, key.team_id if key else user.team_id):
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, msg)

    r = route(requested, messages, set(model_map))
    upstream_body = {**body, "model": model_map[r.model]}
    meter = dict(user=user, key=key, requested_model=requested, served_model=r.model, route_reason=r.reason)
    started = time.perf_counter()

    if not body.get("stream"):
        try:
            data = await upstream.chat_completion(upstream_body)
        except httpx.HTTPError as e:
            await metering.record_usage(
                db, **meter, prompt_tokens=0, completion_tokens=0, ttft_ms=None,
                latency_ms=_ms(started), status="error",
            )
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, f"Upstream error: {e}") from e
        usage = data.get("usage") or {}
        await metering.record_usage(
            db, **meter,
            prompt_tokens=usage.get("prompt_tokens", 0),
            completion_tokens=usage.get("completion_tokens", 0),
            ttft_ms=None, latency_ms=_ms(started), status="ok",
        )
        data["model"] = r.model  # report the public name, not the upstream id
        return JSONResponse(data, headers={"x-antarik-route": r.reason})

    async def event_stream():
        stats = upstream.StreamStats()
        ttft: int | None = None
        outcome = "client_disconnected"  # overwritten if the stream finishes or fails
        try:
            async for line in upstream.chat_completion_stream(upstream_body, stats):
                if ttft is None and stats.chunks:
                    ttft = _ms(started)
                yield line
            outcome = "ok"
        except httpx.HTTPError:
            outcome = "error"
            yield b'data: {"error": {"message": "upstream error"}}\n\n'
        finally:
            prompt, completion = stats.prompt_tokens, stats.completion_tokens
            if not stats.got_usage:  # upstream gave no usage block: approximate
                completion = stats.chunks
                prompt = sum(len(str(m.get("content", ""))) for m in messages) // 4

            async def _save():
                async with SessionLocal() as s:
                    await metering.record_usage(
                        s, **meter, prompt_tokens=prompt, completion_tokens=completion,
                        ttft_ms=ttft, latency_ms=_ms(started), status=outcome,
                    )

            # shield so the record is written even if the client disconnected mid-stream
            try:
                await asyncio.shield(asyncio.ensure_future(_save()))
            except asyncio.CancelledError:
                pass

    return StreamingResponse(
        event_stream(), media_type="text/event-stream", headers={"x-antarik-route": r.reason}
    )


def _ms(started: float) -> int:
    return int((time.perf_counter() - started) * 1000)
