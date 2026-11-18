"""Report model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, JSON, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    report_type: Mapped[str] = mapped_column(String(32), nullable=False)  # assessment, domain, threat, executive
    format: Mapped[str] = mapped_column(String(16), default="pdf", nullable=False)  # pdf, json, csv
    status: Mapped[str] = mapped_column(String(16), default="pending", nullable=False)
    file_path: Mapped[str | None] = mapped_column(String(512))
    file_size: Mapped[int | None] = mapped_column(Integer)
    parameters: Mapped[dict | None] = mapped_column(JSON)
    summary: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow, nullable=False)

    user: Mapped["User"] = relationship("User", back_populates="reports")

    __table_args__ = (
        Index("ix_reports_user_type", "user_id", "report_type"),
    )
