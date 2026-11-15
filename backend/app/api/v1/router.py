"""Main API v1 router."""
from __future__ import annotations

from fastapi import APIRouter

from app.api.v1.endpoints.auth import router as auth_router
from app.api.v1.endpoints.dashboard import router as dashboard_router
from app.api.v1.endpoints.scans import router as scans_router
from app.api.v1.endpoints.domain import router as domain_router
from app.api.v1.endpoints.threat import router as threat_router
from app.api.v1.endpoints.phishing import router as phishing_router
from app.api.v1.endpoints.user import router as user_router
from app.api.v1.endpoints.apikeys import router as apikeys_router
from app.api.v1.endpoints.integrations import router as integrations_router
from app.api.v1.endpoints.extras import (
    reports_router,
    notifications_router,
    monitoring_router,
    subscription_router,
    admin_router,
)

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(scans_router, prefix="/scans", tags=["Scanners"])
api_router.include_router(domain_router, prefix="/domain", tags=["Domain Scanner"])
api_router.include_router(threat_router, prefix="/threat-intel", tags=["Threat Intelligence"])
api_router.include_router(phishing_router, prefix="/phishing", tags=["Phishing Detection"])
api_router.include_router(user_router, prefix="/user", tags=["User"])
api_router.include_router(apikeys_router, prefix="/api-keys", tags=["API Keys"])
api_router.include_router(integrations_router, prefix="/integrations", tags=["Integrations"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(monitoring_router, prefix="/monitoring", tags=["Monitoring"])
api_router.include_router(subscription_router, prefix="/subscription", tags=["Subscription"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin"])
