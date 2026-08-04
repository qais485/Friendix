from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import PrivacySetting, BlockedUser, User


class PrivacyRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id: UUID) -> PrivacySetting | None:
        return self.db.query(PrivacySetting).filter(PrivacySetting.user_id == user_id).first()

    def get_or_create(self, user_id: UUID) -> PrivacySetting:
        setting = self.get_by_user_id(user_id)
        if not setting:
            setting = PrivacySetting(user_id=user_id)
            self.db.add(setting)
            self.db.commit()
            self.db.refresh(setting)
        return setting

    def update(self, setting: PrivacySetting, **kwargs) -> PrivacySetting:
        for key, value in kwargs.items():
            setattr(setting, key, value)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def block_user(self, user_id: UUID, blocked_user_id: UUID, block_type: str = "block") -> BlockedUser | None:
        existing = (
            self.db.query(BlockedUser)
            .filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.blocked_user_id == blocked_user_id,
                )
            )
            .first()
        )
        if existing:
            return existing

        block = BlockedUser(
            user_id=user_id,
            blocked_user_id=blocked_user_id,
            block_type=block_type,
        )
        self.db.add(block)
        self.db.commit()
        self.db.refresh(block)
        return block

    def unblock_user(self, user_id: UUID, blocked_user_id: UUID) -> bool:
        block = (
            self.db.query(BlockedUser)
            .filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.blocked_user_id == blocked_user_id,
                )
            )
            .first()
        )
        if block:
            self.db.delete(block)
            self.db.commit()
            return True
        return False

    def get_blocked_users(self, user_id: UUID) -> list[BlockedUser]:
        return (
            self.db.query(BlockedUser)
            .filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.block_type == "block",
                )
            )
            .all()
        )

    def get_muted_users(self, user_id: UUID) -> list[BlockedUser]:
        return (
            self.db.query(BlockedUser)
            .filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.block_type == "mute",
                )
            )
            .all()
        )

    def get_restricted_users(self, user_id: UUID) -> list[BlockedUser]:
        return (
            self.db.query(BlockedUser)
            .filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.block_type == "restrict",
                )
            )
            .all()
        )

    def is_blocked(self, user_id: UUID, target_user_id: UUID) -> bool:
        return (
            self.db.query(BlockedUser)
            .filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.blocked_user_id == target_user_id,
                    BlockedUser.block_type == "block",
                )
            )
            .first()
            is not None
        )

    def is_muted(self, user_id: UUID, target_user_id: UUID) -> bool:
        return (
            self.db.query(BlockedUser)
            .filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.blocked_user_id == target_user_id,
                    BlockedUser.block_type == "mute",
                )
            )
            .first()
            is not None
        )

    def is_restricted(self, user_id: UUID, target_user_id: UUID) -> bool:
        return (
            self.db.query(BlockedUser)
            .filter(
                and_(
                    BlockedUser.user_id == user_id,
                    BlockedUser.blocked_user_id == target_user_id,
                    BlockedUser.block_type == "restrict",
                )
            )
            .first()
            is not None
        )
