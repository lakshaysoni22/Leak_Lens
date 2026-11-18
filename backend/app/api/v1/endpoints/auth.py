"""Authentication endpoints."""
from __future__ import annotations

import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.core.security import (
    create_access_token,
    create_email_verification_token,
    create_password_reset_token,
    decode_token,
    generate_recovery_codes,
    generate_session_id,
    generate_totp_secret,
    get_totp_uri,
    hash_password,
    hash_recovery_code,
    verify_password,
    verify_totp,
)
from app.core.config import settings
from app.models.user import MFACredential, RecoveryCode, Session, User, UserProfile
from app.schemas.auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    MFAVerifyRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    VerifyEmailRequest,
)

router = APIRouter()


# ---------------------------------------------------------------------------
# Register
# ---------------------------------------------------------------------------
@router.post("/register", status_code=201)
async def register(
    data: RegisterRequest,
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    # Duplicate e-mail check
    res = await db.execute(select(User).where(User.email == data.email))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    # Duplicate username check
    res = await db.execute(select(User).where(User.username == data.username))
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        id=uuid.uuid4(),
        email=data.email,
        username=data.username,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role="user",
        is_active=True,
        is_verified=False,
        mfa_enabled=False,
    )
    db.add(user)
    db.add(UserProfile(id=uuid.uuid4(), user_id=user.id))
    await db.commit()
    await db.refresh(user)

    # In production this token would be e-mailed; returned here for dev convenience
    verification_token = create_email_verification_token(data.email)

    return {
        "success": True,
        "message": "Account created. Please verify your email to continue.",
        "user_id": str(user.id),
        "email": user.email,
        "verification_token": verification_token,
    }


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------
@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_async_session),
) -> TokenResponse:
    # Demo credentials bypass (no database schema changes required)
    if data.email.lower() == "lakshaysoni@gmail.com" and data.password == "123456789":
        res = await db.execute(select(User).where(User.email == data.email))
        user = res.scalar_one_or_none()
        if not user:
            user = User(
                id=uuid.uuid4(),
                email="lakshaysoni@gmail.com",
                username="lakshaysoni",
                hashed_password=hash_password("123456789"),
                full_name="Lakshay Soni",
                role="admin",
                is_active=True,
                is_verified=True,
                mfa_enabled=False,
            )
            db.add(user)
            db.add(UserProfile(id=uuid.uuid4(), user_id=user.id))
            await db.commit()
            await db.refresh(user)

        access_token = create_access_token({"sub": str(user.id)})
        return TokenResponse(
            access_token=access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user_id=str(user.id),
            email=user.email,
            full_name=user.full_name or "Lakshay Soni",
            role=user.role,
            is_verified=user.is_verified,
            mfa_required=False,
        )

    res = await db.execute(select(User).where(User.email == data.email))
    user: User | None = res.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account disabled")

    # MFA gate
    if user.mfa_enabled:
        temp_token = create_access_token(
            {"sub": str(user.id), "mfa_pending": True},
            timedelta(minutes=5),
        )
        return TokenResponse(
            access_token=temp_token,
            expires_in=300,
            user_id=str(user.id),
            email=user.email,
            full_name=user.full_name or "",
            role=user.role,
            is_verified=user.is_verified,
            mfa_required=True,
        )

    # Create session record
    ttl = timedelta(days=7 if data.remember_me else 1)
    session = Session(
        id=uuid.uuid4(),
        user_id=user.id,
        session_token=generate_session_id(),
        ip_address=(request.client.host if request.client else None),
        user_agent=request.headers.get("user-agent"),
        expires_at=datetime.now(timezone.utc) + ttl,
    )
    db.add(session)
    await db.commit()

    access_token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user_id=str(user.id),
        email=user.email,
        full_name=user.full_name or "",
        role=user.role,
        is_verified=user.is_verified,
        mfa_required=False,
    )


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------
@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(
        select(Session).where(Session.user_id == current_user.id, Session.is_active == True)
    )
    for s in res.scalars().all():
        s.is_active = False
    await db.commit()
    return {"success": True, "message": "Logged out successfully"}


# ---------------------------------------------------------------------------
# Verify e-mail
# ---------------------------------------------------------------------------
@router.post("/verify-email")
async def verify_email(
    data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    payload = decode_token(data.token)
    if not payload or payload.get("type") != "email_verification":
        raise HTTPException(status_code=400, detail="Invalid or expired verification token")

    email: str = payload.get("sub", "")
    res = await db.execute(select(User).where(User.email == email))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    await db.commit()
    return {"success": True, "message": "Email verified successfully"}


# ---------------------------------------------------------------------------
# Forgot password
# ---------------------------------------------------------------------------
@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(select(User).where(User.email == data.email))
    user = res.scalar_one_or_none()

    response: dict[str, Any] = {
        "success": True,
        "message": "If this email is registered, a reset link has been sent.",
    }
    if user:
        reset_token = create_password_reset_token(data.email)
        # Production: send email; dev: include token in response
        response["reset_token"] = reset_token  # remove in production
    return response


# ---------------------------------------------------------------------------
# Reset password
# ---------------------------------------------------------------------------
@router.post("/reset-password")
async def reset_password(
    data: ResetPasswordRequest,
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    payload = decode_token(data.token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    email: str = payload.get("sub", "")
    res = await db.execute(select(User).where(User.email == email))
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(data.new_password)

    # Invalidate all active sessions
    sess_res = await db.execute(select(Session).where(Session.user_id == user.id))
    for s in sess_res.scalars().all():
        s.is_active = False

    await db.commit()
    return {"success": True, "message": "Password reset successfully. Please log in again."}


# ---------------------------------------------------------------------------
# MFA — setup
# ---------------------------------------------------------------------------
@router.post("/mfa/setup")
async def setup_mfa(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    import base64
    from io import BytesIO
    import qrcode

    secret = generate_totp_secret()
    uri = get_totp_uri(secret, current_user.email)

    qr = qrcode.QRCode(box_size=8, border=4)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    qr_b64 = base64.b64encode(buf.getvalue()).decode()

    res = await db.execute(select(MFACredential).where(MFACredential.user_id == current_user.id))
    mfa = res.scalar_one_or_none()
    if mfa:
        mfa.secret = secret
        mfa.is_active = False
    else:
        db.add(MFACredential(id=uuid.uuid4(), user_id=current_user.id, secret=secret, is_active=False))
    await db.commit()

    return {
        "secret": secret,
        "provisioning_uri": uri,
        "qr_code_base64": f"data:image/png;base64,{qr_b64}",
    }


# ---------------------------------------------------------------------------
# MFA — verify & enable
# ---------------------------------------------------------------------------
@router.post("/mfa/verify")
async def verify_mfa(
    data: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    res = await db.execute(select(MFACredential).where(MFACredential.user_id == current_user.id))
    mfa = res.scalar_one_or_none()
    if not mfa:
        raise HTTPException(status_code=400, detail="MFA not configured — call /mfa/setup first")

    if not verify_totp(mfa.secret, data.code):
        raise HTTPException(status_code=400, detail="Invalid MFA code")

    mfa.is_active = True
    current_user.mfa_enabled = True

    # Regenerate recovery codes
    old = await db.execute(select(RecoveryCode).where(RecoveryCode.user_id == current_user.id))
    for c in old.scalars().all():
        await db.delete(c)

    plain_codes = generate_recovery_codes(8)
    for code in plain_codes:
        db.add(RecoveryCode(id=uuid.uuid4(), user_id=current_user.id, code_hash=hash_recovery_code(code)))

    await db.commit()
    return {"success": True, "message": "MFA enabled", "recovery_codes": plain_codes}


# ---------------------------------------------------------------------------
# MFA — disable
# ---------------------------------------------------------------------------
@router.post("/mfa/disable")
async def disable_mfa(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect password")

    current_user.mfa_enabled = False
    res = await db.execute(select(MFACredential).where(MFACredential.user_id == current_user.id))
    mfa = res.scalar_one_or_none()
    if mfa:
        await db.delete(mfa)
    await db.commit()
    return {"success": True, "message": "MFA disabled"}


# ---------------------------------------------------------------------------
# Get current user
# ---------------------------------------------------------------------------
@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)) -> dict[str, Any]:
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "username": current_user.username,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "mfa_enabled": current_user.mfa_enabled,
        "created_at": current_user.created_at.isoformat(),
    }


# ---------------------------------------------------------------------------
# Change password
# ---------------------------------------------------------------------------
@router.post("/change-password")
async def change_password(
    data: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(data.new_password)
    await db.commit()
    return {"success": True, "message": "Password changed successfully"}
