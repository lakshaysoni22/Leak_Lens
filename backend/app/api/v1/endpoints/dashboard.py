"""Dashboard overview endpoint."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.assessment import Assessment
from app.models.user import User

router = APIRouter()


@router.get("/overview")
async def get_overview(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    uid = current_user.id

    # Total assessments
    total_res = await db.execute(select(func.count(Assessment.id)).where(Assessment.user_id == uid))
    total = total_res.scalar() or 0

    # By risk level
    dist_res = await db.execute(
        select(Assessment.risk_level, func.count(Assessment.id))
        .where(Assessment.user_id == uid)
        .group_by(Assessment.risk_level)
    )
    dist: dict[str, int] = {row[0]: row[1] for row in dist_res.fetchall()}

    # This week
    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    week_res = await db.execute(
        select(func.count(Assessment.id))
        .where(Assessment.user_id == uid, Assessment.created_at >= week_ago)
    )
    this_week = week_res.scalar() or 0

    # Recent 5
    recent_res = await db.execute(
        select(Assessment).where(Assessment.user_id == uid).order_by(desc(Assessment.created_at)).limit(5)
    )
    recent = recent_res.scalars().all()

    # Scan type breakdown (single query)
    type_res = await db.execute(
        select(Assessment.scan_type, func.count(Assessment.id))
        .where(Assessment.user_id == uid)
        .group_by(Assessment.scan_type)
    )
    type_counts: dict[str, int] = {row[0]: row[1] for row in type_res.fetchall()}

    # Trend data — daily counts for last 30 days (single query)
    thirty_days_ago = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=29)
    trend_res = await db.execute(
        select(
            func.date(Assessment.created_at).label("day"),
            func.count(Assessment.id).label("cnt"),
        )
        .where(Assessment.user_id == uid, Assessment.created_at >= thirty_days_ago)
        .group_by(func.date(Assessment.created_at))
    )
    day_counts: dict[str, int] = {str(row[0]): row[1] for row in trend_res.fetchall()}

    trend: list[dict[str, Any]] = []
    for i in range(29, -1, -1):
        day = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=i)
        day_key = day.strftime("%Y-%m-%d")
        trend.append({"date": day.strftime("%m/%d"), "scans": day_counts.get(day_key, 0)})

    return {
        "user": {
            "full_name": current_user.full_name or current_user.username,
            "email": current_user.email,
            "role": current_user.role,
            "is_verified": current_user.is_verified,
        },
        "stats": {
            "total_assessments": total,
            "this_week": this_week,
            "high_risk": dist.get("high", 0),
            "critical_risk": dist.get("critical", 0),
            "monitored_identifiers": total,
            "active_alerts": dist.get("critical", 0),
        },
        "risk_distribution": {
            "low": dist.get("low", 0),
            "medium": dist.get("medium", 0),
            "high": dist.get("high", 0),
            "critical": dist.get("critical", 0),
        },
        "trend": trend,
        "scan_type_breakdown": type_counts,
        "recent_assessments": [
            {
                "id": str(a.id),
                "scan_type": a.scan_type,
                "identifier_hint": a.identifier_hint,
                "risk_score": a.risk_score,
                "risk_level": a.risk_level,
                "created_at": a.created_at.isoformat(),
            }
            for a in recent
        ],
    }
