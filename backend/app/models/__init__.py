"""ORM models package — import all models so they register with Base.metadata."""
from app.models.user import User, UserProfile, Session, MFACredential, RecoveryCode
from app.models.assessment import Assessment

__all__ = [
    "User", "UserProfile", "Session", "MFACredential", "RecoveryCode",
    "Assessment",
]
