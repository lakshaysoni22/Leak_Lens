"""Reports, notifications, monitoring, subscription, admin — full endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import desc, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.core.security import hmac_hash
from app.models.assessment import Assessment
from app.models.notification import Notification, MonitoringJob
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
    page: int = 1,
    per_page: int = 30,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    base_q = select(Notification).where(Notification.user_id == current_user.id)

    # Unread count
    unread_res = await db.execute(
        select(func.count(Notification.id)).where(
            Notification.user_id == current_user.id, Notification.is_read == False
        )
    )
    unread_count = unread_res.scalar() or 0

    # Total count
    total_res = await db.execute(select(func.count(Notification.id)).select_from(base_q.subquery()))
    total = total_res.scalar() or 0

    # Paginated list
    offset = (page - 1) * per_page
    res = await db.execute(
        base_q.order_by(desc(Notification.created_at)).offset(offset).limit(per_page)
    )
    items = res.scalars().all()

    return {
        "notifications": [
            {
                "id": str(n.id),
                "title": n.title,
                "message": n.message,
                "type": n.notification_type,
                "category": n.category,
                "is_read": n.is_read,
                "action_url": n.action_url,
                "created_at": n.created_at.isoformat(),
            }
            for n in items
        ],
        "unread_count": unread_count,
        "total": total,
        "page": page,
        "per_page": per_page,
    }


@notifications_router.patch("/{notification_id}/read")
async def mark_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(Notification).where(
            Notification.id == notification_id, Notification.user_id == current_user.id
        )
    )
    notif = res.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    notif.is_read = True
    await db.commit()
    return {"success": True, "message": "Notification marked as read"}


@notifications_router.patch("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    await db.execute(
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.commit()
    return {"success": True, "message": "All notifications marked as read"}


@notifications_router.delete("/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(Notification).where(
            Notification.id == notification_id, Notification.user_id == current_user.id
        )
    )
    notif = res.scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")

    await db.delete(notif)
    await db.commit()
    return {"success": True, "message": "Notification deleted"}


# ─── Monitoring ──────────────────────────────────────────────────────────────
monitoring_router = APIRouter()


@monitoring_router.get("")
async def list_monitoring_jobs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(MonitoringJob)
        .where(MonitoringJob.user_id == current_user.id)
        .order_by(desc(MonitoringJob.created_at))
    )
    jobs = res.scalars().all()
    return {
        "jobs": [
            {
                "id": str(j.id),
                "job_type": j.job_type,
                "target": j.target,
                "frequency": j.frequency,
                "is_active": j.is_active,
                "last_run": j.last_run.isoformat() if j.last_run else None,
                "next_run": j.next_run.isoformat() if j.next_run else None,
                "alert_threshold": j.alert_threshold,
                "run_count": j.run_count,
                "results": j.results,
                "created_at": j.created_at.isoformat(),
            }
            for j in jobs
        ],
        "total": len(jobs),
    }


@monitoring_router.post("")
async def create_monitoring_job(
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    job_type = payload.get("job_type", "email").strip()
    target = payload.get("target", "").strip()
    frequency = payload.get("frequency", "daily").strip()
    alert_threshold = payload.get("alert_threshold", "medium").strip()

    if not target:
        raise HTTPException(status_code=400, detail="Target is required")
    if job_type not in ("email", "domain", "keyword", "username"):
        raise HTTPException(status_code=400, detail="job_type must be: email, domain, keyword, or username")
    if frequency not in ("hourly", "daily", "weekly", "monthly"):
        raise HTTPException(status_code=400, detail="frequency must be: hourly, daily, weekly, or monthly")

    # Limit: max 20 jobs per user
    count_res = await db.execute(
        select(func.count(MonitoringJob.id)).where(MonitoringJob.user_id == current_user.id)
    )
    if (count_res.scalar() or 0) >= 20:
        raise HTTPException(status_code=400, detail="Maximum of 20 monitoring jobs allowed")

    job = MonitoringJob(
        id=uuid.uuid4(),
        user_id=current_user.id,
        job_type=job_type,
        target=target,
        target_hash=hmac_hash(target),
        frequency=frequency,
        is_active=True,
        alert_threshold=alert_threshold,
    )
    db.add(job)

    # Also create notification
    notif = Notification(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title="Monitor Created",
        message=f"Monitoring job for {job_type} target '{target}' created with {frequency} frequency.",
        notification_type="info",
        category="monitoring",
    )
    db.add(notif)
    await db.commit()
    await db.refresh(job)

    return {
        "success": True,
        "message": f"Monitoring job created for {target}",
        "job": {
            "id": str(job.id),
            "job_type": job.job_type,
            "target": job.target,
            "frequency": job.frequency,
            "is_active": job.is_active,
            "created_at": job.created_at.isoformat(),
        },
    }


@monitoring_router.patch("/{job_id}")
async def update_monitoring_job(
    job_id: str,
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(MonitoringJob).where(
            MonitoringJob.id == job_id, MonitoringJob.user_id == current_user.id
        )
    )
    job = res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Monitoring job not found")

    if "frequency" in payload:
        job.frequency = payload["frequency"]
    if "is_active" in payload:
        job.is_active = payload["is_active"]
    if "alert_threshold" in payload:
        job.alert_threshold = payload["alert_threshold"]

    await db.commit()
    return {"success": True, "message": "Monitoring job updated"}


@monitoring_router.delete("/{job_id}")
async def delete_monitoring_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(MonitoringJob).where(
            MonitoringJob.id == job_id, MonitoringJob.user_id == current_user.id
        )
    )
    job = res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Monitoring job not found")

    await db.delete(job)
    await db.commit()
    return {"success": True, "message": "Monitoring job deleted"}


@monitoring_router.post("/{job_id}/run")
async def run_monitoring_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    """Manually trigger a monitoring scan."""
    res = await db.execute(
        select(MonitoringJob).where(
            MonitoringJob.id == job_id, MonitoringJob.user_id == current_user.id
        )
    )
    job = res.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=404, detail="Monitoring job not found")

    # Run the actual scan based on job type using real intelligence
    from app.services.breach_intel import BreachIntelligenceService
    intel = BreachIntelligenceService()

    scan_result: dict[str, Any] = {}
    if job.job_type == "email":
        scan_result = await intel.scan_email(job.target)
    elif job.job_type == "username":
        scan_result = await intel.scan_username(job.target)
    elif job.job_type == "domain":
        scan_result = {"status": "scanned", "note": "Domain monitoring scan triggered", "risk_score": 0.0, "risk_level": "low", "exposure_count": 0}

    # Save scan as assessment
    assessment = Assessment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        scan_type=job.job_type,
        identifier_hash=hmac_hash(job.target),
        identifier_hint=job.target[:3] + "***",
        risk_score=scan_result.get("risk_score", 0.0),
        risk_level=scan_result.get("risk_level", "low"),
        exposure_count=scan_result.get("exposure_count", 0),
        data_source="monitoring",
        summary=f"Monitoring scan for {job.job_type}: {job.target}",
        recommendations=scan_result.get("recommendations", []),
        raw_result=scan_result,
        is_demo=False,
    )
    db.add(assessment)

    # Update job
    job.last_run = datetime.now(timezone.utc)
    job.run_count += 1
    job.results = {"last_risk_level": scan_result.get("risk_level", "low"), "last_exposure_count": scan_result.get("exposure_count", 0)}

    # Create notification
    notif = Notification(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title=f"Monitor Scan Complete: {job.target}",
        message=f"{job.job_type.capitalize()} scan found {scan_result.get('exposure_count', 0)} exposure(s), risk: {scan_result.get('risk_level', 'low').upper()}",
        notification_type="alert" if scan_result.get("risk_level") in ("high", "critical") else "info",
        category="monitoring",
        action_url=f"/app/exposure-history",
    )
    db.add(notif)

    await db.commit()

    return {
        "success": True,
        "message": f"Monitoring scan completed for {job.target}",
        "result": {
            "risk_level": scan_result.get("risk_level", "low"),
            "risk_score": scan_result.get("risk_score", 0.0),
            "exposure_count": scan_result.get("exposure_count", 0),
        },
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
        "price_monthly": 900,
        "price_yearly": 8640,
        "features": ["100 assessments/month", "All scanner types", "API access", "Priority support", "PDF reports", "Continuous monitoring"],
        "limits": {"assessments_per_month": 100, "api_access": True, "team_members": 1},
    },
    {
        "id": "business",
        "name": "Business",
        "price_monthly": 5900,
        "price_yearly": 56640,
        "features": ["Unlimited assessments", "Team management (up to 25)", "Custom integrations", "Dedicated support", "Admin console", "SIEM export", "Custom risk rules"],
        "limits": {"assessments_per_month": -1, "api_access": True, "team_members": 25},
    },
    {
        "id": "enterprise",
        "name": "Enterprise",
        "price_monthly": None,
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
    users_res = await db.execute(select(func.count(User.id)))
    assessments_res = await db.execute(select(func.count(Assessment.id)))
    notif_res = await db.execute(select(func.count(Notification.id)))
    jobs_res = await db.execute(select(func.count(MonitoringJob.id)))

    return {
        "total_users": users_res.scalar() or 0,
        "total_assessments": assessments_res.scalar() or 0,
        "total_notifications": notif_res.scalar() or 0,
        "total_monitoring_jobs": jobs_res.scalar() or 0,
        "system_status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@admin_router.get("/audit-logs")
async def audit_logs(
    admin: User = Depends(_require_admin),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    # Aggregate recent assessments as audit events
    res = await db.execute(
        select(Assessment).order_by(desc(Assessment.created_at)).limit(50)
    )
    assessments = res.scalars().all()

    return {
        "logs": [
            {
                "id": str(a.id),
                "action": f"{a.scan_type}_scan",
                "user_id": str(a.user_id),
                "details": a.summary,
                "risk_level": a.risk_level,
                "timestamp": a.created_at.isoformat(),
            }
            for a in assessments
        ],
        "total": len(assessments),
    }
