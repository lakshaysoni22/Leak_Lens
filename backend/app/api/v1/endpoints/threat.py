"""Threat Intelligence endpoint — multi-provider REAL intelligence architecture.

Providers integrated (all FREE, no key needed unless noted):
  1. URLhaus (Abuse.ch)         — malware/phishing URL database (public, no key)
  2. AlienVault OTX             — open threat exchange (public, no key for basic)
  3. IPinfo.io                  — IP geolocation + ASN + org (free tier, no key)
  4. ip-api.com                 — IP geolocation + ISP + proxy (free, no key)
  5. DNSBL Blocklist Checks     — Spamhaus/Barracuda/SORBS via DNS (free)
  6. AbuseIPDB                  — abuse confidence score (requires free API key)
  7. VirusTotal                 — multi-engine scan (requires free API key)
"""
from __future__ import annotations

import asyncio
import re
import socket
from datetime import datetime, timezone
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# ───────────────────────── Constants ─────────────────────────
URLHAUS_API_BASE = "https://urlhaus-api.abuse.ch/v1"
OTX_API_BASE = "https://otx.alienvault.com/api/v1"
IPINFO_API = "https://ipinfo.io"
IPAPI_API = "http://ip-api.com/json"

# DNS-based blocklists for IP reputation
DNSBL_LISTS = [
    ("zen.spamhaus.org", "Spamhaus ZEN"),
    ("b.barracudacentral.org", "Barracuda"),
    ("bl.spamcop.net", "SpamCop"),
    ("dnsbl.sorbs.net", "SORBS"),
    ("cbl.abuseat.org", "CBL"),
]

HTTP_TIMEOUT = 10.0


# ───────────────────────── Helpers ─────────────────────────
def _is_valid_ip(value: str) -> bool:
    return bool(re.match(r"^\d{1,3}(\.\d{1,3}){3}$", value))


def _is_valid_domain(value: str) -> bool:
    return bool(re.match(r"^[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$", value))


def _is_valid_hash(value: str) -> bool:
    return bool(re.match(r"^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$", value))


# ───────────────────────── Provider Status ─────────────────────────
def _get_provider_status() -> dict[str, dict[str, Any]]:
    return {
        "urlhaus": {
            "name": "URLhaus (Abuse.ch)",
            "configured": True,
            "capabilities": ["malware_urls", "phishing_urls"],
            "setup_url": "https://urlhaus-api.abuse.ch/",
            "description": "Real-time malicious URL database from Abuse.ch",
        },
        "alienvault_otx": {
            "name": "AlienVault OTX",
            "configured": True,
            "capabilities": ["ioc_lookup", "threat_feeds", "pulse_data"],
            "setup_url": "https://otx.alienvault.com/api",
            "description": "Open Threat Exchange — community-driven threat intelligence",
        },
        "ipinfo": {
            "name": "IPinfo.io",
            "configured": True,
            "capabilities": ["geolocation", "asn", "organization"],
            "setup_url": "https://ipinfo.io/",
            "description": "IP geolocation, ASN, and organization data",
        },
        "ipapi": {
            "name": "ip-api.com",
            "configured": True,
            "capabilities": ["geolocation", "isp", "proxy_detection"],
            "setup_url": "https://ip-api.com/",
            "description": "IP geolocation with ISP and proxy/VPN detection",
        },
        "dnsbl": {
            "name": "DNSBL Blocklists",
            "configured": True,
            "capabilities": ["spam_detection", "abuse_detection"],
            "setup_url": "https://www.spamhaus.org/",
            "description": "DNS-based blocklist checks (Spamhaus, Barracuda, SORBS)",
        },
        "abuseipdb": {
            "name": "AbuseIPDB",
            "configured": bool(settings.ABUSEIPDB_API_KEY),
            "capabilities": ["ip_reputation", "abuse_reports", "confidence_score"],
            "setup_url": "https://www.abuseipdb.com/api",
            "description": "IP abuse confidence scoring and report database",
        },
        "virustotal": {
            "name": "VirusTotal",
            "configured": bool(settings.VIRUSTOTAL_API_KEY),
            "capabilities": ["url_scan", "file_hash", "domain_reputation", "multi_engine"],
            "setup_url": "https://www.virustotal.com/gui/join-us",
            "description": "Multi-engine antivirus and URL scanner",
        },
    }


# ═══════════════════════════════════════════════════════════
#  PROVIDER LOOKUP FUNCTIONS — ALL REAL, NO SYNTHETIC
# ═══════════════════════════════════════════════════════════

# ─── URLhaus (Abuse.ch) ───
async def _urlhaus_lookup_url(url: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.post(f"{URLHAUS_API_BASE}/url/", data={"url": url})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("query_status") == "ok":
                    return {
                        "provider": "urlhaus",
                        "provider_name": "URLhaus (Abuse.ch)",
                        "match": True,
                        "threat_type": data.get("threat", "unknown"),
                        "status": data.get("url_status", "unknown"),
                        "date_added": data.get("date_added"),
                        "tags": data.get("tags") or [],
                        "reference": data.get("urlhaus_reference"),
                    }
                return {"provider": "urlhaus", "provider_name": "URLhaus (Abuse.ch)", "match": False, "status": data.get("query_status")}
    except Exception:
        pass
    return None


async def _urlhaus_lookup_host(host: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.post(f"{URLHAUS_API_BASE}/host/", data={"host": host})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("query_status") in ("ok", "no_results"):
                    urls = data.get("urls", [])
                    return {
                        "provider": "urlhaus",
                        "provider_name": "URLhaus (Abuse.ch)",
                        "match": len(urls) > 0,
                        "url_count": data.get("url_count", 0),
                        "urls_online": data.get("urls_online", 0),
                        "blacklists": data.get("blacklists", {}),
                        "recent_urls": [
                            {
                                "url": u.get("url", "")[:120],
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
    hash_type = "sha256_hash" if len(file_hash) == 64 else "md5_hash"
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.post(f"{URLHAUS_API_BASE}/payload/", data={hash_type: file_hash})
            if resp.status_code == 200:
                data = resp.json()
                if data.get("query_status") in ("ok", "no_results"):
                    return {
                        "provider": "urlhaus",
                        "provider_name": "URLhaus (Abuse.ch)",
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


# ─── AlienVault OTX (FREE, no key needed for public) ───
async def _otx_lookup_ip(ip: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(f"{OTX_API_BASE}/indicators/IPv4/{ip}/general")
            if resp.status_code == 200:
                data = resp.json()
                pulse_count = data.get("pulse_info", {}).get("count", 0)
                pulses = data.get("pulse_info", {}).get("pulses", [])
                return {
                    "provider": "alienvault_otx",
                    "provider_name": "AlienVault OTX",
                    "match": pulse_count > 0,
                    "pulse_count": pulse_count,
                    "reputation": data.get("reputation", 0),
                    "country_code": data.get("country_code", ""),
                    "country_name": data.get("country_name", ""),
                    "asn": data.get("asn", ""),
                    "city": data.get("city", ""),
                    "pulses": [
                        {
                            "name": p.get("name", ""),
                            "description": (p.get("description") or "")[:200],
                            "created": p.get("created"),
                            "tags": (p.get("tags") or [])[:5],
                            "adversary": p.get("adversary", ""),
                            "targeted_countries": (p.get("targeted_countries") or [])[:5],
                        }
                        for p in pulses[:5]
                    ],
                    "reference": f"https://otx.alienvault.com/indicator/ip/{ip}",
                }
    except Exception:
        pass
    return None


async def _otx_lookup_domain(domain: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(f"{OTX_API_BASE}/indicators/domain/{domain}/general")
            if resp.status_code == 200:
                data = resp.json()
                pulse_count = data.get("pulse_info", {}).get("count", 0)
                pulses = data.get("pulse_info", {}).get("pulses", [])
                return {
                    "provider": "alienvault_otx",
                    "provider_name": "AlienVault OTX",
                    "match": pulse_count > 0,
                    "pulse_count": pulse_count,
                    "alexa_rank": data.get("alexa", ""),
                    "whois_info": (data.get("whois") or "")[:300],
                    "pulses": [
                        {
                            "name": p.get("name", ""),
                            "description": (p.get("description") or "")[:200],
                            "created": p.get("created"),
                            "tags": (p.get("tags") or [])[:5],
                        }
                        for p in pulses[:5]
                    ],
                    "reference": f"https://otx.alienvault.com/indicator/domain/{domain}",
                }
    except Exception:
        pass
    return None


async def _otx_lookup_url(url: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(f"{OTX_API_BASE}/indicators/url/{url}/general")
            if resp.status_code == 200:
                data = resp.json()
                pulse_count = data.get("pulse_info", {}).get("count", 0)
                return {
                    "provider": "alienvault_otx",
                    "provider_name": "AlienVault OTX",
                    "match": pulse_count > 0,
                    "pulse_count": pulse_count,
                    "reference": f"https://otx.alienvault.com/indicator/url/{url}",
                }
    except Exception:
        pass
    return None


async def _otx_lookup_hash(file_hash: str) -> dict[str, Any] | None:
    hash_type = "file"
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(f"{OTX_API_BASE}/indicators/{hash_type}/{file_hash}/general")
            if resp.status_code == 200:
                data = resp.json()
                pulse_count = data.get("pulse_info", {}).get("count", 0)
                pulses = data.get("pulse_info", {}).get("pulses", [])
                return {
                    "provider": "alienvault_otx",
                    "provider_name": "AlienVault OTX",
                    "match": pulse_count > 0,
                    "pulse_count": pulse_count,
                    "pulses": [
                        {
                            "name": p.get("name", ""),
                            "description": (p.get("description") or "")[:200],
                            "tags": (p.get("tags") or [])[:5],
                        }
                        for p in pulses[:5]
                    ],
                    "reference": f"https://otx.alienvault.com/indicator/file/{file_hash}",
                }
    except Exception:
        pass
    return None


# ─── IPinfo.io (FREE, no key needed for basic) ───
async def _ipinfo_lookup(ip: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(f"{IPINFO_API}/{ip}/json")
            if resp.status_code == 200:
                data = resp.json()
                if data.get("bogon"):
                    return {
                        "provider": "ipinfo",
                        "provider_name": "IPinfo.io",
                        "match": False,
                        "note": "Bogon/private IP address",
                    }
                loc = data.get("loc", "")
                lat, lon = ("", "")
                if "," in loc:
                    parts = loc.split(",")
                    lat, lon = parts[0], parts[1]
                return {
                    "provider": "ipinfo",
                    "provider_name": "IPinfo.io",
                    "match": False,  # IPinfo provides context, not threat matching
                    "is_context": True,
                    "hostname": data.get("hostname", ""),
                    "city": data.get("city", ""),
                    "region": data.get("region", ""),
                    "country": data.get("country", ""),
                    "latitude": lat,
                    "longitude": lon,
                    "org": data.get("org", ""),
                    "postal": data.get("postal", ""),
                    "timezone": data.get("timezone", ""),
                }
    except Exception:
        pass
    return None


# ─── ip-api.com (FREE, no key needed) ───
async def _ipapi_lookup(ip: str) -> dict[str, Any] | None:
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            # Request extra fields: proxy, mobile, hosting
            resp = await client.get(
                f"{IPAPI_API}/{ip}",
                params={"fields": "status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,asname,reverse,mobile,proxy,hosting,query"},
            )
            if resp.status_code == 200:
                data = resp.json()
                if data.get("status") == "success":
                    return {
                        "provider": "ipapi",
                        "provider_name": "ip-api.com",
                        "match": False,
                        "is_context": True,
                        "country": data.get("country", ""),
                        "country_code": data.get("countryCode", ""),
                        "region": data.get("regionName", ""),
                        "city": data.get("city", ""),
                        "latitude": str(data.get("lat", "")),
                        "longitude": str(data.get("lon", "")),
                        "isp": data.get("isp", ""),
                        "org": data.get("org", ""),
                        "as_number": data.get("as", ""),
                        "as_name": data.get("asname", ""),
                        "reverse_dns": data.get("reverse", ""),
                        "is_proxy": data.get("proxy", False),
                        "is_mobile": data.get("mobile", False),
                        "is_hosting": data.get("hosting", False),
                    }
    except Exception:
        pass
    return None


# ─── DNSBL Blocklist Check (FREE, DNS-based) ───
async def _dnsbl_check(ip: str) -> dict[str, Any] | None:
    """Check if IP is listed in multiple DNS-based blocklists."""
    if not _is_valid_ip(ip):
        return None

    # Reverse IP octets for DNSBL query
    reversed_ip = ".".join(ip.split(".")[::-1])
    listings: list[dict[str, Any]] = []
    total_checked = 0

    async def _check_single_dnsbl(dnsbl_zone: str, dnsbl_name: str) -> dict[str, Any] | None:
        query = f"{reversed_ip}.{dnsbl_zone}"
        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(None, socket.gethostbyname, query)
            return {"blocklist": dnsbl_name, "zone": dnsbl_zone, "listed": True}
        except socket.gaierror:
            return {"blocklist": dnsbl_name, "zone": dnsbl_zone, "listed": False}
        except Exception:
            return None

    tasks = [_check_single_dnsbl(zone, name) for zone, name in DNSBL_LISTS]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for r in results:
        if isinstance(r, dict):
            total_checked += 1
            if r.get("listed"):
                listings.append(r)

    listed_count = len(listings)
    return {
        "provider": "dnsbl",
        "provider_name": "DNSBL Blocklists",
        "match": listed_count > 0,
        "total_checked": total_checked,
        "listed_count": listed_count,
        "listings": listings,
        "blocklists_checked": [name for _, name in DNSBL_LISTS],
    }


# ─── AbuseIPDB (requires free API key) ───
async def _abuseipdb_lookup(ip: str) -> dict[str, Any] | None:
    if not settings.ABUSEIPDB_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                "https://api.abuseipdb.com/api/v2/check",
                params={"ipAddress": ip, "maxAgeInDays": "90", "verbose": ""},
                headers={
                    "Key": settings.ABUSEIPDB_API_KEY,
                    "Accept": "application/json",
                },
            )
            if resp.status_code == 200:
                data = resp.json().get("data", {})
                return {
                    "provider": "abuseipdb",
                    "provider_name": "AbuseIPDB",
                    "match": data.get("abuseConfidenceScore", 0) > 0,
                    "abuse_confidence_score": data.get("abuseConfidenceScore", 0),
                    "total_reports": data.get("totalReports", 0),
                    "num_distinct_users": data.get("numDistinctUsers", 0),
                    "last_reported_at": data.get("lastReportedAt"),
                    "is_whitelisted": data.get("isWhitelisted", False),
                    "is_tor": data.get("isTor", False),
                    "usage_type": data.get("usageType", ""),
                    "domain": data.get("domain", ""),
                    "country_code": data.get("countryCode", ""),
                    "isp": data.get("isp", ""),
                    "reference": f"https://www.abuseipdb.com/check/{ip}",
                }
    except Exception:
        pass
    return None


# ─── VirusTotal (requires free API key) ───
async def _virustotal_lookup_ip(ip: str) -> dict[str, Any] | None:
    if not settings.VIRUSTOTAL_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/ip_addresses/{ip}",
                headers={"x-apikey": settings.VIRUSTOTAL_API_KEY},
            )
            if resp.status_code == 200:
                attrs = resp.json().get("data", {}).get("attributes", {})
                stats = attrs.get("last_analysis_stats", {})
                malicious = stats.get("malicious", 0)
                suspicious = stats.get("suspicious", 0)
                return {
                    "provider": "virustotal",
                    "provider_name": "VirusTotal",
                    "match": (malicious + suspicious) > 0,
                    "malicious_detections": malicious,
                    "suspicious_detections": suspicious,
                    "harmless": stats.get("harmless", 0),
                    "undetected": stats.get("undetected", 0),
                    "total_engines": sum(stats.values()),
                    "country": attrs.get("country", ""),
                    "as_owner": attrs.get("as_owner", ""),
                    "asn": attrs.get("asn", 0),
                    "network": attrs.get("network", ""),
                    "reputation": attrs.get("reputation", 0),
                    "reference": f"https://www.virustotal.com/gui/ip-address/{ip}",
                }
    except Exception:
        pass
    return None


async def _virustotal_lookup_domain(domain: str) -> dict[str, Any] | None:
    if not settings.VIRUSTOTAL_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/domains/{domain}",
                headers={"x-apikey": settings.VIRUSTOTAL_API_KEY},
            )
            if resp.status_code == 200:
                attrs = resp.json().get("data", {}).get("attributes", {})
                stats = attrs.get("last_analysis_stats", {})
                malicious = stats.get("malicious", 0)
                suspicious = stats.get("suspicious", 0)
                return {
                    "provider": "virustotal",
                    "provider_name": "VirusTotal",
                    "match": (malicious + suspicious) > 0,
                    "malicious_detections": malicious,
                    "suspicious_detections": suspicious,
                    "harmless": stats.get("harmless", 0),
                    "undetected": stats.get("undetected", 0),
                    "total_engines": sum(stats.values()),
                    "registrar": attrs.get("registrar", ""),
                    "creation_date": attrs.get("creation_date"),
                    "reputation": attrs.get("reputation", 0),
                    "categories": attrs.get("categories", {}),
                    "reference": f"https://www.virustotal.com/gui/domain/{domain}",
                }
    except Exception:
        pass
    return None


async def _virustotal_lookup_hash(file_hash: str) -> dict[str, Any] | None:
    if not settings.VIRUSTOTAL_API_KEY:
        return None
    try:
        async with httpx.AsyncClient(timeout=HTTP_TIMEOUT) as client:
            resp = await client.get(
                f"https://www.virustotal.com/api/v3/files/{file_hash}",
                headers={"x-apikey": settings.VIRUSTOTAL_API_KEY},
            )
            if resp.status_code == 200:
                attrs = resp.json().get("data", {}).get("attributes", {})
                stats = attrs.get("last_analysis_stats", {})
                malicious = stats.get("malicious", 0)
                suspicious = stats.get("suspicious", 0)
                return {
                    "provider": "virustotal",
                    "provider_name": "VirusTotal",
                    "match": (malicious + suspicious) > 0,
                    "malicious_detections": malicious,
                    "suspicious_detections": suspicious,
                    "harmless": stats.get("harmless", 0),
                    "undetected": stats.get("undetected", 0),
                    "total_engines": sum(stats.values()),
                    "file_type": attrs.get("type_description", ""),
                    "file_size": attrs.get("size"),
                    "file_name": (attrs.get("meaningful_name") or attrs.get("names", [""])[0] if attrs.get("names") else ""),
                    "sha256": attrs.get("sha256", ""),
                    "md5": attrs.get("md5", ""),
                    "signature": attrs.get("signature_info", {}).get("product", ""),
                    "first_submission": attrs.get("first_submission_date"),
                    "last_analysis": attrs.get("last_analysis_date"),
                    "popular_threat_name": attrs.get("popular_threat_classification", {}).get("suggested_threat_label", ""),
                    "reference": f"https://www.virustotal.com/gui/file/{file_hash}",
                }
    except Exception:
        pass
    return None


# ═══════════════════════════════════════════════════════════
#  RISK SCORING ENGINE
# ═══════════════════════════════════════════════════════════
def _calculate_risk_score(results: list[dict[str, Any]]) -> dict[str, Any]:
    """Aggregate risk score from all providers. Returns 0-100 score + level."""
    score = 0
    factors: list[str] = []

    for r in results:
        if r.get("is_context"):
            # Context providers (ipinfo, ipapi) don't add threat score directly
            if r.get("is_proxy"):
                score += 15
                factors.append("IP identified as proxy/VPN")
            if r.get("is_hosting"):
                score += 5
                factors.append("IP is a hosting provider")
            continue

        provider = r.get("provider", "")

        if provider == "urlhaus" and r.get("match"):
            score += 40
            if r.get("urls_online", 0) > 0:
                score += 20
                factors.append(f"URLhaus: {r['urls_online']} active malicious URLs")
            else:
                factors.append("URLhaus: historical threat data found")

        elif provider == "alienvault_otx" and r.get("match"):
            pulse_count = r.get("pulse_count", 0)
            score += min(30, pulse_count * 5)
            factors.append(f"OTX: appears in {pulse_count} threat pulses")

        elif provider == "dnsbl" and r.get("match"):
            listed = r.get("listed_count", 0)
            score += min(35, listed * 12)
            factors.append(f"DNSBL: listed in {listed} blocklist(s)")

        elif provider == "abuseipdb" and r.get("match"):
            confidence = r.get("abuse_confidence_score", 0)
            score += min(40, confidence)
            factors.append(f"AbuseIPDB: {confidence}% abuse confidence")

        elif provider == "virustotal" and r.get("match"):
            mal = r.get("malicious_detections", 0)
            sus = r.get("suspicious_detections", 0)
            score += min(50, (mal * 5) + (sus * 2))
            factors.append(f"VirusTotal: {mal} malicious, {sus} suspicious detections")

    score = min(100, score)

    if score >= 75:
        level = "critical"
    elif score >= 50:
        level = "high"
    elif score >= 25:
        level = "medium"
    elif score > 0:
        level = "low"
    else:
        level = "clean"

    return {"score": score, "level": level, "factors": factors}


# ═══════════════════════════════════════════════════════════
#  API ENDPOINTS
# ═══════════════════════════════════════════════════════════

@router.get("/providers")
async def list_providers(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    providers = _get_provider_status()
    active_count = sum(1 for p in providers.values() if p["configured"])
    return {
        "providers": providers,
        "active_count": active_count,
        "total_count": len(providers),
        "data_source": "live_intelligence",
        "note": "All active providers query REAL intelligence feeds. Configure API keys for additional coverage.",
    }


@router.post("/lookup")
async def lookup_ioc(
    payload: dict[str, str],
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    ioc_type = (payload.get("ioc_type") or payload.get("type", "")).strip().lower()
    ioc_value = (payload.get("ioc_value") or payload.get("value", "")).strip()

    if not ioc_type or not ioc_value:
        raise HTTPException(status_code=400, detail="Both 'type' and 'value' are required")

    if ioc_type not in ("ip", "domain", "url", "hash"):
        raise HTTPException(status_code=400, detail="type must be one of: ip, domain, url, hash")

    # Input validation
    if ioc_type == "ip" and not _is_valid_ip(ioc_value):
        raise HTTPException(status_code=400, detail="Invalid IP address format")
    if ioc_type == "domain" and not _is_valid_domain(ioc_value):
        raise HTTPException(status_code=400, detail="Invalid domain format")
    if ioc_type == "hash" and not _is_valid_hash(ioc_value):
        raise HTTPException(status_code=400, detail="Invalid hash format (MD5/SHA1/SHA256 expected)")

    # Build parallel tasks based on IOC type
    tasks: list[Any] = []
    queried_providers: list[str] = []

    if ioc_type == "ip":
        # URLhaus (host lookup for IPs)
        tasks.append(_urlhaus_lookup_host(ioc_value))
        queried_providers.append("urlhaus")

        # AlienVault OTX
        tasks.append(_otx_lookup_ip(ioc_value))
        queried_providers.append("alienvault_otx")

        # IPinfo.io geolocation
        tasks.append(_ipinfo_lookup(ioc_value))
        queried_providers.append("ipinfo")

        # ip-api.com geolocation + ISP
        tasks.append(_ipapi_lookup(ioc_value))
        queried_providers.append("ipapi")

        # DNSBL blocklist checks
        tasks.append(_dnsbl_check(ioc_value))
        queried_providers.append("dnsbl")

        # AbuseIPDB (if key configured)
        if settings.ABUSEIPDB_API_KEY:
            tasks.append(_abuseipdb_lookup(ioc_value))
            queried_providers.append("abuseipdb")

        # VirusTotal (if key configured)
        if settings.VIRUSTOTAL_API_KEY:
            tasks.append(_virustotal_lookup_ip(ioc_value))
            queried_providers.append("virustotal")

    elif ioc_type == "domain":
        tasks.append(_urlhaus_lookup_host(ioc_value))
        queried_providers.append("urlhaus")

        tasks.append(_otx_lookup_domain(ioc_value))
        queried_providers.append("alienvault_otx")

        if settings.VIRUSTOTAL_API_KEY:
            tasks.append(_virustotal_lookup_domain(ioc_value))
            queried_providers.append("virustotal")

    elif ioc_type == "url":
        tasks.append(_urlhaus_lookup_url(ioc_value))
        queried_providers.append("urlhaus")

        tasks.append(_otx_lookup_url(ioc_value))
        queried_providers.append("alienvault_otx")

    elif ioc_type == "hash":
        tasks.append(_urlhaus_lookup_hash(ioc_value))
        queried_providers.append("urlhaus")

        tasks.append(_otx_lookup_hash(ioc_value))
        queried_providers.append("alienvault_otx")

        if settings.VIRUSTOTAL_API_KEY:
            tasks.append(_virustotal_lookup_hash(ioc_value))
            queried_providers.append("virustotal")

    # Execute ALL provider queries in parallel
    raw_results = await asyncio.gather(*tasks, return_exceptions=True)

    # Filter valid results
    results: list[dict[str, Any]] = []
    successful_providers: list[str] = []
    failed_providers: list[str] = []

    for i, r in enumerate(raw_results):
        provider_name = queried_providers[i] if i < len(queried_providers) else "unknown"
        if isinstance(r, dict):
            results.append(r)
            successful_providers.append(provider_name)
        else:
            failed_providers.append(provider_name)

    if not results:
        raise HTTPException(
            status_code=503,
            detail="All intelligence providers failed to respond. Please try again later.",
        )

    # Calculate risk score
    risk = _calculate_risk_score(results)

    # Separate threat results from context results
    threat_results = [r for r in results if not r.get("is_context")]
    context_results = [r for r in results if r.get("is_context")]

    # Build geolocation from context providers
    geolocation: dict[str, Any] = {}
    network_info: dict[str, Any] = {}
    for ctx in context_results:
        if ctx.get("provider") == "ipinfo":
            geolocation.update({
                "city": ctx.get("city", ""),
                "region": ctx.get("region", ""),
                "country": ctx.get("country", ""),
                "latitude": ctx.get("latitude", ""),
                "longitude": ctx.get("longitude", ""),
                "timezone": ctx.get("timezone", ""),
                "postal": ctx.get("postal", ""),
            })
            network_info.update({
                "hostname": ctx.get("hostname", ""),
                "org": ctx.get("org", ""),
            })
        elif ctx.get("provider") == "ipapi":
            if not geolocation.get("city"):
                geolocation.update({
                    "city": ctx.get("city", ""),
                    "region": ctx.get("region", ""),
                    "country": ctx.get("country", ""),
                    "country_code": ctx.get("country_code", ""),
                    "latitude": ctx.get("latitude", ""),
                    "longitude": ctx.get("longitude", ""),
                })
            network_info.update({
                "isp": ctx.get("isp", ""),
                "as_number": ctx.get("as_number", ""),
                "as_name": ctx.get("as_name", ""),
                "reverse_dns": ctx.get("reverse_dns", ""),
                "is_proxy": ctx.get("is_proxy", False),
                "is_mobile": ctx.get("is_mobile", False),
                "is_hosting": ctx.get("is_hosting", False),
            })

    # Build summary
    threats_found = sum(1 for r in threat_results if r.get("match"))
    summary_parts: list[str] = []

    if risk["level"] == "critical":
        summary_parts.append(f"🔴 CRITICAL THREAT — Risk Score {risk['score']}/100")
    elif risk["level"] == "high":
        summary_parts.append(f"🟠 HIGH RISK — Risk Score {risk['score']}/100")
    elif risk["level"] == "medium":
        summary_parts.append(f"🟡 MEDIUM RISK — Risk Score {risk['score']}/100")
    elif risk["level"] == "low":
        summary_parts.append(f"🔵 LOW RISK — Risk Score {risk['score']}/100")
    else:
        summary_parts.append(f"🟢 CLEAN — No threats detected (Score {risk['score']}/100)")

    summary_parts.append(f"Queried {len(successful_providers)} provider(s)")
    if threats_found > 0:
        summary_parts.append(f"{threats_found} provider(s) reported threat data")

    return {
        "ioc_type": ioc_type,
        "ioc_value": ioc_value,
        "risk_score": risk,
        "results": results,
        "threat_results": threat_results,
        "context_results": context_results,
        "geolocation": geolocation if geolocation else None,
        "network_info": network_info if network_info else None,
        "summary": " | ".join(summary_parts),
        "data_source": "live_intelligence",
        "queried_providers": successful_providers,
        "failed_providers": failed_providers,
        "total_providers_queried": len(successful_providers),
        "provider_status": _get_provider_status(),
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
                "status": "active",
                "url": "https://urlhaus-api.abuse.ch/",
            },
            {
                "id": "otx",
                "name": "AlienVault OTX Pulses",
                "description": "Open threat exchange — community IOC collections",
                "type": "iocs",
                "update_frequency": "continuous",
                "status": "active",
                "url": "https://otx.alienvault.com/",
            },
            {
                "id": "dnsbl",
                "name": "DNSBL Blocklists",
                "description": "Spamhaus, Barracuda, SpamCop, SORBS, CBL",
                "type": "ip_blocklists",
                "update_frequency": "real-time",
                "status": "active",
            },
        ],
        "data_source": "live_intelligence",
        "note": "All listed feeds provide REAL threat intelligence data.",
    }
