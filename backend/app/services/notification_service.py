import json
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.models import User
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    NotificationCountResponse,
    NotificationActor,
)


class NotificationService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = NotificationRepository(db)

    def _enrich_actor(self, actor_id: UUID) -> NotificationActor | None:
        user = self.db.query(User).filter(User.id == actor_id).first()
        if not user:
            return None
        return NotificationActor(
            id=str(user.id),
            full_name=user.full_name,
            username=user.username,
            avatar_url=user.avatar_url,
            is_verified=user.is_verified or False,
        )

    def _to_response(self, notification) -> NotificationResponse:
        actor = self._enrich_actor(notification.actor_id)
        return NotificationResponse(
            id=notification.id,
            user_id=notification.user_id,
            actor_id=notification.actor_id,
            type=notification.type,
            entity_type=notification.entity_type,
            entity_id=notification.entity_id,
            entity_user_id=notification.entity_user_id,
            content=notification.content,
            extra_json=notification.extra_json,
            is_read=notification.is_read,
            read_at=notification.read_at,
            created_at=notification.created_at,
            actor=actor,
        )

    def get_notifications(
        self,
        user_id: UUID,
        cursor: UUID | None = None,
        limit: int = 20,
    ) -> NotificationListResponse:
        notifications, total, unread_count = self.repo.get_notifications(user_id, cursor, limit)
        has_more = len(notifications) > limit
        if has_more:
            notifications = notifications[:limit]
        return NotificationListResponse(
            notifications=[self._to_response(n) for n in notifications],
            total=total,
            unread_count=unread_count,
            has_more=has_more,
        )

    def get_unread_count(self, user_id: UUID) -> NotificationCountResponse:
        return NotificationCountResponse(unread_count=self.repo.get_unread_count(user_id))

    def mark_as_read(self, notification_id: UUID, user_id: UUID) -> NotificationResponse | None:
        notification = self.repo.get_notification(notification_id)
        if not notification or notification.user_id != user_id:
            return None
        updated = self.repo.mark_as_read(notification_id)
        if updated:
            return self._to_response(updated)
        return None

    def mark_all_as_read(self, user_id: UUID) -> int:
        return self.repo.mark_all_as_read(user_id)

    def delete_notification(self, notification_id: UUID, user_id: UUID) -> bool:
        notification = self.repo.get_notification(notification_id)
        if not notification or notification.user_id != user_id:
            return False
        return self.repo.delete_notification(notification_id)

    def delete_by_entity(self, entity_type: str, entity_id: UUID) -> int:
        return self.repo.delete_by_entity(entity_type, entity_id)

    def create_notification(
        self,
        user_id: UUID,
        actor_id: UUID,
        type: str,
        entity_type: str,
        entity_id: UUID,
        entity_user_id: UUID | None = None,
        content: str | None = None,
        extra_json: str | None = None,
    ) -> NotificationResponse | None:
        if user_id == actor_id:
            return None
        notification = self.repo.create_notification(
            user_id=user_id,
            actor_id=actor_id,
            type=type,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_user_id=entity_user_id,
            content=content,
            extra_json=extra_json,
        )
        return self._to_response(notification)
