from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class NotificationActor(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool

    model_config = {"from_attributes": True}


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    actor_id: UUID
    type: str
    entity_type: str
    entity_id: UUID
    entity_user_id: Optional[UUID]
    content: Optional[str]
    extra_json: Optional[str]
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime
    actor: Optional[NotificationActor] = None

    model_config = {"from_attributes": True}


class NotificationListResponse(BaseModel):
    notifications: list[NotificationResponse]
    total: int
    unread_count: int
    has_more: bool


class NotificationMarkReadRequest(BaseModel):
    notification_ids: list[str] = Field(default_factory=list)


class NotificationCountResponse(BaseModel):
    unread_count: int
