"""User schemas."""
from __future__ import annotations
from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: str
    email: str
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    mfa_enabled: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileResponse(BaseModel):
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    timezone: str = "UTC"
    notification_email: bool = True
    notification_push: bool = True

    model_config = {"from_attributes": True}


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    job_title: Optional[str] = None
    bio: Optional[str] = None
    timezone: Optional[str] = None
    notification_email: Optional[bool] = None
    notification_push: Optional[bool] = None


class SessionResponse(BaseModel):
    id: str
    ip_address: Optional[str]
    user_agent: Optional[str]
    is_active: bool
    created_at: datetime
    expires_at: datetime

    model_config = {"from_attributes": True}
