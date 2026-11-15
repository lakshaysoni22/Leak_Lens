"""Scanner endpoints — email, username, history."""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.core.security import hmac_hash
from app.models.assessment import Assessment
from app.models.notification import Notification
from app.models.user import User
from app.schemas.assessment import EmailScanRequest, ScanResponse, UsernameScanRequest
from app.utils.synthetic_data import SYNTHETIC_DATA_NOTICE, get_synthetic_email_result, get_synthetic_username_result

router = APIRouter()


def _mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    masked_local = local[:2] + "***" if len(local) > 2 else local[0] + "***"
    return f"{masked_local}@{domain}"


def _mask_username(username: str) -> str:
    return username[:2] + "***" if len(username) > 2 else username[0] + "***"


def _build_exposure_records(breaches: list[dict[str, Any]]) -> list[dict[str, Any]]:
    return [
        {
            "source_name": b["name"],
            "source_date": b.get("date"),
            "data_categories": b.get("data_categories", []),
            "severity": b.get("severity", "medium"),
            "is_verified": False,
            "data_source_type": "synthetic",
        }
        for b in breaches
    ]


def _build_risk_factors(result: dict[str, Any]) -> list[dict[str, Any]]:
    count = result["exposure_count"]
    level = result["risk_level"]
    score = result["risk_score"]
    high = level in ("high", "critical")
    return [
        {"name": "Exposure Frequency", "weight": 0.25,
         "score": min(100.0, count * 20), "contribution": min(25.0, count * 5.0),
         "explanation": f"{count} exposure record(s) found in synthetic dataset"},
        {"name": "Incident Count", "weight": 0.20,
         "score": min(100.0, count * 25), "contribution": min(20.0, count * 5.0),
         "explanation": f"Total of {count} synthetic incident(s) factored into score"},
        {"name": "Data Categories", "weight": 0.20,
         "score": 65.0 if count > 0 else 0.0, "contribution": 13.0 if count > 0 else 0.0,
         "explanation": "Sensitive data categories detected in synthetic records"},
        {"name": "Threat Severity", "weight": 0.20,
         "score": 80.0 if high else 40.0, "contribution": 16.0 if high else 8.0,
         "explanation": "Based on synthetic breach severity classifications"},
        {"name": "Recency", "weight": 0.10,
         "score": 70.0, "contribution": 7.0,
         "explanation": "Recent synthetic exposure indicators present"},
        {"name": "Exposure Indicators", "weight": 0.05,
         "score": 50.0 if count > 0 else 0.0, "contribution": 2.5 if count > 0 else 0.0,
         "explanation": "Additional synthetic exposure indicators"},
    ]


# ---------------------------------------------------------------------------
# Email scan
# ---------------------------------------------------------------------------
@router.post("/email")
async def scan_email(
    data: EmailScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    id_hash = hmac_hash(data.email)
    hint = _mask_email(data.email)

    result = get_synthetic_email_result(id_hash, data.email)

    assessment = Assessment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        scan_type="email",
        identifier_hash=id_hash,
        identifier_hint=hint,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        exposure_count=result["exposure_count"],
        data_source="synthetic",
        summary=f"Synthetic email assessment — risk level: {result['risk_level'].upper()}",
        recommendations=result["recommendations"],
        raw_result={"breaches": result["breaches"], "is_synthetic": True},
        is_demo=False,
    )
    db.add(assessment)

    # Auto-create notification
    notif = Notification(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title="Email Scan Complete",
        message=f"Email scan found {result['exposure_count']} exposure(s) — risk level: {result['risk_level'].upper()}",
        notification_type="alert" if result["risk_level"] in ("high", "critical") else "info",
        category="scan_result",
        action_url="/app/exposure-history",
    )
    db.add(notif)

    await db.commit()
    await db.refresh(assessment)

    return {
        "assessment_id": str(assessment.id),
        "scan_type": "email",
        "identifier_hint": hint,
        "risk_score": result["risk_score"],
        "risk_level": result["risk_level"],
        "exposure_count": result["exposure_count"],
        "data_source": "synthetic",
        "data_notice": SYNTHETIC_DATA_NOTICE,
        "summary": assessment.summary,
        "exposure_records": _build_exposure_records(result["breaches"]),
        "risk_factors": _build_risk_factors(result),
        "recommendations": result["recommendations"],
        "is_demo": False,
        "created_at": assessment.created_at.isoformat(),
    }


# ---------------------------------------------------------------------------
# Username scan
# ---------------------------------------------------------------------------
@router.post("/username")
async def scan_username(
    data: UsernameScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    id_hash = hmac_hash(data.username)
    hint = _mask_username(data.username)

    result = get_synthetic_username_result(id_hash, data.username)

    assessment = Assessment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        scan_type="username",
        identifier_hash=id_hash,
        identifier_hint=hint,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        exposure_count=result["exposure_count"],
        data_source="synthetic",
        summary=f"Synthetic username assessment — risk level: {result['risk_level'].upper()}",
        recommendations=result["recommendations"],
        raw_result={"breaches": result["breaches"], "platform_mentions": result.get("platform_mentions", []), "is_synthetic": True},
        is_demo=False,
    )
    db.add(assessment)

    # Auto-create notification
    notif = Notification(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title=f"Username Scan Complete",
        message=f"Username scan found {result['exposure_count']} exposure(s) — risk level: {result['risk_level'].upper()}",
        notification_type="alert" if result["risk_level"] in ("high", "critical") else "info",
        category="scan_result",
        action_url="/app/exposure-history",
    )
    db.add(notif)

    await db.commit()
    await db.refresh(assessment)

    return {
        "assessment_id": str(assessment.id),
        "scan_type": "username",
        "identifier_hint": hint,
        "risk_score": result["risk_score"],
        "risk_level": result["risk_level"],
        "exposure_count": result["exposure_count"],
        "platform_mentions": result.get("platform_mentions", []),
        "data_source": "synthetic",
        "data_notice": SYNTHETIC_DATA_NOTICE,
        "summary": assessment.summary,
        "exposure_records": _build_exposure_records(result["breaches"]),
        "risk_factors": _build_risk_factors(result),
        "recommendations": result["recommendations"],
        "is_demo": False,
        "created_at": assessment.created_at.isoformat(),
    }


# ---------------------------------------------------------------------------
# History
# ---------------------------------------------------------------------------
@router.get("/history")
async def scan_history(
    page: int = 1,
    per_page: int = 20,
    scan_type: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    query = (
        select(Assessment)
        .where(Assessment.user_id == current_user.id)
        .order_by(desc(Assessment.created_at))
    )
    if scan_type:
        query = query.where(Assessment.scan_type == scan_type)

    count_res = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_res.scalar() or 0

    offset = (page - 1) * per_page
    res = await db.execute(query.offset(offset).limit(per_page))
    items = res.scalars().all()

    return {
        "items": [
            {
                "id": str(a.id),
                "scan_type": a.scan_type,
                "identifier_hint": a.identifier_hint,
                "risk_score": a.risk_score,
                "risk_level": a.risk_level,
                "exposure_count": a.exposure_count,
                "data_source": a.data_source,
                "summary": a.summary,
                "created_at": a.created_at.isoformat(),
            }
            for a in items
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page,
    }


# ---------------------------------------------------------------------------
# Single assessment detail
# ---------------------------------------------------------------------------
@router.get("/{assessment_id}")
async def get_assessment(
    assessment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(Assessment).where(
            Assessment.id == assessment_id,
            Assessment.user_id == current_user.id,
        )
    )
    assessment = res.scalar_one_or_none()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return {
        "id": str(assessment.id),
        "scan_type": assessment.scan_type,
        "identifier_hint": assessment.identifier_hint,
        "risk_score": assessment.risk_score,
        "risk_level": assessment.risk_level,
        "exposure_count": assessment.exposure_count,
        "data_source": assessment.data_source,
        "data_notice": SYNTHETIC_DATA_NOTICE,
        "summary": assessment.summary,
        "recommendations": assessment.recommendations or [],
        "raw_result": assessment.raw_result or {},
        "created_at": assessment.created_at.isoformat(),
    }
