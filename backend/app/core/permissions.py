from uuid import UUID
from sqlalchemy.orm import Session
from app.models import User


def is_admin(db: Session, user_id: UUID) -> bool:
    """Check if a user has admin role."""
    user = db.query(User).filter(User.id == user_id).first()
    return user is not None and user.role == "admin"


def is_moderator(db: Session, user_id: UUID) -> bool:
    """Check if a user has moderator or admin role."""
    user = db.query(User).filter(User.id == user_id).first()
    return user is not None and user.role in ("admin", "moderator")
