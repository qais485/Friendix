from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.notification import (
    NotificationListResponse,
    NotificationCountResponse,
    NotificationMarkReadRequest,
)
from app.services.notification_service import NotificationService

router = APIRouter()


def get_notification_service(db: Session = Depends(get_db)) -> NotificationService:
    return NotificationService(db)


@router.get("", response_model=NotificationListResponse)
def get_notifications(
    cursor: str | None = None,
    limit: int = 20,
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_notification_service),
):
    cursor_uuid = UUID(cursor) if cursor else None
    return service.get_notifications(user_id, cursor_uuid, limit)


@router.get("/unread-count", response_model=NotificationCountResponse)
def get_unread_count(
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_notification_service),
):
    return service.get_unread_count(user_id)


@router.post("/mark-read")
def mark_as_read(
    data: NotificationMarkReadRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_notification_service),
):
    if data.notification_ids:
        for nid in data.notification_ids:
            service.mark_as_read(UUID(nid), user_id)
    else:
        service.mark_all_as_read(user_id)
    return {"status": "ok"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: NotificationService = Depends(get_notification_service),
):
    success = service.delete_notification(UUID(notification_id), user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "deleted"}
