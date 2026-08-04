from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class AdminUserResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    username: Optional[str]
    avatar_url: Optional[str]
    role: str
    is_verified: bool
    is_active: bool
    is_deactivated: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminUserListResponse(BaseModel):
    users: list[AdminUserResponse]
    total: int
    has_more: bool


class UserRoleUpdate(BaseModel):
    role: str = Field(..., pattern=r"^(user|moderator|admin)$")


class UserDeactivateRequest(BaseModel):
    is_active: bool


class BanUserRequest(BaseModel):
    reason: str = Field(..., min_length=1, max_length=1000)
    expires_at: Optional[datetime] = None
    is_permanent: bool = False


class BannedUserResponse(BaseModel):
    id: UUID
    user_id: UUID
    banned_by_id: Optional[UUID]
    reason: str
    expires_at: Optional[datetime]
    is_permanent: bool
    created_at: datetime
    username: Optional[str] = None
    email: Optional[str] = None
    full_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ReportResponse(BaseModel):
    id: UUID
    reporter_id: UUID
    reported_user_id: Optional[UUID]
    entity_type: str
    entity_id: UUID
    reason: str
    description: Optional[str]
    status: str
    resolved_by_id: Optional[UUID]
    resolved_at: Optional[datetime]
    resolution_notes: Optional[str]
    created_at: datetime
    reporter_name: Optional[str] = None
    reported_user_name: Optional[str] = None

    model_config = {"from_attributes": True}


class ReportListResponse(BaseModel):
    reports: list[ReportResponse]
    total: int
    has_more: bool


class ReportResolveRequest(BaseModel):
    status: str = Field(..., pattern=r"^(resolved|dismissed)$")
    resolution_notes: Optional[str] = None


class FeatureFlagCreate(BaseModel):
    key: str = Field(..., min_length=1, max_length=100)
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    is_enabled: bool = False
    rollout_percentage: int = Field(default=100, ge=0, le=100)


class FeatureFlagUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    rollout_percentage: Optional[int] = Field(default=None, ge=0, le=100)


class FeatureFlagResponse(BaseModel):
    id: UUID
    key: str
    name: str
    description: Optional[str]
    is_enabled: bool
    rollout_percentage: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class AuditLogResponse(BaseModel):
    id: UUID
    admin_id: UUID
    action: str
    entity_type: str
    entity_id: Optional[UUID]
    target_user_id: Optional[UUID]
    details_json: Optional[str]
    ip_address: Optional[str]
    created_at: datetime
    admin_name: Optional[str] = None
    target_user_name: Optional[str] = None

    model_config = {"from_attributes": True}


class AuditLogListResponse(BaseModel):
    logs: list[AuditLogResponse]
    total: int
    has_more: bool


class SystemSettingCreate(BaseModel):
    key: str = Field(..., min_length=1, max_length=100)
    value: str = Field(..., min_length=1)
    description: Optional[str] = None
    category: str = "general"


class SystemSettingUpdate(BaseModel):
    value: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


class SystemSettingResponse(BaseModel):
    id: UUID
    key: str
    value: str
    description: Optional[str]
    category: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class VerificationRequestResponse(BaseModel):
    id: UUID
    user_id: UUID
    reason: str
    document_url: Optional[str]
    status: str
    reviewed_by_id: Optional[UUID]
    reviewed_at: Optional[datetime]
    review_notes: Optional[str]
    created_at: datetime
    username: Optional[str] = None
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None

    model_config = {"from_attributes": True}


class VerificationRequestListResponse(BaseModel):
    requests: list[VerificationRequestResponse]
    total: int
    has_more: bool


class VerificationReviewRequest(BaseModel):
    status: str = Field(..., pattern=r"^(approved|rejected)$")
    review_notes: Optional[str] = None


class AdminAnalyticsResponse(BaseModel):
    total_users: int
    active_users: int
    total_posts: int
    total_comments: int
    total_messages: int
    pending_reports: int
    pending_verifications: int
    banned_users: int
    new_users_today: int
    new_users_this_week: int
    new_posts_today: int
