from uuid import UUID
import logging
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.feed_repository import FeedRepository, encode_cursor, encode_trending_cursor
from app.repositories.profile_repository import ProfileRepository
from app.repositories.hashtag_repository import HashtagRepository
from app.services.notification_service import NotificationService
from app.schemas.feed import (
    PostCreate,
    PostUpdate,
    PostResponse,
    PostAuthor,
    FeedResponse,
    FeedPositionResponse,
    FeedPositionUpdate,
    PollResponse,
    PollOptionResponse,
)

logger = logging.getLogger(__name__)


class FeedService:
    def __init__(self, db: Session):
        self.db = db
        self.feed_repo = FeedRepository(db)
        self.profile_repo = ProfileRepository(db)
        self.hashtag_repo = HashtagRepository(db)

    def _enrich_poll(self, poll, user_id: UUID) -> PollResponse | None:
        if not poll:
            return None
        from datetime import datetime, timezone
        is_expired = poll.ends_at is not None and poll.ends_at <= datetime.now(timezone.utc)
        user_vote = self.feed_repo.get_user_poll_vote(user_id, poll.id)
        options = []
        for opt in poll.options:
            percentage = (opt.votes_count / poll.total_votes * 100) if poll.total_votes > 0 else 0
            options.append(
                PollOptionResponse(
                    id=opt.id,
                    text=opt.text,
                    votes_count=opt.votes_count,
                    percentage=round(percentage, 1),
                    has_voted=user_vote.option_id == opt.id if user_vote else False,
                )
            )
        return PollResponse(
            id=poll.id,
            question=poll.question,
            ends_at=poll.ends_at,
            is_anonymous=poll.is_anonymous,
            total_votes=poll.total_votes,
            options=options,
            has_voted=user_vote is not None,
            is_expired=is_expired,
        )

    def _enrich_post(
        self,
        post,
        user_id: UUID,
        users_map: dict = None,
        liked_ids: set = None,
        saved_ids: set = None,
    ) -> PostResponse:
        if users_map is None:
            author = self.profile_repo.get_by_id(post.user_id)
        else:
            author = users_map.get(post.user_id)
        author_data = None
        if author:
            author_data = PostAuthor(
                id=str(author.id),
                full_name=author.full_name,
                username=author.username,
                avatar_url=author.avatar_url,
                is_verified=author.is_verified,
            )
        shared_post_data = None
        if post.shared_post:
            shared_post_data = self._enrich_post(post.shared_post, user_id, users_map)
        poll_data = self._enrich_poll(post.poll, user_id) if post.poll else None
        image_urls = None
        if post.image_urls:
            image_urls = [url.strip() for url in post.image_urls.split(",") if url.strip()]
        return PostResponse(
            id=post.id,
            user_id=post.user_id,
            content=post.content,
            image_urls=image_urls,
            video_url=post.video_url,
            audio_url=post.audio_url,
            gif_url=post.gif_url,
            document_url=post.document_url,
            document_name=post.document_name,
            location_name=post.location_name,
            location_lat=post.location_lat,
            location_lng=post.location_lng,
            feeling_type=post.feeling_type,
            feeling_text=post.feeling_text,
            background_style=post.background_style,
            background_image_url=getattr(post, 'background_image_url', None),
            aspect_ratio=getattr(post, 'aspect_ratio', None),
            post_type=post.post_type,
            privacy=post.privacy,
            is_pinned=post.is_pinned,
            is_hidden=post.is_hidden,
            is_archived=post.is_archived,
            is_draft=post.is_draft,
            is_scheduled=post.is_scheduled,
            scheduled_at=post.scheduled_at,
            shared_post_id=post.shared_post_id,
            quote_text=post.quote_text,
            cross_posted_from=post.cross_posted_from,
            repost_count=post.repost_count,
            likes_count=post.likes_count,
            comments_count=post.comments_count,
            shares_count=post.shares_count,
            trending_score=post.trending_score,
            author=author_data,
            shared_post=shared_post_data,
            poll=poll_data,
            is_liked=(
                post.id in liked_ids
                if liked_ids is not None
                else self.feed_repo.is_post_liked(user_id, post.id)
            ),
            is_saved=(
                post.id in saved_ids
                if saved_ids is not None
                else self.feed_repo.is_post_saved(user_id, post.id)
            ),
            created_at=post.created_at,
            updated_at=post.updated_at,
        )

    def _enrich_posts_batch(self, posts, user_id: UUID) -> list[PostResponse]:
        all_user_ids = set()
        for post in posts:
            all_user_ids.add(post.user_id)
            if post.shared_post:
                all_user_ids.add(post.shared_post.user_id)
        users_map = self.profile_repo.get_by_ids(list(all_user_ids))
        post_ids = [post.id for post in posts]
        liked_ids = self.feed_repo.get_liked_post_ids(user_id, post_ids)
        saved_ids = self.feed_repo.get_saved_post_ids(user_id, post_ids)
        return [
            self._enrich_post(p, user_id, users_map, liked_ids, saved_ids)
            for p in posts
        ]

    def _next_post_cursor(self, posts, has_more: bool) -> str | None:
        if not posts or not has_more:
            return None
        last = posts[-1]
        return encode_cursor(last.is_pinned, last.created_at, last.id)

    def create_post(self, user_id: UUID, data: PostCreate) -> PostResponse:
        kwargs = {}
        if data.content is not None:
            kwargs["content"] = data.content
        if data.image_urls is not None:
            kwargs["image_urls"] = ",".join(data.image_urls)
        if data.video_url is not None:
            kwargs["video_url"] = data.video_url
        if data.audio_url is not None:
            kwargs["audio_url"] = data.audio_url
        if data.gif_url is not None:
            kwargs["gif_url"] = data.gif_url
        if data.document_url is not None:
            kwargs["document_url"] = data.document_url
        if data.document_name is not None:
            kwargs["document_name"] = data.document_name
        if data.location_name is not None:
            kwargs["location_name"] = data.location_name
        if data.location_lat is not None:
            kwargs["location_lat"] = data.location_lat
        if data.location_lng is not None:
            kwargs["location_lng"] = data.location_lng
        if data.feeling_type is not None:
            kwargs["feeling_type"] = data.feeling_type
        if data.feeling_text is not None:
            kwargs["feeling_text"] = data.feeling_text
        if data.background_style is not None:
            kwargs["background_style"] = data.background_style
        if data.background_image_url is not None:
            kwargs["background_image_url"] = data.background_image_url
        kwargs["post_type"] = data.post_type
        if data.privacy is not None:
            kwargs["privacy"] = data.privacy
        else:
            from app.models import PrivacySetting
            privacy_setting = self.db.query(PrivacySetting).filter(PrivacySetting.user_id == user_id).first()
            kwargs["privacy"] = privacy_setting.post_privacy if privacy_setting else "everyone"
        kwargs["is_draft"] = data.is_draft
        kwargs["is_scheduled"] = data.is_scheduled
        if data.scheduled_at is not None:
            kwargs["scheduled_at"] = data.scheduled_at
        if data.shared_post_id is not None:
            kwargs["shared_post_id"] = UUID(data.shared_post_id)
        if data.quote_text is not None:
            kwargs["quote_text"] = data.quote_text
        if data.cross_posted_from is not None:
            kwargs["cross_posted_from"] = data.cross_posted_from
        if data.aspect_ratio is not None:
            kwargs["aspect_ratio"] = data.aspect_ratio

        post = self.feed_repo.create_post(user_id, **kwargs)

        if data.poll and data.post_type == "poll":
            self.feed_repo.create_poll(
                post_id=post.id,
                question=data.poll.question,
                options=[opt.text for opt in data.poll.options],
                ends_at=data.poll.ends_at,
                is_anonymous=data.poll.is_anonymous,
            )

        if data.hashtags:
            cleaned = [h.strip().lstrip("#") for h in data.hashtags if h.strip()]
            if cleaned:
                self.hashtag_repo.link_post_to_hashtags(post.id, cleaned)

        return self._enrich_post(post, user_id)

    def update_post(self, user_id: UUID, post_id: UUID, data: PostUpdate) -> PostResponse:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        update_data = data.model_dump(exclude_unset=True)
        if "image_urls" in update_data and update_data["image_urls"] is not None:
            update_data["image_urls"] = ",".join(update_data["image_urls"])

        updated = self.feed_repo.update_post(post, **update_data)
        return self._enrich_post(updated, user_id)

    def delete_post(self, user_id: UUID, post_id: UUID) -> bool:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")

        media_urls = self._collect_post_media_urls(post)
        logger.info("Deleting post %s with %d media files", post_id, len(media_urls))

        try:
            self.feed_repo.delete_post_completely(post_id)
            logger.info("Successfully deleted post %s from database", post_id)
        except Exception as e:
            self.db.rollback()
            logger.error("Failed to delete post %s: %s", post_id, e, exc_info=True)
            raise HTTPException(status_code=500, detail="Failed to delete post")

        self._delete_media_files(media_urls)
        return True

    def _collect_post_media_urls(self, post) -> list[str]:
        urls = []
        if post.image_urls:
            urls.extend(
                url.strip() for url in post.image_urls.split(",") if url.strip()
            )
        if post.video_url:
            urls.append(post.video_url)
        if post.audio_url:
            urls.append(post.audio_url)
        if post.gif_url:
            urls.append(post.gif_url)
        if post.document_url:
            urls.append(post.document_url)
        if post.background_image_url:
            urls.append(post.background_image_url)
        return urls

    def _delete_media_files(self, urls: list[str]) -> None:
        import os
        import logging

        logger = logging.getLogger(__name__)
        UPLOAD_DIR = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
            "uploads",
        )

        for url in urls:
            try:
                if url.startswith("/uploads/"):
                    filename = url.split("/uploads/", 1)[1]
                    file_path = os.path.join(UPLOAD_DIR, filename)
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                        self._delete_thumbnail_files(file_path)
                        logger.info("Deleted local file: %s", file_path)
                elif "cloudinary.com" in url or "res.cloudinary.com" in url:
                    self._delete_cloudinary_file(url)
            except Exception as e:
                logger.warning("Failed to delete media file %s: %s", url, e)

    def _delete_cloudinary_file(self, url: str) -> None:
        import logging
        import re

        logger = logging.getLogger(__name__)
        try:
            from app.core.config import get_settings
            settings = get_settings()
            if not settings.CLOUDINARY_CLOUD_NAME or not settings.CLOUDINARY_API_KEY or not settings.CLOUDINARY_API_SECRET:
                logger.warning("Cloudinary credentials not configured, cannot delete: %s", url)
                return

            match = re.search(r'/upload/(?:v\d+/)?(.+?)(?:\.\w+)?$', url)
            if not match:
                logger.warning("Could not extract Cloudinary public_id from URL: %s", url)
                return

            public_id = match.group(1)
            if '.' in public_id:
                public_id = public_id.rsplit('.', 1)[0]

            import hashlib
            import hmac
            import time
            import json

            timestamp = str(int(time.time()))
            string_to_sign = f"public_id={public_id}&timestamp={timestamp}{settings.CLOUDINARY_API_SECRET}"
            signature = hashlib.sha1(string_to_sign.encode()).hexdigest()

            import httpx
            resource_type = "video" if "/video/" in url or url.endswith(('.mp4', '.mov', '.avi', '.webm')) else "image"
            api_url = f"https://api.cloudinary.com/v1_1/{settings.CLOUDINARY_CLOUD_NAME}/{resource_type}/destroy"

            response = httpx.post(api_url, data={
                "public_id": public_id,
                "timestamp": timestamp,
                "api_key": settings.CLOUDINARY_API_KEY,
                "signature": signature,
            }, timeout=10)

            if response.status_code == 200:
                result = response.json()
                if result.get("result") == "ok":
                    logger.info("Deleted Cloudinary file: %s", public_id)
                else:
                    logger.warning("Cloudinary destroy returned: %s for %s", result, public_id)
            else:
                logger.warning("Cloudinary API error %d for %s: %s", response.status_code, public_id, response.text)
        except Exception as e:
            logger.warning("Failed to delete Cloudinary file %s: %s", url, e)

    def _delete_thumbnail_files(self, file_path: str) -> None:
        import os
        import logging

        logger = logging.getLogger(__name__)
        base, ext = os.path.splitext(file_path)
        for suffix in ["_thumb", "_small", "_medium", "_large"]:
            thumb_path = f"{base}{suffix}{ext}"
            try:
                if os.path.isfile(thumb_path):
                    os.remove(thumb_path)
                    logger.info("Deleted thumbnail: %s", thumb_path)
            except Exception as e:
                logger.warning("Failed to delete thumbnail %s: %s", thumb_path, e)

    def get_home_feed(self, user_id: UUID, cursor: str | None = None, limit: int = 10) -> FeedResponse:
        posts = self.feed_repo.get_home_feed(user_id, cursor, limit=limit)
        has_more = len(posts) > limit
        if has_more:
            posts = posts[:limit]
        return FeedResponse(
            posts=self._enrich_posts_batch(posts, user_id),
            next_cursor=self._next_post_cursor(posts, has_more),
            has_more=has_more,
        )

    def get_following_feed(self, user_id: UUID, cursor: str | None = None, limit: int = 10) -> FeedResponse:
        posts = self.feed_repo.get_following_feed(user_id, cursor, limit=limit)
        has_more = len(posts) > limit
        if has_more:
            posts = posts[:limit]
        return FeedResponse(
            posts=self._enrich_posts_batch(posts, user_id),
            next_cursor=self._next_post_cursor(posts, has_more),
            has_more=has_more,
        )

    def get_friends_feed(self, user_id: UUID, cursor: str | None = None, limit: int = 10) -> FeedResponse:
        posts = self.feed_repo.get_friends_feed(user_id, cursor, limit=limit)
        has_more = len(posts) > limit
        if has_more:
            posts = posts[:limit]
        return FeedResponse(
            posts=self._enrich_posts_batch(posts, user_id),
            next_cursor=self._next_post_cursor(posts, has_more),
            has_more=has_more,
        )

    def get_trending_feed(self, user_id: UUID, cursor: str | None = None, limit: int = 10) -> FeedResponse:
        posts = self.feed_repo.get_trending_feed(user_id, cursor, limit=limit)
        has_more = len(posts) > limit
        if has_more:
            posts = posts[:limit]
        next_cursor = None
        if posts and has_more:
            last = posts[-1]
            next_cursor = encode_trending_cursor(last.trending_score, last.created_at, last.id)
        return FeedResponse(
            posts=self._enrich_posts_batch(posts, user_id),
            next_cursor=next_cursor,
            has_more=has_more,
        )

    def get_suggested_posts(self, user_id: UUID) -> list[PostResponse]:
        posts = self.feed_repo.get_suggested_posts(user_id)
        return self._enrich_posts_batch(posts, user_id)

    def get_user_posts(self, user_id: UUID, viewer_id: UUID, cursor: str | None = None, limit: int = 10) -> FeedResponse:
        posts = self.feed_repo.get_user_posts(user_id, viewer_id, cursor, limit=limit)
        has_more = len(posts) > limit
        if has_more:
            posts = posts[:limit]
        return FeedResponse(
            posts=self._enrich_posts_batch(posts, viewer_id),
            next_cursor=self._next_post_cursor(posts, has_more),
            has_more=has_more,
        )

    def save_post(self, user_id: UUID, post_id: UUID) -> bool:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            if post.is_hidden or post.is_draft or post.is_archived:
                raise HTTPException(status_code=404, detail="Post not found")
            if post.privacy == "only_me":
                raise HTTPException(status_code=403, detail="Access denied")
            if post.privacy == "friends" and not self.feed_repo._are_friends(post.user_id, user_id):
                raise HTTPException(status_code=403, detail="Access denied")
        self.feed_repo.save_post(user_id, post_id)
        return True

    def unsave_post(self, user_id: UUID, post_id: UUID) -> bool:
        return self.feed_repo.unsave_post(user_id, post_id)

    def hide_post(self, user_id: UUID, post_id: UUID) -> bool:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        self.feed_repo.hide_post(user_id, post_id)
        return True

    def unhide_post(self, user_id: UUID, post_id: UUID) -> bool:
        return self.feed_repo.unhide_post(user_id, post_id)

    def get_hidden_posts(self, user_id: UUID) -> list[PostResponse]:
        posts = self.feed_repo.get_hidden_posts(user_id)
        return self._enrich_posts_batch(posts, user_id)

    def get_saved_posts(self, user_id: UUID) -> list[PostResponse]:
        posts = self.feed_repo.get_saved_posts(user_id)
        return self._enrich_posts_batch(posts, user_id)

    def pin_post(self, user_id: UUID, post_id: UUID) -> PostResponse:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        updated = self.feed_repo.pin_post(user_id, post_id)
        if not updated:
            raise HTTPException(status_code=400, detail="Could not pin post")
        return self._enrich_post(updated, user_id)

    def unpin_post(self, user_id: UUID, post_id: UUID) -> PostResponse:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        updated = self.feed_repo.unpin_post(user_id, post_id)
        if not updated:
            raise HTTPException(status_code=400, detail="Could not unpin post")
        return self._enrich_post(updated, user_id)

    def archive_post(self, user_id: UUID, post_id: UUID) -> PostResponse:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        updated = self.feed_repo.archive_post(user_id, post_id)
        if not updated:
            raise HTTPException(status_code=400, detail="Could not archive post")
        return self._enrich_post(updated, user_id)

    def unarchive_post(self, user_id: UUID, post_id: UUID) -> PostResponse:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        updated = self.feed_repo.unarchive_post(user_id, post_id)
        if not updated:
            raise HTTPException(status_code=400, detail="Could not unarchive post")
        return self._enrich_post(updated, user_id)

    def get_archived_posts(self, user_id: UUID) -> list[PostResponse]:
        posts = self.feed_repo.get_archived_posts(user_id)
        return self._enrich_posts_batch(posts, user_id)

    def get_draft_posts(self, user_id: UUID) -> list[PostResponse]:
        posts = self.feed_repo.get_draft_posts(user_id)
        return self._enrich_posts_batch(posts, user_id)

    def get_scheduled_posts(self, user_id: UUID) -> list[PostResponse]:
        posts = self.feed_repo.get_scheduled_posts(user_id)
        return self._enrich_posts_batch(posts, user_id)

    def vote_poll(self, user_id: UUID, poll_id: UUID, option_id: UUID) -> PollResponse:
        from app.models import Poll as PollModel
        poll = self.db.query(PollModel).filter(PollModel.id == poll_id).first()
        if not poll:
            raise HTTPException(status_code=404, detail="Poll not found")
        from datetime import datetime, timezone
        if poll.ends_at and poll.ends_at <= datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Poll has ended")
        existing = self.feed_repo.get_user_poll_vote(user_id, poll_id)
        if existing:
            raise HTTPException(status_code=400, detail="Already voted")
        vote = self.feed_repo.vote_poll(user_id, poll_id, option_id)
        if not vote:
            raise HTTPException(status_code=400, detail="Could not vote")
        return self._enrich_poll(poll, user_id)

    def repost_post(self, user_id: UUID, post_id: UUID, content: str | None = None) -> PostResponse:
        original = self.feed_repo.get_post_by_id(post_id)
        if not original:
            raise HTTPException(status_code=404, detail="Post not found")
        if original.user_id != user_id:
            if original.is_hidden or original.is_draft or original.is_archived:
                raise HTTPException(status_code=404, detail="Post not found")
            if original.privacy == "only_me":
                raise HTTPException(status_code=403, detail="Cannot repost private post")
            if original.privacy == "friends" and not self.feed_repo._are_friends(original.user_id, user_id):
                raise HTTPException(status_code=403, detail="Cannot repost this post")
        post = self.feed_repo.repost_post(user_id, post_id, content)
        return self._enrich_post(post, user_id)

    def quote_post(self, user_id: UUID, post_id: UUID, quote_text: str, content: str | None = None) -> PostResponse:
        original = self.feed_repo.get_post_by_id(post_id)
        if not original:
            raise HTTPException(status_code=404, detail="Post not found")
        if original.user_id != user_id:
            if original.is_hidden or original.is_draft or original.is_archived:
                raise HTTPException(status_code=404, detail="Post not found")
            if original.privacy == "only_me":
                raise HTTPException(status_code=403, detail="Cannot repost private post")
            if original.privacy == "friends" and not self.feed_repo._are_friends(original.user_id, user_id):
                raise HTTPException(status_code=403, detail="Cannot repost this post")
        post = self.feed_repo.quote_post(user_id, post_id, quote_text, content)
        return self._enrich_post(post, user_id)

    def update_feed_position(self, user_id: UUID, data: FeedPositionUpdate) -> FeedPositionResponse:
        last_post_id = UUID(data.last_post_id) if data.last_post_id else None
        position = self.feed_repo.update_feed_position(user_id, data.feed_type, last_post_id, data.scroll_position)
        return FeedPositionResponse(
            user_id=position.user_id,
            feed_type=position.feed_type,
            last_post_id=position.last_post_id,
            scroll_position=position.scroll_position,
            updated_at=position.updated_at,
        )

    def get_feed_position(self, user_id: UUID, feed_type: str) -> FeedPositionResponse | None:
        position = self.feed_repo.get_feed_position(user_id, feed_type)
        if not position:
            return None
        return FeedPositionResponse(
            user_id=position.user_id,
            feed_type=position.feed_type,
            last_post_id=position.last_post_id,
            scroll_position=position.scroll_position,
            updated_at=position.updated_at,
        )

    def get_post_count(self, user_id: UUID) -> int:
        return self.feed_repo.get_post_count(user_id)

    def like_post(self, user_id: UUID, post_id: UUID) -> PostResponse:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            if post.is_hidden or post.is_draft or post.is_archived:
                raise HTTPException(status_code=404, detail="Post not found")
            if post.privacy == "only_me":
                raise HTTPException(status_code=403, detail="Access denied")
            if post.privacy == "friends" and not self.feed_repo._are_friends(post.user_id, user_id):
                raise HTTPException(status_code=403, detail="Access denied")
        self.feed_repo.like_post(user_id, post_id)
        post = self.feed_repo.get_post_by_id(post_id)
        if post.user_id != user_id:
            try:
                svc = NotificationService(self.db)
                svc.create_notification(
                    user_id=post.user_id,
                    actor_id=user_id,
                    type="like",
                    entity_type="post",
                    entity_id=post.id,
                    entity_user_id=user_id,
                )
            except Exception:
                pass
        return self._enrich_post(post, user_id)

    def unlike_post(self, user_id: UUID, post_id: UUID) -> PostResponse:
        post = self.feed_repo.get_post_by_id(post_id)
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        if post.user_id != user_id:
            if post.is_hidden or post.is_draft or post.is_archived:
                raise HTTPException(status_code=404, detail="Post not found")
            if post.privacy == "only_me":
                raise HTTPException(status_code=403, detail="Access denied")
            if post.privacy == "friends" and not self.feed_repo._are_friends(post.user_id, user_id):
                raise HTTPException(status_code=403, detail="Access denied")
        self.feed_repo.unlike_post(user_id, post_id)
        post = self.feed_repo.get_post_by_id(post_id)
        return self._enrich_post(post, user_id)
