from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.security import get_current_user_id
from app.database.base import get_db
from app.schemas.groups import (
    GroupCreate, GroupUpdate, GroupResponse, GroupListResponse,
    GroupMembersResponse, GroupJoinRequestsResponse,
    GroupAnnouncementCreate, GroupAnnouncementsResponse,
    GroupEventCreate, GroupEventsResponse,
    GroupPollCreate, GroupPollsResponse,
    GroupMessageCreate, GroupMessagesResponse,
    GroupMemberRoleUpdate, GroupMemberStatusUpdate,
)
from app.services.group_service import GroupService

router = APIRouter()


def get_group_service(db: Session = Depends(get_db)) -> GroupService:
    return GroupService(db)


@router.get("", response_model=GroupListResponse)
def list_groups(
    q: str | None = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    user_id: str | None = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    uid = user_id if user_id else None
    if q:
        return {"groups": service.search_groups(q, uid)}
    return {"groups": service.list_public_groups(limit, offset, uid)}


@router.get("/my", response_model=GroupListResponse)
def list_my_groups(
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return {"groups": service.list_user_groups(user_id)}


@router.post("", response_model=GroupResponse)
def create_group(
    data: GroupCreate,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.create_group(user_id, data)


@router.get("/{slug}", response_model=GroupResponse)
def get_group(
    slug: str,
    user_id: str | None = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    uid = user_id if user_id else None
    return service.get_group(slug, uid)


@router.put("/{slug}", response_model=GroupResponse)
def update_group(
    slug: str,
    data: GroupUpdate,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.update_group(slug, user_id, data)


@router.delete("/{slug}")
def delete_group(
    slug: str,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.delete_group(slug, user_id)


@router.post("/{slug}/join")
def join_group(
    slug: str,
    message: str | None = None,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.join_group(slug, user_id, message)


@router.post("/{slug}/leave")
def leave_group(
    slug: str,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.leave_group(slug, user_id)


@router.get("/{slug}/members", response_model=GroupMembersResponse)
def get_members(
    slug: str,
    service: GroupService = Depends(get_group_service),
):
    return {"members": service.get_members(slug)}


@router.put("/{slug}/members/{target_user_id}/role")
def update_member_role(
    slug: str,
    target_user_id: str,
    data: GroupMemberRoleUpdate,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.update_member_role(slug, user_id, target_user_id, data.role)


@router.delete("/{slug}/members/{target_user_id}")
def remove_member(
    slug: str,
    target_user_id: str,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.remove_member(slug, user_id, target_user_id)


@router.get("/{slug}/join-requests", response_model=GroupJoinRequestsResponse)
def get_join_requests(
    slug: str,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return {"requests": service.get_join_requests(slug, user_id)}


@router.put("/{slug}/join-requests/{request_id}")
def handle_join_request(
    slug: str,
    request_id: str,
    data: GroupMemberStatusUpdate,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.handle_join_request(slug, user_id, request_id, data.status)


@router.post("/{slug}/announcements", response_model=GroupAnnouncementsResponse)
def create_announcement(
    slug: str,
    data: GroupAnnouncementCreate,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    ann = service.create_announcement(slug, user_id, data)
    return {"announcements": [ann]}


@router.get("/{slug}/announcements", response_model=GroupAnnouncementsResponse)
def get_announcements(
    slug: str,
    service: GroupService = Depends(get_group_service),
):
    return {"announcements": service.get_announcements(slug)}


@router.delete("/{slug}/announcements/{announcement_id}")
def delete_announcement(
    slug: str,
    announcement_id: str,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.delete_announcement(slug, user_id, announcement_id)


@router.post("/{slug}/events", response_model=GroupEventsResponse)
def create_event(
    slug: str,
    data: GroupEventCreate,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    event = service.create_event(slug, user_id, data)
    return {"events": [event]}


@router.get("/{slug}/events", response_model=GroupEventsResponse)
def get_events(
    slug: str,
    user_id: str | None = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    uid = user_id if user_id else None
    return {"events": service.get_events(slug, uid)}


@router.post("/{slug}/events/{event_id}/attend")
def attend_event(
    slug: str,
    event_id: str,
    status: str = "going",
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.attend_event(slug, user_id, event_id, status)


@router.post("/{slug}/polls", response_model=GroupPollsResponse)
def create_poll(
    slug: str,
    data: GroupPollCreate,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    poll = service.create_poll(slug, user_id, data)
    return {"polls": [poll]}


@router.get("/{slug}/polls", response_model=GroupPollsResponse)
def get_polls(
    slug: str,
    user_id: str | None = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    uid = user_id if user_id else None
    return {"polls": service.get_polls(slug, uid)}


@router.post("/{slug}/polls/{poll_id}/vote")
def vote_poll(
    slug: str,
    poll_id: str,
    option_index: int,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.vote_poll(slug, user_id, poll_id, option_index)


@router.post("/{slug}/messages", response_model=GroupMessagesResponse)
def send_message(
    slug: str,
    data: GroupMessageCreate,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    msg = service.send_message(slug, user_id, data)
    return {"messages": [msg]}


@router.get("/{slug}/messages", response_model=GroupMessagesResponse)
def get_messages(
    slug: str,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    service: GroupService = Depends(get_group_service),
):
    return {"messages": service.get_messages(slug, limit, offset)}


@router.delete("/{slug}/messages/{message_id}")
def delete_message(
    slug: str,
    message_id: str,
    user_id: str = Depends(get_current_user_id),
    service: GroupService = Depends(get_group_service),
):
    return service.delete_message(slug, user_id, message_id)
