import json
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func, or_
from app.models.models import (
    User, Post, Comment, Message, AuditLog, Report, FeatureFlag,
    BannedUser, SystemSetting, VerificationRequest, Friendship,
)


class AdminRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_users(self, search: str | None = None, role: str | None = None, cursor: UUID | None = None, limit: int = 20) -> tuple[list[User], int]:
        query = self.db.query(User)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(or_(
                User.full_name.ilike(search_pattern),
                User.username.ilike(search_pattern),
                User.email.ilike(search_pattern),
            ))
        if role:
            query = query.filter(User.role == role)
        total = query.count()
        if cursor:
            query = query.filter(User.id < cursor)
        users = query.order_by(desc(User.created_at)).limit(limit + 1).all()
        return users, total

    def get_user(self, user_id: UUID) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def update_user_role(self, user_id: UUID, role: str) -> User | None:
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.role = role
            self.db.commit()
            self.db.refresh(user)
        return user

    def deactivate_user(self, user_id: UUID, is_active: bool) -> User | None:
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_active = is_active
            self.db.commit()
            self.db.refresh(user)
        return user

    def ban_user(self, user_id: UUID, banned_by_id: UUID, reason: str, expires_at: datetime | None = None, is_permanent: bool = False) -> BannedUser:
        ban = BannedUser(
            user_id=user_id,
            banned_by_id=banned_by_id,
            reason=reason,
            expires_at=expires_at,
            is_permanent=is_permanent,
        )
        self.db.add(ban)
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.is_active = False
        self.db.commit()
        self.db.refresh(ban)
        return ban

    def unban_user(self, ban_id: UUID) -> bool:
        ban = self.db.query(BannedUser).filter(BannedUser.id == ban_id).first()
        if ban:
            user = self.db.query(User).filter(User.id == ban.user_id).first()
            if user:
                user.is_active = True
            self.db.delete(ban)
            self.db.commit()
            return True
        return False

    def get_banned_users(self, cursor: UUID | None = None, limit: int = 20) -> tuple[list[BannedUser], int]:
        query = self.db.query(BannedUser)
        total = query.count()
        if cursor:
            query = query.filter(BannedUser.id < cursor)
        bans = query.order_by(desc(BannedUser.created_at)).limit(limit + 1).all()
        return bans, total

    def create_report(self, reporter_id: UUID, reported_user_id: UUID | None, entity_type: str, entity_id: UUID, reason: str, description: str | None = None) -> Report:
        report = Report(
            reporter_id=reporter_id,
            reported_user_id=reported_user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            reason=reason,
            description=description,
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_reports(self, status: str | None = None, cursor: UUID | None = None, limit: int = 20) -> tuple[list[Report], int]:
        query = self.db.query(Report)
        if status:
            query = query.filter(Report.status == status)
        total = query.count()
        if cursor:
            query = query.filter(Report.id < cursor)
        reports = query.order_by(desc(Report.created_at)).limit(limit + 1).all()
        return reports, total

    def resolve_report(self, report_id: UUID, resolved_by_id: UUID, status: str, resolution_notes: str | None = None) -> Report | None:
        report = self.db.query(Report).filter(Report.id == report_id).first()
        if report:
            report.status = status
            report.resolved_by_id = resolved_by_id
            report.resolved_at = datetime.now(timezone.utc)
            report.resolution_notes = resolution_notes
            self.db.commit()
            self.db.refresh(report)
        return report

    def create_feature_flag(self, key: str, name: str, description: str | None = None, is_enabled: bool = False, rollout_percentage: int = 100) -> FeatureFlag:
        flag = FeatureFlag(
            key=key,
            name=name,
            description=description,
            is_enabled=is_enabled,
            rollout_percentage=rollout_percentage,
        )
        self.db.add(flag)
        self.db.commit()
        self.db.refresh(flag)
        return flag

    def get_feature_flags(self) -> list[FeatureFlag]:
        return self.db.query(FeatureFlag).order_by(desc(FeatureFlag.created_at)).all()

    def get_feature_flag(self, flag_id: UUID) -> FeatureFlag | None:
        return self.db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()

    def update_feature_flag(self, flag_id: UUID, **kwargs) -> FeatureFlag | None:
        flag = self.db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
        if flag:
            for key, value in kwargs.items():
                if value is not None:
                    setattr(flag, key, value)
            self.db.commit()
            self.db.refresh(flag)
        return flag

    def delete_feature_flag(self, flag_id: UUID) -> bool:
        flag = self.db.query(FeatureFlag).filter(FeatureFlag.id == flag_id).first()
        if flag:
            self.db.delete(flag)
            self.db.commit()
            return True
        return False

    def create_audit_log(self, admin_id: UUID, action: str, entity_type: str, entity_id: UUID | None = None, target_user_id: UUID | None = None, details_json: str | None = None, ip_address: str | None = None) -> AuditLog:
        log = AuditLog(
            admin_id=admin_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            target_user_id=target_user_id,
            details_json=details_json,
            ip_address=ip_address,
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_audit_logs(self, admin_id: UUID | None = None, action: str | None = None, cursor: UUID | None = None, limit: int = 20) -> tuple[list[AuditLog], int]:
        query = self.db.query(AuditLog)
        if admin_id:
            query = query.filter(AuditLog.admin_id == admin_id)
        if action:
            query = query.filter(AuditLog.action == action)
        total = query.count()
        if cursor:
            query = query.filter(AuditLog.id < cursor)
        logs = query.order_by(desc(AuditLog.created_at)).limit(limit + 1).all()
        return logs, total

    def get_system_settings(self, category: str | None = None) -> list[SystemSetting]:
        query = self.db.query(SystemSetting)
        if category:
            query = query.filter(SystemSetting.category == category)
        return query.order_by(SystemSetting.key).all()

    def get_system_setting(self, key: str) -> SystemSetting | None:
        return self.db.query(SystemSetting).filter(SystemSetting.key == key).first()

    def create_system_setting(self, key: str, value: str, description: str | None = None, category: str = "general") -> SystemSetting:
        setting = SystemSetting(
            key=key,
            value=value,
            description=description,
            category=category,
        )
        self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def update_system_setting(self, key: str, value: str | None = None, description: str | None = None, category: str | None = None) -> SystemSetting | None:
        setting = self.db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            if value is not None:
                setting.value = value
            if description is not None:
                setting.description = description
            if category is not None:
                setting.category = category
            self.db.commit()
            self.db.refresh(setting)
        return setting

    def delete_system_setting(self, key: str) -> bool:
        setting = self.db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting:
            self.db.delete(setting)
            self.db.commit()
            return True
        return False

    def get_verification_requests(self, status: str | None = None, cursor: UUID | None = None, limit: int = 20) -> tuple[list[VerificationRequest], int]:
        query = self.db.query(VerificationRequest)
        if status:
            query = query.filter(VerificationRequest.status == status)
        total = query.count()
        if cursor:
            query = query.filter(VerificationRequest.id < cursor)
        requests = query.order_by(desc(VerificationRequest.created_at)).limit(limit + 1).all()
        return requests, total

    def review_verification_request(self, request_id: UUID, reviewed_by_id: UUID, status: str, review_notes: str | None = None) -> VerificationRequest | None:
        req = self.db.query(VerificationRequest).filter(VerificationRequest.id == request_id).first()
        if req:
            req.status = status
            req.reviewed_by_id = reviewed_by_id
            req.reviewed_at = datetime.now(timezone.utc)
            req.review_notes = review_notes
            if status == "approved":
                user = self.db.query(User).filter(User.id == req.user_id).first()
                if user:
                    user.is_verified = True
            self.db.commit()
            self.db.refresh(req)
        return req

    def get_analytics(self) -> dict:
        now = datetime.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - __import__('datetime').timedelta(days=7)

        total_users = self.db.query(func.count(User.id)).scalar()
        active_users = self.db.query(func.count(User.id)).filter(User.is_active == True).scalar()
        total_posts = self.db.query(func.count(Post.id)).scalar()
        total_comments = self.db.query(func.count(Comment.id)).scalar()
        total_messages = self.db.query(func.count(Message.id)).scalar()
        pending_reports = self.db.query(func.count(Report.id)).filter(Report.status == "pending").scalar()
        pending_verifications = self.db.query(func.count(VerificationRequest.id)).filter(VerificationRequest.status == "pending").scalar()
        banned_users = self.db.query(func.count(BannedUser.id)).scalar()
        new_users_today = self.db.query(func.count(User.id)).filter(User.created_at >= today_start).scalar()
        new_users_this_week = self.db.query(func.count(User.id)).filter(User.created_at >= week_start).scalar()
        new_posts_today = self.db.query(func.count(Post.id)).filter(Post.created_at >= today_start).scalar()

        return {
            "total_users": total_users,
            "active_users": active_users,
            "total_posts": total_posts,
            "total_comments": total_comments,
            "total_messages": total_messages,
            "pending_reports": pending_reports,
            "pending_verifications": pending_verifications,
            "banned_users": banned_users,
            "new_users_today": new_users_today,
            "new_users_this_week": new_users_this_week,
            "new_posts_today": new_posts_today,
        }
