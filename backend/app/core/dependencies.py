"""FastAPI dependencies — current user, DB session, role guards."""
from __future__ import annotations

import uuid
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.security import decode_token
from app.models.user import User

_bearer = HTTPBearer(auto_error=False)
_ADMIN_ROLES = {"admin", "super_admin"}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: AsyncSession = Depends(get_async_session),
) -> User:
    exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not credentials:
        raise exc

    payload = decode_token(credentials.credentials)
    if not payload or payload.get("type") != "access":
        raise exc

    sub = payload.get("sub")
    if not sub:
        raise exc

    # sub may be a UUID string or UUID object
    try:
        user_id = uuid.UUID(str(sub))
    except ValueError:
        raise exc

    res = await db.execute(select(User).where(User.id == user_id, User.is_active == True))
    user = res.scalar_one_or_none()
    if not user:
        raise exc
    return user


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role not in _ADMIN_ROLES:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


async def get_optional_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: AsyncSession = Depends(get_async_session),
) -> Optional[User]:
    if not credentials:
        return None
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None
