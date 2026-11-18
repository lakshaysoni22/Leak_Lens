"""API Key management endpoints."""
from __future__ import annotations

import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.apikey import APIKey
from app.models.user import User

router = APIRouter()


def _generate_api_key() -> str:
    return f"ll_{secrets.token_urlsafe(32)}"


def _hash_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()


@router.get("")
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(APIKey)
        .where(APIKey.user_id == current_user.id)
        .order_by(APIKey.created_at.desc())
    )
    keys = res.scalars().all()
    return {
        "keys": [
            {
                "id": str(k.id),
                "name": k.name,
                "key_prefix": k.key_prefix,
                "is_active": k.is_active,
                "rate_limit": k.rate_limit,
                "permissions": k.permissions or {"scans": True, "reports": True},
                "last_used_at": k.last_used_at.isoformat() if k.last_used_at else None,
                "expires_at": k.expires_at.isoformat() if k.expires_at else None,
                "created_at": k.created_at.isoformat(),
            }
            for k in keys
        ],
        "total": len(keys),
    }


@router.post("")
async def create_api_key(
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    # Limit: max 5 active keys per user
    count_res = await db.execute(
        select(func.count(APIKey.id)).where(
            APIKey.user_id == current_user.id, APIKey.is_active == True
        )
    )
    count = count_res.scalar() or 0
    if count >= 5:
        raise HTTPException(status_code=400, detail="Maximum of 5 active API keys allowed")

    raw_key = _generate_api_key()
    name = payload.get("name", "API Key").strip() or "API Key"
    expires_days = payload.get("expires_in_days")

    key = APIKey(
        id=uuid.uuid4(),
        user_id=current_user.id,
        key_hash=_hash_key(raw_key),
        key_prefix=raw_key[:12],
        name=name[:128],
        is_active=True,
        permissions=payload.get("permissions", {"scans": True, "reports": True}),
        rate_limit=payload.get("rate_limit", 100),
        expires_at=(
            datetime.now(timezone.utc) + timedelta(days=int(expires_days))
            if expires_days
            else None
        ),
    )
    db.add(key)
    await db.commit()
    await db.refresh(key)

    return {
        "success": True,
        "message": "API key created. Copy the key now — it will not be shown again.",
        "key": {
            "id": str(key.id),
            "name": key.name,
            "api_key": raw_key,  # Only shown once!
            "key_prefix": key.key_prefix,
            "rate_limit": key.rate_limit,
            "expires_at": key.expires_at.isoformat() if key.expires_at else None,
            "created_at": key.created_at.isoformat(),
        },
    }


@router.delete("/{key_id}")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(APIKey).where(APIKey.id == key_id, APIKey.user_id == current_user.id)
    )
    key = res.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    key.is_active = False
    await db.commit()
    return {"success": True, "message": "API key revoked"}


@router.patch("/{key_id}")
async def update_api_key(
    key_id: str,
    payload: dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(APIKey).where(APIKey.id == key_id, APIKey.user_id == current_user.id)
    )
    key = res.scalar_one_or_none()
    if not key:
        raise HTTPException(status_code=404, detail="API key not found")

    if "name" in payload:
        key.name = payload["name"][:128]
    if "permissions" in payload:
        key.permissions = payload["permissions"]
    if "rate_limit" in payload:
        key.rate_limit = int(payload["rate_limit"])

    await db.commit()
    return {
        "success": True,
        "key": {
            "id": str(key.id),
            "name": key.name,
            "key_prefix": key.key_prefix,
            "is_active": key.is_active,
            "rate_limit": key.rate_limit,
            "permissions": key.permissions,
        },
    }
