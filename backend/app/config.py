from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = "Antarik AI"
    database_url: str = "postgresql+asyncpg://antarik:antarik@localhost:5432/antarik"

    jwt_secret: str = "change-me"
    jwt_expire_minutes: int = 720

    upstream_base_url: str = "http://localhost:11434/v1"
    upstream_api_key: str = "not-needed"
    upstream_timeout_seconds: float = 300.0

    # Public model name -> upstream model id
    model_map: dict[str, str] = {
        "antarik-fast": "llama3.2:3b",
        "antarik-reason": "qwen2.5:14b",
        "antarik-code": "qwen2.5-coder:7b",
    }

    cors_origins: list[str] = ["http://localhost:5173"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
