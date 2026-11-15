"""User profile & settings endpoints."""
from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import Session, User, UserProfile
from app.schemas.user import UpdateProfileRequest

router = APIRouter()


@router.get("/profile")
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = res.scalar_one_or_none()
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_verified": current_user.is_verified,
        "mfa_enabled": current_user.mfa_enabled,
        "created_at": current_user.created_at.isoformat(),
        "profile": {
            "avatar_url": profile.avatar_url if profile else None,
            "phone": profile.phone if profile else None,
            "company": profile.company if profile else None,
            "job_title": profile.job_title if profile else None,
            "bio": profile.bio if profile else None,
            "timezone": profile.timezone if profile else "UTC",
            "notification_email": profile.notification_email if profile else True,
            "notification_push": profile.notification_push if profile else True,
        },
    }


@router.patch("/profile")
async def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = res.scalar_one_or_none()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    if data.full_name is not None:
        current_user.full_name = data.full_name
    if data.phone is not None:
        profile.phone = data.phone
    if data.company is not None:
        profile.company = data.company
    if data.job_title is not None:
        profile.job_title = data.job_title
    if data.bio is not None:
        profile.bio = data.bio
    if data.timezone is not None:
        profile.timezone = data.timezone
    if data.notification_email is not None:
        profile.notification_email = data.notification_email
    if data.notification_push is not None:
        profile.notification_push = data.notification_push

    await db.commit()
    return {"success": True, "message": "Profile updated"}


@router.get("/sessions")
async def get_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(Session).where(Session.user_id == current_user.id, Session.is_active == True)
    )
    sessions = res.scalars().all()
    return {
        "sessions": [
            {
                "id": str(s.id),
                "ip_address": s.ip_address,
                "user_agent": s.user_agent,
                "created_at": s.created_at.isoformat(),
                "expires_at": s.expires_at.isoformat(),
            }
            for s in sessions
        ]
    }


@router.delete("/sessions/{session_id}")
async def revoke_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(Session).where(Session.id == session_id, Session.user_id == current_user.id)
    )
    session = res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    session.is_active = False
    await db.commit()
    return {"success": True, "message": "Session revoked"}


@router.get("/settings")
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(select(UserProfile).where(UserProfile.user_id == current_user.id))
    profile = res.scalar_one_or_none()
    return {
        "notifications": {
            "email": profile.notification_email if profile else True,
            "push": profile.notification_push if profile else True,
        },
        "privacy": {
            "data_retention_days": 365,
            "analytics_opt_in": True,
        },
        "preferences": {
            "timezone": profile.timezone if profile else "UTC",
            "language": "en",
            "theme": "dark",
        },
    }
