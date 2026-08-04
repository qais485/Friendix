from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.search import (
    UnifiedSearchResponse,
    SearchHistoryListResponse,
    SavedSearchCreate,
    SavedSearchResponse,
    SavedSearchListResponse,
)
from app.services.search_service import SearchService

router = APIRouter()


def get_search_service(db: Session = Depends(get_db)) -> SearchService:
    return SearchService(db)


@router.get("", response_model=UnifiedSearchResponse)
def search(
    q: str = Query(..., min_length=1, max_length=255),
    type: str = Query("all", pattern=r"^(all|users|posts|reels|comments|lives)$"),
    post_type: str | None = Query(None, pattern=r"^(text|image|video|audio|gif|poll|document|shared|quote)$"),
    date_from: str | None = None,
    date_to: str | None = None,
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    service: SearchService = Depends(get_search_service),
):
    return service.search(user_id, q, type, post_type, date_from, date_to, limit)


@router.get("/history", response_model=SearchHistoryListResponse)
def get_search_history(
    limit: int = Query(20, ge=1, le=100),
    user_id: UUID = Depends(get_current_user_id),
    service: SearchService = Depends(get_search_service),
):
    return service.get_history(user_id, limit)


@router.delete("/history")
def clear_search_history(
    user_id: UUID = Depends(get_current_user_id),
    service: SearchService = Depends(get_search_service),
):
    service.clear_history(user_id)
    return {"message": "Search history cleared"}


@router.post("/save", response_model=SavedSearchResponse)
def save_search(
    data: SavedSearchCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: SearchService = Depends(get_search_service),
):
    return service.save_search(user_id, data)


@router.get("/saved", response_model=SavedSearchListResponse)
def get_saved_searches(
    user_id: UUID = Depends(get_current_user_id),
    service: SearchService = Depends(get_search_service),
):
    return service.get_saved_searches(user_id)


@router.delete("/saved/{search_id}")
def delete_saved_search(
    search_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: SearchService = Depends(get_search_service),
):
    service.delete_saved_search(user_id, UUID(search_id))
    return {"message": "Saved search deleted"}
