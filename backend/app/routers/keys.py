import uuid

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select

from app.deps import DB, CurrentUser
from app.models import ApiKey, AuditLog
from app.schemas import ApiKeyCreatedOut, ApiKeyCreateIn, ApiKeyOut
from app.security import generate_api_key

router = APIRouter(prefix="/keys", tags=["api-keys"])


def _out(k: ApiKey) -> dict:
    return dict(
        id=k.id,
        name=k.name,
        prefix=k.prefix,
        revoked=k.revoked,
        last_used_at=k.last_used_at,
        created_at=k.created_at,
    )


@router.get("", response_model=list[ApiKeyOut])
async def list_keys(user: CurrentUser, db: DB):
    rows = await db.scalars(
        select(ApiKey).where(ApiKey.user_id == user.id).order_by(ApiKey.created_at.desc())
    )
    return [ApiKeyOut(**_out(k)) for k in rows]


@router.post("", response_model=ApiKeyCreatedOut, status_code=201)
async def create_key(body: ApiKeyCreateIn, user: CurrentUser, db: DB):
    full, prefix, key_hash = generate_api_key()
    key = ApiKey(user_id=user.id, team_id=user.team_id, name=body.name, prefix=prefix, key_hash=key_hash)
    db.add(key)
    await db.flush()
    db.add(AuditLog(org_id=user.org_id, actor_user_id=user.id, action="api_key.created", target=prefix))
    await db.commit()
    return ApiKeyCreatedOut(**_out(key), key=full)


@router.delete("/{key_id}", status_code=204)
async def revoke_key(key_id: uuid.UUID, user: CurrentUser, db: DB):
    key = await db.get(ApiKey, key_id)
    if not key or key.user_id != user.id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Key not found")
    key.revoked = True
    db.add(AuditLog(org_id=user.org_id, actor_user_id=user.id, action="api_key.revoked", target=key.prefix))
    await db.commit()
