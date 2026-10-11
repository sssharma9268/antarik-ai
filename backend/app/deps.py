from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.models import ApiKey, User
from app.security import API_KEY_PREFIX, decode_access_token, hash_api_key

DB = Annotated[AsyncSession, Depends(get_db)]


def _bearer(authorization: str | None) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Missing bearer token")
    return authorization.split(" ", 1)[1].strip()


async def current_user(db: DB, authorization: Annotated[str | None, Header()] = None) -> User:
    """Console auth: JWT issued by /auth/login."""
    user_id = decode_access_token(_bearer(authorization))
    user = await db.get(User, _as_uuid(user_id)) if user_id else None
    if not user or not user.is_active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired session")
    return user


async def api_key_principal(
    db: DB, authorization: Annotated[str | None, Header()] = None
) -> tuple[User, ApiKey | None]:
    """Gateway auth: an API key (ak_live_...) or, for the web playground, a console JWT."""
    token = _bearer(authorization)
    if token.startswith(API_KEY_PREFIX):
        key = await db.scalar(select(ApiKey).where(ApiKey.key_hash == hash_api_key(token)))
        if not key or key.revoked:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid API key")
        user = await db.get(User, key.user_id)
        if not user or not user.is_active:
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Key owner is inactive")
        key.last_used_at = datetime.now(timezone.utc)
        await db.commit()
        return user, key
    return await current_user(db, authorization), None


def _as_uuid(value: str):
    import uuid

    try:
        return uuid.UUID(value)
    except (ValueError, TypeError):
        return None


CurrentUser = Annotated[User, Depends(current_user)]
GatewayPrincipal = Annotated[tuple[User, ApiKey | None], Depends(api_key_principal)]
