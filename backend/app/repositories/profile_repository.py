from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import User


class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: UUID) -> User | None:
        return self.db.query(User).filter(User.id == user_id).first()

    def get_by_ids(self, user_ids: list[UUID]) -> dict[UUID, User]:
        if not user_ids:
            return {}
        users = self.db.query(User).filter(User.id.in_(user_ids)).all()
        return {u.id: u for u in users}

    def get_by_username(self, username: str) -> User | None:
        return self.db.query(User).filter(User.username == username).first()

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def update(self, user: User, **kwargs) -> User:
        for key, value in kwargs.items():
            setattr(user, key, value)
        self.db.commit()
        self.db.refresh(user)
        return user

    def check_username_available(self, username: str, exclude_user_id: UUID = None) -> bool:
        query = self.db.query(User).filter(User.username == username)
        if exclude_user_id:
            query = query.filter(User.id != exclude_user_id)
        return query.first() is None

    def search_users(self, query: str, limit: int = 20) -> list[User]:
        search = f"%{query}%"
        return (
            self.db.query(User)
            .filter(
                and_(
                    User.is_active == True,
                    User.is_deactivated == False,
                    (
                        User.full_name.ilike(search)
                        | User.username.ilike(search)
                        | User.email.ilike(search)
                    ),
                )
            )
            .limit(limit)
            .all()
        )

    def get_public_profiles(self, limit: int = 20, offset: int = 0) -> list[User]:
        return (
            self.db.query(User)
            .filter(and_(User.is_active == True, User.is_deactivated == False))
            .offset(offset)
            .limit(limit)
            .all()
        )
