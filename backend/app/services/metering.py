"""Token metering, quotas and chargeback.

Every request writes exactly one UsageRecord — including failures and client disconnects,
so abandoned streams are not silently free. No prompt or completion text is ever stored.
"""

from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import ApiKey, Team, UsageRecord, User


def month_start(now: datetime | None = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


async def team_tokens_this_month(db: AsyncSession, team_id) -> int:
    total = await db.scalar(
        select(
            func.coalesce(func.sum(UsageRecord.prompt_tokens + UsageRecord.completion_tokens), 0)
        ).where(UsageRecord.team_id == team_id, UsageRecord.created_at >= month_start())
    )
    return int(total or 0)


async def check_quota(db: AsyncSession, team_id) -> str | None:
    """Returns an error message if the team is over its monthly budget, else None."""
    team = await db.get(Team, team_id)
    if team is None or team.monthly_token_quota is None:
        return None
    used = await team_tokens_this_month(db, team_id)
    if used >= team.monthly_token_quota:
        return f"Team '{team.name}' has used its monthly token quota ({team.monthly_token_quota:,})."
    return None


async def record_usage(
    db: AsyncSession,
    *,
    user: User,
    key: ApiKey | None,
    requested_model: str,
    served_model: str,
    route_reason: str,
    prompt_tokens: int,
    completion_tokens: int,
    ttft_ms: int | None,
    latency_ms: int,
    status: str,
) -> None:
    db.add(
        UsageRecord(
            org_id=user.org_id,
            team_id=key.team_id if key else user.team_id,
            user_id=user.id,
            api_key_id=key.id if key else None,
            requested_model=requested_model,
            served_model=served_model,
            route_reason=route_reason,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            ttft_ms=ttft_ms,
            latency_ms=latency_ms,
            status=status,
        )
    )
    await db.commit()
