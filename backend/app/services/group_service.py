import json
from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.group_repository import GroupRepository
from app.repositories.profile_repository import ProfileRepository
from app.schemas.groups import (
    GroupCreate, GroupUpdate, GroupResponse, GroupListResponse,
    GroupMemberResponse, GroupMembersResponse,
    GroupJoinRequestResponse, GroupJoinRequestsResponse,
    GroupAnnouncementCreate, GroupAnnouncementResponse, GroupAnnouncementsResponse,
    GroupEventCreate, GroupEventResponse, GroupEventsResponse,
    GroupPollCreate, GroupPollResponse, GroupPollsResponse,
    GroupMessageCreate, GroupMessageResponse, GroupMessagesResponse,
)


class GroupService:
    def __init__(self, db: Session):
        self.db = db
        self.group_repo = GroupRepository(db)
        self.profile_repo = ProfileRepository(db)

    def _enrich_group(self, group, user_id: UUID | None = None) -> GroupResponse:
        is_member = False
        member_role = None
        has_pending = False
        if user_id:
            member = self.group_repo.get_member(group.id, user_id)
            if member and member.status == "approved":
                is_member = True
                member_role = member.role
            req = self.group_repo.get_join_request(group.id, user_id)
            has_pending = req is not None
        return GroupResponse(
            id=group.id,
            creator_id=group.creator_id,
            name=group.name,
            slug=group.slug,
            description=group.description,
            cover_url=group.cover_url,
            privacy=group.privacy,
            members_count=group.members_count or 0,
            rules=group.rules,
            is_active=group.is_active,
            is_member=is_member,
            member_role=member_role,
            has_pending_request=has_pending,
            created_at=group.created_at,
        )

    def _enrich_member(self, m) -> GroupMemberResponse:
        user = self.profile_repo.get_by_ids([m.user_id]).get(m.user_id)
        return GroupMemberResponse(
            id=m.id,
            user_id=m.user_id,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            avatar_url=user.avatar_url if user else None,
            role=m.role,
            status=m.status,
            joined_at=m.created_at,
        )

    def _enrich_announcement(self, a) -> GroupAnnouncementResponse:
        user = self.profile_repo.get_by_ids([a.author_id]).get(a.author_id)
        return GroupAnnouncementResponse(
            id=a.id,
            author_id=a.author_id,
            username=user.username if user else None,
            avatar_url=user.avatar_url if user else None,
            title=a.title,
            content=a.content,
            is_pinned=a.is_pinned,
            created_at=a.created_at,
        )

    def _enrich_event(self, e, user_id: UUID | None = None) -> GroupEventResponse:
        user = self.profile_repo.get_by_ids([e.creator_id]).get(e.creator_id)
        is_attending = False
        if user_id:
            is_attending = self.group_repo.is_attending(e.id, user_id)
        return GroupEventResponse(
            id=e.id,
            creator_id=e.creator_id,
            username=user.username if user else None,
            avatar_url=user.avatar_url if user else None,
            title=e.title,
            description=e.description,
            location=e.location,
            start_time=e.start_time,
            end_time=e.end_time,
            cover_url=e.cover_url,
            attendees_count=e.attendees_count or 0,
            is_attending=is_attending,
            created_at=e.created_at,
        )

    def _enrich_poll(self, p, user_id: UUID | None = None) -> GroupPollResponse:
        user = self.profile_repo.get_by_ids([p.creator_id]).get(p.creator_id)
        options = json.loads(p.options_json) if p.options_json else []
        user_vote = None
        if user_id:
            vote = self.group_repo.get_user_poll_vote(p.id, user_id)
            if vote:
                user_vote = vote.option_index
        vote_counts = self.group_repo.get_poll_vote_counts(p.id, len(options))
        return GroupPollResponse(
            id=p.id,
            creator_id=p.creator_id,
            username=user.username if user else None,
            question=p.question,
            options=options,
            expires_at=p.expires_at,
            is_anonymous=p.is_anonymous,
            total_votes=p.total_votes or 0,
            user_vote=user_vote,
            option_votes=vote_counts,
            created_at=p.created_at,
        )

    def _enrich_message(self, m) -> GroupMessageResponse:
        user = self.profile_repo.get_by_ids([m.user_id]).get(m.user_id)
        return GroupMessageResponse(
            id=m.id,
            user_id=m.user_id,
            username=user.username if user else None,
            avatar_url=user.avatar_url if user else None,
            content=m.content,
            is_announcement=m.is_announcement,
            created_at=m.created_at,
        )

    def _enrich_join_request(self, r) -> GroupJoinRequestResponse:
        user = self.profile_repo.get_by_ids([r.user_id]).get(r.user_id)
        return GroupJoinRequestResponse(
            id=r.id,
            user_id=r.user_id,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            avatar_url=user.avatar_url if user else None,
            status=r.status,
            message=r.message,
            created_at=r.created_at,
        )

    def create_group(self, user_id: UUID, data: GroupCreate) -> GroupResponse:
        group = self.group_repo.create(user_id, data.name, data.description, data.privacy, data.rules)
        return self._enrich_group(group, user_id)

    def get_group(self, slug: str, user_id: UUID | None = None) -> GroupResponse:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        if group.privacy == "hidden":
            if not user_id or not self.group_repo.get_member(group.id, user_id):
                raise HTTPException(status_code=404, detail="Group not found")
        return self._enrich_group(group, user_id)

    def search_groups(self, query: str, user_id: UUID | None = None) -> list[GroupResponse]:
        groups = self.group_repo.search(query)
        return [self._enrich_group(g, user_id) for g in groups]

    def list_public_groups(self, limit: int = 20, offset: int = 0, user_id: UUID | None = None) -> list[GroupResponse]:
        groups = self.group_repo.list_public(limit, offset)
        return [self._enrich_group(g, user_id) for g in groups]

    def list_user_groups(self, user_id: UUID) -> list[GroupResponse]:
        groups = self.group_repo.list_user_groups(user_id)
        return [self._enrich_group(g, user_id) for g in groups]

    def update_group(self, slug: str, user_id: UUID, data: GroupUpdate) -> GroupResponse:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.role not in ("admin",):
            raise HTTPException(status_code=403, detail="Only admins can update the group")
        update_data = data.model_dump(exclude_unset=True)
        updated = self.group_repo.update_group(group.id, **update_data)
        return self._enrich_group(updated, user_id)

    def delete_group(self, slug: str, user_id: UUID) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        if group.creator_id != user_id:
            raise HTTPException(status_code=403, detail="Only the creator can delete the group")
        self.group_repo.delete_group(group.id)
        return {"message": "Group deleted"}

    def join_group(self, slug: str, user_id: UUID, message: str | None = None) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        existing = self.group_repo.get_member(group.id, user_id)
        if existing and existing.status == "approved":
            return {"message": "Already a member", "status": "approved"}
        if group.privacy == "public":
            self.group_repo.add_member(group.id, user_id)
            return {"message": "Joined group", "status": "approved"}
        else:
            req = self.group_repo.create_join_request(group.id, user_id, message)
            return {"message": "Join request sent", "status": "pending", "request_id": req.id}

    def leave_group(self, slug: str, user_id: UUID) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        if group.creator_id == user_id:
            raise HTTPException(status_code=400, detail="Creator cannot leave. Transfer ownership first.")
        removed = self.group_repo.remove_member(group.id, user_id)
        if not removed:
            raise HTTPException(status_code=400, detail="Not a member")
        return {"message": "Left group"}

    def get_members(self, slug: str) -> list[GroupMemberResponse]:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        members = self.group_repo.get_members(group.id)
        return [self._enrich_member(m) for m in members]

    def update_member_role(self, slug: str, user_id: UUID, target_user_id: UUID, role: str) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        requester = self.group_repo.get_member(group.id, user_id)
        if not requester or requester.role != "admin":
            raise HTTPException(status_code=403, detail="Only admins can change roles")
        if role not in ("admin", "moderator", "member"):
            raise HTTPException(status_code=400, detail="Invalid role")
        self.group_repo.update_member_role(group.id, target_user_id, role)
        return {"message": f"Role updated to {role}"}

    def remove_member(self, slug: str, user_id: UUID, target_user_id: UUID) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        requester = self.group_repo.get_member(group.id, user_id)
        if not requester or requester.role not in ("admin", "moderator"):
            raise HTTPException(status_code=403, detail="Only admins/moderators can remove members")
        target = self.group_repo.get_member(group.id, target_user_id)
        if target and target.role == "admin" and requester.role != "admin":
            raise HTTPException(status_code=403, detail="Cannot remove an admin")
        self.group_repo.remove_member(group.id, target_user_id)
        return {"message": "Member removed"}

    def get_join_requests(self, slug: str, user_id: UUID) -> list[GroupJoinRequestResponse]:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.role not in ("admin", "moderator"):
            raise HTTPException(status_code=403, detail="Only admins/moderators can view join requests")
        requests = self.group_repo.get_join_requests(group.id)
        return [self._enrich_join_request(r) for r in requests]

    def handle_join_request(self, slug: str, user_id: UUID, request_id: UUID, status: str) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.role not in ("admin", "moderator"):
            raise HTTPException(status_code=403, detail="Only admins/moderators can handle join requests")
        req = self.group_repo.handle_join_request(request_id, status)
        if not req:
            raise HTTPException(status_code=404, detail="Request not found")
        return {"message": f"Request {status}"}

    # Announcements
    def create_announcement(self, slug: str, user_id: UUID, data: GroupAnnouncementCreate) -> GroupAnnouncementResponse:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.role not in ("admin", "moderator"):
            raise HTTPException(status_code=403, detail="Only admins/moderators can create announcements")
        ann = self.group_repo.create_announcement(group.id, user_id, data.title, data.content)
        return self._enrich_announcement(ann)

    def get_announcements(self, slug: str) -> list[GroupAnnouncementResponse]:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        announcements = self.group_repo.get_announcements(group.id)
        return [self._enrich_announcement(a) for a in announcements]

    def delete_announcement(self, slug: str, user_id: UUID, announcement_id: UUID) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.role not in ("admin", "moderator"):
            raise HTTPException(status_code=403, detail="Only admins/moderators can delete announcements")
        self.group_repo.delete_announcement(announcement_id)
        return {"message": "Announcement deleted"}

    # Events
    def create_event(self, slug: str, user_id: UUID, data: GroupEventCreate) -> GroupEventResponse:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.status != "approved":
            raise HTTPException(status_code=403, detail="Must be a member")
        event = self.group_repo.create_event(group.id, user_id, data.title, data.description, data.location, data.start_time, data.end_time)
        return self._enrich_event(event, user_id)

    def get_events(self, slug: str, user_id: UUID | None = None) -> list[GroupEventResponse]:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        events = self.group_repo.get_events(group.id)
        return [self._enrich_event(e, user_id) for e in events]

    def attend_event(self, slug: str, user_id: UUID, event_id: UUID, status: str = "going") -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        self.group_repo.attend_event(event_id, user_id, status)
        return {"message": f"RSVP updated to {status}"}

    # Polls
    def create_poll(self, slug: str, user_id: UUID, data: GroupPollCreate) -> GroupPollResponse:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.status != "approved":
            raise HTTPException(status_code=403, detail="Must be a member")
        if len(data.options) < 2:
            raise HTTPException(status_code=400, detail="At least 2 options required")
        poll = self.group_repo.create_poll(
            group.id, user_id, data.question,
            json.dumps(data.options), data.expires_at, data.is_anonymous,
        )
        return self._enrich_poll(poll, user_id)

    def get_polls(self, slug: str, user_id: UUID | None = None) -> list[GroupPollResponse]:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        polls = self.group_repo.get_polls(group.id)
        return [self._enrich_poll(p, user_id) for p in polls]

    def vote_poll(self, slug: str, user_id: UUID, poll_id: UUID, option_index: int) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        poll = self.group_repo.get_poll(poll_id)
        if not poll or poll.group_id != group.id:
            raise HTTPException(status_code=404, detail="Poll not found")
        options = json.loads(poll.options_json) if poll.options_json else []
        if option_index < 0 or option_index >= len(options):
            raise HTTPException(status_code=400, detail="Invalid option index")
        self.group_repo.vote_poll(poll_id, user_id, option_index)
        return {"message": "Vote recorded"}

    # Messages
    def send_message(self, slug: str, user_id: UUID, data: GroupMessageCreate) -> GroupMessageResponse:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.status != "approved":
            raise HTTPException(status_code=403, detail="Must be a member")
        is_ann = member.role in ("admin", "moderator")
        msg = self.group_repo.create_message(group.id, user_id, data.content, is_ann)
        return self._enrich_message(msg)

    def get_messages(self, slug: str, limit: int = 50, offset: int = 0) -> list[GroupMessageResponse]:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        messages = self.group_repo.get_messages(group.id, limit, offset)
        return [self._enrich_message(m) for m in messages]

    def delete_message(self, slug: str, user_id: UUID, message_id: UUID) -> dict:
        group = self.group_repo.get_by_slug(slug)
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        member = self.group_repo.get_member(group.id, user_id)
        if not member or member.role not in ("admin", "moderator"):
            raise HTTPException(status_code=403, detail="Only admins/moderators can delete messages")
        self.group_repo.delete_message(message_id)
        return {"message": "Message deleted"}
