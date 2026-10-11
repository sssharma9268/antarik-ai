from sqlalchemy import text

from app.db import engine
from app.routers import gateway

CANARY = "CANARY-7f3e-do-not-store"


async def fake_completion(body):
    return {
        "id": "x",
        "object": "chat.completion",
        "model": body["model"],
        "choices": [{"index": 0, "message": {"role": "assistant", "content": "namaste " + CANARY}}],
        "usage": {"prompt_tokens": 12, "completion_tokens": 5, "total_tokens": 17},
    }


async def test_register_me_and_keys(client, auth_headers):
    me = await client.get("/api/auth/me", headers=auth_headers)
    assert me.json()["role"] == "owner"

    created = await client.post("/api/keys", json={"name": "ci"}, headers=auth_headers)
    assert created.status_code == 201
    assert created.json()["key"].startswith("ak_live_")

    keys = await client.get("/api/keys", headers=auth_headers)
    assert len(keys.json()) == 1 and "key" not in keys.json()[0]


async def test_chat_with_api_key_is_metered_and_content_not_stored(client, auth_headers, monkeypatch):
    monkeypatch.setattr(gateway.upstream, "chat_completion", fake_completion)
    key = (await client.post("/api/keys", json={"name": "app"}, headers=auth_headers)).json()["key"]

    r = await client.post(
        "/v1/chat/completions",
        headers={"Authorization": f"Bearer {key}"},
        json={"model": "antarik-auto", "messages": [{"role": "user", "content": "hello " + CANARY}]},
    )
    assert r.status_code == 200, r.text
    assert r.json()["model"] == "antarik-fast"
    assert r.headers["x-antarik-route"] == "auto:default-fast"

    summary = (await client.get("/api/usage/summary", headers=auth_headers)).json()
    assert summary["requests"] == 1
    assert summary["prompt_tokens"] == 12 and summary["completion_tokens"] == 5

    # Canary: the prompt/response text must not appear in any table
    async with engine.connect() as conn:
        tables = [r[0] for r in await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table'"))]
        for t in tables:
            for row in await conn.execute(text(f'SELECT * FROM "{t}"')):
                assert CANARY not in " ".join(map(str, row)), f"content leaked into {t}"


async def test_bad_key_rejected(client):
    r = await client.post(
        "/v1/chat/completions",
        headers={"Authorization": "Bearer ak_live_nope"},
        json={"messages": [{"role": "user", "content": "hi"}]},
    )
    assert r.status_code == 401
