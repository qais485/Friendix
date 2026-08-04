from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.hashtags import (
    HashtagResponse,
    HashtagDetailResponse,
    HashtagCreate,
    HashtagListResponse,
    TrendingHashtagsListResponse,
    HashtagPostsResponse,
)
from app.services.hashtag_service import HashtagService

router = APIRouter()


def get_hashtag_service(db: Session = Depends(get_db)) -> HashtagService:
    return HashtagService(db)


@router.get("/trending", response_model=TrendingHashtagsListResponse)
def get_trending_hashtags(
    limit: int = Query(20, ge=1, le=100),
    user_id: str | None = Depends(get_current_user_id),
    service: HashtagService = Depends(get_hashtag_service),
):
    uid = user_id if user_id else None
    return {"hashtags": service.get_trending(limit, uid)}


@router.get("/search", response_model=HashtagListResponse)
def search_hashtags(
    q: str = Query(..., min_length=1, max_length=100),
    limit: int = Query(20, ge=1, le=100),
    service: HashtagService = Depends(get_hashtag_service),
):
    return {"hashtags": service.search_hashtags(q, limit)}


@router.get("/followed", response_model=HashtagListResponse)
def get_followed_hashtags(
    limit: int = Query(50, ge=1, le=100),
    user_id: str = Depends(get_current_user_id),
    service: HashtagService = Depends(get_hashtag_service),
):
    return {"hashtags": service.get_followed_hashtags(user_id, limit)}


@router.get("/{name}", response_model=HashtagDetailResponse)
def get_hashtag_detail(
    name: str,
    user_id: str | None = Depends(get_current_user_id),
    service: HashtagService = Depends(get_hashtag_service),
):
    uid = user_id if user_id else None
    return service.get_hashtag_detail(name, uid)


@router.get("/{name}/posts", response_model=HashtagPostsResponse)
def get_hashtag_posts(
    name: str,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str | None = Depends(get_current_user_id),
    service: HashtagService = Depends(get_hashtag_service),
):
    uid = user_id if user_id else None
    return service.get_hashtag_posts(name, uid, limit, offset)


@router.post("/{name}/follow")
def follow_hashtag(
    name: str,
    user_id: str = Depends(get_current_user_id),
    service: HashtagService = Depends(get_hashtag_service),
):
    return service.follow_hashtag(user_id, name)


@router.delete("/{name}/follow")
def unfollow_hashtag(
    name: str,
    user_id: str = Depends(get_current_user_id),
    service: HashtagService = Depends(get_hashtag_service),
):
    return service.unfollow_hashtag(user_id, name)


@router.post("", response_model=HashtagResponse)
def create_hashtag(
    data: HashtagCreate,
    user_id: str = Depends(get_current_user_id),
    service: HashtagService = Depends(get_hashtag_service),
):
    return service.create_hashtag(data)
