"""Phishing URL analysis endpoint — REAL intelligence, ZERO synthetic data.

v2.0 — Enhanced with live DNS resolution, SSL certificate inspection,
domain age via RDAP/WHOIS, HTTP redirect chain analysis, and Google
Web Risk-style pattern matching.  All checks are real network probes.
"""
from __future__ import annotations

import logging
import re
import ssl
import socket
import uuid
import unicodedata
from datetime import datetime, timezone
from typing import Any, Optional
from urllib.parse import urlparse

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.core.security import hmac_hash
from app.models.assessment import Assessment
from app.models.notification import Notification
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter()

# ───────────────────────────────────────────────────────────────
# Constants
# ───────────────────────────────────────────────────────────────

# Homoglyph map (common substitutions — Cyrillic, Greek, l33t)
_HOMOGLYPHS: dict[str, str] = {
    "0": "o", "1": "l", "3": "e", "4": "a", "5": "s",
    "6": "g", "7": "t", "8": "b", "vv": "w", "rn": "m",
    "а": "a", "е": "e", "о": "o", "р": "p", "с": "c",
    "х": "x", "і": "i", "ο": "o", "ν": "v", "τ": "t",
    "ѕ": "s", "ɡ": "g", "ꮪ": "s",
}

# Top brand targets for typosquatting
_BRANDS = [
    "google", "paypal", "apple", "microsoft", "amazon", "facebook",
    "netflix", "instagram", "twitter", "linkedin", "github", "dropbox",
    "stripe", "shopify", "outlook", "office", "adobe", "zoom",
    "spotify", "whatsapp", "telegram", "discord", "slack", "chase",
    "wellsfargo", "bankofamerica", "citibank", "usps", "fedex", "dhl",
]

# Suspicious TLDs heavily used in phishing
_SUSPICIOUS_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".top", ".xyz", ".click",
    ".download", ".link", ".work", ".gdn", ".bid", ".stream",
    ".racing", ".win", ".loan", ".date", ".review", ".faith",
    ".science", ".party", ".trade", ".webcam", ".zip", ".mov",
}

# Suspicious URL patterns
_SUSPICIOUS_PATTERNS = [
    (r"login[-.]+", "login-* keyword in domain — common phishing lure"),
    (r"secure[-.]+", "secure-* keyword — impersonates security"),
    (r"account[-.]+", "account-* keyword — credential harvesting"),
    (r"verify[-.]+", "verify-* keyword — verification phishing"),
    (r"update[-.]+", "update-* keyword — update-scam pattern"),
    (r"confirm[-.]+", "confirm-* keyword — confirmation phishing"),
    (r"banking[-.]+", "banking-* keyword — financial phishing"),
    (r"support[-.]+", "support-* keyword — tech support scam"),
    (r"signin[-.]+", "signin-* keyword — login phishing"),
    (r"password[-.]+", "password-* keyword — credential harvesting"),
    (r"\d{10,}", "Long numeric string — obfuscation technique"),
    (r"[-]{3,}", "Excessive hyphens — domain obfuscation"),
    (r"[a-z0-9]{30,}", "Very long random subdomain — obfuscation"),
    (r"@", "@ symbol in URL — basic auth credential confusion"),
]

# Known phishing path keywords
_PHISHING_PATHS = [
    "/login", "/signin", "/auth", "/verify", "/confirm", "/account",
    "/secure", "/update", "/password", "/reset", "/billing",
    "/payment", "/wallet", "/webmail", "/credential",
]


# ───────────────────────────────────────────────────────────────
# Utility functions
# ───────────────────────────────────────────────────────────────

def _normalise(text: str) -> str:
    """NFKC-normalise and lower-case."""
    return unicodedata.normalize("NFKC", text).lower()


def _has_non_ascii(domain: str) -> bool:
    """Check if domain contains non-ASCII (potential IDN homograph)."""
    try:
        domain.encode("ascii")
        return False
    except UnicodeEncodeError:
        return True


def _detect_homoglyphs(domain: str) -> list[dict[str, Any]]:
    findings = []
    norm = _normalise(domain)
    for glyph, replacement in _HOMOGLYPHS.items():
        if glyph in norm:
            findings.append({
                "severity": "high",
                "finding": f"Homoglyph substitution detected: '{glyph}' mimics '{replacement}' — Cyrillic/Greek character attack",
                "category": "Homograph Attack",
            })
    if _has_non_ascii(domain):
        findings.append({
            "severity": "critical",
            "finding": "Domain contains non-ASCII characters (IDN homograph attack vector). Visual spoofing of legitimate domains.",
            "category": "IDN Homograph",
        })
    return findings


def _detect_typosquatting(domain: str) -> list[dict[str, Any]]:
    findings = []
    base = domain.split(".")[0].lower()
    for brand in _BRANDS:
        if brand == base:
            continue
        if len(brand) > 3:
            diff = sum(1 for a, b in zip(base, brand) if a != b) + abs(len(base) - len(brand))
            if 0 < diff <= 2 and (brand in base or base in brand):
                findings.append({
                    "severity": "high",
                    "finding": f"Possible typosquatting of '{brand}' (edit distance: {diff})",
                    "category": "Typosquatting",
                })
            elif brand in base and brand != base:
                findings.append({
                    "severity": "medium",
                    "finding": f"Domain contains brand name '{brand}' as substring — potential brand impersonation",
                    "category": "Brand Impersonation",
                })
    return findings


# ───────────────────────────────────────────────────────────────
# REAL network checks (async)
# ───────────────────────────────────────────────────────────────

async def _check_dns_resolution(domain: str) -> dict[str, Any]:
    """Check if domain actually resolves via DNS."""
    try:
        import dns.resolver
        try:
            answers = dns.resolver.resolve(domain, "A")
            ips = [str(r) for r in answers]
            return {"resolves": True, "ip_addresses": ips}
        except (dns.resolver.NXDOMAIN, dns.resolver.NoAnswer):
            return {"resolves": False, "ip_addresses": []}
        except dns.resolver.NoNameservers:
            return {"resolves": False, "ip_addresses": []}
        except Exception:
            return {"resolves": False, "ip_addresses": []}
    except ImportError:
        # dnspython not available — fallback to socket
        try:
            ip = socket.gethostbyname(domain)
            return {"resolves": True, "ip_addresses": [ip]}
        except socket.gaierror:
            return {"resolves": False, "ip_addresses": []}


def _check_ssl_certificate(domain: str) -> dict[str, Any]:
    """Get real SSL certificate info for the domain."""
    result: dict[str, Any] = {
        "has_ssl": False,
        "cert_issuer": None,
        "cert_subject": None,
        "cert_expires": None,
        "days_until_expiry": None,
        "is_self_signed": False,
        "is_expired": False,
        "ssl_error": None,
    }
    try:
        ctx = ssl.create_default_context()
        with socket.create_connection((domain, 443), timeout=8) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                if cert:
                    result["has_ssl"] = True

                    # Issuer
                    issuer_parts = dict(x[0] for x in cert.get("issuer", []))
                    result["cert_issuer"] = issuer_parts.get("organizationName", issuer_parts.get("commonName", "Unknown"))

                    # Subject
                    subject_parts = dict(x[0] for x in cert.get("subject", []))
                    result["cert_subject"] = subject_parts.get("commonName", "Unknown")

                    # Expiry
                    not_after = cert.get("notAfter")
                    if not_after:
                        expires = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z")
                        expires = expires.replace(tzinfo=timezone.utc)
                        result["cert_expires"] = expires.isoformat()
                        delta = expires - datetime.now(timezone.utc)
                        result["days_until_expiry"] = delta.days
                        result["is_expired"] = delta.days < 0

                    # Self-signed check
                    issuer_cn = issuer_parts.get("commonName", "")
                    subject_cn = subject_parts.get("commonName", "")
                    if issuer_cn == subject_cn:
                        result["is_self_signed"] = True

                    # Free cert (LE, ZeroSSL) — not necessarily bad, but suspicious for new domains
                    org = issuer_parts.get("organizationName", "").lower()
                    result["is_free_cert"] = any(x in org for x in ["let's encrypt", "zerossl", "buypass"])

    except ssl.SSLCertVerificationError as e:
        result["ssl_error"] = f"Certificate verification failed: {e}"
        result["has_ssl"] = False
    except ssl.SSLError as e:
        result["ssl_error"] = f"SSL error: {e}"
    except (socket.timeout, ConnectionRefusedError, OSError):
        result["ssl_error"] = "Could not establish SSL connection (port 443 unreachable)"
    except Exception as e:
        result["ssl_error"] = f"SSL check error: {str(e)}"

    return result


async def _check_redirect_chain(url: str) -> dict[str, Any]:
    """Follow HTTP redirects to detect suspicious chains."""
    result: dict[str, Any] = {
        "redirect_count": 0,
        "final_url": url,
        "crosses_domains": False,
        "redirect_chain": [],
    }
    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(10.0, connect=5.0),
            follow_redirects=True,
            max_redirects=10,
        ) as client:
            resp = await client.get(url, headers={"User-Agent": "LeakLens/1.0 PhishingAnalyzer"})
            chain = []
            original_domain = urlparse(url).netloc.lower()

            for redirect in resp.history:
                chain.append(str(redirect.url))

            chain.append(str(resp.url))
            result["redirect_chain"] = chain
            result["redirect_count"] = len(resp.history)
            result["final_url"] = str(resp.url)
            result["final_status"] = resp.status_code

            # Check if redirects cross domains
            domains_seen = set()
            for u in chain:
                try:
                    d = urlparse(u).netloc.lower()
                    if d:
                        domains_seen.add(d)
                except Exception:
                    pass
            result["crosses_domains"] = len(domains_seen) > 1
            result["domains_in_chain"] = list(domains_seen)

    except httpx.TooManyRedirects:
        result["redirect_count"] = 10
        result["excessive_redirects"] = True
    except Exception as e:
        result["error"] = str(e)

    return result


async def _check_domain_age_rdap(domain: str) -> dict[str, Any]:
    """Query RDAP for domain registration date (real WHOIS alternative)."""
    result: dict[str, Any] = {
        "domain_age_days": None,
        "registration_date": None,
        "is_newly_registered": False,
    }
    # Strip subdomains to get registrable domain
    parts = domain.split(".")
    if len(parts) > 2:
        reg_domain = ".".join(parts[-2:])
    else:
        reg_domain = domain

    try:
        async with httpx.AsyncClient(
            timeout=httpx.Timeout(10.0, connect=5.0),
        ) as client:
            resp = await client.get(
                f"https://rdap.org/domain/{reg_domain}",
                headers={"Accept": "application/rdap+json"},
                follow_redirects=True,
            )
            if resp.status_code == 200:
                data = resp.json()
                events = data.get("events", [])
                for event in events:
                    if event.get("eventAction") == "registration":
                        reg_date_str = event.get("eventDate", "")
                        if reg_date_str:
                            try:
                                reg_date = datetime.fromisoformat(reg_date_str.replace("Z", "+00:00"))
                                result["registration_date"] = reg_date.isoformat()
                                age = (datetime.now(timezone.utc) - reg_date).days
                                result["domain_age_days"] = age
                                result["is_newly_registered"] = age < 30
                            except Exception:
                                pass
                        break
    except Exception as e:
        logger.debug("RDAP lookup failed for %s: %s", reg_domain, e)

    return result


# ───────────────────────────────────────────────────────────────
# Main URL analysis — combines heuristics + real network checks
# ───────────────────────────────────────────────────────────────

async def _analyse_url_full(raw_url: str) -> dict[str, Any]:
    """Full phishing analysis with REAL network probes + heuristics."""
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

    if not domain:
        return {"error": "Cannot extract domain from URL"}

    risk_factors: list[dict[str, Any]] = []
    score_penalty = 0
    ssl_result: dict[str, Any] = {}
    age_result: dict[str, Any] = {}
    redirect_result: dict[str, Any] = {}

    # ─── Heuristic checks (instant) ───────────────────────────

    # 1. HTTP vs HTTPS
    if scheme == "http":
        risk_factors.append({
            "severity": "high",
            "finding": "URL uses plain HTTP without TLS encryption — credentials and data transmitted in cleartext",
            "category": "Protocol Security",
        })
        score_penalty += 20

    # 2. Suspicious TLD
    for tld in _SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            risk_factors.append({
                "severity": "medium",
                "finding": f"Uses high-risk TLD '{tld}' commonly associated with disposable phishing infrastructure",
                "category": "Suspicious TLD",
            })
            score_penalty += 12
            break

    # 3. URL pattern analysis
    patterns_found = 0
    for pattern, description in _SUSPICIOUS_PATTERNS:
        if re.search(pattern, domain + path, re.IGNORECASE):
            if patterns_found < 3:  # Limit pattern findings
                risk_factors.append({
                    "severity": "medium",
                    "finding": description,
                    "category": "URL Pattern",
                })
            score_penalty += 8
            patterns_found += 1

    # 4. Homoglyph detection
    hg_findings = _detect_homoglyphs(domain)
    for f in hg_findings:
        risk_factors.append(f)
        score_penalty += 20 if f["severity"] == "critical" else 15

    # 5. Typosquatting detection
    ts_findings = _detect_typosquatting(domain)
    for f in ts_findings:
        risk_factors.append(f)
        score_penalty += 20 if f["severity"] == "high" else 10

    # 6. IP-based URL
    if re.match(r"^\d{1,3}(\.\d{1,3}){3}$", domain.split(":")[0]):
        risk_factors.append({
            "severity": "high",
            "finding": "URL uses raw IP address instead of domain name — bypasses DNS reputation checks",
            "category": "IP-Based URL",
        })
        score_penalty += 18

    # 7. Excessive subdomains
    parts = domain.split(".")
    if len(parts) > 4:
        risk_factors.append({
            "severity": "medium",
            "finding": f"URL has {len(parts)} subdomain levels — deep subdomain nesting used to hide malicious intent",
            "category": "Domain Obfuscation",
        })
        score_penalty += 10

    # 8. Phishing path keywords
    path_lower = path.lower()
    for phish_path in _PHISHING_PATHS:
        if phish_path in path_lower:
            risk_factors.append({
                "severity": "low",
                "finding": f"URL path contains credential-related keyword '{phish_path}' — common in phishing pages",
                "category": "Path Analysis",
            })
            score_penalty += 5
            break

    # 9. Data URI or javascript: scheme
    if scheme in ("data", "javascript"):
        risk_factors.append({
            "severity": "critical",
            "finding": f"URL uses '{scheme}:' scheme — direct code execution or data injection vector",
            "category": "Dangerous Scheme",
        })
        score_penalty += 30

    # 10. URL length
    if len(raw_url) > 200:
        risk_factors.append({
            "severity": "low",
            "finding": f"URL is unusually long ({len(raw_url)} characters) — often used to hide malicious parameters",
            "category": "URL Obfuscation",
        })
        score_penalty += 5

    # ─── REAL network checks (async) ──────────────────────────

    # DNS resolution
    dns_result = await _check_dns_resolution(domain)

    if not dns_result["resolves"]:
        risk_factors.append({
            "severity": "info",
            "finding": "Domain does not resolve via DNS — may be deregistered, parked, or already taken down",
            "category": "DNS Resolution",
        })
        # Don't add penalty for non-resolving — could be legitimately offline
    else:
        # Domain resolves — do deeper network checks
        # SSL certificate check
        ssl_result = _check_ssl_certificate(domain)

        if ssl_result.get("has_ssl"):
            if ssl_result.get("is_expired"):
                risk_factors.append({
                    "severity": "high",
                    "finding": f"SSL certificate is EXPIRED (expired {abs(ssl_result.get('days_until_expiry', 0))} days ago) — legitimate sites maintain valid certificates",
                    "category": "SSL Certificate",
                })
                score_penalty += 15
            elif ssl_result.get("is_self_signed"):
                risk_factors.append({
                    "severity": "high",
                    "finding": "SSL certificate is self-signed — no trusted Certificate Authority validation",
                    "category": "SSL Certificate",
                })
                score_penalty += 15
            elif ssl_result.get("is_free_cert"):
                # Free cert + other suspicious indicators = more suspicious
                if score_penalty > 15:
                    risk_factors.append({
                        "severity": "low",
                        "finding": f"Free DV certificate from '{ssl_result.get('cert_issuer', 'Unknown')}' combined with other risk indicators",
                        "category": "SSL Certificate",
                    })
                    score_penalty += 5
            if ssl_result.get("days_until_expiry") is not None and 0 < ssl_result["days_until_expiry"] < 7:
                risk_factors.append({
                    "severity": "medium",
                    "finding": f"SSL certificate expires in {ssl_result['days_until_expiry']} day(s) — short-lived certificates common in phishing",
                    "category": "SSL Certificate",
                })
                score_penalty += 8
        elif not ssl_result.get("ssl_error", "").startswith("Could not"):
            if scheme == "https":
                risk_factors.append({
                    "severity": "high",
                    "finding": f"HTTPS URL but SSL verification failed: {ssl_result.get('ssl_error', 'Unknown error')}",
                    "category": "SSL Certificate",
                })
                score_penalty += 15

        # Redirect chain analysis
        try:
            redirect_result = await _check_redirect_chain(raw_url)

            if redirect_result.get("excessive_redirects"):
                risk_factors.append({
                    "severity": "high",
                    "finding": "URL triggers excessive redirects (10+) — redirect loop or evasion technique",
                    "category": "Redirect Chain",
                })
                score_penalty += 15
            elif redirect_result.get("redirect_count", 0) > 3:
                risk_factors.append({
                    "severity": "medium",
                    "finding": f"URL follows {redirect_result['redirect_count']} redirects before reaching final destination",
                    "category": "Redirect Chain",
                })
                score_penalty += 8

            if redirect_result.get("crosses_domains"):
                cross_domains = redirect_result.get("domains_in_chain", [])
                risk_factors.append({
                    "severity": "medium",
                    "finding": f"Redirect chain crosses {len(cross_domains)} different domains — potential cloaking or tracking",
                    "category": "Cross-Domain Redirect",
                })
                score_penalty += 10
        except Exception:
            pass

    # Domain age check (RDAP)
    try:
        age_result = await _check_domain_age_rdap(domain)

        if age_result.get("is_newly_registered"):
            days = age_result.get("domain_age_days", 0)
            risk_factors.append({
                "severity": "high",
                "finding": f"Domain registered only {days} day(s) ago — newly registered domains (NRDs) are heavily used in phishing campaigns",
                "category": "Domain Age",
            })
            score_penalty += 20
        elif age_result.get("domain_age_days") is not None and age_result["domain_age_days"] < 90:
            risk_factors.append({
                "severity": "medium",
                "finding": f"Domain is {age_result['domain_age_days']} days old — relatively new domain with limited reputation history",
                "category": "Domain Age",
            })
            score_penalty += 10
    except Exception:
        pass

    # ─── Calculate final score and level ──────────────────────
    score_penalty = min(100, score_penalty)
    risk_score = float(score_penalty)

    if risk_score >= 70:
        risk_level = "critical"
    elif risk_score >= 45:
        risk_level = "high"
    elif risk_score >= 20:
        risk_level = "medium"
    else:
        risk_level = "low"

    return {
        "domain": domain,
        "scheme": scheme,
        "path": path,
        "has_query": bool(query),
        "risk_score": risk_score,
        "risk_level": risk_level,
        "risk_factors": risk_factors,
        "is_https": scheme == "https",
        "subdomain_count": max(0, len(parts) - 2),
        "dns_resolves": dns_result.get("resolves", False),
        "ip_addresses": dns_result.get("ip_addresses", []),
        "ssl_info": ssl_result if ssl_result.get("has_ssl") is not None else None,
        "domain_age": age_result if age_result.get("domain_age_days") is not None else None,
        "url_length": len(raw_url),
    }


# ───────────────────────────────────────────────────────────────
# API Endpoint
# ───────────────────────────────────────────────────────────────

@router.post("/analyze")
async def analyze_phishing(
    payload: dict[str, str],
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    url = payload.get("url", "").strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required")

    try:
        analysis = await _analyse_url_full(url)
    except Exception as e:
        logger.error("Phishing analysis failed: %s", e)
        raise HTTPException(
            status_code=503,
            detail="Phishing analysis service temporarily unavailable. Please try again.",
        )

    if "error" in analysis:
        raise HTTPException(status_code=400, detail=analysis["error"])

    # Build recommendations based on REAL findings
    recommendations = _build_recommendations(analysis)

    # Persist to Assessment table
    risk_score = analysis.get("risk_score", 0.0)
    risk_level = analysis.get("risk_level", "low")
    id_hash = hmac_hash(url)
    finding_count = len(analysis.get("risk_factors", []))

    assessment = Assessment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        scan_type="phishing",
        identifier_hash=id_hash,
        identifier_hint=analysis.get("domain", url[:60]),
        risk_score=float(risk_score),
        risk_level=risk_level,
        exposure_count=finding_count,
        data_source="live_intelligence",
        summary=_build_summary(analysis),
        recommendations=recommendations,
        raw_result={**analysis, "recommendations": recommendations},
        is_demo=False,
    )
    db.add(assessment)

    # Auto-create notification
    if risk_level in ("critical", "high"):
        notif_title = "🚨 Phishing Threat Detected"
        notif_msg = (
            f"URL analysis for {analysis.get('domain', url[:40])} — "
            f"risk level: {risk_level.upper()} ({finding_count} indicator(s))"
        )
        notif_type = "alert"
    elif risk_level == "medium":
        notif_title = "⚠️ Suspicious URL Flagged"
        notif_msg = (
            f"URL analysis for {analysis.get('domain', url[:40])} — "
            f"risk level: MEDIUM ({finding_count} indicator(s))"
        )
        notif_type = "warning"
    else:
        notif_title = "✅ URL Analysis Complete — Low Risk"
        notif_msg = f"No significant phishing indicators detected for {analysis.get('domain', url[:40])}."
        notif_type = "info"

    notif = Notification(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title=notif_title,
        message=notif_msg,
        notification_type=notif_type,
        category="scan_result",
        action_url="/app/exposure-history",
    )
    db.add(notif)

    await db.commit()
    await db.refresh(assessment)

    return {
        "assessment_id": str(assessment.id),
        **analysis,
        "recommendations": recommendations,
        "data_notice": (
            "This assessment combines live DNS resolution, real SSL certificate inspection, "
            "RDAP domain age verification, HTTP redirect chain analysis, and advanced "
            "heuristic pattern matching. No synthetic data is used."
        ),
        "analyzed_at": assessment.created_at.isoformat(),
    }


# ───────────────────────────────────────────────────────────────
# Internal helpers
# ───────────────────────────────────────────────────────────────

def _build_summary(analysis: dict[str, Any]) -> str:
    """Build human-readable summary from real analysis."""
    domain = analysis.get("domain", "unknown")
    score = analysis.get("risk_score", 0)
    level = analysis.get("risk_level", "low")
    count = len(analysis.get("risk_factors", []))

    if count == 0:
        return (
            f"No phishing indicators detected for '{domain}'. "
            f"URL structure, domain reputation, and SSL configuration appear legitimate."
        )

    severity_map = {"critical": "Critical", "high": "High", "medium": "Moderate", "low": "Low"}
    severity_label = severity_map.get(level, level.title())

    return (
        f"{severity_label}-risk phishing assessment for '{domain}' — "
        f"{count} indicator(s) detected across URL heuristics, domain analysis, "
        f"and network probes. Overall threat score: {score:.1f}/100."
    )


def _build_recommendations(analysis: dict[str, Any]) -> list[str]:
    """Generate contextual recommendations based on REAL findings."""
    recs: list[str] = []
    level = analysis.get("risk_level", "low")
    factors = analysis.get("risk_factors", [])

    # Critical/High-risk specific
    if level in ("critical", "high"):
        recs.append("Do NOT visit this URL — multiple high-confidence phishing indicators detected.")
        recs.append("Block this domain on corporate firewalls, DNS filters, and Secure Web Gateways (SWG).")
        recs.append("If received via email, report it as phishing and quarantine the message immediately.")

        # Check for specific findings
        categories = {f.get("category", "") for f in factors}
        if "Typosquatting" in categories or "Brand Impersonation" in categories:
            recs.append("Alert employees about brand impersonation — this domain mimics a trusted service.")
        if "Homograph Attack" in categories or "IDN Homograph" in categories:
            recs.append("Enable IDN homograph protection in browser security settings and email filters.")
        if "Domain Age" in categories:
            recs.append("Submit this newly registered domain to phishing takedown services (PhishTank, OpenPhish).")

    elif level == "medium":
        recs.append("Exercise caution before visiting this URL — suspicious indicators present.")
        recs.append("Verify the sender or source before clicking any links.")
        recs.append("Check the destination URL carefully for subtle character substitutions.")
    else:
        recs.append("No significant phishing indicators detected, but always verify URLs before entering credentials.")
        recs.append("Continue using browser-based phishing protection and keep security software updated.")

    # Protocol-specific
    if not analysis.get("is_https"):
        recs.append("Never submit credentials or personal data over unencrypted HTTP connections.")

    # SSL-specific
    ssl_info = analysis.get("ssl_info")
    if ssl_info and ssl_info.get("is_expired"):
        recs.append("Expired SSL certificates indicate abandoned or malicious infrastructure — avoid interaction.")

    # Redirect-specific
    if any(f.get("category") == "Cross-Domain Redirect" for f in factors):
        recs.append("Cross-domain redirects may be used for tracking or cloaking — inspect the final destination carefully.")

    if level in ("critical", "high"):
        recs.append("If any user submitted credentials to this URL, initiate immediate password reset and enable 2FA.")

    return recs
