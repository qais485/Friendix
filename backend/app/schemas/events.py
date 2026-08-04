from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class EventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    event_type: str = "offline"
    location: Optional[str] = None
    online_link: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    reminder_minutes: int = 60


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    event_type: Optional[str] = None
    location: Optional[str] = None
    online_link: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reminder_minutes: Optional[int] = None


class EventResponse(BaseModel):
    id: UUID
    creator_id: UUID
    username: Optional[str] = None
    user_avatar: Optional[str] = None
    title: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    event_type: str
    location: Optional[str] = None
    online_link: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    attendees_count: int
    invited_count: int
    is_cancelled: bool
    is_creator: bool = False
    rsvp_status: Optional[str] = None
    reminder_minutes: int
    created_at: datetime

    model_config = {"from_attributes": True}


class EventListResponse(BaseModel):
    events: list[EventResponse]


class EventDetailResponse(BaseModel):
    id: UUID
    creator_id: UUID
    username: Optional[str] = None
    user_avatar: Optional[str] = None
    title: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    event_type: str
    location: Optional[str] = None
    online_link: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    attendees_count: int
    invited_count: int
    is_cancelled: bool
    is_creator: bool
    rsvp_status: Optional[str] = None
    reminder_minutes: int
    created_at: datetime


class EventRSVPResponse(BaseModel):
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str
    created_at: datetime


class EventRSVPListResponse(BaseModel):
    attendees: list[EventRSVPResponse]


class EventInviteCreate(BaseModel):
    user_ids: list[UUID]


class EventInviteResponse(BaseModel):
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    inviter_id: UUID
    inviter_username: Optional[str] = None
    status: str
    created_at: datetime


class EventInvitesResponse(BaseModel):
    invites: list[EventInviteResponse]


class EventChatMessageCreate(BaseModel):
    content: str


class EventChatMessageResponse(BaseModel):
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    content: str
    created_at: datetime


class EventChatMessagesResponse(BaseModel):
    messages: list[EventChatMessageResponse]
