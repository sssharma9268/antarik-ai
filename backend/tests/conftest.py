import os
import tempfile

# Must be set before the app (and its engine) is imported
_db_file = os.path.join(tempfile.mkdtemp(), "test.db")
os.environ["DATABASE_URL"] = f"sqlite+aiosqlite:///{_db_file}"
os.environ["JWT_SECRET"] = "test-secret"

import httpx  # noqa: E402
import pytest  # noqa: E402

from app.db import Base, engine, init_db  # noqa: E402
from app.main import app  # noqa: E402


@pytest.fixture
async def client():
    await init_db()
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app), base_url="http://test"
    ) as c:
        yield c
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()  # each test runs on its own event loop; don't reuse pooled connections


@pytest.fixture
async def auth_headers(client):
    r = await client.post(
        "/api/auth/register",
        json={
            "org_name": "Test Bank",
            "full_name": "Asha Rao",
            "email": "asha@testbank.in",
            "password": "supersecret1",
        },
    )
    assert r.status_code == 201, r.text
    return {"Authorization": f"Bearer {r.json()['access_token']}"}
