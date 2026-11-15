"""Phishing URL analysis endpoint."""
from __future__ import annotations

import re
import unicodedata
from datetime import datetime, timezone
from typing import Any
from urllib.parse import urlparse

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# Homoglyph map (common substitutions)
_HOMOGLYPHS: dict[str, str] = {
    "0": "o", "1": "l", "3": "e", "4": "a", "5": "s",
    "6": "g", "7": "t", "8": "b", "vv": "w", "rn": "m",
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c",
    "х": "x", "і": "i", "ο": "o",  # Cyrillic/Greek lookalikes
}

# Common brands for typosquatting detection
_BRANDS = [
    "google", "paypal", "apple", "microsoft", "amazon", "facebook",
    "netflix", "instagram", "twitter", "linkedin", "github", "dropbox",
    "stripe", "shopify", "outlook", "office", "adobe", "zoom",
]

# Suspicious TLDs/patterns
_SUSPICIOUS_TLDS = {".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".xyz", ".click", ".download"}
_SUSPICIOUS_PATTERNS = [
    r"login[-.]", r"secure[-.]", r"account[-.]", r"verify[-.]",
    r"update[-.]", r"confirm[-.]", r"banking[-.]", r"support[-.]",
    r"\d{10,}", r"[-]{2,}", r"[a-z0-9]{30,}",
]


def _normalise(text: str) -> str:
    """NFKC-normalise and lower-case."""
    return unicodedata.normalize("NFKC", text).lower()


def _detect_homoglyphs(domain: str) -> list[str]:
    findings = []
    norm = _normalise(domain)
    for glyph, replacement in _HOMOGLYPHS.items():
        if glyph in norm:
            findings.append(f"Possible homoglyph substitution: '{glyph}' → '{replacement}'")
    return findings


def _detect_typosquatting(domain: str) -> list[str]:
    findings = []
    base = domain.split(".")[0].lower()
    for brand in _BRANDS:
        # Simple edit-distance check (1-2 char difference)
        if brand != base and len(brand) > 3:
            diff = sum(1 for a, b in zip(base, brand) if a != b) + abs(len(base) - len(brand))
            if 0 < diff <= 2 and (brand in base or base in brand):
                findings.append(f"Possible typosquatting of '{brand}'")
    return findings


def _analyse_url(raw_url: str) -> dict[str, Any]:
    # Prepend scheme if missing
    if not raw_url.startswith(("http://", "https://")):
        raw_url = "https://" + raw_url

    try:
        parsed = urlparse(raw_url)
    except Exception:
        return {"error": "Cannot parse URL"}

    domain = parsed.netloc.lower()
    scheme = parsed.scheme
    path = parsed.path
    query = parsed.query

    risk_factors = []
    score_penalty = 0

    # HTTP vs HTTPS
    if scheme == "http":
        risk_factors.append({"severity": "high", "finding": "URL uses plain HTTP (not HTTPS)", "category": "protocol"})
        score_penalty += 25

    # Suspicious TLD
    for tld in _SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            risk_factors.append({"severity": "medium", "finding": f"Uses suspicious TLD: {tld}", "category": "domain"})
            score_penalty += 15

    # Suspicious patterns
    for pattern in _SUSPICIOUS_PATTERNS:
        if re.search(pattern, domain + path):
            risk_factors.append({"severity": "medium", "finding": f"Suspicious URL pattern: {pattern}", "category": "pattern"})
            score_penalty += 10
            break  # one flag per category

    # Homoglyphs
    hg = _detect_homoglyphs(domain)
    for h in hg:
        risk_factors.append({"severity": "high", "finding": h, "category": "homoglyph"})
        score_penalty += 20

    # Typosquatting
    ts = _detect_typosquatting(domain)
    for t in ts:
        risk_factors.append({"severity": "high", "finding": t, "category": "typosquatting"})
        score_penalty += 25

    # IP-based URL
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain):
        risk_factors.append({"severity": "high", "finding": "URL uses an IP address instead of a domain name", "category": "domain"})
        score_penalty += 20

    # Excessive subdomains
    parts = domain.split(".")
    if len(parts) > 4:
        risk_factors.append({"severity": "medium", "finding": f"URL has {len(parts)} subdomain levels", "category": "domain"})
        score_penalty += 10

    score_penalty = min(100, score_penalty)
    risk_score = score_penalty
    if risk_score >= 75:
        risk_level = "critical"
    elif risk_score >= 50:
        risk_level = "high"
    elif risk_score >= 25:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "domain": domain,
        "scheme": scheme,
        "path": path,
        "has_query": bool(query),
        "risk_score": float(risk_score),
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "is_https": scheme == "https",
        "subdomain_count": max(0, len(parts) - 2),
    }


@router.post("/analyze")
async def analyze_phishing(
    payload: dict[str, str],
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    url = payload.get("url", "").strip()
    if not url:
        return {"error": "URL is required"}

    analysis = _analyse_url(url)

    recommendations = []
    if analysis.get("risk_level") in ("critical", "high"):
        recommendations.append("Do NOT visit this URL — multiple risk indicators detected")
        recommendations.append("If you received this via email, report it as phishing")
    elif analysis.get("risk_level") == "medium":
        recommendations.append("Exercise caution before visiting this URL")
        recommendations.append("Verify the sender or source before clicking")
    else:
        recommendations.append("No significant phishing indicators detected, but always stay cautious")

    return {
        **analysis,
        "recommendations": recommendations,
        "data_notice": "This is a client-side pattern analysis only. It does not access the URL or external threat feeds.",
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }
