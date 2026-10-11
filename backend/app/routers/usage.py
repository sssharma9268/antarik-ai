from fastapi import APIRouter
from sqlalchemy import func, select

from app.deps import DB, CurrentUser
from app.models import UsageRecord
from app.schemas import UsageByModel, UsageSummaryOut
from app.services.metering import month_start

router = APIRouter(prefix="/usage", tags=["usage"])


@router.get("/summary", response_model=UsageSummaryOut)
async def summary(user: CurrentUser, db: DB):
    """This month's usage for the caller's organization. Admin-level breakdowns
    by team / cost center for chargeback come next."""
    start = month_start()
    base = (UsageRecord.org_id == user.org_id, UsageRecord.created_at >= start)

    totals = (
        await db.execute(
            select(
                func.count(),
                func.coalesce(func.sum(UsageRecord.prompt_tokens), 0),
                func.coalesce(func.sum(UsageRecord.completion_tokens), 0),
                func.avg(UsageRecord.latency_ms),
            ).where(*base)
        )
    ).one()

    by_model = (
        await db.execute(
            select(
                UsageRecord.served_model,
                func.count(),
                func.coalesce(func.sum(UsageRecord.prompt_tokens), 0),
                func.coalesce(func.sum(UsageRecord.completion_tokens), 0),
            )
            .where(*base)
            .group_by(UsageRecord.served_model)
        )
    ).all()

    return UsageSummaryOut(
        period_start=start,
        requests=totals[0],
        prompt_tokens=totals[1],
        completion_tokens=totals[2],
        avg_latency_ms=float(totals[3]) if totals[3] is not None else None,
        by_model=[
            UsageByModel(model=m, requests=n, prompt_tokens=p, completion_tokens=c)
            for m, n, p, c in by_model
        ],
    )
