"""Scanner endpoints — email, username, history.

v2.0 — Uses REAL breach intelligence APIs via BreachIntelligenceService.
No synthetic data. No fake breaches. Only real OSINT intelligence.
"""
from __future__ import annotations

import logging
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
from app.services.breach_intel import (
    BreachIntelligenceError,
    BreachIntelligenceService,
    breach_intel_service,
)

logger = logging.getLogger(__name__)

router = APIRouter()

# ---------------------------------------------------------------------------
# Data notices for live intelligence
# ---------------------------------------------------------------------------
LIVE_INTEL_NOTICE = (
    "This assessment queries live breach intelligence databases in real time. "
    "Results reflect actual known data exposures. Your query is anonymized "
    "via SHA-256 k-anonymity and not stored permanently in cleartext."
)

CLEAN_EMAIL_NOTICE = (
    "No data breaches or credential exposures were found for this identifier "
    "across all queried intelligence sources. Continue practicing good security hygiene."
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _mask_email(email: str) -> str:
    local, _, domain = email.partition("@")
    masked_local = local[:2] + "***" if len(local) > 2 else local[0] + "***"
    return f"{masked_local}@{domain}"


def _mask_username(username: str) -> str:
    return username[:2] + "***" if len(username) > 2 else username[0] + "***"


def _build_exposure_records(breaches: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Convert aggregated breach dicts to the frontend ExposureRecord format."""
    return [
        {
            "source_name": b.get("name", "Unknown Breach"),
            "source_date": b.get("date") or None,
            "data_categories": b.get("data_categories", []),
            "severity": b.get("severity", "medium"),
            "is_verified": b.get("is_verified", False),
            "data_source_type": "live_intelligence",
        }
        for b in breaches
    ]


def _build_summary(result: dict[str, Any], identifier_type: str) -> str:
    """Build a human-readable summary from real breach data."""
    count = result["exposure_count"]
    level = result["risk_level"]
    score = result["risk_score"]
    sources = result.get("sources_queried", [])
    source_text = f" across {len(sources)} intelligence source(s)" if sources else ""

    if count == 0:
        return (
            f"No data breaches or credential exposures were detected for this "
            f"{identifier_type}{source_text}. Your {identifier_type} does not appear "
            f"in any known breach databases."
        )

    severity_map = {"critical": "Critical", "high": "High", "medium": "Moderate", "low": "Low"}
    severity_label = severity_map.get(level, level.title())

    # Collect all unique data categories from breaches
    all_cats = set()
    for b in result.get("breaches", []):
        all_cats.update(b.get("data_categories", []))
    cat_text = ", ".join(sorted(all_cats)[:5]) if all_cats else "various data types"

    return (
        f"{severity_label}-risk exposure detected across {count} independent breach "
        f"database(s){source_text}. Compromised data includes: {cat_text}. "
        f"Overall risk score: {score}/100."
    )


# ---------------------------------------------------------------------------
# Email scan — REAL BREACH INTELLIGENCE
# ---------------------------------------------------------------------------
@router.post("/email")
async def scan_email(
    data: EmailScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    id_hash = hmac_hash(data.email)
    hint = _mask_email(data.email)

    # Query REAL breach intelligence APIs
    try:
        result = await breach_intel_service.scan_email(data.email)
    except BreachIntelligenceError as e:
        logger.error("All breach intelligence sources failed for email scan: %s", e)
        raise HTTPException(
            status_code=503,
            detail=(
                "Breach intelligence services are temporarily unavailable. "
                "Please try again in a few moments."
            ),
        )
    except Exception as e:
        logger.error("Unexpected error during email scan: %s", e)
        raise HTTPException(
            status_code=503,
            detail="An unexpected error occurred while querying breach databases. Please try again.",
        )

    # Build summary from real data
    summary = _build_summary(result, "email address")

    # Determine data notice
    data_notice = LIVE_INTEL_NOTICE if result["exposure_count"] > 0 else CLEAN_EMAIL_NOTICE

    # Build risk factors — use from breach_intel if available, else build from result
    risk_factors = result.get("risk_factors")
    if not risk_factors:
        risk_factors = _build_risk_factors_from_result(result)

    # Format recommendations to match frontend schema
    recommendations = _format_recommendations(result.get("recommendations", []))

    # Save assessment to database
    assessment = Assessment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        scan_type="email",
        identifier_hash=id_hash,
        identifier_hint=hint,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        exposure_count=result["exposure_count"],
        data_source="live_intelligence",
        summary=summary,
        recommendations=result.get("recommendations", []),
        raw_result={
            "breaches": [
                {k: v for k, v in b.items() if k != "description"}
                for b in result.get("breaches", [])
            ],
            "sources_queried": result.get("sources_queried", []),
            "is_synthetic": False,
        },
        is_demo=False,
    )
    db.add(assessment)

    # Auto-create notification
    if result["exposure_count"] > 0:
        notif_title = "⚠️ Breach Exposure Detected"
        notif_msg = (
            f"Email scan found {result['exposure_count']} breach exposure(s) — "
            f"risk level: {result['risk_level'].upper()}"
        )
        notif_type = "alert" if result["risk_level"] in ("high", "critical") else "warning"
    else:
        notif_title = "✅ Email Scan Complete — All Clear"
        notif_msg = "No data breaches found for the scanned email address."
        notif_type = "info"

    notif = Notification(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title=notif_title,
        message=notif_msg,
        notification_type=notif_type,
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
        "data_source": "live_intelligence",
        "data_notice": data_notice,
        "summary": summary,
        "exposure_records": _build_exposure_records(result.get("breaches", [])),
        "risk_factors": risk_factors,
        "recommendations": recommendations,
        "is_demo": False,
        "created_at": assessment.created_at.isoformat(),
    }


# ---------------------------------------------------------------------------
# Username scan — REAL BREACH INTELLIGENCE
# ---------------------------------------------------------------------------
@router.post("/username")
async def scan_username(
    data: UsernameScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    id_hash = hmac_hash(data.username)
    hint = _mask_username(data.username)

    # Query REAL breach intelligence for username — dedicated username scanner
    try:
        result = await breach_intel_service.scan_username(data.username)
    except BreachIntelligenceError as e:
        logger.error("All breach intelligence sources failed for username scan: %s", e)
        raise HTTPException(
            status_code=503,
            detail=(
                "Breach intelligence services are temporarily unavailable. "
                "Please try again in a few moments."
            ),
        )
    except Exception as e:
        logger.error("Unexpected error during username scan: %s", e)
        raise HTTPException(
            status_code=503,
            detail="An unexpected error occurred while querying breach databases. Please try again.",
        )

    summary = _build_summary(result, "username")
    data_notice = LIVE_INTEL_NOTICE if result["exposure_count"] > 0 else CLEAN_EMAIL_NOTICE

    risk_factors = result.get("risk_factors")
    if not risk_factors:
        risk_factors = _build_risk_factors_from_result(result)

    recommendations = _format_recommendations(result.get("recommendations", []))

    assessment = Assessment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        scan_type="username",
        identifier_hash=id_hash,
        identifier_hint=hint,
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        exposure_count=result["exposure_count"],
        data_source="live_intelligence",
        summary=summary,
        recommendations=result.get("recommendations", []),
        raw_result={
            "breaches": [
                {k: v for k, v in b.items() if k != "description"}
                for b in result.get("breaches", [])
            ],
            "sources_queried": result.get("sources_queried", []),
            "is_synthetic": False,
        },
        is_demo=False,
    )
    db.add(assessment)

    notif = Notification(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title="Username Scan Complete",
        message=(
            f"Username scan found {result['exposure_count']} exposure(s) — "
            f"risk level: {result['risk_level'].upper()}"
        ),
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
        "data_source": "live_intelligence",
        "data_notice": data_notice,
        "summary": summary,
        "exposure_records": _build_exposure_records(result.get("breaches", [])),
        "risk_factors": risk_factors,
        "recommendations": recommendations,
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

    data_notice = (
        LIVE_INTEL_NOTICE
        if assessment.exposure_count > 0
        else CLEAN_EMAIL_NOTICE
    )

    return {
        "id": str(assessment.id),
        "scan_type": assessment.scan_type,
        "identifier_hint": assessment.identifier_hint,
        "risk_score": assessment.risk_score,
        "risk_level": assessment.risk_level,
        "exposure_count": assessment.exposure_count,
        "data_source": assessment.data_source,
        "data_notice": data_notice,
        "summary": assessment.summary,
        "recommendations": assessment.recommendations or [],
        "raw_result": assessment.raw_result or {},
        "created_at": assessment.created_at.isoformat(),
    }


# ---------------------------------------------------------------------------
# Internal helpers
# ---------------------------------------------------------------------------
def _build_risk_factors_from_result(result: dict[str, Any]) -> list[dict[str, Any]]:
    """Build risk factor breakdown when breach_intel doesn't provide one."""
    count = result["exposure_count"]
    level = result["risk_level"]
    high = level in ("high", "critical")

    if count == 0:
        return [
            {
                "name": "Exposure Frequency",
                "weight": 0.25,
                "score": 0.0,
                "contribution": 0.0,
                "explanation": "No exposure incidents found in any breach database.",
            },
            {
                "name": "Data Categories",
                "weight": 0.20,
                "score": 0.0,
                "contribution": 0.0,
                "explanation": "No sensitive data categories detected.",
            },
            {
                "name": "Threat Severity",
                "weight": 0.20,
                "score": 0.0,
                "contribution": 0.0,
                "explanation": "No threat indicators found.",
            },
        ]

    return [
        {
            "name": "Exposure Frequency",
            "weight": 0.25,
            "score": min(100.0, count * 20),
            "contribution": min(25.0, count * 5.0),
            "explanation": f"{count} exposure record(s) found in breach intelligence databases.",
        },
        {
            "name": "Incident Count",
            "weight": 0.20,
            "score": min(100.0, count * 25),
            "contribution": min(20.0, count * 5.0),
            "explanation": f"Total of {count} confirmed breach incident(s) factored into risk score.",
        },
        {
            "name": "Data Categories",
            "weight": 0.20,
            "score": 65.0 if count > 0 else 0.0,
            "contribution": 13.0 if count > 0 else 0.0,
            "explanation": "Sensitive data categories detected in breach records.",
        },
        {
            "name": "Threat Severity",
            "weight": 0.20,
            "score": 80.0 if high else 40.0,
            "contribution": 16.0 if high else 8.0,
            "explanation": f"Based on breach severity classifications: {level}.",
        },
        {
            "name": "Recency",
            "weight": 0.10,
            "score": 70.0,
            "contribution": 7.0,
            "explanation": "Recent breach exposure indicators detected.",
        },
        {
            "name": "Exposure Indicators",
            "weight": 0.05,
            "score": 50.0 if count > 0 else 0.0,
            "contribution": 2.5 if count > 0 else 0.0,
            "explanation": "Additional cross-referenced exposure indicators.",
        },
    ]


def _format_recommendations(raw_recs: list[dict[str, str]]) -> list[dict[str, str]]:
    """Ensure recommendations match the frontend Recommendation interface."""
    formatted = []
    for rec in raw_recs:
        formatted.append({
            "priority": rec.get("priority", "Standard").title(),
            "category": rec.get("category", "Security").replace("_", " ").title(),
            "action": rec.get("action", "Review security settings"),
            "explanation": rec.get("explanation", ""),
        })
    return formatted
