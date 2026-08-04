import json
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from app.models.models import Notification, User


class NotificationRepository:
    def __init__(self, db: Session):
        self.db = db

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
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            actor_id=actor_id,
            type=type,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_user_id=entity_user_id,
            content=content,
            extra_json=extra_json,
        )
        self.db.add(notification)
        self.db.commit()
        self.db.refresh(notification)
        return notification

    def get_notifications(
        self,
        user_id: UUID,
        cursor: UUID | None = None,
        limit: int = 20,
    ) -> tuple[list[Notification], int, int]:
        query = self.db.query(Notification).filter(Notification.user_id == user_id)

        total = query.count()

        unread_count = self.db.query(func.count(Notification.id)).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).scalar()

        if cursor:
            query = query.filter(Notification.id < cursor)

        notifications = query.order_by(desc(Notification.created_at)).limit(limit + 1).all()
        has_more = len(notifications) > limit
        if has_more:
            notifications = notifications[:limit]

        return notifications, total, unread_count

    def get_notification(self, notification_id: UUID) -> Notification | None:
        return self.db.query(Notification).filter(Notification.id == notification_id).first()

    def mark_as_read(self, notification_id: UUID) -> Notification | None:
        notification = self.db.query(Notification).filter(Notification.id == notification_id).first()
        if notification and not notification.is_read:
            notification.is_read = True
            notification.read_at = datetime.now(timezone.utc)
            self.db.commit()
            self.db.refresh(notification)
        return notification

    def mark_all_as_read(self, user_id: UUID) -> int:
        count = self.db.query(func.count(Notification.id)).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).scalar()
        self.db.query(Notification).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).update({
            "is_read": True,
            "read_at": datetime.now(timezone.utc),
        })
        self.db.commit()
        return count

    def delete_notification(self, notification_id: UUID) -> bool:
        notification = self.db.query(Notification).filter(Notification.id == notification_id).first()
        if notification:
            self.db.delete(notification)
            self.db.commit()
            return True
        return False

    def delete_by_entity(self, entity_type: str, entity_id: UUID) -> int:
        count = self.db.query(func.count(Notification.id)).filter(
            and_(Notification.entity_type == entity_type, Notification.entity_id == entity_id)
        ).scalar()
        self.db.query(Notification).filter(
            and_(Notification.entity_type == entity_type, Notification.entity_id == entity_id)
        ).delete()
        self.db.commit()
        return count

    def get_unread_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Notification.id)).filter(
            and_(Notification.user_id == user_id, Notification.is_read == False)
        ).scalar()
