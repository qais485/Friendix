from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class GroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    privacy: str = "public"
    rules: Optional[str] = None


class GroupUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cover_url: Optional[str] = None
    privacy: Optional[str] = None
    rules: Optional[str] = None


class GroupResponse(BaseModel):
    id: UUID
    creator_id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    cover_url: Optional[str] = None
    privacy: str
    members_count: int
    rules: Optional[str] = None
    is_active: bool
    is_member: bool = False
    member_role: Optional[str] = None
    has_pending_request: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupListResponse(BaseModel):
    groups: list[GroupResponse]


class GroupMemberResponse(BaseModel):
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    role: str
    status: str
    joined_at: datetime

    model_config = {"from_attributes": True}


class GroupMembersResponse(BaseModel):
    members: list[GroupMemberResponse]


class GroupJoinRequestResponse(BaseModel):
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    status: str
    message: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupJoinRequestsResponse(BaseModel):
    requests: list[GroupJoinRequestResponse]


class GroupAnnouncementCreate(BaseModel):
    title: str
    content: str


class GroupAnnouncementResponse(BaseModel):
    id: UUID
    author_id: UUID
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    title: str
    content: str
    is_pinned: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupAnnouncementsResponse(BaseModel):
    announcements: list[GroupAnnouncementResponse]


class GroupEventCreate(BaseModel):
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None


class GroupEventResponse(BaseModel):
    id: UUID
    creator_id: UUID
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    start_time: datetime
    end_time: Optional[datetime] = None
    cover_url: Optional[str] = None
    attendees_count: int
    is_attending: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupEventsResponse(BaseModel):
    events: list[GroupEventResponse]


class GroupPollCreate(BaseModel):
    question: str
    options: list[str]
    expires_at: Optional[datetime] = None
    is_anonymous: bool = False


class GroupPollResponse(BaseModel):
    id: UUID
    creator_id: UUID
    username: Optional[str] = None
    question: str
    options: list[str]
    expires_at: Optional[datetime] = None
    is_anonymous: bool
    total_votes: int
    user_vote: Optional[int] = None
    option_votes: list[int] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupPollsResponse(BaseModel):
    polls: list[GroupPollResponse]


class GroupMessageCreate(BaseModel):
    content: str


class GroupMessageResponse(BaseModel):
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    avatar_url: Optional[str] = None
    content: str
    is_announcement: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class GroupMessagesResponse(BaseModel):
    messages: list[GroupMessageResponse]


class GroupMemberRoleUpdate(BaseModel):
    role: str


class GroupMemberStatusUpdate(BaseModel):
    status: str
