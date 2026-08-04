from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.search_repository import SearchRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.search import (
    SearchResultUser,
    SearchResultPost,
    SearchResultReel,
    SearchResultComment,
    SearchResultLive,
    UnifiedSearchResponse,
    SearchHistoryResponse,
    SearchHistoryListResponse,
    SavedSearchResponse,
    SavedSearchCreate,
    SavedSearchListResponse,
)


class SearchService:
    def __init__(self, db: Session):
        self.db = db
        self.search_repo = SearchRepository(db)
        self.profile_repo = ProfileRepository(db)

    def _enrich_users(self, users: list) -> list[SearchResultUser]:
        return [
            SearchResultUser(
                id=u.id,
                username=u.username,
                full_name=u.full_name,
                avatar_url=u.avatar_url,
                is_verified=u.is_verified,
                bio=u.bio,
            )
            for u in users
        ]

    def _enrich_posts(self, posts: list) -> list[SearchResultPost]:
        user_ids = list(set(p.user_id for p in posts))
        users_map = self.profile_repo.get_by_ids(user_ids) if user_ids else {}
        results = []
        for p in posts:
            author = users_map.get(p.user_id)
            results.append(
                SearchResultPost(
                    id=p.id,
                    content=p.content,
                    user_id=p.user_id,
                    username=author.username if author else None,
                    user_avatar=author.avatar_url if author else None,
                    post_type=p.post_type,
                    image_urls=p.image_urls,
                    likes_count=p.likes_count,
                    comments_count=p.comments_count,
                    created_at=p.created_at,
                )
            )
        return results

    def _enrich_reels(self, reels: list) -> list[SearchResultReel]:
        user_ids = list(set(r.user_id for r in reels))
        users_map = self.profile_repo.get_by_ids(user_ids) if user_ids else {}
        results = []
        for r in reels:
            author = users_map.get(r.user_id)
            try:
                video_url = r.media.file_url if r.media else None
            except Exception:
                video_url = None
            results.append(
                SearchResultReel(
                    id=r.id,
                    description=r.caption,
                    video_url=video_url,
                    user_id=r.user_id,
                    username=author.username if author else None,
                    user_avatar=author.avatar_url if author else None,
                    created_at=r.created_at,
                )
            )
        return results

    def _enrich_comments(self, comments: list) -> list[SearchResultComment]:
        user_ids = list(set(c.user_id for c in comments))
        users_map = self.profile_repo.get_by_ids(user_ids) if user_ids else {}
        results = []
        for c in comments:
            author = users_map.get(c.user_id)
            results.append(
                SearchResultComment(
                    id=c.id,
                    content=c.content,
                    post_id=c.post_id,
                    user_id=c.user_id,
                    username=author.username if author else None,
                    created_at=c.created_at,
                )
            )
        return results

    def _enrich_lives(self, lives: list) -> list[SearchResultLive]:
        user_ids = list(set(l.user_id for l in lives))
        users_map = self.profile_repo.get_by_ids(user_ids) if user_ids else {}
        results = []
        for l in lives:
            author = users_map.get(l.user_id)
            results.append(
                SearchResultLive(
                    id=l.id,
                    title=l.title,
                    user_id=l.user_id,
                    username=author.username if author else None,
                    user_avatar=author.avatar_url if author else None,
                    is_live=l.status == "live",
                    created_at=l.created_at,
                )
            )
        return results

    def search(self, user_id: UUID, query: str, search_type: str = "all", post_type: str | None = None, date_from: str | None = None, date_to: str | None = None, limit: int = 20) -> UnifiedSearchResponse:
        raw = self.search_repo.unified_search(query, search_type, post_type, date_from, date_to, limit)
        users = self._enrich_users(raw["users"])
        posts = self._enrich_posts(raw["posts"])
        reels = self._enrich_reels(raw["reels"])
        comments = self._enrich_comments(raw["comments"])
        lives = self._enrich_lives(raw["lives"])
        total = len(users) + len(posts) + len(reels) + len(comments) + len(lives)
        self.search_repo.add_to_history(user_id, query, search_type, total)
        return UnifiedSearchResponse(
            users=users,
            posts=posts,
            reels=reels,
            comments=comments,
            lives=lives,
            total_count=total,
        )

    def get_history(self, user_id: UUID, limit: int = 20) -> SearchHistoryListResponse:
        history = self.search_repo.get_history(user_id, limit)
        return SearchHistoryListResponse(
            history=[
                SearchHistoryResponse(
                    id=h.id,
                    query=h.query,
                    search_type=h.search_type,
                    results_count=h.results_count,
                    created_at=h.created_at,
                )
                for h in history
            ]
        )

    def clear_history(self, user_id: UUID) -> None:
        self.search_repo.clear_history(user_id)

    def save_search(self, user_id: UUID, data: SavedSearchCreate) -> SavedSearchResponse:
        saved = self.search_repo.save_search(user_id, data.query, data.search_type, data.filters_json, data.label)
        return SavedSearchResponse(
            id=saved.id,
            query=saved.query,
            search_type=saved.search_type,
            filters_json=saved.filters_json,
            label=saved.label,
            created_at=saved.created_at,
        )

    def get_saved_searches(self, user_id: UUID) -> SavedSearchListResponse:
        saved = self.search_repo.get_saved_searches(user_id)
        return SavedSearchListResponse(
            saved_searches=[
                SavedSearchResponse(
                    id=s.id,
                    query=s.query,
                    search_type=s.search_type,
                    filters_json=s.filters_json,
                    label=s.label,
                    created_at=s.created_at,
                )
                for s in saved
            ]
        )

    def delete_saved_search(self, user_id: UUID, search_id: UUID) -> bool:
        deleted = self.search_repo.delete_saved_search(user_id, search_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Saved search not found")
        return True
