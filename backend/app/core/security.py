"""Security utilities — password hashing (bcrypt), JWT, HMAC, TOTP, recovery codes."""
from __future__ import annotations

import hashlib
import hmac
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

from jose import JWTError, jwt
from passlib.context import CryptContext
import pyotp

from app.core.config import settings

# ── Password hashing (bcrypt via passlib) ────────────────────────────────────
_pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password with bcrypt."""
    return _pwd_ctx.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plain password against its bcrypt hash."""
    return _pwd_ctx.verify(plain, hashed)


def password_needs_rehash(hashed: str) -> bool:
    return _pwd_ctx.needs_update(hashed)


# ── JWT tokens ───────────────────────────────────────────────────────────────

def create_access_token(data: dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_email_verification_token(email: str) -> str:
    data = {"sub": email, "type": "email_verification"}
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    data["exp"] = expire  # type: ignore[assignment]
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_password_reset_token(email: str) -> str:
    data = {"sub": email, "type": "password_reset"}
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    data["exp"] = expire  # type: ignore[assignment]
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> Optional[dict[str, Any]]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


# ── HMAC-SHA256 identifier processing ────────────────────────────────────────

def hmac_hash(identifier: str) -> str:
    """HMAC-SHA256 hex digest of a lowercased, stripped identifier."""
    return hmac.new(
        settings.HMAC_SECRET.encode(),
        identifier.lower().strip().encode(),
        hashlib.sha256,
    ).hexdigest()


# ── TOTP MFA ─────────────────────────────────────────────────────────────────

def generate_totp_secret() -> str:
    return pyotp.random_base32()


def get_totp_uri(secret: str, email: str, issuer: str = "LEAKLENS") -> str:
    return pyotp.TOTP(secret).provisioning_uri(name=email, issuer_name=issuer)


def verify_totp(secret: str, code: str) -> bool:
    return pyotp.TOTP(secret).verify(code, valid_window=1)


# ── Recovery codes ────────────────────────────────────────────────────────────

def generate_recovery_codes(count: int = 8) -> list[str]:
    alphabet = string.ascii_uppercase + string.digits
    return [
        "".join(secrets.choice(alphabet) for _ in range(4))
        + "-"
        + "".join(secrets.choice(alphabet) for _ in range(4))
        for _ in range(count)
    ]


def hash_recovery_code(code: str) -> str:
    return hashlib.sha256(code.upper().strip().encode()).hexdigest()


# ── Misc ──────────────────────────────────────────────────────────────────────

def generate_api_key() -> str:
    return f"ll_{secrets.token_urlsafe(32)}"


def generate_session_id() -> str:
    return secrets.token_urlsafe(48)
