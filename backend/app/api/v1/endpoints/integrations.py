"""Integrations configuration and status endpoints."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

# Integration registry — all supported integrations
INTEGRATION_REGISTRY: list[dict[str, Any]] = [
    {
        "id": "abuseipdb",
        "name": "AbuseIPDB",
        "category": "Threat Intelligence",
        "description": "IP address reputation and abuse reports database. Check if an IP has been associated with malicious activity.",
        "capabilities": ["ip_reputation", "abuse_reports", "ip_blocklist"],
        "setup_url": "https://www.abuseipdb.com/account/api",
        "env_key": "ABUSEIPDB_API_KEY",
        "icon": "shield",
    },
    {
        "id": "virustotal",
        "name": "VirusTotal",
        "category": "Threat Intelligence",
        "description": "Multi-engine antivirus scan for URLs, domains, IPs, and file hashes. Aggregates results from 70+ security vendors.",
        "capabilities": ["url_scan", "file_hash", "domain_reputation", "ip_reputation"],
        "setup_url": "https://www.virustotal.com/gui/join-us",
        "env_key": "VIRUSTOTAL_API_KEY",
        "icon": "search",
    },
    {
        "id": "urlhaus",
        "name": "URLhaus (Abuse.ch)",
        "category": "Threat Intelligence",
        "description": "Community-driven malware URL repository. Free public API, no key required.",
        "capabilities": ["malware_urls", "phishing_urls", "url_reputation"],
        "setup_url": "https://urlhaus-api.abuse.ch/",
        "env_key": None,  # Free API
        "icon": "globe",
        "always_available": True,
    },
    {
        "id": "phishtank",
        "name": "PhishTank",
        "category": "Threat Intelligence",
        "description": "Community-verified phishing URL database. Submit and verify phishing sites.",
        "capabilities": ["phishing_urls", "phishing_verification"],
        "setup_url": "https://www.phishtank.com/api_info.php",
        "env_key": "PHISHTANK_API_KEY",
        "icon": "alert-triangle",
    },
    {
        "id": "alienvault_otx",
        "name": "AlienVault OTX",
        "category": "Threat Intelligence",
        "description": "Open Threat Exchange — crowdsourced threat intelligence with IOC collections (pulses).",
        "capabilities": ["ioc_lookup", "threat_feeds", "malware_hashes", "pulse_subscriptions"],
        "setup_url": "https://otx.alienvault.com/api",
        "env_key": "OTX_API_KEY",
        "icon": "radio",
    },
    {
        "id": "openai",
        "name": "OpenAI / AI Assistant",
        "category": "AI & Analysis",
        "description": "Power the AI Security Assistant with GPT models for threat analysis, report summarization, and security recommendations.",
        "capabilities": ["ai_assistant", "report_summarization", "threat_analysis"],
        "setup_url": "https://platform.openai.com/api-keys",
        "env_key": "OPENAI_API_KEY",
        "icon": "brain",
    },
    {
        "id": "smtp",
        "name": "SMTP Email",
        "category": "Notifications",
        "description": "Send email notifications for critical alerts, scan completions, and monitoring reports.",
        "capabilities": ["email_alerts", "scan_notifications", "report_delivery"],
        "setup_url": None,
        "env_key": "SMTP_HOST",
        "icon": "mail",
    },
    {
        "id": "stripe",
        "name": "Stripe Payments",
        "category": "Billing",
        "description": "Process subscription payments, manage billing, and generate invoices via Stripe.",
        "capabilities": ["subscription_payments", "invoicing", "payment_methods"],
        "setup_url": "https://dashboard.stripe.com/apikeys",
        "env_key": "STRIPE_SECRET_KEY",
        "icon": "credit-card",
    },
]


def _check_configured(env_key: str | None) -> bool:
    if env_key is None:
        return True  # Free API
    return bool(getattr(settings, env_key, None))


@router.get("")
async def list_integrations(
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    integrations = []
    for integ in INTEGRATION_REGISTRY:
        configured = _check_configured(integ.get("env_key"))
        integrations.append({
            "id": integ["id"],
            "name": integ["name"],
            "category": integ["category"],
            "description": integ["description"],
            "capabilities": integ["capabilities"],
            "setup_url": integ.get("setup_url"),
            "icon": integ.get("icon", "plug"),
            "status": "connected" if configured else "not_configured",
            "configured": configured,
            "always_available": integ.get("always_available", False),
        })

    return {
        "integrations": integrations,
        "total": len(integrations),
        "configured_count": sum(1 for i in integrations if i["configured"]),
    }


@router.post("/{provider}/test")
async def test_integration(
    provider: str,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    integ = next((i for i in INTEGRATION_REGISTRY if i["id"] == provider), None)
    if not integ:
        return {"success": False, "message": f"Unknown integration: {provider}"}

    configured = _check_configured(integ.get("env_key"))
    if not configured:
        return {
            "success": False,
            "message": f"{integ['name']} is not configured. Set {integ['env_key']} in your .env file.",
            "setup_url": integ.get("setup_url"),
        }

    # For URLhaus (always available), do a quick test
    if provider == "urlhaus":
        try:
            import httpx
            async with httpx.AsyncClient(timeout=10) as client:
                resp = await client.get("https://urlhaus-api.abuse.ch/v1/")
                return {
                    "success": resp.status_code == 200,
                    "message": "URLhaus API is reachable and responding" if resp.status_code == 200 else "URLhaus API returned an error",
                    "response_time_ms": int(resp.elapsed.total_seconds() * 1000),
                    "tested_at": datetime.now(timezone.utc).isoformat(),
                }
        except Exception as e:
            return {"success": False, "message": f"Connection failed: {str(e)}"}

    return {
        "success": True,
        "message": f"{integ['name']} API key is configured. Full connectivity test requires network access.",
        "tested_at": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/{provider}/status")
async def get_integration_status(
    provider: str,
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    integ = next((i for i in INTEGRATION_REGISTRY if i["id"] == provider), None)
    if not integ:
        return {"error": f"Unknown integration: {provider}"}

    configured = _check_configured(integ.get("env_key"))
    return {
        "id": integ["id"],
        "name": integ["name"],
        "category": integ["category"],
        "description": integ["description"],
        "capabilities": integ["capabilities"],
        "configured": configured,
        "status": "connected" if configured else "not_configured",
        "setup_url": integ.get("setup_url"),
        "env_key": integ.get("env_key"),
        "checked_at": datetime.now(timezone.utc).isoformat(),
    }
