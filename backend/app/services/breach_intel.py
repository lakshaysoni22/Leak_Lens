# ============================================================
# LEAKLENS Breach Intelligence Service  v1.0
# ============================================================
# Queries REAL breach-intelligence APIs and aggregates results.
# Falls back gracefully when individual sources are unavailable.
# ============================================================
from __future__ import annotations

import hashlib
import asyncio
import logging
from datetime import datetime, timezone
from typing import Any, Optional

import httpx

from app.core.config import settings
from app.services.risk_engine import compute_risk, classify_risk

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Recommendation catalogue (mirrors synthetic_data.py format)
# ---------------------------------------------------------------------------
_RECOMMENDATIONS: dict[str, list[dict[str, str]]] = {
    "critical": [
        {
            "priority": "critical",
            "action": "Immediately change passwords on all accounts sharing this credential",
            "explanation": "Multiple high-severity exposures found in live breach databases.",
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
            "explanation": "High-severity exposure indicators found in live breach databases.",
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
            "explanation": "Moderate exposure indicators detected in live breach databases.",
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
            "explanation": "No significant exposure detected in live breach intelligence.",
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

# ---------------------------------------------------------------------------
# Data-category mapping for risk engine
# ---------------------------------------------------------------------------
_KNOWN_CATEGORIES: dict[str, str] = {
    # XposedOrNot / HIBP labels → risk_engine keys
    "passwords": "passwords_hashed",
    "password": "passwords_hashed",
    "passwords_hashed": "passwords_hashed",
    "passwords_plaintext": "passwords_plaintext",
    "email addresses": "email_addresses",
    "email_addresses": "email_addresses",
    "emails": "email_addresses",
    "usernames": "usernames",
    "names": "names",
    "phone numbers": "phone_numbers",
    "phone_numbers": "phone_numbers",
    "dates of birth": "dates_of_birth",
    "dates_of_birth": "dates_of_birth",
    "ip addresses": "ip_addresses",
    "ip_addresses": "ip_addresses",
    "credit cards": "credit_card_full",
    "partial credit cards": "credit_card_partial",
    "credit_card_full": "credit_card_full",
    "credit_card_partial": "credit_card_partial",
    "ssn": "ssn",
    "social security numbers": "ssn",
    "locations": "locations",
    "physical addresses": "locations",
    "geographic locations": "locations",
}


def _normalise_category(cat: str) -> str:
    """Map an API-reported data category to a risk_engine key."""
    key = cat.strip().lower()
    return _KNOWN_CATEGORIES.get(key, key)


def _normalise_breach_name(name: str) -> str:
    """Normalise a breach name for deduplication."""
    return name.strip().lower()


def _parse_date(raw: Optional[str]) -> Optional[datetime]:
    """Best-effort ISO date string → datetime."""
    if not raw:
        return None
    try:
        # Try full ISO first, then date-only
        for fmt in ("%Y-%m-%dT%H:%M:%S%z", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d"):
            try:
                dt = datetime.strptime(raw, fmt)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            except ValueError:
                continue
    except Exception:
        pass
    return None


class BreachIntelligenceError(Exception):
    """Raised when ALL breach-intelligence sources fail."""


class BreachIntelligenceService:
    """Real breach intelligence aggregator — queries live APIs."""

    _USER_AGENT = "LeakLens/1.0 (breach-intelligence-aggregator)"

    def __init__(self) -> None:
        self.timeout = httpx.Timeout(15.0, connect=10.0)

    # -----------------------------------------------------------------------
    # Public API
    # -----------------------------------------------------------------------
    async def scan_username(self, username: str) -> dict[str, Any]:
        """Query breach intelligence sources + platform existence for a username.

        Returns aggregated real breach data plus a list of platforms where
        the username was found.  If the username has NO breaches and NO
        platform presence, returns a clean result with 0 exposures.
        If ALL sources fail (network errors), raises BreachIntelligenceError.
        """
        username = username.strip().lower()

        # Run breach lookups and platform checks in parallel
        raw_results = await asyncio.gather(
            self._query_breachdirectory_username(username),
            self._check_platform_existence(username),
            return_exceptions=True,
        )

        # Separate breach results from platform results
        breach_successes: list[dict[str, Any]] = []
        platform_mentions: list[str] = []
        errors: list[Exception] = []

        for r in raw_results:
            if isinstance(r, Exception):
                errors.append(r)
                logger.warning("Username source failed: %s", r)
            elif isinstance(r, dict):
                breach_successes.append(r)
            elif isinstance(r, list):
                platform_mentions = r

        if not breach_successes and not platform_mentions:
            if errors:
                raise BreachIntelligenceError(
                    f"All username intelligence sources failed. Errors: "
                    f"{[str(e) for e in errors]}"
                )
            # No errors but nothing found either — clean result
            return {
                "risk_score": 0.0,
                "risk_level": "low",
                "exposure_count": 0,
                "breaches": [],
                "platform_mentions": [],
                "recommendations": _RECOMMENDATIONS["low"],
                "data_source": "live_intelligence",
                "sources_queried": ["breachdirectory", "platform_check"],
                "assessment_timestamp": datetime.now(timezone.utc).isoformat(),
            }

        # Aggregate breach data
        aggregated = self._aggregate(breach_successes, username) if breach_successes else {
            "risk_score": 0.0,
            "risk_level": "low",
            "exposure_count": 0,
            "breaches": [],
            "recommendations": _RECOMMENDATIONS["low"],
            "data_source": "live_intelligence",
            "sources_queried": [],
            "assessment_timestamp": datetime.now(timezone.utc).isoformat(),
        }

        # Merge platform mentions
        aggregated["platform_mentions"] = platform_mentions

        # Boost risk slightly if username found on many platforms (identity reuse)
        if len(platform_mentions) >= 3 and aggregated["exposure_count"] > 0:
            bonus = min(10.0, len(platform_mentions) * 2.0)
            aggregated["risk_score"] = min(100.0, aggregated["risk_score"] + bonus)
            aggregated["risk_level"] = classify_risk(aggregated["risk_score"])
            aggregated["recommendations"] = _RECOMMENDATIONS.get(
                aggregated["risk_level"], _RECOMMENDATIONS["low"]
            )

        if "platform_check" not in aggregated.get("sources_queried", []):
            aggregated.setdefault("sources_queried", []).append("platform_check")

        return aggregated

    # -----------------------------------------------------------------------
    # Platform existence checks (username OSINT)
    # -----------------------------------------------------------------------
    async def _check_platform_existence(self, username: str) -> list[str]:
        """Check if username exists on popular platforms — real HTTP probes."""
        platforms: list[str] = []
        short_timeout = httpx.Timeout(8.0, connect=5.0)

        async def _check_github() -> Optional[str]:
            try:
                async with httpx.AsyncClient(timeout=short_timeout) as c:
                    r = await c.get(
                        f"https://api.github.com/users/{username}",
                        headers={"User-Agent": self._USER_AGENT},
                    )
                    if r.status_code == 200:
                        return "GitHub"
            except Exception:
                pass
            return None

        async def _check_gitlab() -> Optional[str]:
            try:
                async with httpx.AsyncClient(timeout=short_timeout) as c:
                    r = await c.get(
                        f"https://gitlab.com/api/v4/users?username={username}",
                        headers={"User-Agent": self._USER_AGENT},
                    )
                    if r.status_code == 200:
                        data = r.json()
                        if isinstance(data, list) and len(data) > 0:
                            return "GitLab"
            except Exception:
                pass
            return None

        async def _check_reddit() -> Optional[str]:
            try:
                async with httpx.AsyncClient(timeout=short_timeout, follow_redirects=True) as c:
                    r = await c.get(
                        f"https://www.reddit.com/user/{username}/about.json",
                        headers={"User-Agent": self._USER_AGENT},
                    )
                    if r.status_code == 200:
                        data = r.json()
                        if data.get("data", {}).get("name"):
                            return "Reddit"
            except Exception:
                pass
            return None

        async def _check_hackernews() -> Optional[str]:
            try:
                async with httpx.AsyncClient(timeout=short_timeout) as c:
                    r = await c.get(
                        f"https://hacker-news.firebaseio.com/v0/user/{username}.json",
                        headers={"User-Agent": self._USER_AGENT},
                    )
                    if r.status_code == 200 and r.text.strip() != "null":
                        return "Hacker News"
            except Exception:
                pass
            return None

        async def _check_keybase() -> Optional[str]:
            try:
                async with httpx.AsyncClient(timeout=short_timeout) as c:
                    r = await c.get(
                        f"https://keybase.io/_/api/1.0/user/lookup.json?usernames={username}",
                        headers={"User-Agent": self._USER_AGENT},
                    )
                    if r.status_code == 200:
                        data = r.json()
                        them = data.get("them", [])
                        if them and them[0] is not None:
                            return "Keybase"
            except Exception:
                pass
            return None

        # Run all checks in parallel
        results = await asyncio.gather(
            _check_github(),
            _check_gitlab(),
            _check_reddit(),
            _check_hackernews(),
            _check_keybase(),
            return_exceptions=True,
        )

        for r in results:
            if isinstance(r, str):
                platforms.append(r)

        return platforms

    # -----------------------------------------------------------------------
    # BreachDirectory for usernames
    # -----------------------------------------------------------------------
    async def _query_breachdirectory_username(self, username: str) -> dict[str, Any]:
        """Query BreachDirectory with username SHA1 hash."""
        source = "breachdirectory"
        try:
            sha1 = hashlib.sha1(username.lower().encode()).hexdigest()
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"https://breachdirectory.org/api/check/{sha1}",
                    headers={"User-Agent": self._USER_AGENT},
                )

                if resp.status_code == 404:
                    return {"found": False, "breaches": [], "source": source}

                resp.raise_for_status()
                data = resp.json()

                breaches: list[dict[str, Any]] = []
                is_found = data.get("found", data.get("success", False))
                if is_found:
                    sources_list = data.get("sources", data.get("result", []))
                    if isinstance(sources_list, list):
                        for s in sources_list:
                            if isinstance(s, str):
                                breaches.append({
                                    "name": s,
                                    "date": "",
                                    "data_categories": ["usernames"],
                                    "severity": "medium",
                                    "source": source,
                                    "is_verified": False,
                                })
                            elif isinstance(s, dict):
                                breaches.append({
                                    "name": s.get("name", "Unknown"),
                                    "date": s.get("date", ""),
                                    "data_categories": s.get("data_categories", ["usernames"]),
                                    "severity": s.get("severity", "medium"),
                                    "source": source,
                                    "is_verified": False,
                                })

                return {"found": bool(breaches), "breaches": breaches, "source": source}

        except Exception as exc:
            logger.warning("BreachDirectory username query failed: %s", exc)
            raise

    async def scan_email(self, email: str) -> dict[str, Any]:
        """Query multiple breach intelligence sources for an email.

        Returns aggregated real breach data.  If the email has NO breaches
        across ALL sources, returns a clean result with 0 exposures.
        If ALL sources fail (network errors), raises BreachIntelligenceError.
        """
        email = email.strip().lower()

        raw_results = await asyncio.gather(
            self._query_xposedornot(email),
            self._query_emailrep(email),
            self._query_hibp(email),
            self._query_breachdirectory(email),
            return_exceptions=True,
        )

        # Separate successes from failures
        successes: list[dict[str, Any]] = []
        errors: list[Exception] = []
        for r in raw_results:
            if isinstance(r, Exception):
                errors.append(r)
                logger.warning("Breach source failed: %s", r)
            elif isinstance(r, dict):
                successes.append(r)

        if not successes:
            raise BreachIntelligenceError(
                f"All breach intelligence sources failed. Errors: "
                f"{[str(e) for e in errors]}"
            )

        # Aggregate and deduplicate
        return self._aggregate(successes, email)

    # -----------------------------------------------------------------------
    # Aggregation
    # -----------------------------------------------------------------------
    def _aggregate(
        self, results: list[dict[str, Any]], email: str
    ) -> dict[str, Any]:
        seen_names: set[str] = set()
        merged_breaches: list[dict[str, Any]] = []
        all_categories: list[str] = []
        all_severities: list[str] = []
        all_dates: list[datetime] = []
        sources_queried: list[str] = []

        for src in results:
            source_name = src.get("source", "unknown")
            if source_name not in sources_queried:
                sources_queried.append(source_name)

            for breach in src.get("breaches", []):
                norm = _normalise_breach_name(breach.get("name", ""))
                if not norm or norm in seen_names:
                    continue
                seen_names.add(norm)
                merged_breaches.append(breach)

                cats = breach.get("data_categories", [])
                normalised_cats = [_normalise_category(c) for c in cats]
                all_categories.extend(normalised_cats)

                sev = breach.get("severity", "medium").lower()
                if sev in ("critical", "high", "medium", "low", "info"):
                    all_severities.append(sev)

                dt = _parse_date(breach.get("date"))
                if dt:
                    all_dates.append(dt)

        exposure_count = len(merged_breaches)

        # Use the existing risk engine
        if exposure_count == 0:
            risk_score = 0.0
            risk_level = "low"
        else:
            risk_result = compute_risk(
                incident_count=exposure_count,
                data_categories=list(set(all_categories)) or None,
                breach_dates=all_dates or None,
                severities=all_severities or None,
            )
            risk_score = risk_result.risk_score
            risk_level = risk_result.risk_level

        recommendations = _RECOMMENDATIONS.get(risk_level, _RECOMMENDATIONS["low"])

        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "exposure_count": exposure_count,
            "breaches": merged_breaches,
            "recommendations": recommendations,
            "data_source": "live_intelligence",
            "sources_queried": sources_queried,
            "assessment_timestamp": datetime.now(timezone.utc).isoformat(),
        }

    # -----------------------------------------------------------------------
    # XposedOrNot — FREE, no API key
    # -----------------------------------------------------------------------
    async def _query_xposedornot(self, email: str) -> dict[str, Any]:
        source = "xposedornot"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"https://api.xposedornot.com/v1/check-email/{email}",
                    headers={"User-Agent": self._USER_AGENT},
                )

                if resp.status_code == 404:
                    # Email not found in any breach — this is correct, not an error
                    return {"found": False, "breaches": [], "source": source}

                resp.raise_for_status()
                data = resp.json()

                breaches: list[dict[str, Any]] = []
                # XposedOrNot returns breaches in various formats
                exposed = data.get("ExposedBreaches", data.get("breaches_details", []))
                if isinstance(exposed, dict):
                    exposed = exposed.get("breaches_details", [])
                if isinstance(exposed, list):
                    for b in exposed:
                        breach_name = b.get("breach", b.get("name", "Unknown"))
                        breach_date = b.get("xposed_date", b.get("date", ""))
                        raw_cats = b.get("xposed_data", b.get("data_classes", ""))
                        if isinstance(raw_cats, str):
                            cats = [c.strip() for c in raw_cats.split(",") if c.strip()]
                        else:
                            cats = raw_cats if isinstance(raw_cats, list) else []

                        breaches.append({
                            "name": breach_name,
                            "date": breach_date,
                            "data_categories": cats,
                            "severity": self._infer_severity(cats),
                            "source": source,
                            "is_verified": True,
                        })

                return {"found": bool(breaches), "breaches": breaches, "source": source}

        except httpx.HTTPStatusError as exc:
            logger.warning("XposedOrNot HTTP error %s: %s", exc.response.status_code, exc)
            raise
        except Exception as exc:
            logger.warning("XposedOrNot query failed: %s", exc)
            raise

    # -----------------------------------------------------------------------
    # EmailRep.io — FREE, no API key (User-Agent required)
    # -----------------------------------------------------------------------
    async def _query_emailrep(self, email: str) -> dict[str, Any]:
        source = "emailrep"
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"https://emailrep.io/{email}",
                    headers={
                        "User-Agent": self._USER_AGENT,
                        "Accept": "application/json",
                    },
                )
                resp.raise_for_status()
                data = resp.json()

                breaches: list[dict[str, Any]] = []
                details = data.get("details", {})
                is_breached = details.get("data_breach", False)
                credentials_leaked = details.get("credentials_leaked", False)

                if is_breached or credentials_leaked:
                    # EmailRep doesn't list individual breaches, but confirms exposure
                    cats: list[str] = ["email_addresses"]
                    if credentials_leaked:
                        cats.append("passwords_hashed")

                    profiles = details.get("profiles", [])
                    breach_name = "EmailRep Confirmed Exposure"

                    breaches.append({
                        "name": breach_name,
                        "date": "",
                        "data_categories": cats,
                        "severity": "high" if credentials_leaked else "medium",
                        "source": source,
                        "is_verified": False,
                        "reputation": data.get("reputation", "none"),
                        "profiles": profiles,
                    })

                return {"found": bool(breaches), "breaches": breaches, "source": source}

        except Exception as exc:
            logger.warning("EmailRep query failed: %s", exc)
            raise

    # -----------------------------------------------------------------------
    # Have I Been Pwned v3 — requires HIBP_API_KEY
    # -----------------------------------------------------------------------
    async def _query_hibp(self, email: str) -> dict[str, Any]:
        source = "hibp"
        api_key = getattr(settings, "HIBP_API_KEY", "")
        if not api_key:
            return {"found": False, "breaches": [], "source": source, "skipped": True}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}",
                    headers={
                        "hibp-api-key": api_key,
                        "User-Agent": self._USER_AGENT,
                    },
                    params={"truncateResponse": "false"},
                )

                if resp.status_code == 404:
                    return {"found": False, "breaches": [], "source": source}

                if resp.status_code == 429:
                    logger.warning("HIBP rate-limited")
                    return {"found": False, "breaches": [], "source": source, "rate_limited": True}

                resp.raise_for_status()
                data = resp.json()

                breaches: list[dict[str, Any]] = []
                if isinstance(data, list):
                    for b in data:
                        cats = b.get("DataClasses", [])
                        breaches.append({
                            "name": b.get("Name", b.get("Title", "Unknown")),
                            "date": b.get("BreachDate", ""),
                            "data_categories": cats,
                            "severity": self._infer_severity(cats),
                            "source": source,
                            "is_verified": b.get("IsVerified", False),
                            "description": b.get("Description", ""),
                        })

                return {"found": bool(breaches), "breaches": breaches, "source": source}

        except Exception as exc:
            logger.warning("HIBP query failed: %s", exc)
            raise

    # -----------------------------------------------------------------------
    # BreachDirectory — uses SHA1 hash
    # -----------------------------------------------------------------------
    async def _query_breachdirectory(self, email: str) -> dict[str, Any]:
        source = "breachdirectory"
        try:
            sha1 = hashlib.sha1(email.lower().encode()).hexdigest()
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(
                    f"https://breachdirectory.org/api/check/{sha1}",
                    headers={"User-Agent": self._USER_AGENT},
                )

                if resp.status_code == 404:
                    return {"found": False, "breaches": [], "source": source}

                resp.raise_for_status()
                data = resp.json()

                breaches: list[dict[str, Any]] = []
                is_found = data.get("found", data.get("success", False))
                if is_found:
                    sources_list = data.get("sources", data.get("result", []))
                    if isinstance(sources_list, list):
                        for s in sources_list:
                            if isinstance(s, str):
                                breaches.append({
                                    "name": s,
                                    "date": "",
                                    "data_categories": ["email_addresses"],
                                    "severity": "medium",
                                    "source": source,
                                    "is_verified": False,
                                })
                            elif isinstance(s, dict):
                                breaches.append({
                                    "name": s.get("name", "Unknown"),
                                    "date": s.get("date", ""),
                                    "data_categories": s.get("data_categories", ["email_addresses"]),
                                    "severity": s.get("severity", "medium"),
                                    "source": source,
                                    "is_verified": False,
                                })

                return {"found": bool(breaches), "breaches": breaches, "source": source}

        except Exception as exc:
            logger.warning("BreachDirectory query failed: %s", exc)
            raise

    # -----------------------------------------------------------------------
    # Helpers
    # -----------------------------------------------------------------------
    @staticmethod
    def _infer_severity(data_categories: list[str]) -> str:
        """Infer breach severity from exposed data categories."""
        cats_lower = {c.strip().lower() for c in data_categories}
        critical_indicators = {
            "passwords", "passwords_plaintext", "credit cards",
            "credit_card_full", "ssn", "social security numbers",
            "financial data", "bank account numbers",
        }
        high_indicators = {
            "passwords_hashed", "credit_card_partial",
            "dates of birth", "dates_of_birth", "phone numbers",
            "phone_numbers", "security questions",
        }
        if cats_lower & critical_indicators:
            return "critical"
        if cats_lower & high_indicators:
            return "high"
        if cats_lower:
            return "medium"
        return "low"


# ---------------------------------------------------------------------------
# Module-level singleton
# ---------------------------------------------------------------------------
breach_intel_service = BreachIntelligenceService()
