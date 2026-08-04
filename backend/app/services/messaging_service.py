from uuid import UUID
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.repositories.messaging_repository import MessagingRepository
from app.schemas.messaging import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationMemberResponse,
    MessageCreate,
    MessageUpdate,
    MessageResponse,
    MessageReactionResponse,
    MessageReadResponse,
    TypingIndicatorResponse,
    OnlineStatusResponse,
    OnlineStatusUpdate,
    MessageSearchResult,
)
from app.models import User, BlockedUser, Friendship
from sqlalchemy import and_, or_


class MessagingService:
    def __init__(self, db: Session):
        self.db = db
        self.repo = MessagingRepository(db)

    def _get_user_display(self, user: User | None) -> dict:
        if not user:
            return {"sender_name": "Unknown", "sender_avatar": None}
        return {
            "sender_name": user.full_name or user.username or "Unknown",
            "sender_avatar": user.avatar_url,
        }

    def _get_member_display(self, member) -> ConversationMemberResponse:
        user = self.db.query(User).filter(User.id == member.user_id).first()
        online_status = self.repo.get_online_status(member.user_id)
        return ConversationMemberResponse(
            id=member.id,
            user_id=member.user_id,
            role=member.role,
            is_muted=member.is_muted,
            is_notifications_paused=member.is_notifications_paused,
            is_pinned=member.is_pinned,
            is_archived=member.is_archived,
            last_read_at=member.last_read_at,
            joined_at=member.joined_at,
            is_left=member.is_left,
            username=user.username if user else None,
            full_name=user.full_name if user else None,
            avatar_url=user.avatar_url if user else None,
            is_online=online_status.is_online if online_status else False,
            last_seen_at=online_status.last_seen_at if online_status else None,
        )

    def _check_blocked(self, user1_id: UUID, user2_id: UUID) -> bool:
        return (
            self.db.query(BlockedUser)
            .filter(
                or_(
                    and_(BlockedUser.user_id == user1_id, BlockedUser.blocked_user_id == user2_id),
                    and_(BlockedUser.user_id == user2_id, BlockedUser.blocked_user_id == user1_id),
                )
            )
            .first()
            is not None
        )

    def _check_friends(self, user1_id: UUID, user2_id: UUID) -> bool:
        return (
            self.db.query(Friendship)
            .filter(
                and_(
                    or_(
                        Friendship.requester_id == user1_id,
                        Friendship.addressee_id == user1_id,
                    ),
                    or_(
                        Friendship.requester_id == user2_id,
                        Friendship.addressee_id == user2_id,
                    ),
                    Friendship.status == "accepted",
                )
            )
            .first()
            is not None
        )

    def _message_to_response(self, msg) -> MessageResponse:
        user = self.db.query(User).filter(User.id == msg.sender_id).first() if msg.sender_id else None
        display = self._get_user_display(user)

        reactions = []
        if msg.reactions:
            for r in msg.reactions:
                r_user = self.db.query(User).filter(User.id == r.user_id).first()
                reactions.append(MessageReactionResponse(
                    id=r.id,
                    message_id=r.message_id,
                    user_id=r.user_id,
                    emoji=r.emoji,
                    created_at=r.created_at,
                    username=r_user.username if r_user else None,
                ))

        reads = []
        if msg.reads:
            for rd in msg.reads:
                rd_user = self.db.query(User).filter(User.id == rd.user_id).first()
                reads.append(MessageReadResponse(
                    id=rd.id,
                    message_id=rd.message_id,
                    user_id=rd.user_id,
                    created_at=rd.created_at,
                    username=rd_user.username if rd_user else None,
                ))

        reply_preview = None
        if msg.reply_to:
            reply_preview = self._message_to_response(msg.reply_to)

        return MessageResponse(
            id=msg.id,
            conversation_id=msg.conversation_id,
            sender_id=msg.sender_id,
            content=msg.content,
            message_type=msg.message_type,
            media_url=msg.media_url,
            media_id=msg.media_id,
            thumbnail_url=msg.thumbnail_url,
            file_name=msg.file_name,
            file_size=msg.file_size,
            mime_type=msg.mime_type,
            duration=msg.duration,
            reply_to_id=msg.reply_to_id,
            is_edited=msg.is_edited,
            is_deleted=msg.is_deleted,
            is_unsent=msg.is_unsent,
            reactions_count=msg.reactions_count,
            reply_count=msg.reply_count,
            is_forwarded=msg.is_forwarded,
            forwarded_from_id=msg.forwarded_from_id,
            metadata_json=msg.metadata_json,
            created_at=msg.created_at,
            updated_at=msg.updated_at,
            sender_name=display["sender_name"],
            sender_avatar=display["sender_avatar"],
            reactions=reactions,
            read_by=reads,
            reply_to_preview=reply_preview,
        )

    def _conversation_to_response(self, conv, user_id: UUID) -> ConversationResponse:
        members = [self._get_member_display(m) for m in conv.members if not m.is_left]
        unread_count = self.repo.get_unread_count(conv.id, user_id)

        last_msg_content = None
        last_msg_sender = None
        if conv.last_message_id:
            last_msg = self.repo.get_message_by_id(conv.last_message_id)
            if last_msg and not last_msg.is_unsent:
                last_msg_content = last_msg.content
                sender = self.db.query(User).filter(User.id == last_msg.sender_id).first() if last_msg.sender_id else None
                last_msg_sender = sender.full_name if sender else None

        return ConversationResponse(
            id=conv.id,
            title=conv.title,
            is_group=conv.is_group,
            group_photo_url=conv.group_photo_url,
            created_by_id=conv.created_by_id,
            last_message_id=conv.last_message_id,
            last_message_at=conv.last_message_at,
            is_archived=conv.is_archived,
            is_pinned=conv.is_pinned,
            chat_theme=conv.chat_theme,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            members=members,
            unread_count=unread_count,
            last_message_content=last_msg_content,
            last_message_sender_name=last_msg_sender,
        )

    # ---- Conversation Methods ----

    def get_conversations(self, user_id: UUID) -> list[ConversationResponse]:
        convs = self.repo.get_user_conversations(user_id)
        return [self._conversation_to_response(c, user_id) for c in convs]

    def get_conversation(self, conversation_id: UUID, user_id: UUID) -> ConversationResponse:
        conv = self.repo.get_conversation_by_id(conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member of this conversation")
        return self._conversation_to_response(conv, user_id)

    def create_conversation(self, user_id: UUID, data: ConversationCreate) -> ConversationResponse:
        if not data.participant_ids:
            raise HTTPException(status_code=400, detail="At least one participant is required")

        for pid in data.participant_ids:
            if self._check_blocked(user_id, pid):
                raise HTTPException(status_code=403, detail="Cannot create conversation with blocked user")

        if not data.is_group and len(data.participant_ids) == 1:
            existing = self.repo.find_direct_conversation(user_id, data.participant_ids[0])
            if existing:
                return self._conversation_to_response(existing, user_id)

        conv = self.repo.create_conversation(
            creator_id=user_id,
            participant_ids=data.participant_ids,
            title=data.title,
            is_group=data.is_group,
        )
        conv = self.repo.get_conversation_by_id(conv.id)
        return self._conversation_to_response(conv, user_id)

    def update_conversation(self, conversation_id: UUID, user_id: UUID, data: ConversationUpdate) -> ConversationResponse:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        update_data = data.model_dump(exclude_unset=True)
        conv = self.repo.update_conversation(conversation_id, **update_data)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        conv = self.repo.get_conversation_by_id(conversation_id)
        return self._conversation_to_response(conv, user_id)

    def delete_conversation(self, conversation_id: UUID, user_id: UUID) -> None:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        self.repo.remove_member(conversation_id, user_id)

    def add_members(self, conversation_id: UUID, user_id: UUID, user_ids: list[UUID]) -> ConversationResponse:
        conv = self.repo.get_conversation_by_id(conversation_id)
        if not conv:
            raise HTTPException(status_code=404, detail="Conversation not found")
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        if not conv.is_group:
            raise HTTPException(status_code=400, detail="Cannot add members to direct conversation")
        for uid in user_ids:
            if self._check_blocked(user_id, uid):
                raise HTTPException(status_code=403, detail="Cannot add blocked user")
        self.repo.add_members_to_group(conversation_id, user_ids)
        conv = self.repo.get_conversation_by_id(conversation_id)
        return self._conversation_to_response(conv, user_id)

    def remove_member(self, conversation_id: UUID, user_id: UUID, target_user_id: UUID) -> None:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        conv = self.repo.get_conversation_by_id(conversation_id)
        if conv and conv.is_group:
            member = next((m for m in conv.members if m.user_id == user_id), None)
            if not member or (member.role != "admin" and user_id != target_user_id):
                raise HTTPException(status_code=403, detail="Not authorized")
        self.repo.remove_member(conversation_id, target_user_id)

    def get_pinned_conversations(self, user_id: UUID) -> list[ConversationResponse]:
        convs = self.repo.get_pinned_conversations(user_id)
        return [self._conversation_to_response(c, user_id) for c in convs]

    def get_archived_conversations(self, user_id: UUID) -> list[ConversationResponse]:
        convs = self.repo.get_archived_conversations(user_id)
        return [self._conversation_to_response(c, user_id) for c in convs]

    def toggle_pin(self, conversation_id: UUID, user_id: UUID, is_pinned: bool) -> None:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        self.repo.toggle_conversation_pin(conversation_id, user_id, is_pinned)

    def toggle_archive(self, conversation_id: UUID, user_id: UUID, is_archived: bool) -> None:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        self.repo.toggle_conversation_archive(conversation_id, user_id, is_archived)

    def toggle_mute(self, conversation_id: UUID, user_id: UUID, is_muted: bool) -> None:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        self.repo.toggle_conversation_mute(conversation_id, user_id, is_muted)

    # ---- Message Methods ----

    def get_messages(self, conversation_id: UUID, user_id: UUID, limit: int = 50, offset: int = 0) -> list[MessageResponse]:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        messages = self.repo.get_conversation_messages(conversation_id, limit, offset)
        return [self._message_to_response(m) for m in reversed(messages)]

    def send_message(self, conversation_id: UUID, user_id: UUID, data: MessageCreate) -> MessageResponse:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")

        if data.reply_to_id:
            reply_msg = self.repo.get_message_by_id(data.reply_to_id)
            if not reply_msg or reply_msg.conversation_id != conversation_id:
                raise HTTPException(status_code=400, detail="Invalid reply message")

        msg = self.repo.create_message(
            conversation_id=conversation_id,
            sender_id=user_id,
            content=data.content,
            message_type=data.message_type,
            media_url=data.media_url,
            thumbnail_url=data.thumbnail_url,
            file_name=data.file_name,
            file_size=data.file_size,
            mime_type=data.mime_type,
            duration=data.duration,
            reply_to_id=data.reply_to_id,
            metadata_json=data.metadata_json,
        )
        return self._message_to_response(msg)

    def update_message(self, message_id: UUID, user_id: UUID, data: MessageUpdate) -> MessageResponse:
        msg = self.repo.get_message_by_id(message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        if msg.sender_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        if msg.is_deleted:
            raise HTTPException(status_code=400, detail="Message is deleted")
        updated = self.repo.update_message(message_id, content=data.content, is_edited=True)
        return self._message_to_response(updated)

    def delete_message(self, message_id: UUID, user_id: UUID) -> None:
        msg = self.repo.get_message_by_id(message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        if msg.sender_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.repo.delete_message(message_id)

    def unsend_message(self, message_id: UUID, user_id: UUID) -> None:
        msg = self.repo.get_message_by_id(message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        if msg.sender_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        self.repo.unsend_message(message_id)

    def add_reaction(self, message_id: UUID, user_id: UUID, emoji: str) -> MessageReactionResponse:
        msg = self.repo.get_message_by_id(message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        if not self.repo.is_member(msg.conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        reaction = self.repo.add_reaction(message_id, user_id, emoji)
        user = self.db.query(User).filter(User.id == user_id).first()
        return MessageReactionResponse(
            id=reaction.id,
            message_id=reaction.message_id,
            user_id=reaction.user_id,
            emoji=reaction.emoji,
            created_at=reaction.created_at,
            username=user.username if user else None,
        )

    def remove_reaction(self, message_id: UUID, user_id: UUID) -> None:
        self.repo.remove_reaction(message_id, user_id)

    def mark_as_read(self, message_id: UUID, user_id: UUID) -> None:
        msg = self.repo.get_message_by_id(message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        if not self.repo.is_member(msg.conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        self.repo.mark_as_read(message_id, user_id)

    # ---- Typing / Online ----

    def set_typing(self, conversation_id: UUID, user_id: UUID, is_typing: bool) -> TypingIndicatorResponse:
        if not self.repo.is_member(conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")
        self.repo.set_typing(conversation_id, user_id, is_typing)
        user = self.db.query(User).filter(User.id == user_id).first()
        return TypingIndicatorResponse(
            user_id=user_id,
            conversation_id=conversation_id,
            is_typing=is_typing,
            username=user.username if user else None,
        )

    def get_typing_users(self, conversation_id: UUID) -> list[TypingIndicatorResponse]:
        typing = self.repo.get_typing_users(conversation_id)
        results = []
        for t in typing:
            user = self.db.query(User).filter(User.id == t.user_id).first()
            results.append(TypingIndicatorResponse(
                user_id=t.user_id,
                conversation_id=t.conversation_id,
                is_typing=t.is_typing,
                username=user.username if user else None,
                created_at=t.created_at,
            ))
        return results

    def update_online_status(self, user_id: UUID, data: OnlineStatusUpdate) -> None:
        self.repo.update_online_status(user_id, data.is_online, data.status_text)

    def get_online_status(self, user_id: UUID) -> OnlineStatusResponse | None:
        status = self.repo.get_online_status(user_id)
        if not status:
            return OnlineStatusResponse(
                user_id=user_id,
                is_online=False,
                last_seen_at=None,
                status_text=None,
            )
        return OnlineStatusResponse.model_validate(status)

    # ---- Search ----

    def search_messages(self, query: str, user_id: UUID, conversation_id: UUID | None = None, limit: int = 50, offset: int = 0) -> MessageSearchResult:
        messages, total = self.repo.search_messages(query, user_id, conversation_id, limit, offset)
        return MessageSearchResult(
            messages=[self._message_to_response(m) for m in messages],
            total_count=total,
        )

    # ---- Forward ----

    def forward_message(self, message_id: UUID, user_id: UUID, conversation_ids: list[UUID]) -> list[MessageResponse]:
        msg = self.repo.get_message_by_id(message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        if not self.repo.is_member(msg.conversation_id, user_id):
            raise HTTPException(status_code=403, detail="Not a member")

        forwarded = []
        for cid in conversation_ids:
            if self.repo.is_member(cid, user_id):
                new_msg = self.repo.create_message(
                    conversation_id=cid,
                    sender_id=user_id,
                    content=msg.content,
                    message_type=msg.message_type,
                    media_url=msg.media_url,
                    thumbnail_url=msg.thumbnail_url,
                    file_name=msg.file_name,
                    file_size=msg.file_size,
                    mime_type=msg.mime_type,
                    is_forwarded=True,
                    forwarded_from_id=message_id,
                )
                forwarded.append(self._message_to_response(new_msg))
        return forwarded

    # ---- Read Receipts ----

    def get_message_read_receipts(self, message_id: UUID, user_id: UUID) -> list[MessageReadResponse]:
        msg = self.repo.get_message_by_id(message_id)
        if not msg:
            raise HTTPException(status_code=404, detail="Message not found")
        if msg.sender_id != user_id:
            raise HTTPException(status_code=403, detail="Only sender can view read receipts")
        reads = []
        for rd in (msg.reads or []):
            rd_user = self.db.query(User).filter(User.id == rd.user_id).first()
            reads.append(MessageReadResponse(
                id=rd.id,
                message_id=rd.message_id,
                user_id=rd.user_id,
                created_at=rd.created_at,
                username=rd_user.username if rd_user else None,
            ))
        return reads
