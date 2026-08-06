from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.feed import (
    PostCreate,
    PostUpdate,
    PostResponse,
    FeedResponse,
    FeedPositionResponse,
    FeedPositionUpdate,
    PollResponse,
    RepostCreate,
    QuoteCreate,
)
from app.services.feed_service import FeedService

router = APIRouter()


def get_feed_service(db: Session = Depends(get_db)) -> FeedService:
    return FeedService(db)


@router.post("/posts", response_model=PostResponse)
def create_post(
    data: PostCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.create_post(user_id, data)


@router.put("/posts/{post_id}", response_model=PostResponse)
def update_post(
    post_id: str,
    data: PostUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.update_post(user_id, UUID(post_id), data)


@router.delete("/posts/{post_id}")
def delete_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    service.delete_post(user_id, UUID(post_id))
    return {"success": True, "message": "Post deleted successfully"}


@router.get("/posts/{post_id}", response_model=PostResponse)
def get_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    post = service.feed_repo.get_post_by_id(UUID(post_id))
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != user_id:
        if post.is_hidden or post.is_draft or post.is_archived or post.is_scheduled:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.privacy == "only_me":
            raise HTTPException(status_code=403, detail="Access denied")
        if post.privacy == "friends":
            if not service.feed_repo._are_friends(post.user_id, user_id):
                raise HTTPException(status_code=403, detail="Access denied")
    return service._enrich_post(post, user_id)


@router.get("/home", response_model=FeedResponse)
def get_home_feed(
    cursor: str | None = None,
    limit: int = Query(10, ge=1, le=20),
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_home_feed(user_id, cursor, limit=limit)


@router.get("/following", response_model=FeedResponse)
def get_following_feed(
    cursor: str | None = None,
    limit: int = Query(10, ge=1, le=20),
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_following_feed(user_id, cursor, limit=limit)


@router.get("/friends", response_model=FeedResponse)
def get_friends_feed(
    cursor: str | None = None,
    limit: int = Query(10, ge=1, le=20),
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_friends_feed(user_id, cursor, limit=limit)


@router.get("/trending", response_model=FeedResponse)
def get_trending_feed(
    cursor: str | None = None,
    limit: int = Query(10, ge=1, le=20),
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_trending_feed(user_id, cursor, limit=limit)


@router.get("/suggested", response_model=list[PostResponse])
def get_suggested_posts(
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_suggested_posts(user_id)


@router.get("/user/{target_user_id}", response_model=FeedResponse)
def get_user_posts(
    target_user_id: str,
    cursor: str | None = None,
    limit: int = Query(10, ge=1, le=20),
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_user_posts(UUID(target_user_id), user_id, cursor, limit=limit)


@router.post("/posts/{post_id}/save")
def save_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    service.save_post(user_id, UUID(post_id))
    return {"message": "Post saved"}


@router.delete("/posts/{post_id}/save")
def unsave_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    service.unsave_post(user_id, UUID(post_id))
    return {"message": "Post unsaved"}


@router.get("/saved", response_model=list[PostResponse])
def get_saved_posts(
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_saved_posts(user_id)


@router.post("/posts/{post_id}/hide")
def hide_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    service.hide_post(user_id, UUID(post_id))
    return {"message": "Post hidden"}


@router.delete("/posts/{post_id}/hide")
def unhide_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    service.unhide_post(user_id, UUID(post_id))
    return {"message": "Post unhidden"}


@router.get("/hidden", response_model=list[PostResponse])
def get_hidden_posts(
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_hidden_posts(user_id)


@router.post("/posts/{post_id}/pin", response_model=PostResponse)
def pin_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.pin_post(user_id, UUID(post_id))


@router.delete("/posts/{post_id}/pin", response_model=PostResponse)
def unpin_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.unpin_post(user_id, UUID(post_id))


@router.post("/posts/{post_id}/archive", response_model=PostResponse)
def archive_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.archive_post(user_id, UUID(post_id))


@router.delete("/posts/{post_id}/archive", response_model=PostResponse)
def unarchive_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.unarchive_post(user_id, UUID(post_id))


@router.get("/archived", response_model=list[PostResponse])
def get_archived_posts(
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_archived_posts(user_id)


@router.get("/drafts", response_model=list[PostResponse])
def get_draft_posts(
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_draft_posts(user_id)


@router.get("/scheduled", response_model=list[PostResponse])
def get_scheduled_posts(
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_scheduled_posts(user_id)


@router.post("/polls/{poll_id}/vote", response_model=PollResponse)
def vote_poll(
    poll_id: str,
    option_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.vote_poll(user_id, UUID(poll_id), UUID(option_id))


@router.post("/posts/{post_id}/repost", response_model=PostResponse)
def repost_post(
    post_id: str,
    data: RepostCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.repost_post(user_id, UUID(post_id), data.content)


@router.post("/posts/{post_id}/quote", response_model=PostResponse)
def quote_post(
    post_id: str,
    data: QuoteCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.quote_post(user_id, UUID(post_id), data.quote_text, data.content)


@router.put("/position", response_model=FeedPositionResponse)
def update_feed_position(
    data: FeedPositionUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.update_feed_position(user_id, data)


@router.get("/position/{feed_type}", response_model=FeedPositionResponse | None)
def get_feed_position(
    feed_type: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.get_feed_position(user_id, feed_type)


@router.get("/count")
def get_post_count(
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return {"count": service.get_post_count(user_id)}


@router.post("/posts/{post_id}/like", response_model=PostResponse)
def like_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.like_post(user_id, UUID(post_id))


@router.delete("/posts/{post_id}/like", response_model=PostResponse)
def unlike_post(
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: FeedService = Depends(get_feed_service),
):
    return service.unlike_post(user_id, UUID(post_id))
