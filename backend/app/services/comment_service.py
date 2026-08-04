import json
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.repositories.comment_repository import CommentRepository
from app.repositories.feed_repository import FeedRepository
from app.models.models import Friendship, PrivacySetting, User
from app.services.notification_service import NotificationService
from app.schemas.comment import (
    CommentCreate,
    CommentUpdate,
    CommentReactionCreate,
    CommentReportCreate,
    CommentResponse,
    CommentListResponse,
    CommentReactionResponse,
    CommentAuthor,
)


class CommentService:
    def __init__(self, db: Session):
        self.db = db
        self.comment_repo = CommentRepository(db)
        self.feed_repo = FeedRepository(db)

    def _are_friends(self, user_id: UUID, other_user_id: UUID) -> bool:
        return self.db.query(Friendship).filter(
            and_(
                or_(
                    and_(Friendship.requester_id == user_id, Friendship.addressee_id == other_user_id),
                    and_(Friendship.requester_id == other_user_id, Friendship.addressee_id == user_id),
                ),
                Friendship.status == "accepted",
            )
        ).first() is not None

    def _get_post_author_privacy(self, post) -> PrivacySetting | None:
        return self.db.query(PrivacySetting).filter(
            PrivacySetting.user_id == post.user_id
        ).first()

    def _can_comment(self, commenter_id: UUID, post, privacy: PrivacySetting | None) -> bool:
        if post.user_id == commenter_id:
            return True
        if not privacy:
            return True
        setting = privacy.comment_privacy
        if setting == "everyone":
            return True
        if setting == "friends":
            return self._are_friends(commenter_id, post.user_id)
        return False

    def _filter_comments_by_privacy(self, comments, post_author_id: UUID, viewer_id: UUID | None, privacy: PrivacySetting | None) -> list:
        if not viewer_id or post_author_id == viewer_id:
            return comments
        if not privacy:
            return comments
        setting = privacy.comment_privacy
        if setting == "everyone":
            return comments
        if setting == "friends":
            if self._are_friends(viewer_id, post_author_id):
                return comments
            return [c for c in comments if c.user_id == post_author_id]
        return [c for c in comments if c.user_id == post_author_id]

    def _can_mention(self, mentioner_id: UUID, target_user_id: UUID) -> bool:
        if mentioner_id == target_user_id:
            return True
        privacy = self.db.query(PrivacySetting).filter(
            PrivacySetting.user_id == target_user_id
        ).first()
        if not privacy:
            return True
        setting = privacy.mention_permissions
        if setting == "everyone":
            return True
        if setting == "friends":
            return self._are_friends(mentioner_id, target_user_id)
        return False

    def _enrich_comment(self, comment, user_id: UUID | None = None) -> CommentResponse:
        author = CommentAuthor(
            id=str(comment.user_id),
            full_name=comment.user.full_name if comment.user else None,
            username=comment.user.username if comment.user else None,
            avatar_url=comment.user.avatar_url if comment.user else None,
            is_verified=comment.user.is_verified if comment.user else False,
        )

        mentions = None
        if comment.mentions:
            try:
                mentions = json.loads(comment.mentions)
            except (json.JSONDecodeError, TypeError):
                mentions = None

        reactions = []
        has_reacted = False
        if hasattr(comment, '_has_reacted'):
            has_reacted = comment._has_reacted

        db_reactions = self.comment_repo.get_reactions(comment.id)
        for r in db_reactions:
            r_author = CommentAuthor(
                id=str(r.user_id),
                full_name=r.user.full_name if r.user else None,
                username=r.user.username if r.user else None,
                avatar_url=r.user.avatar_url if r.user else None,
                is_verified=r.user.is_verified if r.user else False,
            )
            reactions.append(CommentReactionResponse(
                id=r.id,
                user_id=r.user_id,
                emoji=r.emoji,
                created_at=r.created_at,
                user=r_author,
            ))

        return CommentResponse(
            id=comment.id,
            post_id=comment.post_id,
            user_id=comment.user_id,
            parent_id=comment.parent_id,
            content=comment.content,
            mentions=mentions,
            is_pinned=comment.is_pinned,
            is_hidden=comment.is_hidden,
            is_deleted=comment.is_deleted,
            replies_count=comment.replies_count,
            reactions_count=comment.reactions_count,
            author=author,
            reactions=reactions,
            has_reacted=has_reacted,
            created_at=comment.created_at,
            updated_at=comment.updated_at,
        )

    def create_comment(self, user_id: UUID, post_id: UUID, data: CommentCreate) -> CommentResponse:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise ValueError("Post not found")

        privacy = self._get_post_author_privacy(post)
        if not self._can_comment(user_id, post, privacy):
            raise ValueError("You are not allowed to comment on this post")

        allowed_mentions = None
        if data.mentions:
            allowed_mentions = [m for m in data.mentions if self._can_mention(user_id, m)]

        comment = self.comment_repo.create_comment(
            post_id=post_id,
            user_id=user_id,
            content=data.content,
            parent_id=UUID(data.parent_id) if data.parent_id else None,
            mentions=allowed_mentions,
        )

        post.comments_count = self.comment_repo.get_comment_count(post_id)
        self.db.commit()

        if post.user_id != user_id:
            try:
                svc = NotificationService(self.db)
                svc.create_notification(
                    user_id=post.user_id,
                    actor_id=user_id,
                    type="comment",
                    entity_type="comment",
                    entity_id=comment.id,
                    entity_user_id=user_id,
                    content=data.content[:200] if data.content else None,
                )
            except Exception:
                pass

        return self._enrich_comment(comment, user_id)

    def get_post_comments(self, post_id: UUID, user_id: UUID | None = None, cursor: str | None = None) -> CommentListResponse:
        cursor_uuid = UUID(cursor) if cursor else None
        comments, has_more = self.comment_repo.get_post_comments(post_id, user_id, cursor_uuid)

        post = self.feed_repo.get_post_by_id(post_id)
        if post:
            privacy = self._get_post_author_privacy(post)
            comments = self._filter_comments_by_privacy(comments, post.user_id, user_id, privacy)

        enriched = [self._enrich_comment(c, user_id) for c in comments]
        total = self.comment_repo.get_comment_count(post_id)

        return CommentListResponse(
            comments=enriched,
            total=total,
            has_more=has_more,
        )

    def get_comment_replies(self, comment_id: UUID, user_id: UUID | None = None, cursor: str | None = None) -> CommentListResponse:
        cursor_uuid = UUID(cursor) if cursor else None
        replies, has_more = self.comment_repo.get_comment_replies(comment_id, user_id, cursor_uuid)

        enriched = [self._enrich_comment(r, user_id) for r in replies]

        return CommentListResponse(
            comments=enriched,
            total=len(replies),
            has_more=has_more,
        )

    def update_comment(self, user_id: UUID, comment_id: UUID, data: CommentUpdate) -> CommentResponse:
        comment = self.comment_repo.update_comment(comment_id, user_id, data.content)
        if not comment:
            raise ValueError("Comment not found or not authorized")
        return self._enrich_comment(comment, user_id)

    def delete_comment(self, user_id: UUID, comment_id: UUID) -> bool:
        comment = self.comment_repo.get_comment(comment_id)
        if not comment:
            return False

        success = self.comment_repo.delete_comment(comment_id, user_id)
        if success:
            post = self.feed_repo.get_post(comment.post_id)
            if post:
                post.comments_count = self.comment_repo.get_comment_count(comment.post_id)
                self.db.commit()
        return success

    def pin_comment(self, user_id: UUID, comment_id: UUID, post_id: UUID) -> CommentResponse:
        comment = self.comment_repo.pin_comment(comment_id, post_id, user_id)
        if not comment:
            raise ValueError("Comment not found or not authorized")
        return self._enrich_comment(comment, user_id)

    def unpin_comment(self, user_id: UUID, comment_id: UUID, post_id: UUID) -> CommentResponse:
        comment = self.comment_repo.unpin_comment(comment_id, post_id, user_id)
        if not comment:
            raise ValueError("Comment not found or not authorized")
        return self._enrich_comment(comment, user_id)

    def hide_comment(self, user_id: UUID, comment_id: UUID) -> CommentResponse:
        comment = self.comment_repo.hide_comment(comment_id, user_id)
        if not comment:
            raise ValueError("Comment not found or not authorized")
        return self._enrich_comment(comment, user_id)

    def unhide_comment(self, user_id: UUID, comment_id: UUID) -> CommentResponse:
        comment = self.comment_repo.unhide_comment(comment_id, user_id)
        if not comment:
            raise ValueError("Comment not found or not authorized")
        return self._enrich_comment(comment, user_id)

    def toggle_reaction(self, user_id: UUID, comment_id: UUID, data: CommentReactionCreate) -> CommentReactionResponse | None:
        comment = self.comment_repo.get_comment(comment_id)
        if not comment:
            raise ValueError("Comment not found")

        reaction = self.comment_repo.add_reaction(comment_id, user_id, data.emoji)

        if reaction is None:
            return None

        author = CommentAuthor(
            id=str(reaction.user_id),
            full_name=reaction.user.full_name if reaction.user else None,
            username=reaction.user.username if reaction.user else None,
            avatar_url=reaction.user.avatar_url if reaction.user else None,
            is_verified=reaction.user.is_verified if reaction.user else False,
        )

        return CommentReactionResponse(
            id=reaction.id,
            user_id=reaction.user_id,
            emoji=reaction.emoji,
            created_at=reaction.created_at,
            user=author,
        )

    def report_comment(self, user_id: UUID, comment_id: UUID, data: CommentReportCreate):
        comment = self.comment_repo.get_comment(comment_id)
        if not comment:
            raise ValueError("Comment not found")

        return self.comment_repo.report_comment(
            comment_id=comment_id,
            reporter_id=user_id,
            reason=data.reason,
            description=data.description,
        )
