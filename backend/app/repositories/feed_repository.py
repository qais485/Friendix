from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, func, text
from app.models import Post, PostLike, PostSave, PostHide, FeedPosition, Friendship, CloseFriend, Follow, User, Poll, PollOption, PollVote, BlockedUser, Mute


_CURSOR_SEP = "|"


def encode_cursor(is_pinned: bool, created_at: datetime, post_id: UUID) -> str:
    """Opaque keyset cursor for feeds ordered by (is_pinned, created_at, id) DESC."""
    return f"{1 if is_pinned else 0}|{created_at.isoformat()}|{post_id}"


def encode_trending_cursor(score: float, created_at: datetime, post_id: UUID) -> str:
    """Opaque keyset cursor for feeds ordered by (trending_score, created_at, id) DESC."""
    return f"{round(score, 8)}|{created_at.isoformat()}|{post_id}"


def parse_cursor(cursor: str | None):
    """Decode a feed keyset cursor into (is_pinned, created_at, post_id).

    Falls back to legacy bare-UUID cursors, returning (None, None, post_id).
    """
    if not cursor:
        return None
    parts = cursor.split(_CURSOR_SEP)
    if len(parts) == 3:
        try:
            return (
                parts[0] == "1",
                datetime.fromisoformat(parts[1]),
                UUID(parts[2]),
            )
        except (ValueError, TypeError):
            return None
    try:
        return (None, None, UUID(cursor))
    except (ValueError, TypeError):
        return None


def parse_trending_cursor(cursor: str | None):
    """Decode a trending keyset cursor into (trending_score, created_at, post_id)."""
    if not cursor:
        return None
    parts = cursor.split(_CURSOR_SEP)
    if len(parts) == 3:
        try:
            return (
                float(parts[0]),
                datetime.fromisoformat(parts[1]),
                UUID(parts[2]),
            )
        except (ValueError, TypeError):
            return None
    try:
        return (None, None, UUID(cursor))
    except (ValueError, TypeError):
        return None


class FeedRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_post(self, user_id: UUID, **kwargs) -> Post:
        post = Post(user_id=user_id, **kwargs)
        self.db.add(post)
        self.db.commit()
        self.db.refresh(post)
        return post

    def get_post_by_id(self, post_id: UUID) -> Post | None:
        return self.db.query(Post).filter(Post.id == post_id).first()

    def update_post(self, post: Post, **kwargs) -> Post:
        for key, value in kwargs.items():
            setattr(post, key, value)
        self.db.commit()
        self.db.refresh(post)
        return post

    def delete_post(self, post: Post) -> None:
        self.db.delete(post)
        self.db.commit()

    def delete_post_completely(self, post_id: UUID) -> None:
        pid = str(post_id)
        self.db.execute(text("DELETE FROM comment_reactions WHERE comment_id IN (SELECT id FROM comments WHERE post_id = :pid)"), {"pid": pid})
        self.db.execute(text("DELETE FROM comment_reports WHERE comment_id IN (SELECT id FROM comments WHERE post_id = :pid)"), {"pid": pid})
        self.db.execute(text("DELETE FROM comments WHERE post_id = :pid"), {"pid": pid})
        self.db.execute(text("DELETE FROM poll_votes WHERE poll_id IN (SELECT id FROM polls WHERE post_id = :pid)"), {"pid": pid})
        self.db.execute(text("DELETE FROM poll_options WHERE poll_id IN (SELECT id FROM polls WHERE post_id = :pid)"), {"pid": pid})
        self.db.execute(text("DELETE FROM polls WHERE post_id = :pid"), {"pid": pid})
        self.db.execute(text("DELETE FROM post_likes WHERE post_id = :pid"), {"pid": pid})
        self.db.execute(text("DELETE FROM post_saves WHERE post_id = :pid"), {"pid": pid})
        self.db.execute(text("DELETE FROM post_hides WHERE post_id = :pid"), {"pid": pid})
        self.db.execute(text("DELETE FROM post_hashtags WHERE post_id = :pid"), {"pid": pid})
        self.db.execute(text("UPDATE posts SET shared_post_id = NULL WHERE shared_post_id = :pid"), {"pid": pid})
        self.db.execute(text("UPDATE feed_positions SET last_post_id = NULL WHERE last_post_id = :pid"), {"pid": pid})
        self.db.execute(text("DELETE FROM notifications WHERE entity_type = 'post' AND entity_id = :pid"), {"pid": pid})
        self.db.execute(text("DELETE FROM reports WHERE entity_type = 'post' AND entity_id = :pid"), {"pid": pid})
        self.db.execute(text("UPDATE posts SET repost_count = GREATEST(repost_count - 1, 0) WHERE id = (SELECT shared_post_id FROM posts WHERE id = :pid)"), {"pid": pid})
        self.db.execute(text("DELETE FROM posts WHERE id = :pid"), {"pid": pid})
        self.db.commit()

    def delete_notifications_for_post(self, post_id: UUID) -> int:
        from app.models import Notification
        result = self.db.query(Notification).filter(
            and_(
                Notification.entity_type == "post",
                Notification.entity_id == post_id,
            )
        ).delete(synchronize_session="fetch")
        return result

    def delete_reports_for_post(self, post_id: UUID) -> int:
        from app.models import Report
        result = self.db.query(Report).filter(
            and_(
                Report.entity_type == "post",
                Report.entity_id == post_id,
            )
        ).delete(synchronize_session="fetch")
        return result

    def nullify_feed_positions_for_post(self, post_id: UUID) -> int:
        from app.models import FeedPosition
        result = self.db.query(FeedPosition).filter(
            FeedPosition.last_post_id == post_id
        ).update(
            {"last_post_id": None},
            synchronize_session="fetch",
        )
        return result

    def decrement_hashtag_counts_for_post(self, post_id: UUID) -> None:
        from app.models import PostHashtag, Hashtag
        post_hashtags = self.db.query(PostHashtag).filter(
            PostHashtag.post_id == post_id
        ).all()
        for ph in post_hashtags:
            hashtag = self.db.query(Hashtag).filter(Hashtag.id == ph.hashtag_id).first()
            if hashtag and (hashtag.posts_count or 0) > 0:
                hashtag.posts_count -= 1

    def decrement_repost_counts_for_post(self, post_id: UUID) -> None:
        reposts = self.db.query(Post).filter(Post.shared_post_id == post_id).all()
        for repost in reposts:
            if (repost.repost_count or 0) > 0:
                repost.repost_count -= 1

    def get_home_feed(self, user_id: UUID, cursor: str | None = None, limit: int = 10) -> list[Post]:
        hidden_ids = self._get_hidden_post_ids(user_id)
        friend_ids = self._get_friend_ids(user_id)
        close_friend_ids = self._get_close_friend_ids(user_id)
        follower_ids = self._get_follower_ids(user_id)
        following_ids = self._get_following_ids(user_id)
        blocked_ids = self._get_blocked_user_ids(user_id)
        muted_ids = self._get_muted_post_author_ids(user_id)
        
        base_filters = [
            Post.is_hidden == False,
            Post.is_draft == False,
            Post.is_archived == False,
            ~Post.id.in_(hidden_ids) if hidden_ids else True,
            ~Post.user_id.in_(blocked_ids) if blocked_ids else True,
            ~Post.user_id.in_(muted_ids) if muted_ids else True,
        ]
        
        everyone_filter = and_(*base_filters, Post.privacy == "everyone")
        
        friends_filter = and_(
            *base_filters, Post.privacy == "friends",
            Post.user_id.in_(friend_ids) if friend_ids else False,
        )

        close_friends_filter = and_(
            *base_filters, Post.privacy == "close_friends",
            Post.user_id.in_(close_friend_ids) if close_friend_ids else False,
        )

        followers_filter = and_(
            *base_filters, Post.privacy == "followers",
            Post.user_id.in_(follower_ids) if follower_ids else False,
        )

        friends_followers_filter = and_(
            *base_filters, Post.privacy == "friends_followers",
            Post.user_id.in_(friend_ids + follower_ids) if (friend_ids or follower_ids) else False,
        )
        
        query = self.db.query(Post).filter(or_(everyone_filter, friends_filter, close_friends_filter, followers_filter, friends_followers_filter))

        parsed = parse_cursor(cursor)
        if parsed:
            is_pinned, created_at, cursor_id = parsed
            if is_pinned is not None:
                query = query.filter(
                    or_(
                        and_(Post.is_pinned.is_(False), is_pinned is True),
                        and_(Post.is_pinned == is_pinned, Post.created_at < created_at),
                        and_(Post.is_pinned == is_pinned, Post.created_at == created_at, Post.id < cursor_id),
                    )
                )
            else:
                cursor_post = self.db.query(Post).filter(Post.id == cursor_id).first()
                if cursor_post:
                    query = query.filter(Post.created_at < cursor_post.created_at)
        return query.order_by(desc(Post.is_pinned), desc(Post.created_at), desc(Post.id)).limit(limit + 1).all()

    def get_following_feed(self, user_id: UUID, cursor: str | None = None, limit: int = 10) -> list[Post]:
        following_ids = self._get_following_ids(user_id)
        friend_ids = self._get_friend_ids(user_id)
        blocked_ids = self._get_blocked_user_ids(user_id)
        hidden_ids = self._get_hidden_post_ids(user_id)

        if not following_ids:
            return []

        base_filters = [
            Post.user_id.in_(following_ids),
            Post.is_hidden == False,
            Post.is_draft == False,
            Post.is_archived == False,
            ~Post.id.in_(hidden_ids) if hidden_ids else True,
            ~Post.user_id.in_(blocked_ids) if blocked_ids else True,
        ]

        everyone_filter = and_(
            *base_filters,
            Post.privacy == "everyone",
        )

        friends_filter = and_(
            *base_filters,
            Post.privacy == "friends",
            Post.user_id.in_(friend_ids) if friend_ids else False,
        )

        query = self.db.query(Post).filter(or_(everyone_filter, friends_filter))

        parsed = parse_cursor(cursor)
        if parsed:
            is_pinned, created_at, cursor_id = parsed
            if is_pinned is not None:
                query = query.filter(
                    or_(
                        and_(Post.is_pinned.is_(False), is_pinned is True),
                        and_(Post.is_pinned == is_pinned, Post.created_at < created_at),
                        and_(Post.is_pinned == is_pinned, Post.created_at == created_at, Post.id < cursor_id),
                    )
                )
            else:
                cursor_post = self.db.query(Post).filter(Post.id == cursor_id).first()
                if cursor_post:
                    query = query.filter(Post.created_at < cursor_post.created_at)
        return query.order_by(desc(Post.is_pinned), desc(Post.created_at), desc(Post.id)).limit(limit + 1).all()

    def get_friends_feed(self, user_id: UUID, cursor: str | None = None, limit: int = 10) -> list[Post]:
        friend_ids = self._get_friend_ids(user_id)
        close_friend_ids = self._get_close_friend_ids(user_id)
        hidden_ids = self._get_hidden_post_ids(user_id)
        blocked_ids = self._get_blocked_user_ids(user_id)

        if not friend_ids:
            return []

        query = (
            self.db.query(Post)
            .filter(
                and_(
                    Post.user_id.in_(friend_ids),
                    Post.is_hidden == False,
                    Post.is_draft == False,
                    Post.is_archived == False,
                    ~Post.id.in_(hidden_ids) if hidden_ids else True,
                    ~Post.user_id.in_(blocked_ids) if blocked_ids else True,
                    or_(
                        Post.privacy.in_(["everyone", "friends"]),
                        and_(
                            Post.privacy == "close_friends",
                            Post.user_id.in_(close_friend_ids) if close_friend_ids else False,
                        ),
                    ),
                )
            )
        )
        parsed = parse_cursor(cursor)
        if parsed:
            is_pinned, created_at, cursor_id = parsed
            if is_pinned is not None:
                query = query.filter(
                    or_(
                        and_(Post.is_pinned.is_(False), is_pinned is True),
                        and_(Post.is_pinned == is_pinned, Post.created_at < created_at),
                        and_(Post.is_pinned == is_pinned, Post.created_at == created_at, Post.id < cursor_id),
                    )
                )
            else:
                cursor_post = self.db.query(Post).filter(Post.id == cursor_id).first()
                if cursor_post:
                    query = query.filter(Post.created_at < cursor_post.created_at)
        return query.order_by(desc(Post.is_pinned), desc(Post.created_at), desc(Post.id)).limit(limit + 1).all()

    def get_trending_feed(self, user_id: UUID, cursor: str | None = None, limit: int = 10) -> list[Post]:
        hidden_ids = self._get_hidden_post_ids(user_id)
        blocked_ids = self._get_blocked_user_ids(user_id)
        query = (
            self.db.query(Post)
            .filter(
                and_(
                    Post.is_hidden == False,
                    Post.is_draft == False,
                    Post.is_archived == False,
                    ~Post.id.in_(hidden_ids) if hidden_ids else True,
                    ~Post.user_id.in_(blocked_ids) if blocked_ids else True,
                    Post.privacy == "everyone",
                )
            )
        )
        parsed = parse_trending_cursor(cursor)
        if parsed:
            score, created_at, cursor_id = parsed
            if score is not None:
                query = query.filter(
                    or_(
                        Post.trending_score < score,
                        and_(Post.trending_score == score, Post.created_at < created_at),
                        and_(Post.trending_score == score, Post.created_at == created_at, Post.id < cursor_id),
                    )
                )
            else:
                cursor_post = self.db.query(Post).filter(Post.id == cursor_id).first()
                if cursor_post:
                    query = query.filter(
                        or_(
                            Post.trending_score < cursor_post.trending_score,
                            and_(
                                Post.trending_score == cursor_post.trending_score,
                                Post.created_at < cursor_post.created_at,
                            ),
                        )
                    )
        return query.order_by(desc(Post.trending_score), desc(Post.created_at), desc(Post.id)).limit(limit + 1).all()

    def get_suggested_posts(self, user_id: UUID, limit: int = 10) -> list[Post]:
        friend_ids = self._get_friend_ids(user_id)
        following_ids = self._get_following_ids(user_id)
        exclude_ids = list(set(friend_ids) | set(following_ids) | {user_id})
        hidden_ids = self._get_hidden_post_ids(user_id)
        blocked_ids = self._get_blocked_user_ids(user_id)

        query = (
            self.db.query(Post)
            .filter(
                and_(
                    Post.is_hidden == False,
                    Post.is_draft == False,
                    Post.is_archived == False,
                    ~Post.user_id.in_(exclude_ids) if exclude_ids else True,
                    ~Post.id.in_(hidden_ids) if hidden_ids else True,
                    ~Post.user_id.in_(blocked_ids) if blocked_ids else True,
                    Post.privacy == "everyone",
                )
            )
        )
        return query.order_by(desc(Post.trending_score), desc(Post.created_at)).limit(limit).all()

    def get_user_posts(self, user_id: UUID, viewer_id: UUID, cursor: str | None = None, limit: int = 10) -> list[Post]:
        hidden_ids = self._get_hidden_post_ids(viewer_id)
        are_friends = self._are_friends(user_id, viewer_id)
        is_close = self._is_close_friend(user_id, viewer_id) if are_friends else False
        is_follower = self._is_follower(viewer_id, user_id)

        query = self.db.query(Post).filter(Post.user_id == user_id)

        if user_id != viewer_id:
            if is_close:
                query = query.filter(Post.privacy.in_(["everyone", "friends", "close_friends", "followers", "friends_followers"]))
            elif are_friends:
                query = query.filter(Post.privacy.in_(["everyone", "friends", "friends_followers"]))
            elif is_follower:
                query = query.filter(Post.privacy.in_(["everyone", "followers", "friends_followers"]))
            else:
                query = query.filter(Post.privacy == "everyone")

        query = query.filter(
            and_(
                Post.is_hidden == False,
                Post.is_draft == False,
                Post.is_archived == False,
                ~Post.id.in_(hidden_ids) if hidden_ids else True,
            )
        )

        parsed = parse_cursor(cursor)
        if parsed:
            is_pinned, created_at, cursor_id = parsed
            if is_pinned is not None:
                query = query.filter(
                    or_(
                        and_(Post.is_pinned.is_(False), is_pinned is True),
                        and_(Post.is_pinned == is_pinned, Post.created_at < created_at),
                        and_(Post.is_pinned == is_pinned, Post.created_at == created_at, Post.id < cursor_id),
                    )
                )
            else:
                cursor_post = self.db.query(Post).filter(Post.id == cursor_id).first()
                if cursor_post:
                    query = query.filter(Post.created_at < cursor_post.created_at)

        return query.order_by(desc(Post.is_pinned), desc(Post.created_at), desc(Post.id)).limit(limit + 1).all()

    def is_post_liked(self, user_id: UUID, post_id: UUID) -> bool:
        return self.db.query(PostLike).filter(
            and_(PostLike.user_id == user_id, PostLike.post_id == post_id)
        ).first() is not None

    def like_post(self, user_id: UUID, post_id: UUID) -> PostLike | None:
        existing = self.db.query(PostLike).filter(
            and_(PostLike.user_id == user_id, PostLike.post_id == post_id)
        ).first()
        if existing:
            return existing
        like = PostLike(user_id=user_id, post_id=post_id)
        self.db.add(like)
        post = self.db.query(Post).filter(Post.id == post_id).first()
        if post:
            post.likes_count += 1
        self.db.commit()
        self.db.refresh(like)
        return like

    def unlike_post(self, user_id: UUID, post_id: UUID) -> bool:
        like = self.db.query(PostLike).filter(
            and_(PostLike.user_id == user_id, PostLike.post_id == post_id)
        ).first()
        if like:
            self.db.delete(like)
            post = self.db.query(Post).filter(Post.id == post_id).first()
            if post and post.likes_count > 0:
                post.likes_count -= 1
            self.db.commit()
            return True
        return False

    def is_post_saved(self, user_id: UUID, post_id: UUID) -> bool:
        return self.db.query(PostSave).filter(
            and_(PostSave.user_id == user_id, PostSave.post_id == post_id)
        ).first() is not None

    def get_liked_post_ids(self, user_id: UUID, post_ids: list) -> set[UUID]:
        if not post_ids:
            return set()
        rows = self.db.query(PostLike.post_id).filter(
            PostLike.user_id == user_id,
            PostLike.post_id.in_(post_ids),
        ).all()
        return {row[0] for row in rows}

    def get_saved_post_ids(self, user_id: UUID, post_ids: list) -> set[UUID]:
        if not post_ids:
            return set()
        rows = self.db.query(PostSave.post_id).filter(
            PostSave.user_id == user_id,
            PostSave.post_id.in_(post_ids),
        ).all()
        return {row[0] for row in rows}

    def save_post(self, user_id: UUID, post_id: UUID) -> PostSave | None:
        existing = self.db.query(PostSave).filter(
            and_(PostSave.user_id == user_id, PostSave.post_id == post_id)
        ).first()
        if existing:
            return existing
        save = PostSave(user_id=user_id, post_id=post_id)
        self.db.add(save)
        self.db.commit()
        self.db.refresh(save)
        return save

    def unsave_post(self, user_id: UUID, post_id: UUID) -> bool:
        save = self.db.query(PostSave).filter(
            and_(PostSave.user_id == user_id, PostSave.post_id == post_id)
        ).first()
        if save:
            self.db.delete(save)
            self.db.commit()
            return True
        return False

    def hide_post(self, user_id: UUID, post_id: UUID) -> PostHide | None:
        existing = self.db.query(PostHide).filter(
            and_(PostHide.user_id == user_id, PostHide.post_id == post_id)
        ).first()
        if existing:
            return existing
        hide = PostHide(user_id=user_id, post_id=post_id)
        self.db.add(hide)
        self.db.commit()
        self.db.refresh(hide)
        return hide

    def unhide_post(self, user_id: UUID, post_id: UUID) -> bool:
        hide = self.db.query(PostHide).filter(
            and_(PostHide.user_id == user_id, PostHide.post_id == post_id)
        ).first()
        if hide:
            self.db.delete(hide)
            self.db.commit()
            return True
        return False

    def get_hidden_posts(self, user_id: UUID) -> list[Post]:
        hides = self.db.query(PostHide).filter(PostHide.user_id == user_id).all()
        post_ids = [h.post_id for h in hides]
        if not post_ids:
            return []
        return (
            self.db.query(Post)
            .filter(
                and_(
                    Post.id.in_(post_ids),
                    Post.user_id != user_id,
                    Post.is_archived == False,
                )
            )
            .order_by(desc(Post.created_at))
            .all()
        )

    def get_saved_posts(self, user_id: UUID) -> list[Post]:
        saves = self.db.query(PostSave).filter(PostSave.user_id == user_id).all()
        post_ids = [s.post_id for s in saves]
        if not post_ids:
            return []
        return self.db.query(Post).filter(Post.id.in_(post_ids)).order_by(desc(Post.created_at)).all()

    def pin_post(self, user_id: UUID, post_id: UUID) -> Post | None:
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        if not post:
            return None
        self.db.query(Post).filter(
            and_(Post.user_id == user_id, Post.is_pinned == True)
        ).update({"is_pinned": False})
        post.is_pinned = True
        self.db.commit()
        self.db.refresh(post)
        return post

    def unpin_post(self, user_id: UUID, post_id: UUID) -> Post | None:
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        if not post:
            return None
        post.is_pinned = False
        self.db.commit()
        self.db.refresh(post)
        return post

    def update_feed_position(self, user_id: UUID, feed_type: str, last_post_id: UUID | None, scroll_position: int) -> FeedPosition:
        position = self.db.query(FeedPosition).filter(
            and_(FeedPosition.user_id == user_id, FeedPosition.feed_type == feed_type)
        ).first()
        if position:
            position.last_post_id = last_post_id
            position.scroll_position = scroll_position
        else:
            position = FeedPosition(
                user_id=user_id,
                feed_type=feed_type,
                last_post_id=last_post_id,
                scroll_position=scroll_position,
            )
            self.db.add(position)
        self.db.commit()
        self.db.refresh(position)
        return position

    def get_feed_position(self, user_id: UUID, feed_type: str) -> FeedPosition | None:
        return self.db.query(FeedPosition).filter(
            and_(FeedPosition.user_id == user_id, FeedPosition.feed_type == feed_type)
        ).first()

    def get_post_count(self, user_id: UUID) -> int:
        return self.db.query(Post).filter(Post.user_id == user_id).count()

    def archive_post(self, user_id: UUID, post_id: UUID) -> Post | None:
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        if not post:
            return None
        post.is_archived = True
        self.db.commit()
        self.db.refresh(post)
        return post

    def unarchive_post(self, user_id: UUID, post_id: UUID) -> Post | None:
        post = self.db.query(Post).filter(
            and_(Post.id == post_id, Post.user_id == user_id)
        ).first()
        if not post:
            return None
        post.is_archived = False
        self.db.commit()
        self.db.refresh(post)
        return post

    def get_archived_posts(self, user_id: UUID) -> list[Post]:
        return self.db.query(Post).filter(
            and_(Post.user_id == user_id, Post.is_archived == True)
        ).order_by(desc(Post.created_at)).all()

    def get_draft_posts(self, user_id: UUID) -> list[Post]:
        return self.db.query(Post).filter(
            and_(Post.user_id == user_id, Post.is_draft == True)
        ).order_by(desc(Post.updated_at)).all()

    def get_scheduled_posts(self, user_id: UUID) -> list[Post]:
        return self.db.query(Post).filter(
            and_(
                Post.user_id == user_id,
                Post.is_scheduled == True,
                Post.is_draft == False,
            )
        ).order_by(Post.scheduled_at).all()

    def publish_scheduled_posts(self) -> list[Post]:
        from datetime import datetime, timezone
        now = datetime.now(timezone.utc)
        posts = self.db.query(Post).filter(
            and_(
                Post.is_scheduled == True,
                Post.is_draft == False,
                Post.scheduled_at <= now,
            )
        ).all()
        for post in posts:
            post.is_scheduled = False
        self.db.commit()
        return posts

    def create_poll(self, post_id: UUID, question: str, options: list[str], ends_at=None, is_anonymous: bool = False) -> Poll:
        poll = Poll(
            post_id=post_id,
            question=question,
            ends_at=ends_at,
            is_anonymous=is_anonymous,
        )
        self.db.add(poll)
        self.db.flush()
        for text in options:
            option = PollOption(poll_id=poll.id, text=text)
            self.db.add(option)
        self.db.commit()
        self.db.refresh(poll)
        return poll

    def get_poll_by_post_id(self, post_id: UUID) -> Poll | None:
        return self.db.query(Poll).filter(Poll.post_id == post_id).first()

    def vote_poll(self, user_id: UUID, poll_id: UUID, option_id: UUID) -> PollVote | None:
        existing = self.db.query(PollVote).filter(
            and_(PollVote.user_id == user_id, PollVote.poll_id == poll_id)
        ).first()
        if existing:
            return None
        vote = PollVote(poll_id=poll_id, option_id=option_id, user_id=user_id)
        self.db.add(vote)
        option = self.db.query(PollOption).filter(PollOption.id == option_id).first()
        if option:
            option.votes_count += 1
        poll = self.db.query(Poll).filter(Poll.id == poll_id).first()
        if poll:
            poll.total_votes += 1
        self.db.commit()
        self.db.refresh(vote)
        return vote

    def get_user_poll_vote(self, user_id: UUID, poll_id: UUID) -> PollVote | None:
        return self.db.query(PollVote).filter(
            and_(PollVote.user_id == user_id, PollVote.poll_id == poll_id)
        ).first()

    def repost_post(self, user_id: UUID, shared_post_id: UUID, content: str | None = None) -> Post:
        original = self.db.query(Post).filter(Post.id == shared_post_id).first()
        if original and original.user_id != user_id:
            if original.privacy == "only_me":
                from fastapi import HTTPException
                raise HTTPException(status_code=403, detail="Cannot repost private post")
            if original.privacy == "friends" and not self._are_friends(original.user_id, user_id):
                from fastapi import HTTPException
                raise HTTPException(status_code=403, detail="Cannot repost this post")
            if original.privacy == "close_friends" and not self._is_close_friend(original.user_id, user_id):
                from fastapi import HTTPException
                raise HTTPException(status_code=403, detail="Cannot repost this post")
        post = Post(
            user_id=user_id,
            content=content,
            post_type="shared",
            shared_post_id=shared_post_id,
        )
        self.db.add(post)
        self.db.flush()
        if original:
            original.repost_count += 1
        self.db.commit()
        self.db.refresh(post)
        return post

    def quote_post(self, user_id: UUID, shared_post_id: UUID, quote_text: str, content: str | None = None) -> Post:
        original = self.db.query(Post).filter(Post.id == shared_post_id).first()
        if original and original.user_id != user_id:
            if original.privacy == "only_me":
                from fastapi import HTTPException
                raise HTTPException(status_code=403, detail="Cannot quote private post")
            if original.privacy == "friends" and not self._are_friends(original.user_id, user_id):
                from fastapi import HTTPException
                raise HTTPException(status_code=403, detail="Cannot quote this post")
            if original.privacy == "close_friends" and not self._is_close_friend(original.user_id, user_id):
                from fastapi import HTTPException
                raise HTTPException(status_code=403, detail="Cannot quote this post")
        post = Post(
            user_id=user_id,
            content=content,
            post_type="quote",
            shared_post_id=shared_post_id,
            quote_text=quote_text,
        )
        self.db.add(post)
        self.db.flush()
        if original:
            original.repost_count += 1
        self.db.commit()
        self.db.refresh(post)
        return post

    def _get_hidden_post_ids(self, user_id: UUID) -> list[UUID]:
        hides = self.db.query(PostHide.post_id).filter(PostHide.user_id == user_id).all()
        return [h[0] for h in hides]

    def _get_friend_ids(self, user_id: UUID) -> list[UUID]:
        friendships = self.db.query(Friendship).filter(
            and_(
                or_(Friendship.requester_id == user_id, Friendship.addressee_id == user_id),
                Friendship.status == "accepted",
            )
        ).all()
        return [f.addressee_id if f.requester_id == user_id else f.requester_id for f in friendships]

    def _get_close_friend_ids(self, user_id: UUID) -> list[UUID]:
        close_friends = self.db.query(CloseFriend.friend_id).filter(CloseFriend.user_id == user_id).all()
        return [cf[0] for cf in close_friends]

    def _get_follower_ids(self, user_id: UUID) -> list[UUID]:
        follows = self.db.query(Follow.follower_id).filter(Follow.following_id == user_id).all()
        return [f[0] for f in follows]

    def _get_following_ids(self, user_id: UUID) -> list[UUID]:
        follows = self.db.query(Follow.following_id).filter(Follow.follower_id == user_id).all()
        return [f[0] for f in follows]

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

    def _is_close_friend(self, user_id: UUID, other_user_id: UUID) -> bool:
        return self.db.query(CloseFriend).filter(
            and_(CloseFriend.user_id == user_id, CloseFriend.friend_id == other_user_id)
        ).first() is not None

    def _is_follower(self, user_id: UUID, other_user_id: UUID) -> bool:
        return self.db.query(Follow).filter(
            and_(Follow.follower_id == user_id, Follow.following_id == other_user_id)
        ).first() is not None

    def _get_blocked_user_ids(self, user_id: UUID) -> list[UUID]:
        blocked_by = self.db.query(BlockedUser.blocked_user_id).filter(BlockedUser.user_id == user_id, BlockedUser.block_type == "block").all()
        blocking = self.db.query(BlockedUser.user_id).filter(BlockedUser.blocked_user_id == user_id, BlockedUser.block_type == "block").all()
        return list(set([b[0] for b in blocked_by] + [b[0] for b in blocking]))

    def _get_muted_post_author_ids(self, user_id: UUID) -> list[UUID]:
        mutes = self.db.query(Mute.muted_user_id).filter(
            and_(Mute.user_id == user_id, Mute.mute_posts == True)
        ).all()
        return [m[0] for m in mutes]

    def _get_muted_story_author_ids(self, user_id: UUID) -> list[UUID]:
        mutes = self.db.query(Mute.muted_user_id).filter(
            and_(Mute.user_id == user_id, Mute.mute_stories == True)
        ).all()
        return [m[0] for m in mutes]
