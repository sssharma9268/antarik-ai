"""Client for the upstream inference server (vLLM / SGLang / TGI / Ollama — anything OpenAI-compatible)."""

import json
from collections.abc import AsyncIterator
from dataclasses import dataclass, field

import httpx

from app.config import get_settings


@dataclass
class StreamStats:
    prompt_tokens: int = 0
    completion_tokens: int = 0
    chunks: int = 0
    got_usage: bool = False
    extra: dict = field(default_factory=dict)


def _client() -> httpx.AsyncClient:
    s = get_settings()
    return httpx.AsyncClient(
        base_url=s.upstream_base_url,
        headers={"Authorization": f"Bearer {s.upstream_api_key}"},
        timeout=httpx.Timeout(s.upstream_timeout_seconds, connect=10.0),
    )


async def chat_completion(body: dict) -> dict:
    async with _client() as client:
        r = await client.post("/chat/completions", json=body)
        r.raise_for_status()
        return r.json()


async def chat_completion_stream(body: dict, stats: StreamStats) -> AsyncIterator[bytes]:
    """Yields raw SSE lines from upstream, updating `stats` as usage arrives."""
    body = {**body, "stream": True, "stream_options": {"include_usage": True}}
    async with _client() as client:
        async with client.stream("POST", "/chat/completions", json=body) as r:
            r.raise_for_status()
            async for line in r.aiter_lines():
                if not line:
                    continue
                if line.startswith("data: ") and line != "data: [DONE]":
                    try:
                        chunk = json.loads(line[6:])
                    except json.JSONDecodeError:
                        chunk = {}
                    if chunk.get("choices"):
                        stats.chunks += 1
                    usage = chunk.get("usage")
                    if usage:
                        stats.prompt_tokens = usage.get("prompt_tokens", 0)
                        stats.completion_tokens = usage.get("completion_tokens", 0)
                        stats.got_usage = True
                yield (line + "\n\n").encode()


async def list_upstream_models() -> list[str]:
    async with _client() as client:
        r = await client.get("/models")
        r.raise_for_status()
        return [m["id"] for m in r.json().get("data", [])]
