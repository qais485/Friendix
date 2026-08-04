import json
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.models import User
from app.repositories.admin_repository import AdminRepository
from app.schemas.admin import (
    AdminUserResponse,
    AdminUserListResponse,
    BannedUserResponse,
    ReportResponse,
    ReportListResponse,
    FeatureFlagResponse,
    AuditLogResponse,
    AuditLogListResponse,
    SystemSettingResponse,
    VerificationRequestResponse,
    VerificationRequestListResponse,
    AdminAnalyticsResponse,
)


class AdminService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = AdminRepository(db)

    def _require_admin(self, user_id: UUID) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user or user.role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return user

    def _to_user_response(self, user: User) -> AdminUserResponse:
        return AdminUserResponse(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            username=user.username,
            avatar_url=user.avatar_url,
            role=user.role or "user",
            is_verified=user.is_verified or False,
            is_active=user.is_active if user.is_active is not None else True,
            is_deactivated=user.is_deactivated or False,
            created_at=user.created_at,
        )

    def _to_report_response(self, report) -> ReportResponse:
        reporter = self.db.query(User).filter(User.id == report.reporter_id).first()
        reported_user = self.db.query(User).filter(User.id == report.reported_user_id).first() if report.reported_user_id else None
        return ReportResponse(
            id=report.id,
            reporter_id=report.reporter_id,
            reported_user_id=report.reported_user_id,
            entity_type=report.entity_type,
            entity_id=report.entity_id,
            reason=report.reason,
            description=report.description,
            status=report.status,
            resolved_by_id=report.resolved_by_id,
            resolved_at=report.resolved_at,
            resolution_notes=report.resolution_notes,
            created_at=report.created_at,
            reporter_name=reporter.full_name if reporter else None,
            reported_user_name=reported_user.full_name if reported_user else None,
        )

    def _to_verification_response(self, req) -> VerificationRequestResponse:
        user = self.db.query(User).filter(User.id == req.user_id).first()
        return VerificationRequestResponse(
            id=req.id,
            user_id=req.user_id,
            reason=req.reason,
            document_url=req.document_url,
            status=req.status,
            reviewed_by_id=req.reviewed_by_id,
            reviewed_at=req.reviewed_at,
            review_notes=req.review_notes,
            created_at=req.created_at,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            avatar_url=user.avatar_url if user else None,
        )

    def get_users(self, admin_id: UUID, search: str | None = None, role: str | None = None, cursor: str | None = None, limit: int = 20) -> AdminUserListResponse:
        self._require_admin(admin_id)
        cursor_uuid = UUID(cursor) if cursor else None
        users, total = self.repo.get_users(search, role, cursor_uuid, limit)
        has_more = len(users) > limit
        if has_more:
            users = users[:limit]
        return AdminUserListResponse(
            users=[self._to_user_response(u) for u in users],
            total=total,
            has_more=has_more,
        )

    def update_user_role(self, admin_id: UUID, user_id: UUID, role: str) -> AdminUserResponse:
        self._require_admin(admin_id)
        user = self.repo.update_user_role(user_id, role)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        self.repo.create_audit_log(admin_id, "update_role", "user", user_id, user_id, json.dumps({"role": role}))
        return self._to_user_response(user)

    def deactivate_user(self, admin_id: UUID, user_id: UUID, is_active: bool) -> AdminUserResponse:
        self._require_admin(admin_id)
        user = self.repo.deactivate_user(user_id, is_active)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        self.repo.create_audit_log(admin_id, "deactivate_user" if not is_active else "activate_user", "user", user_id, user_id)
        return self._to_user_response(user)

    def ban_user(self, admin_id: UUID, user_id: UUID, reason: str, expires_at=None, is_permanent: bool = False) -> BannedUserResponse:
        self._require_admin(admin_id)
        ban = self.repo.ban_user(user_id, admin_id, reason, expires_at, is_permanent)
        self.repo.create_audit_log(admin_id, "ban_user", "user", user_id, user_id, json.dumps({"reason": reason, "is_permanent": is_permanent}))
        user = self.db.query(User).filter(User.id == user_id).first()
        return BannedUserResponse(
            id=ban.id,
            user_id=ban.user_id,
            banned_by_id=ban.banned_by_id,
            reason=ban.reason,
            expires_at=ban.expires_at,
            is_permanent=ban.is_permanent,
            created_at=ban.created_at,
            username=user.username if user else None,
            email=user.email if user else None,
            full_name=user.full_name if user else None,
        )

    def unban_user(self, admin_id: UUID, ban_id: UUID) -> bool:
        self._require_admin(admin_id)
        success = self.repo.unban_user(ban_id)
        if success:
            self.repo.create_audit_log(admin_id, "unban_user", "ban", ban_id)
        return success

    def get_banned_users(self, admin_id: UUID, cursor: str | None = None, limit: int = 20) -> list[BannedUserResponse]:
        self._require_admin(admin_id)
        cursor_uuid = UUID(cursor) if cursor else None
        bans, total = self.repo.get_banned_users(cursor_uuid, limit)
        return [BannedUserResponse(
            id=b.id, user_id=b.user_id, banned_by_id=b.banned_by_id,
            reason=b.reason, expires_at=b.expires_at, is_permanent=b.is_permanent,
            created_at=b.created_at,
        ) for b in bans[:limit]]

    def get_reports(self, admin_id: UUID, status: str | None = None, cursor: str | None = None, limit: int = 20) -> ReportListResponse:
        self._require_admin(admin_id)
        cursor_uuid = UUID(cursor) if cursor else None
        reports, total = self.repo.get_reports(status, cursor_uuid, limit)
        has_more = len(reports) > limit
        return ReportListResponse(
            reports=[self._to_report_response(r) for r in reports[:limit]],
            total=total,
            has_more=has_more,
        )

    def resolve_report(self, admin_id: UUID, report_id: UUID, status: str, resolution_notes: str | None = None) -> ReportResponse:
        self._require_admin(admin_id)
        report = self.repo.resolve_report(report_id, admin_id, status, resolution_notes)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        self.repo.create_audit_log(admin_id, "resolve_report", "report", report_id, report.reported_user_id, json.dumps({"status": status}))
        return self._to_report_response(report)

    def create_feature_flag(self, admin_id: UUID, key: str, name: str, description: str | None = None, is_enabled: bool = False, rollout_percentage: int = 100) -> FeatureFlagResponse:
        self._require_admin(admin_id)
        flag = self.repo.create_feature_flag(key, name, description, is_enabled, rollout_percentage)
        self.repo.create_audit_log(admin_id, "create_feature_flag", "feature_flag", flag.id)
        return FeatureFlagResponse.model_validate(flag)

    def get_feature_flags(self, admin_id: UUID) -> list[FeatureFlagResponse]:
        self._require_admin(admin_id)
        flags = self.repo.get_feature_flags()
        return [FeatureFlagResponse.model_validate(f) for f in flags]

    def update_feature_flag(self, admin_id: UUID, flag_id: UUID, **kwargs) -> FeatureFlagResponse:
        self._require_admin(admin_id)
        flag = self.repo.update_feature_flag(flag_id, **kwargs)
        if not flag:
            raise HTTPException(status_code=404, detail="Feature flag not found")
        self.repo.create_audit_log(admin_id, "update_feature_flag", "feature_flag", flag_id)
        return FeatureFlagResponse.model_validate(flag)

    def delete_feature_flag(self, admin_id: UUID, flag_id: UUID) -> bool:
        self._require_admin(admin_id)
        success = self.repo.delete_feature_flag(flag_id)
        if success:
            self.repo.create_audit_log(admin_id, "delete_feature_flag", "feature_flag", flag_id)
        return success

    def get_audit_logs(self, admin_id: UUID, action: str | None = None, cursor: str | None = None, limit: int = 20) -> AuditLogListResponse:
        self._require_admin(admin_id)
        cursor_uuid = UUID(cursor) if cursor else None
        logs, total = self.repo.get_audit_logs(action=action, cursor=cursor_uuid, limit=limit)
        has_more = len(logs) > limit
        enriched = []
        for log in logs[:limit]:
            admin_user = self.db.query(User).filter(User.id == log.admin_id).first()
            target_user = self.db.query(User).filter(User.id == log.target_user_id).first() if log.target_user_id else None
            enriched.append(AuditLogResponse(
                id=log.id, admin_id=log.admin_id, action=log.action,
                entity_type=log.entity_type, entity_id=log.entity_id,
                target_user_id=log.target_user_id, details_json=log.details_json,
                ip_address=log.ip_address, created_at=log.created_at,
                admin_name=admin_user.full_name if admin_user else None,
                target_user_name=target_user.full_name if target_user else None,
            ))
        return AuditLogListResponse(logs=enriched, total=total, has_more=has_more)

    def get_system_settings(self, admin_id: UUID, category: str | None = None) -> list[SystemSettingResponse]:
        self._require_admin(admin_id)
        settings = self.repo.get_system_settings(category)
        return [SystemSettingResponse.model_validate(s) for s in settings]

    def create_system_setting(self, admin_id: UUID, key: str, value: str, description: str | None = None, category: str = "general") -> SystemSettingResponse:
        self._require_admin(admin_id)
        existing = self.repo.get_system_setting(key)
        if existing:
            raise HTTPException(status_code=400, detail="Setting already exists")
        setting = self.repo.create_system_setting(key, value, description, category)
        self.repo.create_audit_log(admin_id, "create_system_setting", "system_setting", setting.id)
        return SystemSettingResponse.model_validate(setting)

    def update_system_setting(self, admin_id: UUID, key: str, value: str | None = None, description: str | None = None, category: str | None = None) -> SystemSettingResponse:
        self._require_admin(admin_id)
        setting = self.repo.update_system_setting(key, value, description, category)
        if not setting:
            raise HTTPException(status_code=404, detail="Setting not found")
        self.repo.create_audit_log(admin_id, "update_system_setting", "system_setting", setting.id)
        return SystemSettingResponse.model_validate(setting)

    def delete_system_setting(self, admin_id: UUID, key: str) -> bool:
        self._require_admin(admin_id)
        success = self.repo.delete_system_setting(key)
        if success:
            self.repo.create_audit_log(admin_id, "delete_system_setting", "system_setting", None)
        return success

    def get_verification_requests(self, admin_id: UUID, status: str | None = None, cursor: str | None = None, limit: int = 20) -> VerificationRequestListResponse:
        self._require_admin(admin_id)
        cursor_uuid = UUID(cursor) if cursor else None
        requests, total = self.repo.get_verification_requests(status, cursor_uuid, limit)
        has_more = len(requests) > limit
        return VerificationRequestListResponse(
            requests=[self._to_verification_response(r) for r in requests[:limit]],
            total=total,
            has_more=has_more,
        )

    def review_verification_request(self, admin_id: UUID, request_id: UUID, status: str, review_notes: str | None = None) -> VerificationRequestResponse:
        self._require_admin(admin_id)
        req = self.repo.review_verification_request(request_id, admin_id, status, review_notes)
        if not req:
            raise HTTPException(status_code=404, detail="Verification request not found")
        self.repo.create_audit_log(admin_id, f"review_verification_{status}", "verification_request", request_id, req.user_id)
        return self._to_verification_response(req)

    def get_analytics(self, admin_id: UUID) -> AdminAnalyticsResponse:
        self._require_admin(admin_id)
        data = self.repo.get_analytics()
        return AdminAnalyticsResponse(**data)
