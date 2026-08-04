from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class HashtagResponse(BaseModel):
    id: UUID
    name: str
    posts_count: int
    followers_count: int
    description: Optional[str] = None
    created_at: datetime
    is_following: bool = False

    model_config = {"from_attributes": True}


class HashtagCreate(BaseModel):
    name: str
    description: Optional[str] = None


class HashtagListResponse(BaseModel):
    hashtags: list[HashtagResponse]


class HashtagDetailResponse(BaseModel):
    id: UUID
    name: str
    posts_count: int
    followers_count: int
    description: Optional[str] = None
    is_following: bool
    created_at: datetime


class TrendingHashtagResponse(BaseModel):
    id: UUID
    name: str
    posts_count: int
    followers_count: int
    description: Optional[str] = None
    is_following: bool = False

    model_config = {"from_attributes": True}


class TrendingHashtagsListResponse(BaseModel):
    hashtags: list[TrendingHashtagResponse]


class HashtagPostResponse(BaseModel):
    id: UUID
    content: Optional[str] = None
    user_id: UUID
    username: Optional[str] = None
    user_avatar: Optional[str] = None
    post_type: str
    image_urls: Optional[str] = None
    likes_count: int
    comments_count: int
    created_at: datetime


class HashtagPostsResponse(BaseModel):
    posts: list[HashtagPostResponse]
    total_count: int
