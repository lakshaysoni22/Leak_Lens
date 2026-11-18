"""Assessment ORM models."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    scan_type: Mapped[str] = mapped_column(String(32), nullable=False)           # email | username | domain | url | ip
    identifier_hash: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    identifier_hint: Mapped[str | None] = mapped_column(String(128))
    risk_score: Mapped[float] = mapped_column(Float, nullable=False)
    risk_level: Mapped[str] = mapped_column(String(16), nullable=False)          # low | medium | high | critical
    exposure_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    data_source: Mapped[str] = mapped_column(String(32), default="synthetic")    # synthetic | live_intelligence
    summary: Mapped[str | None] = mapped_column(Text)
    recommendations: Mapped[list | None] = mapped_column(JSON)
    raw_result: Mapped[dict | None] = mapped_column(JSON)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now, onupdate=_now, nullable=False)

    __table_args__ = (Index("ix_assessments_user_created", "user_id", "created_at"),)
