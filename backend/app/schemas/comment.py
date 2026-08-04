from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    parent_id: Optional[str] = None
    mentions: Optional[list[str]] = None


class CommentUpdate(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)


class CommentReactionCreate(BaseModel):
    emoji: str = Field(..., min_length=1, max_length=10)


class CommentReportCreate(BaseModel):
    reason: str = Field(..., pattern=r"^(spam|harassment|inappropriate|other)$")
    description: Optional[str] = None


class CommentAuthor(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    is_verified: bool

    model_config = {"from_attributes": True}


class CommentReactionResponse(BaseModel):
    id: UUID
    user_id: UUID
    emoji: str
    created_at: datetime
    user: Optional[CommentAuthor] = None

    model_config = {"from_attributes": True}


class CommentResponse(BaseModel):
    id: UUID
    post_id: UUID
    user_id: UUID
    parent_id: Optional[UUID]
    content: str
    mentions: Optional[list[str]] = None
    is_pinned: bool
    is_hidden: bool
    is_deleted: bool
    replies_count: int
    reactions_count: int
    author: Optional[CommentAuthor] = None
    reactions: list[CommentReactionResponse] = []
    has_reacted: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CommentListResponse(BaseModel):
    comments: list[CommentResponse]
    total: int
    has_more: bool


class CommentReportResponse(BaseModel):
    id: UUID
    comment_id: UUID
    reporter_id: UUID
    reason: str
    description: Optional[str]
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}
