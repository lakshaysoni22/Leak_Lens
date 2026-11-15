"""Assessment / scan schemas."""
from __future__ import annotations
from typing import Any, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator
import re


class EmailScanRequest(BaseModel):
    email: EmailStr


class UsernameScanRequest(BaseModel):
    username: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2 or len(v) > 50:
            raise ValueError("Username must be 2-50 characters")
        return v


class DomainScanRequest(BaseModel):
    domain: str

    @field_validator("domain")
    @classmethod
    def validate_domain(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^([a-z0-9]([a-z0-9\-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$", v):
            raise ValueError("Invalid domain format")
        return v


class RiskFactorDetail(BaseModel):
    name: str
    weight: float
    score: float
    contribution: float
    explanation: str


class ExposureRecord(BaseModel):
    source_name: str
    source_date: Optional[str]
    data_categories: list[str]
    severity: str
    is_verified: bool
    data_source_type: str


class ScanResponse(BaseModel):
    assessment_id: str
    scan_type: str
    identifier_hint: str
    risk_score: float
    risk_level: str
    exposure_count: int
    data_source: str
    data_notice: str
    summary: str
    exposure_records: list[ExposureRecord]
    risk_factors: list[RiskFactorDetail]
    recommendations: list[dict[str, Any]]
    is_demo: bool
    created_at: datetime


class AssessmentListItem(BaseModel):
    id: str
    scan_type: str
    identifier_hint: Optional[str]
    risk_score: float
    risk_level: str
    exposure_count: int
    data_source: str
    created_at: datetime

    model_config = {"from_attributes": True}
