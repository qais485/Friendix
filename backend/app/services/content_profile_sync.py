"""Automatic content-profile synchronization.

Hooks content create/update/delete operations so that content profiles are
always kept in sync without manual refresh endpoints. Content deletion removes
the profile row; creation and updates rebuild it from the latest source row.
"""
from uuid import UUID

from sqlalchemy.orm import Session

from app.services.content_profile_service import ContentProfileService


def sync_content_profile(db: Session, content_type: str, content_id: UUID) -> None:
    """Build or refresh the profile for a content item after create/update."""
    ContentProfileService(db).build(content_type, content_id)


def drop_content_profile(db: Session, content_type: str, content_id: UUID) -> None:
    """Delete the profile row when its content item is removed."""
    ContentProfileService(db).delete(content_type, content_id)
