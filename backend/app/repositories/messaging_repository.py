from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func
from app.models import (
    Conversation, ConversationMember, Message, MessageReaction, MessageRead,
    MessageTyping, OnlineStatus, User, BlockedUser, Friendship
)


class MessagingRepository:
    def __init__(self, db: Session):
        self.db = db

    def _get_blocked_user_ids(self, user_id: UUID) -> list[UUID]:
        blocked_by = self.db.query(BlockedUser.blocked_user_id).filter(
            BlockedUser.user_id == user_id, BlockedUser.block_type == "block"
        ).all()
        blocking = self.db.query(BlockedUser.user_id).filter(
            BlockedUser.blocked_user_id == user_id, BlockedUser.block_type == "block"
        ).all()
        return list(set([b[0] for b in blocked_by] + [b[0] for b in blocking]))

    def get_user_conversations(self, user_id: UUID) -> list[Conversation]:
        return (
            self.db.query(Conversation)
            .join(ConversationMember, ConversationMember.conversation_id == Conversation.id)
            .filter(
                ConversationMember.user_id == user_id,
                ConversationMember.is_left == False,
            )
            .options(
                joinedload(Conversation.members).joinedload(ConversationMember.user),
            )
            .order_by(desc(Conversation.last_message_at))
            .all()
        )

    def get_conversation_by_id(self, conversation_id: UUID) -> Conversation | None:
        return (
            self.db.query(Conversation)
            .filter(Conversation.id == conversation_id)
            .options(
                joinedload(Conversation.members).joinedload(ConversationMember.user),
            )
            .first()
        )

    def is_member(self, conversation_id: UUID, user_id: UUID) -> bool:
        return (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
                ConversationMember.is_left == False,
            )
            .first()
            is not None
        )

    def create_conversation(
        self,
        creator_id: UUID,
        participant_ids: list[UUID],
        title: str | None = None,
        is_group: bool = False,
        group_photo_url: str | None = None,
    ) -> Conversation:
        conversation = Conversation(
            title=title,
            is_group=is_group,
            group_photo_url=group_photo_url,
            created_by_id=creator_id,
        )
        self.db.add(conversation)
        self.db.flush()

        all_members = set(participant_ids + [creator_id])
        for uid in all_members:
            role = "admin" if uid == creator_id else "member"
            member = ConversationMember(
                conversation_id=conversation.id,
                user_id=uid,
                role=role,
            )
            self.db.add(member)

        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def find_direct_conversation(self, user1_id: UUID, user2_id: UUID) -> Conversation | None:
        user1_convs = (
            self.db.query(ConversationMember.conversation_id)
            .filter(ConversationMember.user_id == user1_id, ConversationMember.is_left == False)
            .subquery()
        )
        return (
            self.db.query(Conversation)
            .join(ConversationMember, ConversationMember.conversation_id == Conversation.id)
            .filter(
                Conversation.is_group == False,
                ConversationMember.user_id == user2_id,
                Conversation.id.in_(user1_convs),
            )
            .first()
        )

    def add_member(self, conversation_id: UUID, user_id: UUID, role: str = "member") -> ConversationMember:
        existing = (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
            .first()
        )
        if existing:
            if existing.is_left:
                existing.is_left = False
                existing.left_at = None
                self.db.commit()
                self.db.refresh(existing)
            return existing

        member = ConversationMember(
            conversation_id=conversation_id,
            user_id=user_id,
            role=role,
        )
        self.db.add(member)
        self.db.commit()
        self.db.refresh(member)
        return member

    def remove_member(self, conversation_id: UUID, user_id: UUID) -> bool:
        member = (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
            .first()
        )
        if not member:
            return False
        member.is_left = True
        member.left_at = datetime.now(timezone.utc)
        self.db.commit()
        return True

    def update_conversation(self, conversation_id: UUID, **kwargs) -> Conversation | None:
        conv = self.get_conversation_by_id(conversation_id)
        if not conv:
            return None
        for key, value in kwargs.items():
            if hasattr(conv, key):
                setattr(conv, key, value)
        self.db.commit()
        self.db.refresh(conv)
        return conv

    def get_conversation_messages(
        self, conversation_id: UUID, limit: int = 50, offset: int = 0
    ) -> list[Message]:
        return (
            self.db.query(Message)
            .filter(
                Message.conversation_id == conversation_id,
                Message.is_unsent == False,
            )
            .options(
                joinedload(Message.sender),
                joinedload(Message.reactions).joinedload(MessageReaction.user),
                joinedload(Message.reads).joinedload(MessageRead.user),
                joinedload(Message.reply_to).joinedload(Message.sender),
            )
            .order_by(desc(Message.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )

    def get_message_by_id(self, message_id: UUID) -> Message | None:
        return (
            self.db.query(Message)
            .filter(Message.id == message_id)
            .options(
                joinedload(Message.sender),
                joinedload(Message.reactions).joinedload(MessageReaction.user),
                joinedload(Message.reads).joinedload(MessageRead.user),
                joinedload(Message.reply_to).joinedload(Message.sender),
            )
            .first()
        )

    def create_message(self, conversation_id: UUID, sender_id: UUID, **kwargs) -> Message:
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            **kwargs,
        )
        self.db.add(message)
        self.db.flush()

        conv = self.db.query(Conversation).filter(Conversation.id == conversation_id).first()
        if conv:
            conv.last_message_id = message.id
            conv.last_message_at = message.created_at

        self.db.commit()
        self.db.refresh(message)
        return message

    def update_message(self, message_id: UUID, **kwargs) -> Message | None:
        msg = self.get_message_by_id(message_id)
        if not msg:
            return None
        for key, value in kwargs.items():
            if hasattr(msg, key):
                setattr(msg, key, value)
        self.db.commit()
        self.db.refresh(msg)
        return msg

    def delete_message(self, message_id: UUID) -> bool:
        msg = self.get_message_by_id(message_id)
        if not msg:
            return False
        msg.is_deleted = True
        msg.content = None
        msg.media_url = None
        msg.file_name = None
        self.db.commit()
        return True

    def unsend_message(self, message_id: UUID) -> bool:
        msg = self.get_message_by_id(message_id)
        if not msg:
            return False
        msg.is_unsent = True
        self.db.commit()
        return True

    def add_reaction(self, message_id: UUID, user_id: UUID, emoji: str) -> MessageReaction:
        existing = (
            self.db.query(MessageReaction)
            .filter(
                MessageReaction.message_id == message_id,
                MessageReaction.user_id == user_id,
            )
            .first()
        )
        if existing:
            existing.emoji = emoji
            self.db.commit()
            self.db.refresh(existing)
            return existing

        reaction = MessageReaction(
            message_id=message_id,
            user_id=user_id,
            emoji=emoji,
        )
        self.db.add(reaction)
        msg = self.db.query(Message).filter(Message.id == message_id).first()
        if msg:
            msg.reactions_count += 1
        self.db.commit()
        self.db.refresh(reaction)
        return reaction

    def remove_reaction(self, message_id: UUID, user_id: UUID) -> bool:
        reaction = (
            self.db.query(MessageReaction)
            .filter(
                MessageReaction.message_id == message_id,
                MessageReaction.user_id == user_id,
            )
            .first()
        )
        if not reaction:
            return False
        self.db.delete(reaction)
        msg = self.db.query(Message).filter(Message.id == message_id).first()
        if msg and msg.reactions_count > 0:
            msg.reactions_count -= 1
        self.db.commit()
        return True

    def mark_as_read(self, message_id: UUID, user_id: UUID) -> MessageRead | None:
        existing = (
            self.db.query(MessageRead)
            .filter(
                MessageRead.message_id == message_id,
                MessageRead.user_id == user_id,
            )
            .first()
        )
        if existing:
            return existing

        read = MessageRead(
            message_id=message_id,
            user_id=user_id,
        )
        self.db.add(read)

        member = (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == (
                    self.db.query(Message.conversation_id).filter(Message.id == message_id).scalar_subquery()
                ),
                ConversationMember.user_id == user_id,
            )
            .first()
        )
        if member:
            member.last_read_at = datetime.now(timezone.utc)

        self.db.commit()
        self.db.refresh(read)
        return read

    def get_unread_count(self, conversation_id: UUID, user_id: UUID) -> int:
        member = (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
            .first()
        )
        if not member or not member.last_read_at:
            return (
                self.db.query(Message)
                .filter(
                    Message.conversation_id == conversation_id,
                    Message.sender_id != user_id,
                    Message.is_unsent == False,
                )
                .count()
            )
        return (
            self.db.query(Message)
            .filter(
                Message.conversation_id == conversation_id,
                Message.sender_id != user_id,
                Message.is_unsent == False,
                Message.created_at > member.last_read_at,
            )
            .count()
        )

    def set_typing(self, conversation_id: UUID, user_id: UUID, is_typing: bool) -> None:
        existing = (
            self.db.query(MessageTyping)
            .filter(
                MessageTyping.conversation_id == conversation_id,
                MessageTyping.user_id == user_id,
            )
            .first()
        )
        if existing:
            existing.is_typing = is_typing
        else:
            typing = MessageTyping(
                conversation_id=conversation_id,
                user_id=user_id,
                is_typing=is_typing,
            )
            self.db.add(typing)
        self.db.commit()

    def get_typing_users(self, conversation_id: UUID) -> list[MessageTyping]:
        return (
            self.db.query(MessageTyping)
            .filter(
                MessageTyping.conversation_id == conversation_id,
                MessageTyping.is_typing == True,
            )
            .options(joinedload(MessageTyping.user))
            .all()
        )

    def update_online_status(self, user_id: UUID, is_online: bool, status_text: str | None = None) -> None:
        existing = (
            self.db.query(OnlineStatus)
            .filter(OnlineStatus.user_id == user_id)
            .first()
        )
        if existing:
            existing.is_online = is_online
            existing.last_seen_at = datetime.now(timezone.utc)
            if status_text is not None:
                existing.status_text = status_text
        else:
            status = OnlineStatus(
                user_id=user_id,
                is_online=is_online,
                last_seen_at=datetime.now(timezone.utc),
                status_text=status_text,
            )
            self.db.add(status)
        self.db.commit()

    def get_online_status(self, user_id: UUID) -> OnlineStatus | None:
        return (
            self.db.query(OnlineStatus)
            .filter(OnlineStatus.user_id == user_id)
            .first()
        )

    def get_online_statuses(self, user_ids: list[UUID]) -> list[OnlineStatus]:
        if not user_ids:
            return []
        return (
            self.db.query(OnlineStatus)
            .filter(OnlineStatus.user_id.in_(user_ids))
            .all()
        )

    def search_messages(self, query: str, user_id: UUID, conversation_id: UUID | None = None, limit: int = 50, offset: int = 0) -> tuple[list[Message], int]:
        base_filter = [
            Message.is_deleted == False,
            Message.is_unsent == False,
            Message.content.ilike(f"%{query}%"),
        ]

        user_conv_ids = [
            cm.conversation_id
            for cm in self.db.query(ConversationMember.conversation_id)
            .filter(ConversationMember.user_id == user_id, ConversationMember.is_left == False)
            .all()
        ]

        base_filter.append(Message.conversation_id.in_(user_conv_ids))

        if conversation_id:
            base_filter.append(Message.conversation_id == conversation_id)

        total = self.db.query(Message).filter(and_(*base_filter)).count()
        messages = (
            self.db.query(Message)
            .filter(and_(*base_filter))
            .options(
                joinedload(Message.sender),
                joinedload(Message.conversation),
            )
            .order_by(desc(Message.created_at))
            .offset(offset)
            .limit(limit)
            .all()
        )
        return messages, total

    def get_conversation_member_ids(self, conversation_id: UUID) -> list[UUID]:
        return [
            cm.user_id
            for cm in self.db.query(ConversationMember.user_id)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.is_left == False,
            )
            .all()
        ]

    def toggle_conversation_pin(self, conversation_id: UUID, user_id: UUID, is_pinned: bool) -> None:
        member = (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
            .first()
        )
        if member:
            member.is_pinned = is_pinned
            self.db.commit()

    def toggle_conversation_archive(self, conversation_id: UUID, user_id: UUID, is_archived: bool) -> None:
        member = (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
            .first()
        )
        if member:
            member.is_archived = is_archived
            self.db.commit()

    def toggle_conversation_mute(self, conversation_id: UUID, user_id: UUID, is_muted: bool) -> None:
        member = (
            self.db.query(ConversationMember)
            .filter(
                ConversationMember.conversation_id == conversation_id,
                ConversationMember.user_id == user_id,
            )
            .first()
        )
        if member:
            member.is_muted = is_muted
            self.db.commit()

    def get_pinned_conversations(self, user_id: UUID) -> list[Conversation]:
        return (
            self.db.query(Conversation)
            .join(ConversationMember, ConversationMember.conversation_id == Conversation.id)
            .filter(
                ConversationMember.user_id == user_id,
                ConversationMember.is_pinned == True,
                ConversationMember.is_left == False,
            )
            .options(joinedload(Conversation.members).joinedload(ConversationMember.user))
            .order_by(desc(Conversation.last_message_at))
            .all()
        )

    def get_archived_conversations(self, user_id: UUID) -> list[Conversation]:
        return (
            self.db.query(Conversation)
            .join(ConversationMember, ConversationMember.conversation_id == Conversation.id)
            .filter(
                ConversationMember.user_id == user_id,
                ConversationMember.is_archived == True,
                ConversationMember.is_left == False,
            )
            .options(joinedload(Conversation.members).joinedload(ConversationMember.user))
            .order_by(desc(Conversation.last_message_at))
            .all()
        )

    def add_members_to_group(self, conversation_id: UUID, user_ids: list[UUID]) -> list[ConversationMember]:
        members = []
        for uid in user_ids:
            member = self.add_member(conversation_id, uid, role="member")
            members.append(member)
        return members
