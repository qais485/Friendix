from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.admin import (
    AdminUserListResponse,
    AdminUserResponse,
    UserRoleUpdate,
    UserDeactivateRequest,
    BanUserRequest,
    BannedUserResponse,
    ReportListResponse,
    ReportResponse,
    ReportResolveRequest,
    FeatureFlagCreate,
    FeatureFlagUpdate,
    FeatureFlagResponse,
    AuditLogListResponse,
    SystemSettingCreate,
    SystemSettingUpdate,
    SystemSettingResponse,
    VerificationRequestListResponse,
    VerificationRequestResponse,
    VerificationReviewRequest,
    AdminAnalyticsResponse,
)
from app.services.admin_service import AdminService

router = APIRouter()


def get_admin_service(db: Session = Depends(get_db)) -> AdminService:
    return AdminService(db)


@router.get("/analytics", response_model=AdminAnalyticsResponse)
def get_analytics(
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_analytics(user_id)


@router.get("/users", response_model=AdminUserListResponse)
def get_users(
    search: str | None = None,
    role: str | None = None,
    cursor: str | None = None,
    limit: int = 20,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_users(user_id, search, role, cursor, limit)


@router.put("/users/{target_user_id}/role", response_model=AdminUserResponse)
def update_user_role(
    target_user_id: str,
    data: UserRoleUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.update_user_role(user_id, UUID(target_user_id), data.role)


@router.put("/users/{target_user_id}/active", response_model=AdminUserResponse)
def toggle_user_active(
    target_user_id: str,
    data: UserDeactivateRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.deactivate_user(user_id, UUID(target_user_id), data.is_active)


@router.post("/users/{target_user_id}/ban", response_model=BannedUserResponse)
def ban_user(
    target_user_id: str,
    data: BanUserRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.ban_user(user_id, UUID(target_user_id), data.reason, data.expires_at, data.is_permanent)


@router.get("/banned", response_model=list[BannedUserResponse])
def get_banned_users(
    cursor: str | None = None,
    limit: int = 20,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_banned_users(user_id, cursor, limit)


@router.delete("/banned/{ban_id}")
def unban_user(
    ban_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    success = service.unban_user(user_id, UUID(ban_id))
    if not success:
        raise HTTPException(status_code=404, detail="Ban not found")
    return {"status": "unbanned"}


@router.get("/reports", response_model=ReportListResponse)
def get_reports(
    status: str | None = None,
    cursor: str | None = None,
    limit: int = 20,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_reports(user_id, status, cursor, limit)


@router.put("/reports/{report_id}/resolve", response_model=ReportResponse)
def resolve_report(
    report_id: str,
    data: ReportResolveRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.resolve_report(user_id, UUID(report_id), data.status, data.resolution_notes)


@router.get("/feature-flags", response_model=list[FeatureFlagResponse])
def get_feature_flags(
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_feature_flags(user_id)


@router.post("/feature-flags", response_model=FeatureFlagResponse)
def create_feature_flag(
    data: FeatureFlagCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.create_feature_flag(user_id, data.key, data.name, data.description, data.is_enabled, data.rollout_percentage)


@router.put("/feature-flags/{flag_id}", response_model=FeatureFlagResponse)
def update_feature_flag(
    flag_id: str,
    data: FeatureFlagUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.update_feature_flag(user_id, UUID(flag_id), name=data.name, description=data.description, is_enabled=data.is_enabled, rollout_percentage=data.rollout_percentage)


@router.delete("/feature-flags/{flag_id}")
def delete_feature_flag(
    flag_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    success = service.delete_feature_flag(user_id, UUID(flag_id))
    if not success:
        raise HTTPException(status_code=404, detail="Feature flag not found")
    return {"status": "deleted"}


@router.get("/audit-logs", response_model=AuditLogListResponse)
def get_audit_logs(
    action: str | None = None,
    cursor: str | None = None,
    limit: int = 20,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_audit_logs(user_id, action, cursor, limit)


@router.get("/settings", response_model=list[SystemSettingResponse])
def get_system_settings(
    category: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_system_settings(user_id, category)


@router.post("/settings", response_model=SystemSettingResponse)
def create_system_setting(
    data: SystemSettingCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.create_system_setting(user_id, data.key, data.value, data.description, data.category)


@router.put("/settings/{key}", response_model=SystemSettingResponse)
def update_system_setting(
    key: str,
    data: SystemSettingUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.update_system_setting(user_id, key, data.value, data.description, data.category)


@router.delete("/settings/{key}")
def delete_system_setting(
    key: str,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    success = service.delete_system_setting(user_id, key)
    if not success:
        raise HTTPException(status_code=404, detail="Setting not found")
    return {"status": "deleted"}


@router.get("/verifications", response_model=VerificationRequestListResponse)
def get_verification_requests(
    status: str | None = None,
    cursor: str | None = None,
    limit: int = 20,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.get_verification_requests(user_id, status, cursor, limit)


@router.put("/verifications/{request_id}/review", response_model=VerificationRequestResponse)
def review_verification_request(
    request_id: str,
    data: VerificationReviewRequest,
    user_id: UUID = Depends(get_current_user_id),
    service: AdminService = Depends(get_admin_service),
):
    return service.review_verification_request(user_id, UUID(request_id), data.status, data.review_notes)
