# ============================================================
# LEAKLENS Synthetic Data Module
# ⚠️  ALL DATA HERE IS FICTIONAL AND FOR DEMONSTRATION ONLY
#    These are NOT real breach records.
#    No actual personal data is stored or processed.
# ============================================================

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

SYNTHETIC_DATA_NOTICE = (
    "⚠️ SYNTHETIC DATA — FOR DEMONSTRATION PURPOSES ONLY. "
    "These results are simulated and do NOT represent real breach discoveries. "
    "No personal identifiers are stored; only keyed HMAC digests are used."
)

# ---------------------------------------------------------------------------
# Fictional synthetic breach catalogue
# ---------------------------------------------------------------------------
SYNTHETIC_SOURCES: list[dict[str, Any]] = [
    {
        "id": "syn_001",
        "name": "DataVault Synthetic Incident 2023",
        "date": "2023-03-15",
        "description": "Simulated credential database exposure scenario.",
        "data_categories": ["email_addresses", "usernames", "passwords_hashed"],
        "severity": "high",
        "record_count": 48_200,
        "is_synthetic": True,
    },
    {
        "id": "syn_002",
        "name": "CloudStore Demo Misconfiguration 2022",
        "date": "2022-11-08",
        "description": "Simulated cloud-storage misconfiguration scenario.",
        "data_categories": ["email_addresses", "names", "phone_numbers"],
        "severity": "medium",
        "record_count": 23_500,
        "is_synthetic": True,
    },
    {
        "id": "syn_003",
        "name": "ForumSite Synthetic Leak 2024",
        "date": "2024-01-22",
        "description": "Simulated forum-database exposure scenario.",
        "data_categories": ["email_addresses", "usernames", "passwords_hashed", "ip_addresses"],
        "severity": "critical",
        "record_count": 102_000,
        "is_synthetic": True,
    },
    {
        "id": "syn_004",
        "name": "EcomDemo Credential Exposure 2023",
        "date": "2023-07-30",
        "description": "Simulated e-commerce credential-stuffing scenario.",
        "data_categories": ["email_addresses", "passwords_plaintext", "credit_card_partial"],
        "severity": "critical",
        "record_count": 14_900,
        "is_synthetic": True,
    },
    {
        "id": "syn_005",
        "name": "SocialApp Demo Scrape 2024",
        "date": "2024-05-10",
        "description": "Simulated social-media data-aggregation scenario.",
        "data_categories": ["email_addresses", "usernames", "names", "locations"],
        "severity": "low",
        "record_count": 198_000,
        "is_synthetic": True,
    },
]

_SOURCE_MAP = {s["id"]: s for s in SYNTHETIC_SOURCES}

# ---------------------------------------------------------------------------
# Demo e-mail triggers (deterministic results for well-known demo addresses)
# ---------------------------------------------------------------------------
_EMAIL_TRIGGERS: dict[str, dict[str, Any]] = {
    "demo@leaklens.io": {
        "risk_score": 78.5,
        "risk_level": "critical",
        "breach_ids": ["syn_001", "syn_003", "syn_004"],
        "exposure_count": 3,
    },
    "test@example.com": {
        "risk_score": 45.0,
        "risk_level": "medium",
        "breach_ids": ["syn_002"],
        "exposure_count": 1,
    },
    "highrisker@test.com": {
        "risk_score": 92.0,
        "risk_level": "critical",
        "breach_ids": ["syn_001", "syn_002", "syn_003", "syn_004"],
        "exposure_count": 4,
    },
    "lowrisk@example.org": {
        "risk_score": 12.0,
        "risk_level": "low",
        "breach_ids": [],
        "exposure_count": 0,
    },
    "medium@demo.com": {
        "risk_score": 38.0,
        "risk_level": "medium",
        "breach_ids": ["syn_005"],
        "exposure_count": 1,
    },
}

_USERNAME_TRIGGERS: dict[str, dict[str, Any]] = {
    "demo_user": {
        "risk_score": 55.0,
        "risk_level": "high",
        "breach_ids": ["syn_001", "syn_003"],
        "exposure_count": 2,
        "platform_mentions": ["gaming_forums", "tech_communities"],
    },
    "testuser123": {
        "risk_score": 25.0,
        "risk_level": "medium",
        "breach_ids": ["syn_002"],
        "exposure_count": 1,
        "platform_mentions": ["social_platforms"],
    },
    "highexposure": {
        "risk_score": 85.0,
        "risk_level": "critical",
        "breach_ids": ["syn_001", "syn_003", "syn_004"],
        "exposure_count": 3,
        "platform_mentions": ["gaming_forums", "tech_communities", "social_platforms"],
    },
}

# ---------------------------------------------------------------------------
# Recommendation catalogue
# ---------------------------------------------------------------------------
SECURITY_RECOMMENDATIONS: dict[str, list[dict[str, str]]] = {
    "critical": [
        {
            "priority": "critical",
            "action": "Immediately change passwords on all accounts sharing this credential",
            "explanation": "Multiple high-severity exposure indicators found in synthetic assessment.",
            "category": "credential_security",
        },
        {
            "priority": "critical",
            "action": "Enable two-factor authentication on every account that supports it",
            "explanation": "2FA significantly reduces risk even when credentials are exposed.",
            "category": "account_security",
        },
        {
            "priority": "high",
            "action": "Review recent login activity on your most sensitive accounts",
            "explanation": "Look for unrecognised logins or access from unusual locations.",
            "category": "account_monitoring",
        },
        {
            "priority": "high",
            "action": "Use a unique, randomly generated password for every account",
            "explanation": "Password reuse amplifies credential-exposure risk across services.",
            "category": "credential_security",
        },
        {
            "priority": "medium",
            "action": "Consider adopting a reputable password manager",
            "explanation": "Password managers help maintain unique, complex passwords without memorisation.",
            "category": "tools",
        },
    ],
    "high": [
        {
            "priority": "high",
            "action": "Change passwords for affected account types promptly",
            "explanation": "High-severity exposure indicators found in synthetic assessment.",
            "category": "credential_security",
        },
        {
            "priority": "high",
            "action": "Enable 2FA wherever available",
            "explanation": "Two-factor authentication adds a critical extra layer of protection.",
            "category": "account_security",
        },
        {
            "priority": "medium",
            "action": "Set up alerts for suspicious login attempts",
            "explanation": "Early detection reduces the impact of compromised credentials.",
            "category": "account_monitoring",
        },
    ],
    "medium": [
        {
            "priority": "medium",
            "action": "Consider refreshing passwords for accounts associated with this identifier",
            "explanation": "Moderate exposure indicators detected in synthetic assessment.",
            "category": "credential_security",
        },
        {
            "priority": "medium",
            "action": "Enable 2FA on critical accounts if not already done",
            "explanation": "Authentication security enhancement is recommended.",
            "category": "account_security",
        },
        {
            "priority": "low",
            "action": "Review privacy settings on your online accounts",
            "explanation": "Reducing data exposure helps minimise future risk.",
            "category": "privacy",
        },
    ],
    "low": [
        {
            "priority": "low",
            "action": "Continue maintaining good password hygiene",
            "explanation": "No significant exposure detected in this synthetic assessment.",
            "category": "credential_security",
        },
        {
            "priority": "low",
            "action": "Periodically review account security settings",
            "explanation": "Regular reviews help maintain a strong security posture.",
            "category": "account_monitoring",
        },
    ],
}


def _classify(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 50:
        return "high"
    if score >= 25:
        return "medium"
    return "low"


def get_synthetic_email_result(identifier_hash: str, original_hint: str) -> dict[str, Any]:
    """Return a synthetic assessment result for an e-mail address."""
    trigger = _EMAIL_TRIGGERS.get(original_hint.lower().strip())
    if not trigger:
        hash_int = int(identifier_hash[:8], 16)
        risk_score = round(5 + (hash_int % 85), 1)
        risk_level = _classify(risk_score)
        count = 2 if risk_level == "critical" else (1 if risk_level in ("high", "medium") else 0)
        ids = ["syn_001", "syn_003"][:count]
        trigger = {"risk_score": risk_score, "risk_level": risk_level, "breach_ids": ids, "exposure_count": count}

    breaches = [_SOURCE_MAP[bid] for bid in trigger["breach_ids"] if bid in _SOURCE_MAP]
    return {
        "data_notice": SYNTHETIC_DATA_NOTICE,
        "risk_score": trigger["risk_score"],
        "risk_level": trigger["risk_level"],
        "exposure_count": trigger["exposure_count"],
        "breaches": breaches,
        "recommendations": SECURITY_RECOMMENDATIONS.get(trigger["risk_level"], SECURITY_RECOMMENDATIONS["low"]),
        "is_synthetic": True,
        "assessment_timestamp": datetime.now(timezone.utc).isoformat(),
    }


def get_synthetic_username_result(identifier_hash: str, original_hint: str) -> dict[str, Any]:
    """Return a synthetic assessment result for a username."""
    trigger = _USERNAME_TRIGGERS.get(original_hint.lower().strip())
    if not trigger:
        hash_int = int(identifier_hash[:8], 16)
        risk_score = round(10 + (hash_int % 70), 1)
        risk_level = _classify(risk_score)
        count = 1 if risk_level in ("critical", "high") else 0
        ids = ["syn_001"][:count]
        trigger = {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "breach_ids": ids,
            "exposure_count": count,
            "platform_mentions": [],
        }

    breaches = [_SOURCE_MAP[bid] for bid in trigger["breach_ids"] if bid in _SOURCE_MAP]
    return {
        "data_notice": SYNTHETIC_DATA_NOTICE,
        "risk_score": trigger["risk_score"],
        "risk_level": trigger["risk_level"],
        "exposure_count": trigger["exposure_count"],
        "breaches": breaches,
        "platform_mentions": trigger.get("platform_mentions", []),
        "recommendations": SECURITY_RECOMMENDATIONS.get(trigger["risk_level"], SECURITY_RECOMMENDATIONS["low"]),
        "is_synthetic": True,
        "assessment_timestamp": datetime.now(timezone.utc).isoformat(),
    }
