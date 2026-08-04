from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from app.models import Hashtag, HashtagFollow, PostHashtag, Post, User


class HashtagRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create(self, name: str) -> Hashtag:
        normalized = name.lower().strip().lstrip("#")
        hashtag = self.db.query(Hashtag).filter(Hashtag.name == normalized).first()
        if not hashtag:
            hashtag = Hashtag(name=normalized)
            self.db.add(hashtag)
            self.db.commit()
            self.db.refresh(hashtag)
        return hashtag

    def get_by_name(self, name: str) -> Hashtag | None:
        normalized = name.lower().strip().lstrip("#")
        return self.db.query(Hashtag).filter(Hashtag.name == normalized).first()

    def get_by_id(self, hashtag_id: UUID) -> Hashtag | None:
        return self.db.query(Hashtag).filter(Hashtag.id == hashtag_id).first()

    def search(self, query: str, limit: int = 20) -> list[Hashtag]:
        search = f"%{query.lower().strip().lstrip('#')}%"
        return (
            self.db.query(Hashtag)
            .filter(Hashtag.name.ilike(search))
            .order_by(desc(Hashtag.posts_count))
            .limit(limit)
            .all()
        )

    def get_trending(self, limit: int = 20) -> list[Hashtag]:
        return (
            self.db.query(Hashtag)
            .order_by(desc(Hashtag.posts_count), desc(Hashtag.followers_count))
            .limit(limit)
            .all()
        )

    def is_following(self, user_id: UUID, hashtag_id: UUID) -> bool:
        return (
            self.db.query(HashtagFollow)
            .filter(
                and_(
                    HashtagFollow.user_id == user_id,
                    HashtagFollow.hashtag_id == hashtag_id,
                )
            )
            .first()
            is not None
        )

    def follow(self, user_id: UUID, hashtag_id: UUID) -> None:
        existing = (
            self.db.query(HashtagFollow)
            .filter(
                and_(
                    HashtagFollow.user_id == user_id,
                    HashtagFollow.hashtag_id == hashtag_id,
                )
            )
            .first()
        )
        if existing:
            return
        follow = HashtagFollow(user_id=user_id, hashtag_id=hashtag_id)
        self.db.add(follow)
        hashtag = self.db.query(Hashtag).filter(Hashtag.id == hashtag_id).first()
        if hashtag:
            hashtag.followers_count = (hashtag.followers_count or 0) + 1
        self.db.commit()

    def unfollow(self, user_id: UUID, hashtag_id: UUID) -> None:
        follow = (
            self.db.query(HashtagFollow)
            .filter(
                and_(
                    HashtagFollow.user_id == user_id,
                    HashtagFollow.hashtag_id == hashtag_id,
                )
            )
            .first()
        )
        if follow:
            self.db.delete(follow)
            hashtag = self.db.query(Hashtag).filter(Hashtag.id == hashtag_id).first()
            if hashtag and (hashtag.followers_count or 0) > 0:
                hashtag.followers_count -= 1
            self.db.commit()

    def link_post_to_hashtags(self, post_id: UUID, hashtag_names: list[str]) -> None:
        for name in hashtag_names:
            normalized = name.lower().strip().lstrip("#")
            if not normalized:
                continue
            hashtag = self.db.query(Hashtag).filter(Hashtag.name == normalized).first()
            if not hashtag:
                hashtag = Hashtag(name=normalized)
                self.db.add(hashtag)
                self.db.flush()
            existing = (
                self.db.query(PostHashtag)
                .filter(
                    and_(
                        PostHashtag.post_id == post_id,
                        PostHashtag.hashtag_id == hashtag.id,
                    )
                )
                .first()
            )
            if not existing:
                ph = PostHashtag(post_id=post_id, hashtag_id=hashtag.id)
                self.db.add(ph)
                hashtag.posts_count = (hashtag.posts_count or 0) + 1
        self.db.commit()

    def get_posts_by_hashtag(
        self, hashtag_id: UUID, limit: int = 20, offset: int = 0
    ) -> list[Post]:
        return (
            self.db.query(Post)
            .join(PostHashtag, PostHashtag.post_id == Post.id)
            .filter(
                and_(
                    PostHashtag.hashtag_id == hashtag_id,
                    Post.is_hidden == False,
                    Post.is_draft == False,
                    Post.is_archived == False,
                    Post.privacy == "everyone",
                )
            )
            .order_by(desc(Post.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def count_posts_by_hashtag(self, hashtag_id: UUID) -> int:
        return (
            self.db.query(func.count(PostHashtag.id))
            .join(Post, Post.id == PostHashtag.post_id)
            .filter(
                and_(
                    PostHashtag.hashtag_id == hashtag_id,
                    Post.is_hidden == False,
                    Post.is_draft == False,
                    Post.is_archived == False,
                    Post.privacy == "everyone",
                )
            )
            .scalar()
        )

    def get_user_followed_hashtags(self, user_id: UUID, limit: int = 50) -> list[Hashtag]:
        return (
            self.db.query(Hashtag)
            .join(HashtagFollow, HashtagFollow.hashtag_id == Hashtag.id)
            .filter(HashtagFollow.user_id == user_id)
            .order_by(desc(HashtagFollow.created_at))
            .limit(limit)
            .all()
        )

    def delete(self, hashtag_id: UUID) -> bool:
        hashtag = self.db.query(Hashtag).filter(Hashtag.id == hashtag_id).first()
        if hashtag:
            self.db.delete(hashtag)
            self.db.commit()
            return True
        return False
