import json
from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from app.models.models import Comment, CommentReaction, CommentReport, User


class CommentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_comment(self, post_id: UUID, user_id: UUID, content: str, parent_id: UUID | None = None, mentions: list[str] | None = None) -> Comment:
        comment = Comment(
            post_id=post_id,
            user_id=user_id,
            parent_id=parent_id,
            content=content,
            mentions=json.dumps(mentions) if mentions else None,
        )
        self.db.add(comment)

        if parent_id:
            parent = self.db.query(Comment).filter(Comment.id == parent_id).first()
            if parent:
                parent.replies_count += 1

        self.db.commit()
        self.db.refresh(comment)
        return comment

    def get_comment(self, comment_id: UUID, user_id: UUID | None = None) -> Comment | None:
        query = self.db.query(Comment).filter(Comment.id == comment_id)
        comment = query.first()
        if comment and user_id:
            reaction = self.db.query(CommentReaction).filter(
                and_(CommentReaction.comment_id == comment_id, CommentReaction.user_id == user_id)
            ).first()
            comment._has_reacted = reaction is not None
        return comment

    def get_post_comments(self, post_id: UUID, user_id: UUID | None = None, cursor: UUID | None = None, limit: int = 20) -> tuple[list[Comment], bool]:
        query = self.db.query(Comment).filter(
            and_(Comment.post_id == post_id, Comment.parent_id == None, Comment.is_deleted == False)
        )

        if cursor:
            query = query.filter(Comment.id < cursor)

        pinned = query.filter(Comment.is_pinned == True).order_by(desc(Comment.created_at)).all()
        unpinned = query.filter(Comment.is_pinned == False).order_by(desc(Comment.created_at)).limit(limit - len(pinned) + 1).all()

        has_more = len(unpinned) > limit
        if has_more:
            unpinned = unpinned[:limit]

        all_comments = pinned + unpinned

        if user_id:
            for comment in all_comments:
                reaction = self.db.query(CommentReaction).filter(
                    and_(CommentReaction.comment_id == comment.id, CommentReaction.user_id == user_id)
                ).first()
                comment._has_reacted = reaction is not None

        return all_comments, has_more

    def get_comment_replies(self, comment_id: UUID, user_id: UUID | None = None, cursor: UUID | None = None, limit: int = 20) -> tuple[list[Comment], bool]:
        query = self.db.query(Comment).filter(
            and_(Comment.parent_id == comment_id, Comment.is_deleted == False)
        )

        if cursor:
            query = query.filter(Comment.id < cursor)

        query = query.order_by(desc(Comment.created_at))
        comments = query.limit(limit + 1).all()
        has_more = len(comments) > limit
        if has_more:
            comments = comments[:limit]

        if user_id:
            for comment in comments:
                reaction = self.db.query(CommentReaction).filter(
                    and_(CommentReaction.comment_id == comment.id, CommentReaction.user_id == user_id)
                ).first()
                comment._has_reacted = reaction is not None

        return comments, has_more

    def update_comment(self, comment_id: UUID, user_id: UUID, content: str) -> Comment | None:
        comment = self.db.query(Comment).filter(
            and_(Comment.id == comment_id, Comment.user_id == user_id)
        ).first()
        if comment:
            comment.content = content
            self.db.commit()
            self.db.refresh(comment)
        return comment

    def delete_comment(self, comment_id: UUID, user_id: UUID) -> bool:
        comment = self.db.query(Comment).filter(
            and_(Comment.id == comment_id, Comment.user_id == user_id)
        ).first()
        if comment:
            comment.is_deleted = True
            comment.content = "[deleted]"
            self.db.commit()
            return True
        return False

    def pin_comment(self, comment_id: UUID, post_id: UUID, user_id: UUID) -> Comment | None:
        from app.models.models import Post
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        if not post:
            return None

        self.db.query(Comment).filter(
            and_(Comment.post_id == post_id, Comment.is_pinned == True)
        ).update({"is_pinned": False})

        comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
        if comment:
            comment.is_pinned = True
            self.db.commit()
            self.db.refresh(comment)
        return comment

    def unpin_comment(self, comment_id: UUID, post_id: UUID, user_id: UUID) -> Comment | None:
        from app.models.models import Post
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        if not post:
            return None

        comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
        if comment:
            comment.is_pinned = False
            self.db.commit()
            self.db.refresh(comment)
        return comment

    def hide_comment(self, comment_id: UUID, user_id: UUID) -> Comment | None:
        from app.models.models import Post
        comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            return None

        post = self.db.query(Post).filter(
            and_(Post.id == comment.post_id, Post.user_id == user_id)
        ).first()
        if not post:
            return None

        comment.is_hidden = True
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def unhide_comment(self, comment_id: UUID, user_id: UUID) -> Comment | None:
        from app.models.models import Post
        comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
        if not comment:
            return None

        post = self.db.query(Post).filter(
            and_(Post.id == comment.post_id, Post.user_id == user_id)
        ).first()
        if not post:
            return None

        comment.is_hidden = False
        self.db.commit()
        self.db.refresh(comment)
        return comment

    def add_reaction(self, comment_id: UUID, user_id: UUID, emoji: str) -> CommentReaction | None:
        existing = self.db.query(CommentReaction).filter(
            and_(CommentReaction.comment_id == comment_id, CommentReaction.user_id == user_id)
        ).first()
        if existing:
            if existing.emoji == emoji:
                self.db.delete(existing)
                comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
                if comment:
                    comment.reactions_count = max(0, comment.reactions_count - 1)
                self.db.commit()
                return None
            else:
                existing.emoji = emoji
                self.db.commit()
                self.db.refresh(existing)
                return existing

        reaction = CommentReaction(
            comment_id=comment_id,
            user_id=user_id,
            emoji=emoji,
        )
        self.db.add(reaction)
        comment = self.db.query(Comment).filter(Comment.id == comment_id).first()
        if comment:
            comment.reactions_count += 1
        self.db.commit()
        self.db.refresh(reaction)
        return reaction

    def get_reactions(self, comment_id: UUID) -> list[CommentReaction]:
        return self.db.query(CommentReaction).filter(CommentReaction.comment_id == comment_id).all()

    def report_comment(self, comment_id: UUID, reporter_id: UUID, reason: str, description: str | None = None) -> CommentReport:
        report = CommentReport(
            comment_id=comment_id,
            reporter_id=reporter_id,
            reason=reason,
            description=description,
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_comment_count(self, post_id: UUID) -> int:
        return self.db.query(func.count(Comment.id)).filter(
            and_(Comment.post_id == post_id, Comment.is_deleted == False, Comment.parent_id == None)
        ).scalar() or 0
