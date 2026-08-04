from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class FriendRequestCreate(BaseModel):
    addressee_id: str


class FriendshipResponse(BaseModel):
    id: UUID
    requester_id: UUID
    addressee_id: UUID
    status: str
    is_favorite: bool
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class FriendDetail(BaseModel):
    id: str
    friendship_id: Optional[str] = None
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    is_verified: bool
    mutual_friends_count: int = 0
    is_close_friend: bool = False
    model_config = {"from_attributes": True}


class FollowResponse(BaseModel):
    id: UUID
    follower_id: UUID
    following_id: UUID
    created_at: datetime
    model_config = {"from_attributes": True}


class FollowUserDetail(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    is_verified: bool
    is_friend: bool = False
    mutual_friends_count: int = 0
    model_config = {"from_attributes": True}


class FriendshipStatusResponse(BaseModel):
    status: Optional[str]
    is_requester: bool
    is_favorite: bool
    is_close_friend: bool
    is_following: bool = False
    is_followed_by: bool = False


class FollowRequestResponse(BaseModel):
    id: UUID
    requester_id: UUID
    target_id: UUID
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


class FollowRequestDetail(BaseModel):
    id: str
    request_id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    is_verified: bool
    model_config = {"from_attributes": True}


class CloseFriendResponse(BaseModel):
    id: UUID
    user_id: UUID
    friend_id: UUID
    created_at: datetime
    model_config = {"from_attributes": True}


class CloseFriendDetail(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    is_verified: bool
    added_at: datetime
    model_config = {"from_attributes": True}


class FavoriteUpdate(BaseModel):
    is_favorite: bool


FavoriteCloseUpdate = FavoriteUpdate


class MuteUpdate(BaseModel):
    mute_posts: bool = True
    mute_stories: bool = True
    mute_notes: bool = True
    mute_notifications: bool = True


class MuteResponse(BaseModel):
    id: UUID
    user_id: UUID
    muted_user_id: UUID
    mute_posts: bool
    mute_stories: bool
    mute_notes: bool
    mute_notifications: bool
    created_at: datetime
    model_config = {"from_attributes": True}


class MuteDetail(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    mute_posts: bool
    mute_stories: bool
    mute_notes: bool
    mute_notifications: bool
    model_config = {"from_attributes": True}


class RestrictResponse(BaseModel):
    id: UUID
    user_id: UUID
    restricted_user_id: UUID
    created_at: datetime
    model_config = {"from_attributes": True}


class RestrictDetail(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    restricted_at: datetime
    model_config = {"from_attributes": True}


class BlockResponse(BaseModel):
    id: str
    blocked_user_id: str
    blocked_at: datetime


class BlockDetail(BaseModel):
    id: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    blocked_at: datetime
    model_config = {"from_attributes": True}


class UserCounts(BaseModel):
    friends: int
    followers: int
    following: int
    close_friends: int
    pending_friend_requests: int = 0
    pending_follow_requests: int = 0


class RelationshipSummary(BaseModel):
    are_friends: bool
    is_close_friend: bool
    is_following: bool
    is_followed_by: bool
    are_blocked: bool
    is_muted: bool
    is_restricted: bool
    mutual_friends_count: int = 0
