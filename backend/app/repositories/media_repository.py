from uuid import UUID
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, desc, func
from app.models import Media, PhotoAlbum, AlbumPhoto, Story, StoryView, StoryReaction, StoryReply, StoryHighlight, StoryHighlightItem, Reel, BlockedUser, PrivacySetting, Friendship, CloseFriend


class MediaRepository:
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

    def _get_friend_ids(self, user_id: UUID) -> list[UUID]:
        friendships = self.db.query(Friendship).filter(
            and_(
                or_(
                    Friendship.requester_id == user_id,
                    Friendship.addressee_id == user_id,
                ),
                Friendship.status == "accepted",
            )
        ).all()
        ids = []
        for f in friendships:
            ids.append(f.addressee_id if f.requester_id == user_id else f.requester_id)
        return ids

    def create_media(self, user_id: UUID, **kwargs) -> Media:
        media = Media(user_id=user_id, **kwargs)
        self.db.add(media)
        self.db.commit()
        self.db.refresh(media)
        return media

    def get_media_by_id(self, media_id: UUID, viewer_id: UUID | None = None) -> Media | None:
        media = self.db.query(Media).filter(Media.id == media_id).first()
        if not media:
            return None
        if viewer_id and viewer_id != media.user_id:
            if media.privacy == "only_me":
                return None
            if media.privacy == "friends":
                are_friends = self.db.query(Friendship).filter(
                    and_(
                        or_(
                            Friendship.requester_id == viewer_id,
                            Friendship.addressee_id == viewer_id,
                        ),
                        or_(
                            Friendship.requester_id == media.user_id,
                            Friendship.addressee_id == media.user_id,
                        ),
                        Friendship.status == "accepted",
                    )
                ).first() is not None
                if not are_friends:
                    return None
        return media

    def get_user_media(self, user_id: UUID, media_type: str | None = None, limit: int = 20, offset: int = 0, viewer_id: UUID | None = None) -> list[Media]:
        base_filter = [Media.user_id == user_id]
        if media_type:
            base_filter.append(Media.media_type == media_type)
        if viewer_id and viewer_id != user_id:
            excluded_ids = self._get_blocked_user_ids(viewer_id)
            if excluded_ids and user_id in excluded_ids:
                return []
            are_friends = self.db.query(Friendship).filter(
                and_(
                    or_(
                        Friendship.requester_id == viewer_id,
                        Friendship.addressee_id == viewer_id,
                    ),
                    or_(
                        Friendship.requester_id == user_id,
                        Friendship.addressee_id == user_id,
                    ),
                    Friendship.status == "accepted",
                )
            ).first() is not None
            if are_friends:
                base_filter.append(Media.privacy.in_(["everyone", "friends"]))
            else:
                base_filter.append(Media.privacy == "everyone")
        return self.db.query(Media).filter(and_(*base_filter)).order_by(desc(Media.created_at)).limit(limit).offset(offset).all()

    def get_user_media_count(self, user_id: UUID, media_type: str | None = None) -> int:
        query = self.db.query(func.count(Media.id)).filter(Media.user_id == user_id)
        if media_type:
            query = query.filter(Media.media_type == media_type)
        return query.scalar() or 0

    def update_media(self, media: Media, **kwargs) -> Media:
        for key, value in kwargs.items():
            setattr(media, key, value)
        self.db.commit()
        self.db.refresh(media)
        return media

    def delete_media(self, media: Media) -> None:
        self.db.delete(media)
        self.db.commit()

    def create_album(self, user_id: UUID, **kwargs) -> PhotoAlbum:
        album = PhotoAlbum(user_id=user_id, **kwargs)
        self.db.add(album)
        self.db.commit()
        self.db.refresh(album)
        return album

    def get_album_by_id(self, album_id: UUID) -> PhotoAlbum | None:
        return self.db.query(PhotoAlbum).filter(PhotoAlbum.id == album_id).first()

    def get_user_albums(self, user_id: UUID) -> list[PhotoAlbum]:
        return self.db.query(PhotoAlbum).filter(
            PhotoAlbum.user_id == user_id
        ).order_by(desc(PhotoAlbum.updated_at)).all()

    def update_album(self, album: PhotoAlbum, **kwargs) -> PhotoAlbum:
        for key, value in kwargs.items():
            setattr(album, key, value)
        self.db.commit()
        self.db.refresh(album)
        return album

    def delete_album(self, album: PhotoAlbum) -> None:
        self.db.delete(album)
        self.db.commit()

    def add_photo_to_album(self, album_id: UUID, media_id: UUID, caption: str | None = None, position: int = 0) -> AlbumPhoto:
        photo = AlbumPhoto(album_id=album_id, media_id=media_id, caption=caption, position=position)
        self.db.add(photo)
        album = self.db.query(PhotoAlbum).filter(PhotoAlbum.id == album_id).first()
        if album:
            album.media_count = (album.media_count or 0) + 1
        self.db.commit()
        self.db.refresh(photo)
        return photo

    def remove_photo_from_album(self, album_id: UUID, media_id: UUID) -> bool:
        photo = self.db.query(AlbumPhoto).filter(
            and_(AlbumPhoto.album_id == album_id, AlbumPhoto.media_id == media_id)
        ).first()
        if photo:
            self.db.delete(photo)
            album = self.db.query(PhotoAlbum).filter(PhotoAlbum.id == album_id).first()
            if album and album.media_count > 0:
                album.media_count -= 1
            self.db.commit()
            return True
        return False

    def get_album_photos(self, album_id: UUID) -> list[AlbumPhoto]:
        return self.db.query(AlbumPhoto).filter(
            AlbumPhoto.album_id == album_id
        ).order_by(AlbumPhoto.position).all()

    def create_story(self, user_id: UUID, expires_at: datetime, **kwargs) -> Story:
        story = Story(user_id=user_id, expires_at=expires_at, **kwargs)
        self.db.add(story)
        self.db.commit()
        self.db.refresh(story)
        return story

    def get_active_stories(self, user_ids: list[UUID], viewer_id: UUID | None = None) -> list[Story]:
        now = datetime.now(timezone.utc)
        base_filter = [
            Story.user_id.in_(user_ids),
            Story.expires_at > now,
            Story.is_archived == False,
        ]
        if viewer_id:
            excluded_ids = self._get_blocked_user_ids(viewer_id)
            if excluded_ids:
                base_filter.append(~Story.user_id.in_(excluded_ids))
            close_friend_ids = self.get_close_friend_ids(viewer_id)
            base_filter.append(
                or_(
                    Story.is_close_friends_only == False,
                    Story.user_id == viewer_id,
                    Story.user_id.in_(close_friend_ids) if close_friend_ids else False,
                )
            )
        else:
            base_filter.append(Story.is_close_friends_only == False)
        if viewer_id:
            privacy_settings = self.db.query(PrivacySetting).filter(
                PrivacySetting.user_id.in_(user_ids)
            ).all()
            privacy_map = {ps.user_id: ps.story_privacy for ps in privacy_settings}

            only_me_user_ids = [uid for uid, p in privacy_map.items() if p == "only_me"]
            friends_only_user_ids = [uid for uid, p in privacy_map.items() if p == "friends"]
            everyone_else = [uid for uid in user_ids if uid not in privacy_map or privacy_map[uid] == "everyone"]

            friend_ids = self._get_friend_ids(viewer_id)

            privacy_conditions = []
            if everyone_else:
                privacy_conditions.append(Story.user_id.in_(everyone_else))
            if only_me_user_ids:
                privacy_conditions.append(
                    and_(Story.user_id.in_(only_me_user_ids), Story.user_id == viewer_id)
                )
            if friends_only_user_ids:
                allowed_friend_ids = [uid for uid in friends_only_user_ids if uid in friend_ids or uid == viewer_id]
                if allowed_friend_ids:
                    privacy_conditions.append(Story.user_id.in_(allowed_friend_ids))

            if privacy_conditions:
                base_filter.append(or_(*privacy_conditions))
            else:
                base_filter.append(False)
        return self.db.query(Story).options(joinedload(Story.media), joinedload(Story.user)).filter(and_(*base_filter)).order_by(desc(Story.created_at)).all()

    def get_user_stories(self, user_id: UUID, viewer_id: UUID | None = None) -> list[Story]:
        now = datetime.now(timezone.utc)
        base_filter = [
            Story.user_id == user_id,
            Story.expires_at > now,
            Story.is_archived == False,
        ]
        if viewer_id and viewer_id != user_id:
            excluded_ids = self._get_blocked_user_ids(viewer_id)
            if excluded_ids and user_id in excluded_ids:
                return []

            close_friend_ids = self.get_close_friend_ids(viewer_id)
            is_close_friend = user_id in close_friend_ids if close_friend_ids else False
            if not is_close_friend:
                base_filter.append(Story.is_close_friends_only == False)

            privacy_setting = self.db.query(PrivacySetting).filter(
                PrivacySetting.user_id == user_id
            ).first()
            story_privacy = privacy_setting.story_privacy if privacy_setting else "everyone"

            if story_privacy == "only_me":
                return []
            elif story_privacy == "friends":
                friend_ids = self._get_friend_ids(viewer_id)
                if user_id not in friend_ids and user_id != viewer_id:
                    return []
        return self.db.query(Story).options(joinedload(Story.media), joinedload(Story.user)).filter(and_(*base_filter)).order_by(desc(Story.created_at)).all()

    def get_story_by_id(self, story_id: UUID) -> Story | None:
        return self.db.query(Story).filter(Story.id == story_id).first()

    def view_story(self, story_id: UUID, user_id: UUID) -> StoryView | None:
        existing = self.db.query(StoryView).filter(
            and_(StoryView.story_id == story_id, StoryView.user_id == user_id)
        ).first()
        if existing:
            return existing
        view = StoryView(story_id=story_id, user_id=user_id)
        self.db.add(view)
        story = self.db.query(Story).filter(Story.id == story_id).first()
        if story:
            story.views_count = (story.views_count or 0) + 1
        self.db.commit()
        self.db.refresh(view)
        return view

    def get_story_viewers(self, story_id: UUID) -> list[StoryView]:
        return self.db.query(StoryView).filter(StoryView.story_id == story_id).all()

    def delete_story(self, story: Story) -> None:
        self.db.delete(story)
        self.db.commit()

    def create_reel(self, user_id: UUID, media_id: UUID, **kwargs) -> Reel:
        reel = Reel(user_id=user_id, media_id=media_id, **kwargs)
        self.db.add(reel)
        self.db.commit()
        self.db.refresh(reel)
        return reel

    def get_reel_by_id(self, reel_id: UUID) -> Reel | None:
        return self.db.query(Reel).filter(Reel.id == reel_id).first()

    def get_user_reels(self, user_id: UUID, viewer_id: UUID | None = None, limit: int = 20, offset: int = 0) -> list[Reel]:
        base_filter = [Reel.user_id == user_id, Reel.is_archived == False]
        if viewer_id and viewer_id != user_id:
            excluded_ids = self._get_blocked_user_ids(viewer_id)
            if excluded_ids and user_id in excluded_ids:
                return []
            from app.repositories.feed_repository import FeedRepository
            feed_repo = FeedRepository(self.db)
            are_friends = feed_repo._are_friends(user_id, viewer_id)
            if are_friends:
                base_filter.append(Reel.privacy.in_(["everyone", "friends"]))
            else:
                base_filter.append(Reel.privacy == "everyone")
        return self.db.query(Reel).options(joinedload(Reel.media), joinedload(Reel.user)).filter(and_(*base_filter)).order_by(desc(Reel.created_at)).limit(limit).offset(offset).all()

    def get_feed_reels(self, user_id: UUID, following_ids: list[UUID], limit: int = 20, offset: int = 0) -> list[Reel]:
        visible_ids = list(set(following_ids) | {user_id})
        return self.db.query(Reel).options(joinedload(Reel.media), joinedload(Reel.user)).filter(
            and_(
                Reel.user_id.in_(visible_ids),
                Reel.is_archived == False,
                Reel.privacy.in_(["everyone", "friends"]),
            )
        ).order_by(desc(Reel.created_at)).limit(limit).offset(offset).all()

    def get_trending_reels(self, limit: int = 20, offset: int = 0) -> list[Reel]:
        return self.db.query(Reel).options(joinedload(Reel.media), joinedload(Reel.user)).filter(
            and_(Reel.is_archived == False, Reel.privacy == "everyone")
        ).order_by(desc(Reel.views_count), desc(Reel.created_at)).limit(limit).offset(offset).all()

    def update_reel(self, reel: Reel, **kwargs) -> Reel:
        for key, value in kwargs.items():
            setattr(reel, key, value)
        self.db.commit()
        self.db.refresh(reel)
        return reel

    def delete_reel(self, reel: Reel) -> None:
        self.db.delete(reel)
        self.db.commit()

    def increment_reel_views(self, reel_id: UUID) -> None:
        reel = self.db.query(Reel).filter(Reel.id == reel_id).first()
        if reel:
            reel.views_count = (reel.views_count or 0) + 1
            self.db.commit()

    def get_user_reel_count(self, user_id: UUID) -> int:
        return self.db.query(func.count(Reel.id)).filter(
            and_(Reel.user_id == user_id, Reel.is_archived == False)
        ).scalar() or 0

    def get_user_story_count(self, user_id: UUID) -> int:
        now = datetime.now(timezone.utc)
        return self.db.query(func.count(Story.id)).filter(
            and_(
                Story.user_id == user_id,
                Story.expires_at > now,
                Story.is_archived == False,
            )
        ).scalar() or 0

    def archive_story(self, story: Story) -> Story:
        story.is_archived = True
        self.db.commit()
        self.db.refresh(story)
        return story

    def get_archived_stories(self, user_id: UUID) -> list[Story]:
        return self.db.query(Story).filter(
            and_(
                Story.user_id == user_id,
                Story.is_archived == True,
            )
        ).order_by(desc(Story.created_at)).all()

    def unarchive_story(self, story: Story) -> Story:
        story.is_archived = False
        self.db.commit()
        self.db.refresh(story)
        return story

    def get_close_friends_stories(self, user_id: UUID, close_friend_ids: list[UUID]) -> list[Story]:
        now = datetime.now(timezone.utc)
        visible_ids = list(set(close_friend_ids) | {user_id})
        return self.db.query(Story).filter(
            and_(
                Story.user_id.in_(visible_ids),
                Story.expires_at > now,
                Story.is_archived == False,
                Story.is_close_friends_only == True,
            )
        ).order_by(desc(Story.created_at)).all()

    def add_reaction(self, story_id: UUID, user_id: UUID, emoji: str) -> StoryReaction:
        existing = self.db.query(StoryReaction).filter(
            and_(
                StoryReaction.story_id == story_id,
                StoryReaction.user_id == user_id,
            )
        ).first()
        if existing:
            existing.emoji = emoji
            self.db.commit()
            self.db.refresh(existing)
            return existing
        reaction = StoryReaction(story_id=story_id, user_id=user_id, emoji=emoji)
        self.db.add(reaction)
        self.db.commit()
        self.db.refresh(reaction)
        return reaction

    def remove_reaction(self, story_id: UUID, user_id: UUID) -> bool:
        reaction = self.db.query(StoryReaction).filter(
            and_(
                StoryReaction.story_id == story_id,
                StoryReaction.user_id == user_id,
            )
        ).first()
        if reaction:
            self.db.delete(reaction)
            self.db.commit()
            return True
        return False

    def get_story_reactions(self, story_id: UUID) -> list[StoryReaction]:
        return self.db.query(StoryReaction).filter(StoryReaction.story_id == story_id).all()

    def get_story_reaction_counts(self, story_id: UUID) -> dict[str, int]:
        results = self.db.query(
            StoryReaction.emoji,
            func.count(StoryReaction.id)
        ).filter(StoryReaction.story_id == story_id).group_by(StoryReaction.emoji).all()
        return {emoji: count for emoji, count in results}

    def add_reply(self, story_id: UUID, user_id: UUID, content: str) -> StoryReply:
        reply = StoryReply(story_id=story_id, user_id=user_id, content=content)
        self.db.add(reply)
        self.db.commit()
        self.db.refresh(reply)
        return reply

    def get_story_replies(self, story_id: UUID) -> list[StoryReply]:
        return self.db.query(StoryReply).filter(StoryReply.story_id == story_id).order_by(StoryReply.created_at).all()

    def delete_reply(self, reply: StoryReply) -> None:
        self.db.delete(reply)
        self.db.commit()

    def create_highlight(self, user_id: UUID, title: str, cover_url: str | None = None) -> StoryHighlight:
        highlight = StoryHighlight(user_id=user_id, title=title, cover_url=cover_url)
        self.db.add(highlight)
        self.db.commit()
        self.db.refresh(highlight)
        return highlight

    def get_user_highlights(self, user_id: UUID) -> list[StoryHighlight]:
        return self.db.query(StoryHighlight).filter(
            StoryHighlight.user_id == user_id
        ).order_by(desc(StoryHighlight.updated_at)).all()

    def get_highlight_by_id(self, highlight_id: UUID) -> StoryHighlight | None:
        return self.db.query(StoryHighlight).filter(StoryHighlight.id == highlight_id).first()

    def update_highlight(self, highlight: StoryHighlight, **kwargs) -> StoryHighlight:
        for key, value in kwargs.items():
            setattr(highlight, key, value)
        self.db.commit()
        self.db.refresh(highlight)
        return highlight

    def delete_highlight(self, highlight: StoryHighlight) -> None:
        self.db.delete(highlight)
        self.db.commit()

    def add_story_to_highlight(self, highlight_id: UUID, story_id: UUID, position: int = 0) -> StoryHighlightItem:
        existing = self.db.query(StoryHighlightItem).filter(
            and_(
                StoryHighlightItem.highlight_id == highlight_id,
                StoryHighlightItem.story_id == story_id,
            )
        ).first()
        if existing:
            return existing
        item = StoryHighlightItem(highlight_id=highlight_id, story_id=story_id, position=position)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def remove_story_from_highlight(self, highlight_id: UUID, story_id: UUID) -> bool:
        item = self.db.query(StoryHighlightItem).filter(
            and_(
                StoryHighlightItem.highlight_id == highlight_id,
                StoryHighlightItem.story_id == story_id,
            )
        ).first()
        if item:
            self.db.delete(item)
            self.db.commit()
            return True
        return False

    def get_highlight_items(self, highlight_id: UUID) -> list[StoryHighlightItem]:
        return self.db.query(StoryHighlightItem).filter(
            StoryHighlightItem.highlight_id == highlight_id
        ).order_by(StoryHighlightItem.position).all()

    def get_close_friend_ids(self, user_id: UUID) -> list[UUID]:
        close_friends = self.db.query(CloseFriend).filter(
            CloseFriend.user_id == user_id
        ).all()
        return [cf.friend_id for cf in close_friends]
