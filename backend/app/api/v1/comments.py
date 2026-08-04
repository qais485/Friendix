from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentReactionCreate,
    CommentReportCreate,
    CommentResponse,
    CommentListResponse,
    CommentReactionResponse,
)
from app.services.comment_service import CommentService

router = APIRouter()


def get_comment_service(db: Session = Depends(get_db)) -> CommentService:
    return CommentService(db)


@router.post("/posts/{post_id}/comments", response_model=CommentResponse)
def create_comment(
    post_id: str,
    data: CommentCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    try:
        return service.create_comment(user_id, UUID(post_id), data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/posts/{post_id}/comments", response_model=CommentListResponse)
def get_post_comments(
    post_id: str,
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    return service.get_post_comments(UUID(post_id), user_id, cursor)


@router.get("/comments/{comment_id}/replies", response_model=CommentListResponse)
def get_comment_replies(
    comment_id: str,
    cursor: str | None = None,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    return service.get_comment_replies(UUID(comment_id), user_id, cursor)


@router.put("/comments/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: str,
    data: CommentUpdate,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    try:
        return service.update_comment(user_id, UUID(comment_id), data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/comments/{comment_id}")
def delete_comment(
    comment_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    success = service.delete_comment(user_id, UUID(comment_id))
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted"}


@router.post("/comments/{comment_id}/pin", response_model=CommentResponse)
def pin_comment(
    comment_id: str,
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    try:
        return service.pin_comment(user_id, UUID(comment_id), UUID(post_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/comments/{comment_id}/unpin", response_model=CommentResponse)
def unpin_comment(
    comment_id: str,
    post_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    try:
        return service.unpin_comment(user_id, UUID(comment_id), UUID(post_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/comments/{comment_id}/hide", response_model=CommentResponse)
def hide_comment(
    comment_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    try:
        return service.hide_comment(user_id, UUID(comment_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/comments/{comment_id}/unhide", response_model=CommentResponse)
def unhide_comment(
    comment_id: str,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    try:
        return service.unhide_comment(user_id, UUID(comment_id))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/comments/{comment_id}/reactions", response_model=CommentReactionResponse | None)
def toggle_reaction(
    comment_id: str,
    data: CommentReactionCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    try:
        return service.toggle_reaction(user_id, UUID(comment_id), data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/comments/{comment_id}/report")
def report_comment(
    comment_id: str,
    data: CommentReportCreate,
    user_id: UUID = Depends(get_current_user_id),
    service: CommentService = Depends(get_comment_service),
):
    try:
        service.report_comment(user_id, UUID(comment_id), data)
        return {"message": "Comment reported"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
