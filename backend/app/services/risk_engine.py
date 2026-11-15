# ============================================================
# LEAKLENS Risk Assessment Engine  v1.0
# ============================================================
# Methodology note:
#   Risk score (0-100) is computed as a weighted sum of six
#   normalised factor scores.  Weights sum to 1.0.
#   Classification:  Low 0-24 | Medium 25-49 | High 50-74 | Critical 75-100
#
# ⚠️  This is an educational / demonstration scoring system.
#     Scores are NOT scientifically validated risk metrics.
# ============================================================
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Optional

ENGINE_VERSION = "1.0"
ENGINE_DESCRIPTION = (
    "LEAKLENS Risk Assessment Engine v1.0 — demonstration scoring system. "
    "Scores are computed from configurable weighted factors and are for "
    "educational and indicative purposes only."
)

# ---------------------------------------------------------------------------
# Weights configuration
# ---------------------------------------------------------------------------
@dataclass
class RiskWeights:
    exposure_frequency: float = 0.25
    incident_count: float = 0.20
    data_categories: float = 0.20
    threat_severity: float = 0.20
    recency: float = 0.10
    exposure_indicators: float = 0.05

    def total(self) -> float:
        return (
            self.exposure_frequency + self.incident_count +
            self.data_categories + self.threat_severity +
            self.recency + self.exposure_indicators
        )

    def validate(self) -> None:
        t = self.total()
        if abs(t - 1.0) > 0.01:
            raise ValueError(f"RiskWeights must sum to 1.0, got {t:.4f}")


DEFAULT_WEIGHTS = RiskWeights()

# ---------------------------------------------------------------------------
# Lookup tables
# ---------------------------------------------------------------------------
_SEVERITY_VALUES: dict[str, float] = {
    "critical": 1.00,
    "high": 0.75,
    "medium": 0.50,
    "low": 0.25,
    "info": 0.10,
}

_DATA_CATEGORY_WEIGHTS: dict[str, float] = {
    "passwords_plaintext": 1.00,
    "credit_card_full": 1.00,
    "ssn": 1.00,
    "passwords_hashed": 0.80,
    "credit_card_partial": 0.60,
    "dates_of_birth": 0.50,
    "phone_numbers": 0.50,
    "email_addresses": 0.40,
    "usernames": 0.40,
    "names": 0.30,
    "ip_addresses": 0.30,
    "locations": 0.20,
}


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------
@dataclass
class FactorResult:
    name: str
    weight: float
    raw_score: float          # 0-1
    normalised_score: float   # 0-100
    contribution: float       # points added to final score
    explanation: str


@dataclass
class RiskResult:
    risk_score: float
    risk_level: str
    factors: list[FactorResult] = field(default_factory=list)
    summary: str = ""
    methodology_note: str = ENGINE_DESCRIPTION
    engine_version: str = ENGINE_VERSION


# ---------------------------------------------------------------------------
# Individual factor scorers
# ---------------------------------------------------------------------------
def _score_frequency(incident_count: int, max_expected: int = 10) -> float:
    return min(1.0, incident_count / max_expected)


def _score_data_categories(categories: list[str]) -> float:
    if not categories:
        return 0.0
    weights = [_DATA_CATEGORY_WEIGHTS.get(c, 0.20) for c in categories]
    return min(1.0, max(weights) * 0.6 + (sum(weights) / len(weights)) * 0.4)


def _score_severity(severities: list[str]) -> float:
    if not severities:
        return 0.0
    return max(_SEVERITY_VALUES.get(s, 0.30) for s in severities)


def _score_recency(latest_date: Optional[datetime]) -> float:
    if latest_date is None:
        return 0.30
    if latest_date.tzinfo is None:
        latest_date = latest_date.replace(tzinfo=timezone.utc)
    days = (datetime.now(timezone.utc) - latest_date).days
    if days < 90:
        return 1.00
    if days < 365:
        return 0.80
    if days < 730:
        return 0.50
    return 0.20


def _score_indicators(indicators: list[str]) -> float:
    return min(1.0, len(indicators) * 0.20)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------
def classify_risk(score: float) -> str:
    if score >= 75:
        return "critical"
    if score >= 50:
        return "high"
    if score >= 25:
        return "medium"
    return "low"


def compute_risk(
    incident_count: int = 0,
    data_categories: Optional[list[str]] = None,
    breach_dates: Optional[list[datetime]] = None,
    severities: Optional[list[str]] = None,
    exposure_indicators: Optional[list[str]] = None,
    weights: Optional[RiskWeights] = None,
) -> RiskResult:
    """
    Compute a risk score and return a fully-explainable RiskResult.

    Parameters
    ----------
    incident_count : int
        Number of exposure incidents found.
    data_categories : list[str]
        Categories of data exposed (e.g. 'passwords_hashed').
    breach_dates : list[datetime]
        Dates of associated breaches (used for recency scoring).
    severities : list[str]
        Severity labels of incidents ('critical', 'high', 'medium', 'low').
    exposure_indicators : list[str]
        Any extra exposure signal strings.
    weights : RiskWeights
        Optional custom weights; defaults to DEFAULT_WEIGHTS.
    """
    w = weights or DEFAULT_WEIGHTS
    w.validate()

    cats = data_categories or []
    dates = breach_dates or []
    sevs = severities or []
    inds = exposure_indicators or []
    latest = max(dates) if dates else None

    ef = _score_frequency(incident_count)
    ic = min(1.0, incident_count / 5.0)
    dc = _score_data_categories(cats)
    ts = _score_severity(sevs)
    re = _score_recency(latest)
    ei = _score_indicators(inds)

    raw = (
        ef * w.exposure_frequency +
        ic * w.incident_count +
        dc * w.data_categories +
        ts * w.threat_severity +
        re * w.recency +
        ei * w.exposure_indicators
    )

    score = round(min(100.0, max(0.0, raw * 100)), 1)
    level = classify_risk(score)

    factors = [
        FactorResult("Exposure Frequency", w.exposure_frequency, ef, ef * 100,
                     ef * w.exposure_frequency * 100,
                     f"{incident_count} exposure incident(s) recorded in synthetic dataset."),
        FactorResult("Incident Count", w.incident_count, ic, ic * 100,
                     ic * w.incident_count * 100,
                     f"Total of {incident_count} incident(s) factored into score."),
        FactorResult("Data Categories", w.data_categories, dc, dc * 100,
                     dc * w.data_categories * 100,
                     f"Exposed categories: {', '.join(cats) if cats else 'none detected'}."),
        FactorResult("Threat Severity", w.threat_severity, ts, ts * 100,
                     ts * w.threat_severity * 100,
                     f"Severity levels present: {', '.join(sevs) if sevs else 'none'}."),
        FactorResult("Recency", w.recency, re, re * 100,
                     re * w.recency * 100,
                     f"Most recent incident: {latest.strftime('%Y-%m-%d') if latest else 'unknown'}."),
        FactorResult("Exposure Indicators", w.exposure_indicators, ei, ei * 100,
                     ei * w.exposure_indicators * 100,
                     f"{len(inds)} additional exposure indicator(s)."),
    ]

    summaries = {
        "critical": f"Critical risk ({score}/100). Immediate action strongly recommended.",
        "high": f"High risk ({score}/100). Prompt security review advised.",
        "medium": f"Medium risk ({score}/100). Some security improvements recommended.",
        "low": f"Low risk ({score}/100). Continue maintaining good security practices.",
    }

    return RiskResult(risk_score=score, risk_level=level, factors=factors, summary=summaries[level])
