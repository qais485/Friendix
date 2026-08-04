from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.hashtag_repository import HashtagRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.hashtags import (
    HashtagResponse,
    HashtagDetailResponse,
    TrendingHashtagResponse,
    HashtagPostResponse,
    HashtagCreate,
    HashtagListResponse,
    TrendingHashtagsListResponse,
    HashtagPostsResponse,
)


class HashtagService:
    def __init__(self, db: Session):
        self.db = db
        self.hashtag_repo = HashtagRepository(db)
        self.profile_repo = ProfileRepository(db)

    def _enrich_hashtag(self, hashtag, user_id: UUID | None = None) -> HashtagResponse:
        is_following = False
        if user_id:
            is_following = self.hashtag_repo.is_following(user_id, hashtag.id)
        return HashtagResponse(
            id=hashtag.id,
            name=hashtag.name,
            posts_count=hashtag.posts_count or 0,
            followers_count=hashtag.followers_count or 0,
            description=hashtag.description,
            created_at=hashtag.created_at,
            is_following=is_following,
        )

    def search_hashtags(self, query: str, limit: int = 20) -> list[HashtagResponse]:
        hashtags = self.hashtag_repo.search(query, limit)
        return [HashtagResponse(
            id=h.id,
            name=h.name,
            posts_count=h.posts_count or 0,
            followers_count=h.followers_count or 0,
            description=h.description,
            created_at=h.created_at,
        ) for h in hashtags]

    def get_trending(self, limit: int = 20, user_id: UUID | None = None) -> list[TrendingHashtagResponse]:
        hashtags = self.hashtag_repo.get_trending(limit)
        results = []
        for h in hashtags:
            is_following = False
            if user_id:
                is_following = self.hashtag_repo.is_following(user_id, h.id)
            results.append(TrendingHashtagResponse(
                id=h.id,
                name=h.name,
                posts_count=h.posts_count or 0,
                followers_count=h.followers_count or 0,
                description=h.description,
                is_following=is_following,
            ))
        return results

    def get_hashtag_detail(self, name: str, user_id: UUID | None = None) -> HashtagDetailResponse:
        hashtag = self.hashtag_repo.get_by_name(name)
        if not hashtag:
            raise HTTPException(status_code=404, detail="Hashtag not found")
        is_following = False
        if user_id:
            is_following = self.hashtag_repo.is_following(user_id, hashtag.id)
        return HashtagDetailResponse(
            id=hashtag.id,
            name=hashtag.name,
            posts_count=hashtag.posts_count or 0,
            followers_count=hashtag.followers_count or 0,
            description=hashtag.description,
            is_following=is_following,
            created_at=hashtag.created_at,
        )

    def follow_hashtag(self, user_id: UUID, hashtag_name: str) -> dict:
        hashtag = self.hashtag_repo.get_or_create(hashtag_name)
        self.hashtag_repo.follow(user_id, hashtag.id)
        return {"message": f"Now following #{hashtag.name}", "hashtag_id": hashtag.id, "is_following": True}

    def unfollow_hashtag(self, user_id: UUID, hashtag_name: str) -> dict:
        hashtag = self.hashtag_repo.get_by_name(hashtag_name)
        if not hashtag:
            raise HTTPException(status_code=404, detail="Hashtag not found")
        self.hashtag_repo.unfollow(user_id, hashtag.id)
        return {"message": f"Unfollowed #{hashtag.name}", "hashtag_id": hashtag.id, "is_following": False}

    def get_hashtag_posts(
        self, name: str, user_id: UUID | None = None, limit: int = 20, offset: int = 0
    ) -> HashtagPostsResponse:
        hashtag = self.hashtag_repo.get_by_name(name)
        if not hashtag:
            raise HTTPException(status_code=404, detail="Hashtag not found")
        posts = self.hashtag_repo.get_posts_by_hashtag(hashtag.id, limit, offset)
        total = self.hashtag_repo.count_posts_by_hashtag(hashtag.id)
        user_ids = list(set(p.user_id for p in posts))
        users_map = self.profile_repo.get_by_ids(user_ids) if user_ids else {}
        enriched = []
        for p in posts:
            author = users_map.get(p.user_id)
            enriched.append(HashtagPostResponse(
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
            ))
        return HashtagPostsResponse(posts=enriched, total_count=total)

    def get_followed_hashtags(self, user_id: UUID, limit: int = 50) -> list[HashtagResponse]:
        hashtags = self.hashtag_repo.get_user_followed_hashtags(user_id, limit)
        return [self._enrich_hashtag(h, user_id) for h in hashtags]

    def create_hashtag(self, data: HashtagCreate) -> HashtagResponse:
        existing = self.hashtag_repo.get_by_name(data.name)
        if existing:
            raise HTTPException(status_code=409, detail="Hashtag already exists")
        hashtag = self.hashtag_repo.get_or_create(data.name)
        if data.description:
            hashtag.description = data.description
            self.db.commit()
            self.db.refresh(hashtag)
        return self._enrich_hashtag(hashtag)
