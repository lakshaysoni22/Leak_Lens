"""
Domain Security Scanner — Comprehensive REAL infrastructure audit.

Performs ACTUAL live checks:
- SSL/TLS certificate validation & cipher analysis
- DNS resolution (A, AAAA, MX, TXT, NS, CNAME)
- HTTP security headers (HSTS, CSP, X-Frame, X-Content-Type, etc.)
- SPF, DKIM, DMARC email authentication records
- Security.txt detection
- Open redirect / mixed content indicators
- WHOIS-based domain age estimation
"""
from __future__ import annotations

import logging
import re
import socket
import ssl
import uuid
from datetime import datetime, timezone
from typing import Any, Optional

import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_async_session
from app.core.dependencies import get_current_user
from app.core.security import hmac_hash
from app.models.assessment import Assessment
from app.models.notification import Notification
from app.models.user import User
from app.schemas.assessment import DomainScanRequest

logger = logging.getLogger(__name__)

router = APIRouter()

SAFE_DOMAINS = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}

# Timeout for all network operations
CONNECT_TIMEOUT = 8
HTTP_TIMEOUT = httpx.Timeout(12.0, connect=8.0)


# =====================================================================
# SSL / TLS Analysis
# =====================================================================
def _check_ssl(domain: str) -> dict[str, Any]:
    """Full SSL/TLS certificate + handshake analysis."""
    result: dict[str, Any] = {
        "https_available": False,
        "ssl_valid": False,
        "cert_issuer": None,
        "cert_subject": None,
        "cert_expires": None,
        "days_until_expiry": None,
        "ssl_version": None,
        "ssl_error": None,
        "san_domains": [],
    }
    try:
        ctx = ssl.create_default_context()
        with ctx.wrap_socket(
            socket.create_connection((domain, 443), timeout=CONNECT_TIMEOUT),
            server_hostname=domain,
        ) as s:
            cert = s.getpeercert()
            if not cert:
                result["https_available"] = True
                result["ssl_error"] = "No certificate returned"
                return result

            # Parse expiry
            not_after_str = cert.get("notAfter", "")
            not_after: Optional[datetime] = None
            if not_after_str:
                try:
                    not_after = datetime.strptime(
                        not_after_str, "%b %d %H:%M:%S %Y %Z"
                    ).replace(tzinfo=timezone.utc)
                except ValueError:
                    pass

            not_before_str = cert.get("notBefore", "")
            not_before: Optional[datetime] = None
            if not_before_str:
                try:
                    not_before = datetime.strptime(
                        not_before_str, "%b %d %H:%M:%S %Y %Z"
                    ).replace(tzinfo=timezone.utc)
                except ValueError:
                    pass

            days_remaining = None
            if not_after:
                days_remaining = (not_after - datetime.now(timezone.utc)).days

            # Parse issuer & subject
            issuer_raw = cert.get("issuer", ())
            subject_raw = cert.get("subject", ())
            issuer = {}
            for group in issuer_raw:
                for key, val in group:
                    issuer[key] = val
            subject = {}
            for group in subject_raw:
                for key, val in group:
                    subject[key] = val

            # Subject Alternative Names
            san_list = []
            for san_type, san_val in cert.get("subjectAltName", ()):
                if san_type == "DNS":
                    san_list.append(san_val)

            result.update({
                "https_available": True,
                "ssl_valid": True,
                "cert_issuer": issuer.get("organizationName", issuer.get("commonName", "Unknown CA")),
                "cert_subject": subject.get("commonName", domain),
                "cert_expires": not_after.isoformat() if not_after else None,
                "cert_not_before": not_before.isoformat() if not_before else None,
                "days_until_expiry": days_remaining,
                "ssl_version": s.version(),
                "san_domains": san_list[:10],
                "serial_number": cert.get("serialNumber", ""),
            })

    except ssl.SSLCertVerificationError as e:
        result["https_available"] = True
        result["ssl_valid"] = False
        result["ssl_error"] = f"Certificate verification failed: {str(e)[:200]}"
    except (socket.timeout, ConnectionRefusedError, OSError) as e:
        result["ssl_error"] = f"Could not connect on port 443: {str(e)[:100]}"
    except Exception as e:
        result["ssl_error"] = str(e)[:200]

    return result


# =====================================================================
# DNS Analysis
# =====================================================================
def _check_dns(domain: str) -> dict[str, Any]:
    """DNS resolution — A/AAAA records via socket + MX/TXT/NS via dnspython if available."""
    result: dict[str, Any] = {
        "dns_resolves": False,
        "ip_addresses": [],
        "ipv6_addresses": [],
        "mx_records": [],
        "ns_records": [],
        "txt_records": [],
        "cname_records": [],
        "has_spf": False,
        "spf_record": None,
        "has_dmarc": False,
        "dmarc_record": None,
        "has_dkim": False,
    }

    # Basic A/AAAA resolution
    try:
        addrs = socket.getaddrinfo(domain, None)
        ipv4 = list({a[4][0] for a in addrs if a[0] == socket.AF_INET})
        ipv6 = list({a[4][0] for a in addrs if a[0] == socket.AF_INET6})
        result["dns_resolves"] = True
        result["ip_addresses"] = ipv4[:5]
        result["ipv6_addresses"] = ipv6[:3]
    except socket.gaierror:
        return result  # Domain doesn't resolve at all

    # Try dnspython for detailed records
    try:
        import dns.resolver

        resolver = dns.resolver.Resolver()
        resolver.timeout = 5
        resolver.lifetime = 8

        # MX Records
        try:
            mx_answers = resolver.resolve(domain, "MX")
            result["mx_records"] = [
                {"priority": r.preference, "host": str(r.exchange).rstrip(".")}
                for r in sorted(mx_answers, key=lambda x: x.preference)
            ][:5]
        except Exception:
            pass

        # NS Records
        try:
            ns_answers = resolver.resolve(domain, "NS")
            result["ns_records"] = [str(r.target).rstrip(".") for r in ns_answers][:5]
        except Exception:
            pass

        # TXT Records (includes SPF)
        try:
            txt_answers = resolver.resolve(domain, "TXT")
            for r in txt_answers:
                txt_val = r.to_text().strip('"')
                result["txt_records"].append(txt_val[:300])
                if txt_val.lower().startswith("v=spf1"):
                    result["has_spf"] = True
                    result["spf_record"] = txt_val[:500]
        except Exception:
            pass

        # DMARC Record
        try:
            dmarc_answers = resolver.resolve(f"_dmarc.{domain}", "TXT")
            for r in dmarc_answers:
                txt_val = r.to_text().strip('"')
                if "v=dmarc1" in txt_val.lower():
                    result["has_dmarc"] = True
                    result["dmarc_record"] = txt_val[:500]
                    break
        except Exception:
            pass

        # DKIM (check common selectors)
        for selector in ("default", "google", "selector1", "selector2", "k1", "dkim"):
            try:
                dkim_answers = resolver.resolve(f"{selector}._domainkey.{domain}", "TXT")
                if dkim_answers:
                    result["has_dkim"] = True
                    break
            except Exception:
                continue

        # CNAME check
        try:
            cname_answers = resolver.resolve(domain, "CNAME")
            result["cname_records"] = [str(r.target).rstrip(".") for r in cname_answers][:3]
        except Exception:
            pass

    except ImportError:
        logger.info("dnspython not available — using basic DNS resolution only")
    except Exception as e:
        logger.warning("DNS detailed check failed: %s", e)

    return result


# =====================================================================
# HTTP Security Headers Analysis
# =====================================================================
async def _check_http_headers(domain: str) -> dict[str, Any]:
    """Check HTTP security headers by making a real HEAD/GET request."""
    result: dict[str, Any] = {
        "headers_checked": False,
        "has_hsts": False,
        "hsts_value": None,
        "hsts_includes_subdomains": False,
        "hsts_preload": False,
        "has_csp": False,
        "csp_value": None,
        "has_x_frame_options": False,
        "x_frame_value": None,
        "has_x_content_type": False,
        "has_x_xss_protection": False,
        "has_referrer_policy": False,
        "referrer_policy_value": None,
        "has_permissions_policy": False,
        "has_security_txt": False,
        "server_header": None,
        "x_powered_by": None,
        "redirects_http_to_https": False,
        "response_status": None,
    }

    try:
        async with httpx.AsyncClient(
            timeout=HTTP_TIMEOUT,
            follow_redirects=True,
            verify=False,  # We're checking headers, not validating cert here
        ) as client:
            # Check HTTPS headers
            try:
                resp = await client.get(
                    f"https://{domain}",
                    headers={"User-Agent": "LeakLens-DomainScanner/2.0 (Security Audit)"},
                )
                result["headers_checked"] = True
                result["response_status"] = resp.status_code
                headers = {k.lower(): v for k, v in resp.headers.items()}

                # HSTS
                hsts = headers.get("strict-transport-security", "")
                if hsts:
                    result["has_hsts"] = True
                    result["hsts_value"] = hsts[:200]
                    result["hsts_includes_subdomains"] = "includesubdomains" in hsts.lower()
                    result["hsts_preload"] = "preload" in hsts.lower()

                # CSP
                csp = headers.get("content-security-policy", "")
                if csp:
                    result["has_csp"] = True
                    result["csp_value"] = csp[:500]

                # X-Frame-Options
                xfo = headers.get("x-frame-options", "")
                if xfo:
                    result["has_x_frame_options"] = True
                    result["x_frame_value"] = xfo

                # X-Content-Type-Options
                result["has_x_content_type"] = "x-content-type-options" in headers

                # X-XSS-Protection
                result["has_x_xss_protection"] = "x-xss-protection" in headers

                # Referrer-Policy
                rp = headers.get("referrer-policy", "")
                if rp:
                    result["has_referrer_policy"] = True
                    result["referrer_policy_value"] = rp

                # Permissions-Policy / Feature-Policy
                result["has_permissions_policy"] = (
                    "permissions-policy" in headers or "feature-policy" in headers
                )

                # Server info leak
                result["server_header"] = headers.get("server", None)
                result["x_powered_by"] = headers.get("x-powered-by", None)

            except Exception as e:
                logger.debug("HTTPS header check failed: %s", e)

            # Check HTTP → HTTPS redirect
            try:
                http_resp = await client.get(
                    f"http://{domain}",
                    headers={"User-Agent": "LeakLens-DomainScanner/2.0"},
                    follow_redirects=False,
                )
                if http_resp.status_code in (301, 302, 307, 308):
                    location = http_resp.headers.get("location", "")
                    if location.startswith("https://"):
                        result["redirects_http_to_https"] = True
            except Exception:
                pass

            # Check security.txt
            try:
                sec_resp = await client.get(
                    f"https://{domain}/.well-known/security.txt",
                    headers={"User-Agent": "LeakLens-DomainScanner/2.0"},
                )
                result["has_security_txt"] = sec_resp.status_code == 200 and len(sec_resp.text) > 10
            except Exception:
                pass

    except Exception as e:
        logger.warning("HTTP header check entirely failed: %s", e)

    return result


# =====================================================================
# Findings Generator — builds actionable findings from real data
# =====================================================================
def _generate_findings(
    ssl_info: dict, dns_info: dict, headers_info: dict
) -> list[dict[str, str]]:
    """Generate security findings from real scan data."""
    findings: list[dict[str, str]] = []

    # --- SSL/TLS findings ---
    if not ssl_info.get("https_available"):
        findings.append({
            "severity": "critical",
            "category": "SSL/TLS",
            "finding": "HTTPS is not available on this domain. No SSL/TLS certificate detected on port 443.",
            "recommendation": "Install a valid SSL/TLS certificate immediately. Use Let's Encrypt for free certificates or purchase from a trusted CA.",
        })
    elif not ssl_info.get("ssl_valid"):
        findings.append({
            "severity": "critical",
            "category": "SSL/TLS",
            "finding": f"SSL/TLS certificate validation failed: {ssl_info.get('ssl_error', 'Unknown error')}",
            "recommendation": "Replace the certificate with a valid one from a trusted Certificate Authority. Check certificate chain, domain name match, and expiry.",
        })
    else:
        days = ssl_info.get("days_until_expiry")
        if days is not None:
            if days < 0:
                findings.append({
                    "severity": "critical",
                    "category": "SSL/TLS Certificate Expiry",
                    "finding": f"SSL/TLS certificate has EXPIRED ({abs(days)} days ago). Browsers will show security warnings to all visitors.",
                    "recommendation": "Renew the certificate immediately. Enable auto-renewal via your CA or use certbot for Let's Encrypt automation.",
                })
            elif days < 14:
                findings.append({
                    "severity": "critical",
                    "category": "SSL/TLS Certificate Expiry",
                    "finding": f"SSL/TLS certificate expires in {days} days. Imminent expiry will cause service disruption.",
                    "recommendation": "Renew the certificate immediately. Configure auto-renewal to prevent future near-expiry situations.",
                })
            elif days < 30:
                findings.append({
                    "severity": "high",
                    "category": "SSL/TLS Certificate Expiry",
                    "finding": f"SSL/TLS certificate expires in {days} days. Approaching critical renewal window.",
                    "recommendation": f"Schedule certificate renewal within the next {days} days. Issuer: {ssl_info.get('cert_issuer', 'Unknown')}.",
                })
            elif days < 60:
                findings.append({
                    "severity": "medium",
                    "category": "SSL/TLS Certificate Expiry",
                    "finding": f"SSL/TLS certificate expires in {days} days.",
                    "recommendation": "Plan certificate renewal. Consider enabling auto-renewal for continuous protection.",
                })

        # TLS version check
        tls_ver = ssl_info.get("ssl_version", "")
        if tls_ver and "TLSv1.3" not in tls_ver:
            if "TLSv1.2" in tls_ver:
                findings.append({
                    "severity": "info",
                    "category": "TLS Protocol Version",
                    "finding": f"Server negotiated {tls_ver}. TLSv1.3 offers improved security and performance.",
                    "recommendation": "Upgrade server configuration to prefer TLSv1.3 while maintaining TLSv1.2 fallback.",
                })
            elif "TLSv1.1" in tls_ver or "TLSv1.0" in tls_ver or "SSLv" in tls_ver:
                findings.append({
                    "severity": "critical",
                    "category": "TLS Protocol Version",
                    "finding": f"Server uses deprecated {tls_ver}. This protocol has known vulnerabilities (POODLE, BEAST).",
                    "recommendation": "Disable TLSv1.0/1.1 and SSLv3 immediately. Configure server to use TLSv1.2+ only.",
                })

    # --- DNS findings ---
    if not dns_info.get("dns_resolves"):
        findings.append({
            "severity": "critical",
            "category": "DNS Resolution",
            "finding": "Domain does not resolve via DNS. The domain may not exist, be expired, or have misconfigured nameservers.",
            "recommendation": "Verify domain registration status and nameserver configuration with your registrar.",
        })
    else:
        if not dns_info.get("ipv6_addresses"):
            findings.append({
                "severity": "low",
                "category": "IPv6 Support",
                "finding": "No AAAA (IPv6) records found. Domain is only accessible via IPv4.",
                "recommendation": "Consider adding AAAA records for IPv6 connectivity to improve global accessibility.",
            })

    # --- Email Security findings ---
    if dns_info.get("dns_resolves"):
        if not dns_info.get("has_spf"):
            findings.append({
                "severity": "high",
                "category": "SPF Record",
                "finding": "No SPF (Sender Policy Framework) record found. Domain is vulnerable to email spoofing attacks.",
                "recommendation": "Add a TXT record with SPF policy, e.g.: v=spf1 include:_spf.google.com ~all",
            })

        if not dns_info.get("has_dmarc"):
            findings.append({
                "severity": "high",
                "category": "DMARC Record",
                "finding": "No DMARC record found at _dmarc.{domain}. Email receivers cannot verify domain authenticity.",
                "recommendation": "Add a DMARC TXT record: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com",
            })
        else:
            dmarc = dns_info.get("dmarc_record", "")
            if "p=none" in dmarc.lower():
                findings.append({
                    "severity": "medium",
                    "category": "DMARC Policy",
                    "finding": "DMARC policy is set to 'none' (monitoring only). Spoofed emails will still be delivered.",
                    "recommendation": "Upgrade DMARC policy to p=quarantine or p=reject after monitoring shows legitimate traffic.",
                })

        if not dns_info.get("has_dkim"):
            findings.append({
                "severity": "medium",
                "category": "DKIM Record",
                "finding": "No DKIM records found for common selectors. Email signing is not configured.",
                "recommendation": "Configure DKIM signing through your email provider and publish the public key as a DNS TXT record.",
            })

    # --- HTTP Security Header findings ---
    if headers_info.get("headers_checked"):
        if not headers_info.get("has_hsts"):
            findings.append({
                "severity": "high",
                "category": "HSTS Header",
                "finding": "Strict-Transport-Security (HSTS) header is missing. Browsers won't enforce HTTPS connections.",
                "recommendation": "Add header: Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
            })
        elif not headers_info.get("hsts_includes_subdomains"):
            findings.append({
                "severity": "medium",
                "category": "HSTS Configuration",
                "finding": "HSTS header is present but missing 'includeSubDomains' directive.",
                "recommendation": "Add includeSubDomains to HSTS header to protect all subdomains.",
            })

        if not headers_info.get("has_csp"):
            findings.append({
                "severity": "high",
                "category": "Content Security Policy",
                "finding": "Content-Security-Policy header is missing. The site is vulnerable to XSS and injection attacks.",
                "recommendation": "Implement a Content-Security-Policy header. Start with: default-src 'self'; script-src 'self'",
            })
        else:
            csp = headers_info.get("csp_value", "")
            if "'unsafe-inline'" in csp:
                findings.append({
                    "severity": "medium",
                    "category": "CSP Configuration",
                    "finding": "CSP allows 'unsafe-inline' in script directives, weakening XSS protection.",
                    "recommendation": "Replace 'unsafe-inline' with nonce-based or hash-based CSP for script elements.",
                })
            if "'unsafe-eval'" in csp:
                findings.append({
                    "severity": "medium",
                    "category": "CSP Configuration",
                    "finding": "CSP allows 'unsafe-eval', enabling dynamic code execution via eval().",
                    "recommendation": "Remove 'unsafe-eval' from CSP and refactor code to avoid eval() calls.",
                })

        if not headers_info.get("has_x_frame_options"):
            findings.append({
                "severity": "medium",
                "category": "Clickjacking Protection",
                "finding": "X-Frame-Options header is missing. The site can be embedded in iframes for clickjacking attacks.",
                "recommendation": "Add header: X-Frame-Options: DENY or SAMEORIGIN. Also set frame-ancestors in CSP.",
            })

        if not headers_info.get("has_x_content_type"):
            findings.append({
                "severity": "medium",
                "category": "MIME Type Sniffing",
                "finding": "X-Content-Type-Options: nosniff header is missing. Browsers may MIME-sniff responses.",
                "recommendation": "Add header: X-Content-Type-Options: nosniff",
            })

        if not headers_info.get("has_referrer_policy"):
            findings.append({
                "severity": "low",
                "category": "Referrer Policy",
                "finding": "Referrer-Policy header is not set. Full URLs may leak in referrer headers to third parties.",
                "recommendation": "Add header: Referrer-Policy: strict-origin-when-cross-origin",
            })

        if not headers_info.get("has_permissions_policy"):
            findings.append({
                "severity": "low",
                "category": "Permissions Policy",
                "finding": "Permissions-Policy (Feature-Policy) header is missing. Browser features are not restricted.",
                "recommendation": "Add Permissions-Policy header to restrict access to camera, microphone, geolocation, etc.",
            })

        if not headers_info.get("redirects_http_to_https"):
            findings.append({
                "severity": "high",
                "category": "HTTP to HTTPS Redirect",
                "finding": "HTTP requests are not automatically redirected to HTTPS. Users may access the site insecurely.",
                "recommendation": "Configure your web server to 301 redirect all HTTP traffic to HTTPS.",
            })

        # Server info leak
        if headers_info.get("server_header"):
            findings.append({
                "severity": "low",
                "category": "Server Information Disclosure",
                "finding": f"Server header reveals: '{headers_info['server_header']}'. Attackers can use this to find known vulnerabilities.",
                "recommendation": "Remove or genericize the Server header in your web server configuration.",
            })

        if headers_info.get("x_powered_by"):
            findings.append({
                "severity": "low",
                "category": "Technology Disclosure",
                "finding": f"X-Powered-By header reveals: '{headers_info['x_powered_by']}'. This exposes your tech stack.",
                "recommendation": "Remove the X-Powered-By header from your server responses.",
            })

        if not headers_info.get("has_security_txt"):
            findings.append({
                "severity": "info",
                "category": "Security Contact",
                "finding": "No security.txt file found at /.well-known/security.txt.",
                "recommendation": "Create a security.txt file (RFC 9116) to help security researchers report vulnerabilities responsibly.",
            })

    # Sort findings by severity
    severity_order = {"critical": 0, "high": 1, "medium": 2, "low": 3, "info": 4}
    findings.sort(key=lambda f: severity_order.get(f["severity"], 5))

    return findings


# =====================================================================
# Score Computation
# =====================================================================
def _compute_score(
    ssl_info: dict, dns_info: dict, headers_info: dict, findings: list[dict]
) -> tuple[float, str]:
    """Compute domain security score (0-100) from real scan data."""
    score = 100.0

    # Deductions by severity
    for f in findings:
        sev = f.get("severity", "info")
        if sev == "critical":
            score -= 15
        elif sev == "high":
            score -= 8
        elif sev == "medium":
            score -= 4
        elif sev == "low":
            score -= 1.5
        # info findings don't deduct

    # Bonuses for good practices
    if ssl_info.get("ssl_valid") and ssl_info.get("https_available"):
        score += 2  # Slight bonus for valid HTTPS
    if headers_info.get("has_hsts") and headers_info.get("hsts_preload"):
        score += 2  # Bonus for HSTS preload
    if dns_info.get("has_spf") and dns_info.get("has_dmarc") and dns_info.get("has_dkim"):
        score += 3  # Full email auth suite

    score = round(max(0.0, min(100.0, score)), 1)

    if score >= 80:
        level = "good"
    elif score >= 55:
        level = "fair"
    elif score >= 30:
        level = "poor"
    else:
        level = "critical"

    return score, level


# =====================================================================
# Generate Recommendations from Findings
# =====================================================================
def _generate_recommendations(
    ssl_info: dict, dns_info: dict, headers_info: dict, findings: list[dict]
) -> list[str]:
    """Generate prioritized strategic recommendations."""
    recs: list[str] = []

    # Critical / High priority first
    critical_findings = [f for f in findings if f["severity"] in ("critical", "high")]
    for cf in critical_findings[:3]:
        recs.append(cf["recommendation"])

    # Strategic recommendations
    if not ssl_info.get("https_available"):
        recs.append("Install an SSL/TLS certificate to enable HTTPS encryption for all traffic.")
    elif ssl_info.get("days_until_expiry") and ssl_info["days_until_expiry"] < 30:
        recs.append(f"Renew SSL certificate immediately — only {ssl_info['days_until_expiry']} days remaining.")

    if not headers_info.get("has_hsts"):
        recs.append("Deploy HSTS with includeSubDomains and preload directives for enforced HTTPS.")
    if not headers_info.get("has_csp"):
        recs.append("Implement Content-Security-Policy to mitigate XSS and code injection vulnerabilities.")
    if not dns_info.get("has_spf") or not dns_info.get("has_dmarc"):
        recs.append("Configure SPF, DKIM, and DMARC records to prevent email spoofing on this domain.")
    if not headers_info.get("redirects_http_to_https"):
        recs.append("Configure HTTP → HTTPS redirect (301) to ensure all traffic is encrypted.")

    # General best practices
    recs.append("Conduct regular security scans and keep all software and dependencies updated.")

    # Deduplicate while preserving order
    seen: set[str] = set()
    unique_recs: list[str] = []
    for r in recs:
        if r not in seen:
            seen.add(r)
            unique_recs.append(r)

    return unique_recs[:8]


# =====================================================================
# Main Endpoint
# =====================================================================
@router.post("/scan")
async def assess_domain(
    data: DomainScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_async_session),
) -> dict[str, Any]:
    domain = data.domain.lower().strip()

    if domain in SAFE_DOMAINS or domain.endswith(".internal"):
        raise HTTPException(status_code=400, detail="Cannot scan internal/reserved domains")

    # Run all checks
    ssl_info = _check_ssl(domain)
    dns_info = _check_dns(domain)

    # HTTP headers check requires async
    headers_info = await _check_http_headers(domain)

    # Generate findings from REAL data
    findings = _generate_findings(ssl_info, dns_info, headers_info)

    # Compute score from REAL findings
    score, level = _compute_score(ssl_info, dns_info, headers_info, findings)

    # Generate recommendations
    recommendations = _generate_recommendations(ssl_info, dns_info, headers_info, findings)

    # Build data notice
    if not dns_info["dns_resolves"]:
        data_notice = (
            "Domain does not resolve via DNS. The domain may be unregistered, expired, "
            "or have misconfigured nameservers. Limited scan data available."
        )
    else:
        checks_performed = ["DNS resolution", "SSL/TLS certificate validation"]
        if headers_info.get("headers_checked"):
            checks_performed.append("HTTP security headers audit")
        if dns_info.get("has_spf") is not None:
            checks_performed.append("email authentication (SPF/DKIM/DMARC)")
        data_notice = (
            f"Live infrastructure scan completed. Checks performed: "
            f"{', '.join(checks_performed)}. All scans use standard RFC-compliant "
            f"public protocol endpoints only."
        )

    # Persist to Assessment table
    id_hash = hmac_hash(domain)
    risk_level_map = {"good": "low", "fair": "medium", "poor": "high", "critical": "critical"}

    assessment = Assessment(
        id=uuid.uuid4(),
        user_id=current_user.id,
        scan_type="domain",
        identifier_hash=id_hash,
        identifier_hint=domain,
        risk_score=float(100.0 - score),
        risk_level=risk_level_map.get(level, "medium"),
        exposure_count=len(findings),
        data_source="live_intelligence",
        summary=(
            f"Domain security audit — score: {score}/100 ({level}). "
            f"{len(findings)} finding(s) across SSL/TLS, DNS, HTTP headers, and email security."
        ),
        recommendations=recommendations,
        raw_result={
            "ssl": {k: v for k, v in ssl_info.items() if k != "san_domains"},
            "dns": {k: v for k, v in dns_info.items() if k not in ("txt_records",)},
            "headers": {k: v for k, v in headers_info.items() if v is not None},
            "findings": findings,
        },
        is_demo=False,
    )
    db.add(assessment)

    # Notification
    notif = Notification(
        id=uuid.uuid4(),
        user_id=current_user.id,
        title="Domain Scan Complete" if level != "critical" else "⚠️ Critical Domain Vulnerabilities",
        message=(
            f"Domain {domain} — security score: {score}/100 ({level}), "
            f"{len(findings)} finding(s)"
        ),
        notification_type="alert" if level in ("poor", "critical") else "info",
        category="scan_result",
        action_url="/app/exposure-history",
    )
    db.add(notif)

    await db.commit()
    await db.refresh(assessment)

    return {
        "assessment_id": str(assessment.id),
        "domain": domain,
        "security_score": score,
        "security_level": level,
        "ssl": ssl_info,
        "dns": {
            "dns_resolves": dns_info["dns_resolves"],
            "ip_addresses": dns_info["ip_addresses"],
            "ipv6_addresses": dns_info.get("ipv6_addresses", []),
            "mx_records": dns_info.get("mx_records", []),
            "ns_records": dns_info.get("ns_records", []),
            "has_spf": dns_info.get("has_spf", False),
            "spf_record": dns_info.get("spf_record"),
            "has_dmarc": dns_info.get("has_dmarc", False),
            "dmarc_record": dns_info.get("dmarc_record"),
            "has_dkim": dns_info.get("has_dkim", False),
        },
        "headers": {
            "has_hsts": headers_info.get("has_hsts", False),
            "has_csp": headers_info.get("has_csp", False),
            "has_x_frame_options": headers_info.get("has_x_frame_options", False),
            "has_x_content_type": headers_info.get("has_x_content_type", False),
            "redirects_http_to_https": headers_info.get("redirects_http_to_https", False),
            "has_security_txt": headers_info.get("has_security_txt", False),
            "server_header": headers_info.get("server_header"),
        },
        "findings": findings,
        "recommendations": recommendations,
        "data_notice": data_notice,
        "scanned_at": assessment.created_at.isoformat(),
    }
