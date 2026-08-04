from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from app.models import SearchHistory, SavedSearch, User, Post, Reel, Comment, LiveStream


class SearchRepository:
    def __init__(self, db: Session):
        self.db = db

    def search_users(self, query: str, limit: int = 20) -> list[User]:
        search = f"%{query}%"
        return (
            self.db.query(User)
            .filter(
                and_(
                    User.is_active == True,
                    User.is_deactivated == False,
                    (User.username.ilike(search) | User.full_name.ilike(search)),
                )
            )
            .limit(limit)
            .all()
        )

    def search_posts(self, query: str, post_type: str | None = None, date_from: str | None = None, date_to: str | None = None, limit: int = 20) -> list[Post]:
        search = f"%{query}%"
        filters = [
            Post.content.ilike(search),
            Post.is_hidden == False,
            Post.is_draft == False,
            Post.is_archived == False,
            Post.privacy == "everyone",
        ]
        if post_type:
            filters.append(Post.post_type == post_type)
        if date_from:
            filters.append(Post.created_at >= date_from)
        if date_to:
            filters.append(Post.created_at <= date_to)
        return (
            self.db.query(Post)
            .filter(and_(*filters))
            .order_by(desc(Post.created_at))
            .limit(limit)
            .all()
        )

    def search_reels(self, query: str, limit: int = 20) -> list[Reel]:
        search = f"%{query}%"
        return (
            self.db.query(Reel)
            .filter(
                and_(
                    Reel.caption.ilike(search),
                    Reel.is_archived == False,
                    Reel.privacy == "everyone",
                )
            )
            .order_by(desc(Reel.created_at))
            .limit(limit)
            .all()
        )

    def search_comments(self, query: str, limit: int = 20) -> list[Comment]:
        search = f"%{query}%"
        return (
            self.db.query(Comment)
            .filter(
                and_(
                    Comment.content.ilike(search),
                    Comment.is_deleted == False,
                    Comment.is_hidden == False,
                )
            )
            .order_by(desc(Comment.created_at))
            .limit(limit)
            .all()
        )

    def search_lives(self, query: str, limit: int = 20) -> list[LiveStream]:
        search = f"%{query}%"
        return (
            self.db.query(LiveStream)
            .filter(
                and_(
                    LiveStream.title.ilike(search),
                    LiveStream.privacy == "everyone",
                )
            )
            .order_by(desc(LiveStream.created_at))
            .limit(limit)
            .all()
        )

    def unified_search(self, query: str, search_type: str = "all", post_type: str | None = None, date_from: str | None = None, date_to: str | None = None, limit: int = 20) -> dict:
        results = {
            "users": [],
            "posts": [],
            "reels": [],
            "comments": [],
            "lives": [],
        }
        if search_type in ("all", "users"):
            results["users"] = self.search_users(query, limit)
        if search_type in ("all", "posts"):
            results["posts"] = self.search_posts(query, post_type, date_from, date_to, limit)
        if search_type in ("all", "reels"):
            results["reels"] = self.search_reels(query, limit)
        if search_type in ("all", "comments"):
            results["comments"] = self.search_comments(query, limit)
        if search_type in ("all", "lives"):
            results["lives"] = self.search_lives(query, limit)
        return results

    def add_to_history(self, user_id: UUID, query: str, search_type: str = "all", results_count: int = 0) -> SearchHistory:
        entry = SearchHistory(
            user_id=user_id,
            query=query,
            search_type=search_type,
            results_count=results_count,
        )
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_history(self, user_id: UUID, limit: int = 20) -> list[SearchHistory]:
        return (
            self.db.query(SearchHistory)
            .filter(SearchHistory.user_id == user_id)
            .order_by(desc(SearchHistory.created_at))
            .limit(limit)
            .all()
        )

    def clear_history(self, user_id: UUID) -> None:
        self.db.query(SearchHistory).filter(SearchHistory.user_id == user_id).delete()
        self.db.commit()

    def save_search(self, user_id: UUID, query: str, search_type: str = "all", filters_json: str | None = None, label: str | None = None) -> SavedSearch:
        saved = SavedSearch(
            user_id=user_id,
            query=query,
            search_type=search_type,
            filters_json=filters_json,
            label=label,
        )
        self.db.add(saved)
        self.db.commit()
        self.db.refresh(saved)
        return saved

    def get_saved_searches(self, user_id: UUID) -> list[SavedSearch]:
        return (
            self.db.query(SavedSearch)
            .filter(SavedSearch.user_id == user_id)
            .order_by(desc(SavedSearch.created_at))
            .all()
        )

    def delete_saved_search(self, user_id: UUID, search_id: UUID) -> bool:
        saved = self.db.query(SavedSearch).filter(
            and_(SavedSearch.id == search_id, SavedSearch.user_id == user_id)
        ).first()
        if saved:
            self.db.delete(saved)
            self.db.commit()
            return True
        return False
