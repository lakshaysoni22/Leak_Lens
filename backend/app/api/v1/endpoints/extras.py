"""Reports, notifications, monitoring, subscription, admin — stub endpoints."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.assessment import Assessment
from app.models.user import User

# ─── Reports ────────────────────────────────────────────────────────────────
reports_router = APIRouter()


@reports_router.get("")
async def list_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(Assessment)
        .where(Assessment.user_id == current_user.id)
        .order_by(desc(Assessment.created_at))
        .limit(50)
    )
    assessments = res.scalars().all()
    return {
        "reports": [
            {
                "id": str(a.id),
                "type": f"{a.scan_type}_exposure_report",
                "title": f"{a.scan_type.capitalize()} Exposure Report",
                "identifier_hint": a.identifier_hint,
                "risk_level": a.risk_level,
                "risk_score": a.risk_score,
                "created_at": a.created_at.isoformat(),
                "data_source": a.data_source,
            }
            for a in assessments
        ]
    }


@reports_router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(Assessment).where(Assessment.id == report_id, Assessment.user_id == current_user.id)
    )
    a = res.scalar_one_or_none()
    if not a:
        raise HTTPException(status_code=404, detail="Report not found")

    return {
        "id": str(a.id),
        "type": f"{a.scan_type}_exposure_report",
        "title": f"{a.scan_type.capitalize()} Exposure Report",
        "executive_summary": a.summary,
        "identifier_hint": a.identifier_hint,
        "risk_score": a.risk_score,
        "risk_level": a.risk_level,
        "exposure_count": a.exposure_count,
        "data_source": a.data_source,
        "recommendations": a.recommendations or [],
        "findings": a.raw_result or {},
        "created_at": a.created_at.isoformat(),
        "data_notice": "SYNTHETIC DATA — for demonstration purposes only.",
    }


@reports_router.get("/{report_id}/export/json")
async def export_report_json(
    report_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    return await get_report(report_id, current_user, db)


# ─── Notifications ───────────────────────────────────────────────────────────
notifications_router = APIRouter()


@notifications_router.get("")
async def list_notifications(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    # Stub — real implementation would query a Notification model
    return {
        "notifications": [],
        "unread_count": 0,
        "note": "Notifications are generated when new assessments complete or risk levels change.",
    }


@notifications_router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return {"success": True, "message": "Notification marked as read"}


# ─── Monitoring ──────────────────────────────────────────────────────────────
monitoring_router = APIRouter()


@monitoring_router.get("")
async def list_monitoring_jobs(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return {
        "jobs": [],
        "note": (
            "Scheduled monitoring is architecture-ready. "
            "Configure monitoring jobs to receive alerts on new exposure indicators."
        ),
    }


@monitoring_router.post("")
async def create_monitoring_job(
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return {
        "success": True,
        "message": "Monitoring job created (stub — backend scheduler not yet running)",
        "job": payload,
    }


# ─── Subscription ─────────────────────────────────────────────────────────────
subscription_router = APIRouter()

PLANS = [
    {
        "id": "free",
        "name": "Free",
        "price_monthly": 0,
        "price_yearly": 0,
        "features": ["5 assessments/month", "Basic risk reports", "Email & username scanning"],
        "limits": {"assessments_per_month": 5, "api_access": False, "team_members": 1},
    },
    {
        "id": "pro",
        "name": "Pro",
        "price_monthly": 1200,  # INR
        "price_yearly": 11520,
        "features": ["50 assessments/month", "Advanced analytics", "Domain scanning", "Phishing detection", "Priority support"],
        "limits": {"assessments_per_month": 50, "api_access": False, "team_members": 1},
    },
    {
        "id": "business",
        "name": "Business",
        "price_monthly": 4999,
        "price_yearly": 47990,
        "features": ["Unlimited assessments", "Team dashboard", "API access", "Shared reports", "Threat intelligence"],
        "limits": {"assessments_per_month": -1, "api_access": True, "team_members": 10},
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "price_monthly": None,  # Custom pricing
        "price_yearly": None,
        "features": ["Custom limits", "Admin console", "SSO", "SLA", "Dedicated support"],
        "limits": {"assessments_per_month": -1, "api_access": True, "team_members": -1},
    },
]


@subscription_router.get("/plans")
async def list_plans() -> dict[str, Any]:
    return {"plans": PLANS}


@subscription_router.get("/current")
async def current_subscription(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return {
        "plan": "free",
        "status": "active",
        "limits": {"assessments_per_month": 5, "assessments_used": 0, "api_access": False},
        "note": "Payment integration via Stripe/Razorpay is architecture-ready. Configure keys in .env to enable.",
    }


@subscription_router.post("/checkout")
async def create_checkout(
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return {
        "success": False,
        "message": "Payment provider not configured. Add STRIPE_SECRET_KEY or RAZORPAY_KEY_ID to .env.",
    }


# ─── Admin ─────────────────────────────────────────────────────────────────
admin_router = APIRouter()


async def _require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in ("admin", "super_admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


@admin_router.get("/users")
async def list_users(
    page: int = 1,
    per_page: int = 20,
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    from sqlalchemy import func
    total_res = await db.execute(select(func.count(User.id)))
    total = total_res.scalar() or 0

    res = await db.execute(select(User).offset((page - 1) * per_page).limit(per_page))
    users = res.scalars().all()

    return {
        "users": [
            {
                "id": str(u.id),
                "email": u.email,
                "username": u.username,
                "full_name": u.full_name,
                "role": u.role,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@admin_router.get("/stats")
async def admin_stats(
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    from sqlalchemy import func
    users_res = await db.execute(select(func.count(User.id)))
    assessments_res = await db.execute(select(func.count(Assessment.id)))

    return {
        "total_users": users_res.scalar() or 0,
        "total_assessments": assessments_res.scalar() or 0,
        "system_status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@admin_router.get("/audit-logs")
async def audit_logs(
    admin: User = Depends(_require_admin),
) -> dict[str, Any]:
    return {
        "logs": [],
        "note": "Audit log model is defined. Full audit trail implementation in Phase 2.",
    }
