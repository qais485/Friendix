from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class PrivacySettingResponse(BaseModel):
    id: UUID
    user_id: UUID
    profile_visibility: str
    hide_online_status: bool
    story_privacy: str
    post_privacy: str
    comment_privacy: str
    tag_review: bool
    timeline_review: bool
    search_engine_visibility: bool
    mention_permissions: str
    follow_permissions: str
    hide_friends_list: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PrivacySettingUpdate(BaseModel):
    profile_visibility: Optional[str] = Field(None, pattern=r"^(public|friends|private)$")
    hide_online_status: Optional[bool] = None
    story_privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me|custom)$")
    post_privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me|custom)$")
    comment_privacy: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me|custom)$")
    tag_review: Optional[bool] = None
    timeline_review: Optional[bool] = None
    search_engine_visibility: Optional[bool] = None
    mention_permissions: Optional[str] = Field(None, pattern=r"^(everyone|friends|only_me|none)$")
    follow_permissions: Optional[str] = Field(None, pattern=r"^(everyone|friends|none)$")
    hide_friends_list: Optional[bool] = None


class BlockUserRequest(BaseModel):
    blocked_user_id: str


class BlockUserResponse(BaseModel):
    id: UUID
    user_id: UUID
    blocked_user_id: UUID
    block_type: str
    created_at: datetime

    model_config = {"from_attributes": True}


class BlockedUserDetail(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]

    model_config = {"from_attributes": True}
