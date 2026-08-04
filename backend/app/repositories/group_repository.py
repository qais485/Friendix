import json
import re
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from app.models import (
    Group, GroupMember, GroupJoinRequest, GroupAnnouncement,
    GroupEvent, GroupEventAttendee, GroupPoll, GroupPollVote, GroupMessage, User,
)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_-]+", "-", text)
    return text.strip("-")


class GroupRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, creator_id: UUID, name: str, description: str | None, privacy: str, rules: str | None) -> Group:
        slug = slugify(name)
        existing = self.db.query(Group).filter(Group.slug == slug).first()
        if existing:
            import uuid
            slug = f"{slug}-{uuid.uuid4().hex[:6]}"
        group = Group(
            creator_id=creator_id,
            name=name,
            slug=slug,
            description=description,
            privacy=privacy,
            rules=rules,
        )
        self.db.add(group)
        self.db.flush()
        member = GroupMember(user_id=creator_id, group_id=group.id, role="admin", status="approved")
        self.db.add(member)
        group.members_count = 1
        self.db.commit()
        self.db.refresh(group)
        return group

    def get_by_slug(self, slug: str) -> Group | None:
        return self.db.query(Group).filter(Group.slug == slug).first()

    def get_by_id(self, group_id: UUID) -> Group | None:
        return self.db.query(Group).filter(Group.id == group_id).first()

    def search(self, query: str, limit: int = 20) -> list[Group]:
        search = f"%{query}%"
        return (
            self.db.query(Group)
            .filter(
                and_(
                    Group.is_active == True,
                    Group.privacy != "hidden",
                    Group.name.ilike(search),
                )
            )
            .order_by(desc(Group.members_count))
            .limit(limit)
            .all()
        )

    def list_public(self, limit: int = 20, offset: int = 0) -> list[Group]:
        return (
            self.db.query(Group)
            .filter(and_(Group.is_active == True, Group.privacy == "public"))
            .order_by(desc(Group.members_count))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def list_user_groups(self, user_id: UUID) -> list[Group]:
        return (
            self.db.query(Group)
            .join(GroupMember, GroupMember.group_id == Group.id)
            .filter(GroupMember.user_id == user_id)
            .order_by(desc(Group.updated_at))
            .all()
        )

    def get_member(self, group_id: UUID, user_id: UUID) -> GroupMember | None:
        return (
            self.db.query(GroupMember)
            .filter(and_(GroupMember.group_id == group_id, GroupMember.user_id == user_id))
            .first()
        )

    def add_member(self, group_id: UUID, user_id: UUID, role: str = "member", status: str = "approved") -> GroupMember:
        existing = self.get_member(group_id, user_id)
        if existing:
            return existing
        member = GroupMember(user_id=user_id, group_id=group_id, role=role, status=status)
        self.db.add(member)
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if group:
            group.members_count = (group.members_count or 0) + 1
        self.db.commit()
        self.db.refresh(member)
        return member

    def remove_member(self, group_id: UUID, user_id: UUID) -> bool:
        member = self.get_member(group_id, user_id)
        if not member:
            return False
        self.db.delete(member)
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if group and (group.members_count or 0) > 0:
            group.members_count -= 1
        self.db.commit()
        return True

    def update_member_role(self, group_id: UUID, user_id: UUID, role: str) -> bool:
        member = self.get_member(group_id, user_id)
        if not member:
            return False
        member.role = role
        self.db.commit()
        return True

    def get_join_request(self, group_id: UUID, user_id: UUID) -> GroupJoinRequest | None:
        return (
            self.db.query(GroupJoinRequest)
            .filter(
                and_(
                    GroupJoinRequest.group_id == group_id,
                    GroupJoinRequest.user_id == user_id,
                    GroupJoinRequest.status == "pending",
                )
            )
            .first()
        )

    def create_join_request(self, group_id: UUID, user_id: UUID, message: str | None = None) -> GroupJoinRequest:
        existing = self.get_join_request(group_id, user_id)
        if existing:
            return existing
        req = GroupJoinRequest(user_id=user_id, group_id=group_id, message=message)
        self.db.add(req)
        self.db.commit()
        self.db.refresh(req)
        return req

    def handle_join_request(self, request_id: UUID, status: str) -> GroupJoinRequest | None:
        req = self.db.query(GroupJoinRequest).filter(GroupJoinRequest.id == request_id).first()
        if not req:
            return None
        req.status = status
        if status == "approved":
            self.add_member(req.group_id, req.user_id)
        self.db.commit()
        self.db.refresh(req)
        return req

    def get_join_requests(self, group_id: UUID) -> list[GroupJoinRequest]:
        return (
            self.db.query(GroupJoinRequest)
            .filter(and_(GroupJoinRequest.group_id == group_id, GroupJoinRequest.status == "pending"))
            .order_by(desc(GroupJoinRequest.created_at))
            .all()
        )

    def get_members(self, group_id: UUID) -> list[GroupMember]:
        return (
            self.db.query(GroupMember)
            .filter(GroupMember.group_id == group_id)
            .order_by(GroupMember.role, desc(GroupMember.created_at))
            .all()
        )

    def update_group(self, group_id: UUID, **kwargs) -> Group | None:
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if not group:
            return None
        for key, value in kwargs.items():
            if value is not None:
                setattr(group, key, value)
        self.db.commit()
        self.db.refresh(group)
        return group

    def delete_group(self, group_id: UUID) -> bool:
        group = self.db.query(Group).filter(Group.id == group_id).first()
        if group:
            self.db.delete(group)
            self.db.commit()
            return True
        return False

    # Announcements
    def create_announcement(self, group_id: UUID, author_id: UUID, title: str, content: str) -> GroupAnnouncement:
        ann = GroupAnnouncement(group_id=group_id, author_id=author_id, title=title, content=content)
        self.db.add(ann)
        self.db.commit()
        self.db.refresh(ann)
        return ann

    def get_announcements(self, group_id: UUID) -> list[GroupAnnouncement]:
        return (
            self.db.query(GroupAnnouncement)
            .filter(GroupAnnouncement.group_id == group_id)
            .order_by(desc(GroupAnnouncement.is_pinned), desc(GroupAnnouncement.created_at))
            .all()
        )

    def delete_announcement(self, announcement_id: UUID) -> bool:
        ann = self.db.query(GroupAnnouncement).filter(GroupAnnouncement.id == announcement_id).first()
        if ann:
            self.db.delete(ann)
            self.db.commit()
            return True
        return False

    # Events
    def create_event(self, group_id: UUID, creator_id: UUID, title: str, description: str | None, location: str | None, start_time, end_time=None) -> GroupEvent:
        event = GroupEvent(
            group_id=group_id, creator_id=creator_id, title=title,
            description=description, location=location,
            start_time=start_time, end_time=end_time,
        )
        self.db.add(event)
        self.db.flush()
        attendee = GroupEventAttendee(user_id=creator_id, event_id=event.id, status="going")
        self.db.add(attendee)
        event.attendees_count = 1
        self.db.commit()
        self.db.refresh(event)
        return event

    def get_events(self, group_id: UUID) -> list[GroupEvent]:
        return (
            self.db.query(GroupEvent)
            .filter(GroupEvent.group_id == group_id)
            .order_by(desc(GroupEvent.start_time))
            .all()
        )

    def get_event(self, event_id: UUID) -> GroupEvent | None:
        return self.db.query(GroupEvent).filter(GroupEvent.id == event_id).first()

    def attend_event(self, event_id: UUID, user_id: UUID, status: str = "going") -> GroupEventAttendee:
        existing = (
            self.db.query(GroupEventAttendee)
            .filter(and_(GroupEventAttendee.event_id == event_id, GroupEventAttendee.user_id == user_id))
            .first()
        )
        if existing:
            existing.status = status
            self.db.commit()
            self.db.refresh(existing)
            return existing
        attendee = GroupEventAttendee(user_id=user_id, event_id=event_id, status=status)
        self.db.add(attendee)
        event = self.db.query(GroupEvent).filter(GroupEvent.id == event_id).first()
        if event:
            event.attendees_count = (event.attendees_count or 0) + 1
        self.db.commit()
        self.db.refresh(attendee)
        return attendee

    def is_attending(self, event_id: UUID, user_id: UUID) -> bool:
        return (
            self.db.query(GroupEventAttendee)
            .filter(
                and_(
                    GroupEventAttendee.event_id == event_id,
                    GroupEventAttendee.user_id == user_id,
                    GroupEventAttendee.status == "going",
                )
            )
            .first()
            is not None
        )

    # Polls
    def create_poll(self, group_id: UUID, creator_id: UUID, question: str, options_json: str, expires_at=None, is_anonymous: bool = False) -> GroupPoll:
        poll = GroupPoll(
            group_id=group_id, creator_id=creator_id,
            question=question, options_json=options_json,
            expires_at=expires_at, is_anonymous=is_anonymous,
        )
        self.db.add(poll)
        self.db.commit()
        self.db.refresh(poll)
        return poll

    def get_polls(self, group_id: UUID) -> list[GroupPoll]:
        return (
            self.db.query(GroupPoll)
            .filter(GroupPoll.group_id == group_id)
            .order_by(desc(GroupPoll.created_at))
            .all()
        )

    def get_poll(self, poll_id: UUID) -> GroupPoll | None:
        return self.db.query(GroupPoll).filter(GroupPoll.id == poll_id).first()

    def vote_poll(self, poll_id: UUID, user_id: UUID, option_index: int) -> GroupPollVote:
        existing = (
            self.db.query(GroupPollVote)
            .filter(and_(GroupPollVote.poll_id == poll_id, GroupPollVote.user_id == user_id))
            .first()
        )
        if existing:
            existing.option_index = option_index
            self.db.commit()
            self.db.refresh(existing)
            return existing
        vote = GroupPollVote(user_id=user_id, poll_id=poll_id, option_index=option_index)
        self.db.add(vote)
        poll = self.db.query(GroupPoll).filter(GroupPoll.id == poll_id).first()
        if poll:
            poll.total_votes = (poll.total_votes or 0) + 1
        self.db.commit()
        self.db.refresh(vote)
        return vote

    def get_user_poll_vote(self, poll_id: UUID, user_id: UUID) -> GroupPollVote | None:
        return (
            self.db.query(GroupPollVote)
            .filter(and_(GroupPollVote.poll_id == poll_id, GroupPollVote.user_id == user_id))
            .first()
        )

    def get_poll_vote_counts(self, poll_id: UUID, num_options: int) -> list[int]:
        counts = (
            self.db.query(GroupPollVote.option_index, func.count(GroupPollVote.id))
            .filter(GroupPollVote.poll_id == poll_id)
            .group_by(GroupPollVote.option_index)
            .all()
        )
        result = [0] * num_options
        for idx, count in counts:
            if 0 <= idx < num_options:
                result[idx] = count
        return result

    # Messages
    def create_message(self, group_id: UUID, user_id: UUID, content: str, is_announcement: bool = False) -> GroupMessage:
        msg = GroupMessage(group_id=group_id, user_id=user_id, content=content, is_announcement=is_announcement)
        self.db.add(msg)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def get_messages(self, group_id: UUID, limit: int = 50, offset: int = 0) -> list[GroupMessage]:
        return (
            self.db.query(GroupMessage)
            .filter(GroupMessage.group_id == group_id)
            .order_by(desc(GroupMessage.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def delete_message(self, message_id: UUID) -> bool:
        msg = self.db.query(GroupMessage).filter(GroupMessage.id == message_id).first()
        if msg:
            self.db.delete(msg)
            self.db.commit()
            return True
        return False
