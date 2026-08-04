from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import User, Session as UserSession, Device, LoginHistory


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_google_id(self, google_id: str) -> User | None:
        return self.db.query(User).filter(User.google_id == google_id).first()

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def create(self, **kwargs) -> User:
        user = User(**kwargs)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def delete(self, user: User) -> None:
        self.db.delete(user)
        self.db.commit()

    def deactivate(self, user: User) -> User:
        user.is_deactivated = True
        user.is_active = False
        user.deactivated_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(user)
        return user


class SessionRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> UserSession:
        session = UserSession(**kwargs)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_by_token(self, refresh_token: str) -> UserSession | None:
        return (
            self.db.query(UserSession)
            .filter(
                and_(
                    UserSession.refresh_token == refresh_token,
                    UserSession.is_active == True,
                )
            )
            .first()
        )

    def deactivate_all_for_user(self, user_id: UUID) -> None:
        self.db.query(UserSession).filter(
            and_(UserSession.user_id == user_id, UserSession.is_active == True)
        ).update({"is_active": False})
        self.db.commit()

    def deactivate(self, session: UserSession) -> None:
        session.is_active = False
        self.db.commit()


class DeviceRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> Device:
        device = Device(**kwargs)
        self.db.add(device)
        self.db.commit()
        self.db.refresh(device)
        return device

    def get_all_for_user(self, user_id: UUID) -> list[Device]:
        return (
            self.db.query(Device)
            .filter(and_(Device.user_id == user_id, Device.is_active == True))
            .all()
        )

    def update_last_active(self, device_id: UUID) -> None:
        device = self.db.query(Device).filter(Device.id == device_id).first()
        if device:
            device.last_active = datetime.now(timezone.utc)
            self.db.commit()

    def deactivate(self, device_id: UUID) -> None:
        device = self.db.query(Device).filter(Device.id == device_id).first()
        if device:
            device.is_active = False
            self.db.commit()

    def find_by_user_and_name(self, user_id: UUID, device_name: str) -> Device | None:
        return (
            self.db.query(Device)
            .filter(and_(Device.user_id == user_id, Device.device_name == device_name, Device.is_active == True))
            .first()
        )

    def update_or_create(self, user_id: UUID, device_name: str, device_type: str, browser: str = None, os: str = None, ip_address: str = None) -> Device:
        existing = self.find_by_user_and_name(user_id, device_name)
        if existing:
            existing.last_active = datetime.now(timezone.utc)
            existing.ip_address = ip_address
            if browser:
                existing.browser = browser
            if os:
                existing.os = os
            self.db.commit()
            self.db.refresh(existing)
            return existing
        return self.create(
            user_id=user_id,
            device_name=device_name,
            device_type=device_type,
            browser=browser,
            os=os,
            ip_address=ip_address,
            last_active=datetime.now(timezone.utc),
        )


class LoginHistoryRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, **kwargs) -> LoginHistory:
        record = LoginHistory(**kwargs)
        self.db.add(record)
        self.db.commit()
        self.db.refresh(record)
        return record

    def get_all_for_user(self, user_id: UUID, limit: int = 50) -> list[LoginHistory]:
        return (
            self.db.query(LoginHistory)
            .filter(LoginHistory.user_id == user_id)
            .order_by(LoginHistory.created_at.desc())
            .limit(limit)
            .all()
        )
