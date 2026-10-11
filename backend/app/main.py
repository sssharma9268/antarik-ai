from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.db import init_db
from app.routers import auth, gateway, keys, usage


@asynccontextmanager
async def lifespan(_: FastAPI):
    await init_db()
    yield


settings = get_settings()
app = FastAPI(title=f"{settings.app_name} API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["x-antarik-route"],
)

# Console API (used by the React app)
app.include_router(auth.router, prefix="/api")
app.include_router(keys.router, prefix="/api")
app.include_router(usage.router, prefix="/api")
# OpenAI-compatible gateway (used by apps, SDKs, IDE plugins)
app.include_router(gateway.router)


@app.get("/health", tags=["ops"])
async def health():
    return {"status": "ok"}
