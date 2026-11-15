"""Domain security scanner endpoint."""
from __future__ import annotations

import ssl
import socket
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.assessment import DomainScanRequest

router = APIRouter()

SAFE_DOMAINS = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}


def _check_https(domain: str) -> dict[str, Any]:
    """Attempt HTTPS connection and retrieve certificate info."""
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(socket.create_connection((domain, 443), timeout=5), server_hostname=domain) as s:
            cert = s.getpeercert()
            not_after_str = cert.get("notAfter", "")
            if not_after_str:
                not_after = datetime.strptime(not_after_str, "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                days_remaining = (not_after - datetime.now(timezone.utc)).days
            else:
                not_after = None
                days_remaining = None

            issuer = dict(x[0] for x in cert.get("issuer", []))
            subject = dict(x[0] for x in cert.get("subject", []))

            return {
                "https_available": True,
                "ssl_valid": True,
                "cert_issuer": issuer.get("organizationName", "Unknown"),
                "cert_subject": subject.get("commonName", domain),
                "cert_expires": not_after.isoformat() if not_after else None,
                "days_until_expiry": days_remaining,
                "ssl_version": s.version(),
            }
    except ssl.SSLCertVerificationError:
        return {"https_available": True, "ssl_valid": False, "ssl_error": "Certificate verification failed"}
    except (socket.timeout, ConnectionRefusedError, OSError):
        return {"https_available": False, "ssl_valid": False, "ssl_error": "Could not connect on port 443"}
    except Exception as e:
        return {"https_available": False, "ssl_valid": False, "ssl_error": str(e)}


def _check_dns(domain: str) -> dict[str, Any]:
    """Basic DNS resolution check."""
    try:
        addrs = socket.getaddrinfo(domain, None)
        ips = list({a[4][0] for a in addrs})
        return {"dns_resolves": True, "ip_addresses": ips[:5]}
    except socket.gaierror:
        return {"dns_resolves": False, "ip_addresses": []}


def _compute_domain_score(ssl_info: dict, dns_info: dict) -> tuple[float, str]:
    """Simple domain security score 0-100."""
    score = 100.0
    findings = []

    if not dns_info.get("dns_resolves"):
        score -= 30
        findings.append(("critical", "Domain does not resolve via DNS"))
    if not ssl_info.get("https_available"):
        score -= 25
        findings.append(("high", "HTTPS not available on port 443"))
    elif not ssl_info.get("ssl_valid"):
        score -= 20
        findings.append(("high", "SSL certificate validation failed"))
    else:
        days = ssl_info.get("days_until_expiry")
        if days is not None:
            if days < 0:
                score -= 30
                findings.append(("critical", "SSL certificate has expired"))
            elif days < 14:
                score -= 20
                findings.append(("critical", f"SSL certificate expires in {days} days"))
            elif days < 30:
                score -= 10
                findings.append(("high", f"SSL certificate expires in {days} days"))
            elif days < 90:
                score -= 5
                findings.append(("medium", f"SSL certificate expires in {days} days"))

    score = max(0.0, min(100.0, score))
    if score >= 75:
        level = "good"
    elif score >= 50:
        level = "fair"
    elif score >= 25:
        level = "poor"
    else:
        level = "critical"

    return round(score, 1), level


@router.post("/assess")
async def assess_domain(
    data: DomainScanRequest,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    domain = data.domain.lower().strip()

    if domain in SAFE_DOMAINS or domain.endswith(".internal"):
        raise HTTPException(status_code=400, detail="Cannot scan internal/reserved domains")

    ssl_info = _check_https(domain)
    dns_info = _check_dns(domain)
    score, level = _compute_domain_score(ssl_info, dns_info)

    findings = []
    if not dns_info["dns_resolves"]:
        findings.append({"severity": "critical", "category": "DNS", "finding": "Domain does not resolve",
                         "recommendation": "Check DNS configuration for this domain"})
    if not ssl_info.get("https_available"):
        findings.append({"severity": "high", "category": "SSL/TLS", "finding": "HTTPS not available",
                         "recommendation": "Configure HTTPS with a valid SSL certificate"})
    elif not ssl_info.get("ssl_valid"):
        findings.append({"severity": "high", "category": "SSL/TLS", "finding": "SSL certificate invalid",
                         "recommendation": "Replace or renew the SSL certificate"})
    else:
        days = ssl_info.get("days_until_expiry")
        if days is not None and days < 90:
            sev = "critical" if days < 14 else ("high" if days < 30 else "medium")
            findings.append({"severity": sev, "category": "SSL/TLS",
                             "finding": f"Certificate expires in {days} days",
                             "recommendation": "Renew SSL certificate before expiry"})

    recommendations = [
        "Ensure HTTPS is enforced with HSTS headers",
        "Keep SSL certificates renewed well before expiry",
        "Configure SPF, DKIM, and DMARC records for email security",
        "Review DNS records for unexpected entries",
        "Enable DNSSEC if your registrar supports it",
    ]

    return {
        "domain": domain,
        "security_score": score,
        "security_level": level,
        "ssl": ssl_info,
        "dns": dns_info,
        "findings": findings,
        "recommendations": recommendations,
        "data_notice": "Domain scan uses read-only DNS and TLS checks only. No active probing is performed.",
        "scanned_at": datetime.now(timezone.utc).isoformat(),
    }
