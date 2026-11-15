"""FastAPI application entry point."""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import init_db
from app.api.v1.router import api_router

logging.basicConfig(
    level=logging.DEBUG if settings.ENVIRONMENT == "development" else logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("leaklens")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    logger.info("🔒 LEAKLENS API starting …")
    await init_db()
    logger.info("✅ Database initialised")
    yield
    logger.info("LEAKLENS API shutting down")


app = FastAPI(
    title="LEAKLENS API",
    description=(
        "Privacy-Focused Personal Data Exposure and Cyber Risk Intelligence Platform — REST API v1.\n\n"
        "⚠️ Scan results use **synthetic data** for demonstration purposes. "
        "No real personal data is stored."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────────────
origins = settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else [settings.CORS_ORIGINS]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ───────────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"], include_in_schema=False)
async def health() -> dict[str, str]:
    return {"status": "healthy", "service": "LEAKLENS API", "version": "1.0.0"}


@app.get("/api/v1/health", tags=["Health"])
async def api_health() -> dict[str, str]:
    return {"status": "healthy", "version": "v1", "environment": settings.ENVIRONMENT}


# ── Routers ──────────────────────────────────────────────────────────────────
app.include_router(api_router, prefix="/api/v1")


# ── Global error handler ─────────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})
