from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class GoogleOAuthRequest(BaseModel):
    credential: str


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: Optional[str]
    avatar_url: Optional[str]
    username: Optional[str]
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class DeviceResponse(BaseModel):
    id: UUID
    device_name: str
    device_type: str
    browser: Optional[str]
    os: Optional[str]
    ip_address: Optional[str]
    last_active: Optional[datetime]
    is_active: bool

    model_config = {"from_attributes": True}


class LoginHistoryResponse(BaseModel):
    id: UUID
    ip_address: Optional[str]
    device_info: Optional[str]
    location: Optional[str]
    is_successful: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AccountDelete(BaseModel):
    confirmation: str = Field(..., pattern=r"^DELETE$")
