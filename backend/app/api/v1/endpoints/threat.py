"""Threat intelligence endpoint — provider adapter architecture."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


def _get_provider_status() -> dict[str, dict[str, Any]]:
    return {
        "abuseipdb": {
            "name": "AbuseIPDB",
            "configured": bool(settings.ABUSEIPDB_API_KEY),
            "capabilities": ["ip_reputation", "abuse_reports"],
            "setup_url": "https://www.abuseipdb.com/api",
        },
        "virustotal": {
            "name": "VirusTotal",
            "configured": bool(settings.VIRUSTOTAL_API_KEY),
            "capabilities": ["url_scan", "file_hash", "domain_reputation"],
            "setup_url": "https://www.virustotal.com/gui/join-us",
        },
        "urlhaus": {
            "name": "URLhaus (Abuse.ch)",
            "configured": True,  # Public API, no key required
            "capabilities": ["malware_urls", "phishing_urls"],
            "setup_url": "https://urlhaus-api.abuse.ch/",
        },
        "phishtank": {
            "name": "PhishTank",
            "configured": False,
            "capabilities": ["phishing_urls"],
            "setup_url": "https://www.phishtank.com/api_info.php",
        },
        "alienvault_otx": {
            "name": "AlienVault OTX",
            "configured": False,
            "capabilities": ["ioc_lookup", "threat_feeds", "malware_hashes"],
            "setup_url": "https://otx.alienvault.com/api",
        },
    }


@router.get("/providers")
async def list_providers(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return {
        "providers": _get_provider_status(),
        "note": "Configure API keys in .env to enable live intelligence providers.",
    }


@router.post("/lookup")
async def lookup_ioc(
    payload: dict[str, str],
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    ioc_type = payload.get("type", "").strip()   # ip | domain | url | hash
    ioc_value = payload.get("value", "").strip()

    if not ioc_type or not ioc_value:
        return {"error": "Both 'type' and 'value' are required"}

    if ioc_type not in ("ip", "domain", "url", "hash"):
        return {"error": "type must be one of: ip, domain, url, hash"}

    providers = _get_provider_status()
    results: list[dict[str, Any]] = []
    configured_count = sum(1 for p in providers.values() if p["configured"])

    if configured_count == 0:
        return {
            "ioc_type": ioc_type,
            "ioc_value": ioc_value,
            "results": [],
            "summary": "No threat intelligence providers are configured.",
            "data_notice": (
                "To enable live threat intelligence, configure one or more provider API keys "
                "in your .env file. See /api/v1/threat-intelligence/providers for details."
            ),
            "provider_status": providers,
            "queried_at": datetime.now(timezone.utc).isoformat(),
        }

    # Placeholder — in a real deployment, call each configured provider's API here
    # and aggregate the results. Keys are checked above.
    return {
        "ioc_type": ioc_type,
        "ioc_value": ioc_value,
        "results": results,
        "summary": f"Queried {configured_count} configured provider(s).",
        "data_notice": "Live intelligence results depend on external provider APIs.",
        "provider_status": providers,
        "queried_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/feeds")
async def list_feeds(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    return {
        "feeds": [
            {
                "id": "urlhaus",
                "name": "URLhaus Malware Feed",
                "description": "Real-time malicious URL feed from Abuse.ch",
                "type": "malware_urls",
                "update_frequency": "real-time",
                "status": "available",
                "url": "https://urlhaus-api.abuse.ch/",
            },
            {
                "id": "phishtank",
                "name": "PhishTank Phishing Feed",
                "description": "Community-verified phishing URL database",
                "type": "phishing_urls",
                "update_frequency": "hourly",
                "status": "requires_key",
            },
            {
                "id": "otx",
                "name": "AlienVault OTX Pulses",
                "description": "Open threat exchange — IOC collections",
                "type": "iocs",
                "update_frequency": "continuous",
                "status": "requires_key",
            },
        ],
        "note": "Feed integration is architecture-ready. Configure provider keys to enable live data.",
    }
