from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from uuid import UUID
from datetime import datetime

USERNAME_PATTERN = r"^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$"


class ProfileResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    cover_photo_url: Optional[str]
    bio: Optional[str]
    website: Optional[str]
    gender: Optional[str]
    birthday: Optional[str]
    relationship_status: Optional[str]
    education: Optional[str]
    work: Optional[str]
    location: Optional[str]
    languages: Optional[str]
    interests: Optional[str]
    profile_theme: str
    is_verified: bool
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    username: Optional[str] = Field(None, min_length=3, max_length=30, pattern=USERNAME_PATTERN)
    bio: Optional[str] = Field(None, max_length=500)
    website: Optional[str] = Field(None, max_length=255)
    gender: Optional[str] = Field(None, max_length=20)
    birthday: Optional[str] = Field(None, max_length=10)
    relationship_status: Optional[str] = Field(None, max_length=30)
    education: Optional[str] = Field(None, max_length=500)
    work: Optional[str] = Field(None, max_length=500)
    location: Optional[str] = Field(None, max_length=255)
    languages: Optional[str] = Field(None, max_length=500)
    interests: Optional[str] = Field(None, max_length=500)
    profile_theme: Optional[str] = Field(None, max_length=50)


class AvatarUpdate(BaseModel):
    avatar_url: str = Field(..., max_length=500)


class CoverPhotoUpdate(BaseModel):
    cover_photo_url: str = Field(..., max_length=500)


class UsernameCheck(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=USERNAME_PATTERN)


class UsernameUpdate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=USERNAME_PATTERN)


class UsernameResponse(BaseModel):
    available: bool
    username: str
