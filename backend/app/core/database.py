"""Async SQLAlchemy engine, session factory, and declarative Base."""
from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=(settings.ENVIRONMENT == "development"),
    future=True,
)

_session_factory = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all ORM models."""
    pass


async def get_async_session() -> AsyncSession:  # type: ignore[misc]
    """FastAPI dependency — yields an async database session."""
    async with _session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


# alias for backward compat
get_db = get_async_session


async def init_db() -> None:
    """Create all tables (called on startup)."""
    # Import all models so they are registered with Base.metadata
    import app.models.user  # noqa: F401
    import app.models.assessment  # noqa: F401
    import app.models.domain  # noqa: F401
    import app.models.notification  # noqa: F401
    import app.models.organization  # noqa: F401
    import app.models.report  # noqa: F401
    import app.models.threat  # noqa: F401
    import app.models.apikey  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
