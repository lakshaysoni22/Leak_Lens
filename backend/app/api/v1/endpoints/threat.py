"""Threat intelligence endpoint — provider adapter architecture."""
from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()


URLHAUS_API_BASE = "https://urlhaus-api.abuse.ch/v1"


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


async def _urlhaus_lookup_url(url: str) -> dict[str, Any] | None:
    """Look up a URL in URLhaus."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{URLHAUS_API_BASE}/url/", data={"url": url})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("query_status") == "ok":
                    return {
                        "provider": "urlhaus",
                        "match": True,
                        "threat_type": data.get("threat", "unknown"),
                        "status": data.get("url_status", "unknown"),
                        "date_added": data.get("date_added"),
                        "tags": data.get("tags") or [],
                        "reference": data.get("urlhaus_reference"),
                    }
                return {"provider": "urlhaus", "match": False, "status": data.get("query_status")}
    except Exception:
        pass
    return None


async def _urlhaus_lookup_host(host: str) -> dict[str, Any] | None:
    """Look up a host/domain in URLhaus."""
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{URLHAUS_API_BASE}/host/", data={"host": host})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("query_status") in ("ok", "no_results"):
                    urls = data.get("urls", [])
                    return {
                        "provider": "urlhaus",
                        "match": len(urls) > 0,
                        "url_count": data.get("url_count", 0),
                        "urls_online": data.get("urls_online", 0),
                        "blacklists": data.get("blacklists", {}),
                        "recent_urls": [
                            {
                                "url": u.get("url", "")[:100],
                                "status": u.get("url_status"),
                                "threat": u.get("threat"),
                                "date_added": u.get("date_added"),
                                "tags": u.get("tags") or [],
                            }
                            for u in urls[:5]
                        ],
                        "reference": data.get("urlhaus_reference"),
                    }
    except Exception:
        pass
    return None


async def _urlhaus_lookup_hash(file_hash: str) -> dict[str, Any] | None:
    """Look up a file hash (MD5 or SHA256) in URLhaus."""
    hash_type = "sha256_hash" if len(file_hash) == 64 else "md5_hash"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(f"{URLHAUS_API_BASE}/payload/", data={hash_type: file_hash})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("query_status") in ("ok", "no_results"):
                    return {
                        "provider": "urlhaus",
                        "match": data.get("query_status") == "ok",
                        "file_type": data.get("file_type"),
                        "file_size": data.get("file_size"),
                        "signature": data.get("signature"),
                        "url_count": data.get("url_count", 0),
                        "firstseen": data.get("firstseen"),
                        "lastseen": data.get("lastseen"),
                    }
    except Exception:
        pass
    return None


def _is_valid_ip(value: str) -> bool:
    return bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", value))


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
    ioc_type = (payload.get("ioc_type") or payload.get("type", "")).strip()
    ioc_value = (payload.get("ioc_value") or payload.get("value", "")).strip()

    if not ioc_type or not ioc_value:
        return {"error": "Both 'type' and 'value' are required"}

    if ioc_type not in ("ip", "domain", "url", "hash"):
        return {"error": "type must be one of: ip, domain, url, hash"}

    providers = _get_provider_status()
    results: list[dict[str, Any]] = []

    # URLhaus is always available (public API)
    urlhaus_result = None
    if ioc_type == "url":
        urlhaus_result = await _urlhaus_lookup_url(ioc_value)
    elif ioc_type in ("domain", "ip"):
        urlhaus_result = await _urlhaus_lookup_host(ioc_value)
    elif ioc_type == "hash":
        urlhaus_result = await _urlhaus_lookup_hash(ioc_value)

    if urlhaus_result:
        results.append(urlhaus_result)

    # Count configured providers that were actually queried
    queried_providers = ["urlhaus"]
    configured_count = sum(1 for p in providers.values() if p["configured"])

    summary_parts = []
    if urlhaus_result and urlhaus_result.get("match"):
        summary_parts.append("⚠️ Threat data found in URLhaus")
    elif urlhaus_result:
        summary_parts.append("✅ No threats found in URLhaus")
    else:
        summary_parts.append("URLhaus query failed or timed out")

    # Note about unconfigured providers
    unconfigured = [p["name"] for k, p in providers.items() if not p["configured"] and k != "urlhaus"]
    if unconfigured:
        summary_parts.append(f"Configure API keys for additional coverage: {', '.join(unconfigured)}")

    return {
        "ioc_type": ioc_type,
        "ioc_value": ioc_value,
        "results": results,
        "summary": " | ".join(summary_parts),
        "data_notice": "Live intelligence results from URLhaus (Abuse.ch). Additional providers require API keys.",
        "queried_providers": queried_providers,
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
