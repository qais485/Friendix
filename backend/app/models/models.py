import uuid
import sqlalchemy
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Float, BigInteger
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.base import Base


class TimestampMixin:
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    google_id = Column(String(255), unique=True, index=True, nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    cover_photo_url = Column(String(500), nullable=True)
    username = Column(String(30), unique=True, index=True, nullable=True)
    bio = Column(Text, nullable=True)
    website = Column(String(255), nullable=True)
    gender = Column(String(20), nullable=True)
    birthday = Column(String(10), nullable=True)
    relationship_status = Column(String(30), nullable=True)
    education = Column(Text, nullable=True)
    work = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    languages = Column(Text, nullable=True)
    interests = Column(Text, nullable=True)
    profile_theme = Column(String(50), default="default")
    is_verified = Column(Boolean, default=False)
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    is_deactivated = Column(Boolean, default=False)
    deactivated_at = Column(DateTime(timezone=True), nullable=True)

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    login_history = relationship("LoginHistory", back_populates="user")
    privacy_settings = relationship("PrivacySetting", back_populates="user", uselist=False)


class Session(Base, TimestampMixin):
    __tablename__ = "sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    access_token = Column(Text, nullable=False)
    refresh_token = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    device_info = Column(String(500), nullable=True)
    ip_address = Column(String(45), nullable=True)

    user = relationship("User", back_populates="sessions")


class Device(Base, TimestampMixin):
    __tablename__ = "devices"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_name = Column(String(255), nullable=False)
    device_type = Column(String(50), nullable=False)
    browser = Column(String(100), nullable=True)
    os = Column(String(100), nullable=True)
    ip_address = Column(String(45), nullable=True)
    last_active = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="devices")


class LoginHistory(Base, TimestampMixin):
    __tablename__ = "login_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    device_info = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)
    is_successful = Column(Boolean, default=True)

    user = relationship("User", back_populates="login_history")


class PrivacySetting(Base, TimestampMixin):
    __tablename__ = "privacy_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    profile_visibility = Column(String(20), default="public")
    hide_online_status = Column(Boolean, default=False)
    hide_last_seen = Column(Boolean, default=False)
    hide_birthday = Column(Boolean, default=False)
    hide_phone = Column(Boolean, default=True)
    hide_email = Column(Boolean, default=True)
    hide_work = Column(Boolean, default=False)
    hide_education = Column(Boolean, default=False)
    story_privacy = Column(String(20), default="everyone")
    post_privacy = Column(String(20), default="everyone")
    reel_privacy = Column(String(20), default="everyone")
    photo_privacy = Column(String(20), default="everyone")
    video_privacy = Column(String(20), default="everyone")
    comment_privacy = Column(String(20), default="everyone")
    tag_review = Column(Boolean, default=False)
    timeline_review = Column(Boolean, default=False)
    search_engine_visibility = Column(Boolean, default=True)
    mention_permissions = Column(String(20), default="everyone")
    follow_permissions = Column(String(20), default="everyone")
    friend_request_permissions = Column(String(20), default="everyone")
    message_permissions = Column(String(20), default="everyone")
    call_permissions = Column(String(20), default="everyone")
    hide_friends_list = Column(Boolean, default=False)
    hide_followers_list = Column(Boolean, default=False)
    hide_following_list = Column(Boolean, default=False)
    download_media_permissions = Column(String(20), default="everyone")
    invite_permissions = Column(String(20), default="everyone")

    user = relationship("User", back_populates="privacy_settings")


class BlockedUser(Base, TimestampMixin):
    __tablename__ = "blocked_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    blocked_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    block_type = Column(String(20), default="block")

    user = relationship("User", foreign_keys=[user_id], backref="blocking")
    blocked_user = relationship("User", foreign_keys=[blocked_user_id], backref="blocked_by")


class Friendship(Base, TimestampMixin):
    __tablename__ = "friendships"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    addressee_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="pending")  # pending, accepted, rejected
    is_favorite = Column(Boolean, default=False)
    rejected_at = Column(DateTime(timezone=True), nullable=True)

    requester = relationship("User", foreign_keys=[requester_id], backref="sent_requests")
    addressee = relationship("User", foreign_keys=[addressee_id], backref="received_requests")


class CloseFriend(Base, TimestampMixin):
    __tablename__ = "close_friends"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "friend_id", name="uq_close_friends_user_friend"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    friend_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    user = relationship("User", foreign_keys=[user_id], backref="close_friends_list")
    friend = relationship("User", foreign_keys=[friend_id], backref="added_as_close_friend_by")


class Follow(Base, TimestampMixin):
    __tablename__ = "follows"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    follower_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    following_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    follower = relationship("User", foreign_keys=[follower_id], backref="following")
    following = relationship("User", foreign_keys=[following_id], backref="followers")


class FollowRequest(Base, TimestampMixin):
    __tablename__ = "follow_requests"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("requester_id", "target_id", name="uq_follow_requests_requester_target"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    target_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="pending")  # pending, accepted, rejected

    requester = relationship("User", foreign_keys=[requester_id], backref="sent_follow_requests")
    target = relationship("User", foreign_keys=[target_id], backref="received_follow_requests")


class Mute(Base, TimestampMixin):
    __tablename__ = "mutes"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "muted_user_id", name="uq_mutes_user_muted"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    muted_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    mute_posts = Column(Boolean, default=True)
    mute_stories = Column(Boolean, default=True)
    mute_notes = Column(Boolean, default=True)
    mute_notifications = Column(Boolean, default=True)

    user = relationship("User", foreign_keys=[user_id], backref="muting")
    muted_user = relationship("User", foreign_keys=[muted_user_id], backref="muted_by")


class Restrict(Base, TimestampMixin):
    __tablename__ = "restricts"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "restricted_user_id", name="uq_restricts_user_restricted"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    restricted_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", foreign_keys=[user_id], backref="restricting")
    restricted_user = relationship("User", foreign_keys=[restricted_user_id], backref="restricted_by")


class Post(Base, TimestampMixin):
    __tablename__ = "posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=True)
    image_urls = Column(Text, nullable=True)
    video_url = Column(String(500), nullable=True)
    audio_url = Column(String(500), nullable=True)
    gif_url = Column(String(500), nullable=True)
    document_url = Column(String(500), nullable=True)
    document_name = Column(String(255), nullable=True)
    location_name = Column(String(255), nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    feeling_type = Column(String(50), nullable=True)
    feeling_text = Column(String(255), nullable=True)
    background_style = Column(String(255), nullable=True)
    background_image_url = Column(Text, nullable=True)
    aspect_ratio = Column(String(20), nullable=True)
    post_type = Column(String(20), default="text")
    privacy = Column(String(20), default="everyone")
    is_pinned = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    is_draft = Column(Boolean, default=False)
    is_scheduled = Column(Boolean, default=False)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    shared_post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="SET NULL"), nullable=True)
    quote_text = Column(Text, nullable=True)
    cross_posted_from = Column(String(255), nullable=True)
    repost_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    trending_score = Column(Float, default=0.0)

    user = relationship("User", backref="posts")
    shared_post = relationship("Post", remote_side=[id], backref="reposts")


class PostSave(Base, TimestampMixin):
    __tablename__ = "post_saves"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", backref="saved_posts")
    post = relationship("Post", backref="saved_by")


class PostHide(Base, TimestampMixin):
    __tablename__ = "post_hides"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", backref="hidden_posts")
    post = relationship("Post", backref="hidden_by")


class PostLike(Base, TimestampMixin):
    __tablename__ = "post_likes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)

    user = relationship("User", backref="liked_posts")
    post = relationship("Post", backref="likes")


class FeedPosition(Base, TimestampMixin):
    __tablename__ = "feed_positions"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "feed_type", name="uq_feed_positions_user_feed_type"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    feed_type = Column(String(20), default="home")
    last_post_id = Column(UUID(as_uuid=True), nullable=True)
    scroll_position = Column(Integer, default=0)

    user = relationship("User", backref="feed_positions")


class Poll(Base, TimestampMixin):
    __tablename__ = "polls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), unique=True, nullable=False)
    question = Column(Text, nullable=False)
    ends_at = Column(DateTime(timezone=True), nullable=True)
    is_anonymous = Column(Boolean, default=False)
    total_votes = Column(Integer, default=0)

    post = relationship("Post", backref="poll")
    options = relationship("PollOption", back_populates="poll", cascade="all, delete-orphan")


class PollOption(Base, TimestampMixin):
    __tablename__ = "poll_options"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    text = Column(String(500), nullable=False)
    votes_count = Column(Integer, default=0)

    poll = relationship("Poll", back_populates="options")
    voters = relationship("PollVote", back_populates="option", cascade="all, delete-orphan")


class PollVote(Base, TimestampMixin):
    __tablename__ = "poll_votes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    poll_id = Column(UUID(as_uuid=True), ForeignKey("polls.id", ondelete="CASCADE"), nullable=False)
    option_id = Column(UUID(as_uuid=True), ForeignKey("poll_options.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    poll = relationship("Poll", backref="votes")
    option = relationship("PollOption", back_populates="voters")
    user = relationship("User", backref="poll_votes")


class Media(Base, TimestampMixin):
    __tablename__ = "media"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    media_type = Column(String(20), nullable=False)
    file_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500), nullable=True)
    original_name = Column(String(255), nullable=True)
    mime_type = Column(String(100), nullable=True)
    file_size = Column(Integer, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    duration = Column(Float, nullable=True)
    alt_text = Column(String(500), nullable=True)
    caption = Column(Text, nullable=True)
    cloudinary_public_id = Column(String(500), nullable=True)
    is_processed = Column(Boolean, default=False)
    metadata_json = Column(Text, nullable=True)
    privacy = Column(String(20), default="everyone")

    user = relationship("User", backref="media")


class PhotoAlbum(Base, TimestampMixin):
    __tablename__ = "photo_albums"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    cover_media_id = Column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    privacy = Column(String(20), default="everyone")
    media_count = Column(Integer, default=0)

    user = relationship("User", backref="photo_albums")
    cover_media = relationship("Media", foreign_keys=[cover_media_id])
    photos = relationship("AlbumPhoto", back_populates="album", cascade="all, delete-orphan")


class AlbumPhoto(Base, TimestampMixin):
    __tablename__ = "album_photos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    album_id = Column(UUID(as_uuid=True), ForeignKey("photo_albums.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="CASCADE"), nullable=False)
    position = Column(Integer, default=0)
    caption = Column(Text, nullable=True)

    album = relationship("PhotoAlbum", back_populates="photos")
    media = relationship("Media")


class Story(Base, TimestampMixin):
    __tablename__ = "stories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="CASCADE"), nullable=True)
    content = Column(Text, nullable=True)
    background_color = Column(String(20), nullable=True)
    story_type = Column(String(20), default="media")
    music_url = Column(String(500), nullable=True)
    music_name = Column(String(255), nullable=True)
    music_artist = Column(String(255), nullable=True)
    music_cover_url = Column(String(500), nullable=True)
    is_close_friends_only = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    views_count = Column(Integer, default=0)
    is_archived = Column(Boolean, default=False)

    user = relationship("User", backref="stories")
    media = relationship("Media")
    viewers = relationship("StoryView", back_populates="story", cascade="all, delete-orphan")
    reactions = relationship("StoryReaction", back_populates="story", cascade="all, delete-orphan")
    replies = relationship("StoryReply", back_populates="story", cascade="all, delete-orphan")


class StoryView(Base, TimestampMixin):
    __tablename__ = "story_views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    story = relationship("Story", back_populates="viewers")
    user = relationship("User")


class StoryReaction(Base, TimestampMixin):
    __tablename__ = "story_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji = Column(String(10), nullable=False)

    story = relationship("Story", back_populates="reactions")
    user = relationship("User")


class StoryReply(Base, TimestampMixin):
    __tablename__ = "story_replies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)

    story = relationship("Story", back_populates="replies")
    user = relationship("User")


class StoryHighlight(Base, TimestampMixin):
    __tablename__ = "story_highlights"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    cover_url = Column(String(500), nullable=True)

    user = relationship("User", backref="story_highlights")
    items = relationship("StoryHighlightItem", back_populates="highlight", cascade="all, delete-orphan")


class StoryHighlightItem(Base, TimestampMixin):
    __tablename__ = "story_highlight_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    highlight_id = Column(UUID(as_uuid=True), ForeignKey("story_highlights.id", ondelete="CASCADE"), nullable=False)
    story_id = Column(UUID(as_uuid=True), ForeignKey("stories.id", ondelete="CASCADE"), nullable=False)
    position = Column(Integer, default=0)

    highlight = relationship("StoryHighlight", back_populates="items")
    story = relationship("Story")


class Reel(Base, TimestampMixin):
    __tablename__ = "reels"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    media_id = Column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="CASCADE"), nullable=False)
    caption = Column(Text, nullable=True)
    audio_url = Column(String(500), nullable=True)
    audio_name = Column(String(255), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    duration = Column(Float, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    privacy = Column(String(20), default="everyone")
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    is_archived = Column(Boolean, default=False)

    user = relationship("User", backref="reels")
    media = relationship("Media")


# ============================================================
# Live Streaming Models
# ============================================================

class LiveStream(Base, TimestampMixin):
    __tablename__ = "live_streams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    stream_key = Column(String(255), unique=True, nullable=False)
    stream_url = Column(String(500), nullable=True)
    playback_url = Column(String(500), nullable=True)
    status = Column(String(20), default="scheduled")  # scheduled, live, ended, recording, replay
    privacy = Column(String(20), default="everyone")  # everyone, friends, only_me
    is_recording = Column(Boolean, default=False)
    replay_url = Column(String(500), nullable=True)
    replay_duration = Column(Integer, nullable=True)
    scheduled_at = Column(DateTime(timezone=True), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    viewers_count = Column(Integer, default=0)
    peak_viewers_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    donations_count = Column(Integer, default=0)
    donations_total = Column(Float, default=0.0)
    allow_chat = Column(Boolean, default=True)
    allow_reactions = Column(Boolean, default=True)
    allow_donations = Column(Boolean, default=True)
    allow_guests = Column(Boolean, default=True)

    user = relationship("User", backref="live_streams")
    chat_messages = relationship("LiveChatMessage", back_populates="stream", cascade="all, delete-orphan")
    reactions = relationship("LiveReaction", back_populates="stream", cascade="all, delete-orphan")
    donations = relationship("LiveDonation", back_populates="stream", cascade="all, delete-orphan")
    guests = relationship("LiveGuest", back_populates="stream", cascade="all, delete-orphan")
    moderators = relationship("LiveModerator", back_populates="stream", cascade="all, delete-orphan")
    viewers = relationship("LiveViewer", back_populates="stream", cascade="all, delete-orphan")


class LiveChatMessage(Base, TimestampMixin):
    __tablename__ = "live_chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stream_id = Column(UUID(as_uuid=True), ForeignKey("live_streams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)

    stream = relationship("LiveStream", back_populates="chat_messages")
    user = relationship("User", backref="live_chat_messages")


class LiveReaction(Base, TimestampMixin):
    __tablename__ = "live_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stream_id = Column(UUID(as_uuid=True), ForeignKey("live_streams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji = Column(String(10), nullable=False)

    stream = relationship("LiveStream", back_populates="reactions")
    user = relationship("User", backref="live_reactions")


class LiveDonation(Base, TimestampMixin):
    __tablename__ = "live_donations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stream_id = Column(UUID(as_uuid=True), ForeignKey("live_streams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    message = Column(Text, nullable=True)
    is_anonymous = Column(Boolean, default=False)

    stream = relationship("LiveStream", back_populates="donations")
    user = relationship("User", backref="live_donations")


class LiveGuest(Base, TimestampMixin):
    __tablename__ = "live_guests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stream_id = Column(UUID(as_uuid=True), ForeignKey("live_streams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="pending")  # pending, accepted, rejected, removed
    joined_at = Column(DateTime(timezone=True), nullable=True)
    left_at = Column(DateTime(timezone=True), nullable=True)

    stream = relationship("LiveStream", back_populates="guests")
    user = relationship("User", backref="live_guests")


class LiveModerator(Base, TimestampMixin):
    __tablename__ = "live_moderators"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stream_id = Column(UUID(as_uuid=True), ForeignKey("live_streams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    stream = relationship("LiveStream", back_populates="moderators")
    user = relationship("User", backref="live_moderators")


class LiveViewer(Base, TimestampMixin):
    __tablename__ = "live_viewers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    stream_id = Column(UUID(as_uuid=True), ForeignKey("live_streams.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    last_seen_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    stream = relationship("LiveStream", back_populates="viewers")
    user = relationship("User", backref="live_viewer_history")


# ============================================================
# Comment Models
# ============================================================

class Comment(Base, TimestampMixin):
    __tablename__ = "comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=True)
    content = Column(Text, nullable=False)
    mentions = Column(Text, nullable=True)  # JSON array of mentioned user IDs
    is_pinned = Column(Boolean, default=False)
    is_hidden = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    replies_count = Column(Integer, default=0)
    reactions_count = Column(Integer, default=0)

    post = relationship("Post", backref="comments")
    user = relationship("User", backref="comments")
    parent = relationship("Comment", remote_side=[id], backref="replies")
    reactions = relationship("CommentReaction", back_populates="comment", cascade="all, delete-orphan")
    reports = relationship("CommentReport", back_populates="comment", cascade="all, delete-orphan")


class CommentReaction(Base, TimestampMixin):
    __tablename__ = "comment_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comment_id = Column(UUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji = Column(String(10), nullable=False)

    comment = relationship("Comment", back_populates="reactions")
    user = relationship("User", backref="comment_reactions")


class CommentReport(Base, TimestampMixin):
    __tablename__ = "comment_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comment_id = Column(UUID(as_uuid=True), ForeignKey("comments.id", ondelete="CASCADE"), nullable=False)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason = Column(String(50), nullable=False)  # spam, harassment, inappropriate, other
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending")  # pending, reviewed, resolved, dismissed

    comment = relationship("Comment", back_populates="reports")
    reporter = relationship("User", backref="comment_reports")


# ============================================================
# Messaging Models
# ============================================================


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=True)
    is_group = Column(Boolean, default=False)
    group_photo_url = Column(String(500), nullable=True)
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    last_message_id = Column(UUID(as_uuid=True), nullable=True)
    last_message_at = Column(DateTime(timezone=True), nullable=True)
    is_archived = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    chat_theme = Column(String(50), default="default")
    encryption_key = Column(String(255), nullable=True)

    creator = relationship("User", foreign_keys=[created_by_id], backref="created_conversations")
    members = relationship("ConversationMember", back_populates="conversation", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at.desc()")


class ConversationMember(Base, TimestampMixin):
    __tablename__ = "conversation_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String(20), default="member")  # admin, member
    is_muted = Column(Boolean, default=False)
    is_notifications_paused = Column(Boolean, default=False)
    is_pinned = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    last_read_at = Column(DateTime(timezone=True), nullable=True)
    joined_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    left_at = Column(DateTime(timezone=True), nullable=True)
    is_left = Column(Boolean, default=False)

    conversation = relationship("Conversation", back_populates="members")
    user = relationship("User", backref="conversation_memberships")


class Message(Base, TimestampMixin):
    __tablename__ = "messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=True)
    message_type = Column(String(20), default="text")  # text, image, video, audio, file, voice, gif, sticker, system
    media_url = Column(String(500), nullable=True)
    media_id = Column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)
    duration = Column(Float, nullable=True)  # For voice/video messages
    reply_to_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    is_edited = Column(Boolean, default=False)
    is_deleted = Column(Boolean, default=False)
    is_unsent = Column(Boolean, default=False)
    reactions_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    is_forwarded = Column(Boolean, default=False)
    forwarded_from_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="SET NULL"), nullable=True)
    metadata_json = Column(Text, nullable=True)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], backref="sent_messages")
    reply_to = relationship("Message", remote_side=[id], foreign_keys=[reply_to_id], backref="replies")
    forwarded_from = relationship("Message", remote_side=[id], foreign_keys=[forwarded_from_id], backref="forwards")
    reactions = relationship("MessageReaction", back_populates="message", cascade="all, delete-orphan")
    reads = relationship("MessageRead", back_populates="message", cascade="all, delete-orphan")
    media = relationship("Media", foreign_keys=[media_id], viewonly=True, uselist=False)


class MessageReaction(Base, TimestampMixin):
    __tablename__ = "message_reactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji = Column(String(10), nullable=False)

    message = relationship("Message", back_populates="reactions")
    user = relationship("User", backref="message_reactions")


class MessageRead(Base, TimestampMixin):
    __tablename__ = "message_reads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = Column(UUID(as_uuid=True), ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    message = relationship("Message", back_populates="reads")
    user = relationship("User", backref="message_reads")


class MessageTyping(Base, TimestampMixin):
    __tablename__ = "message_typing"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    is_typing = Column(Boolean, default=True)

    conversation = relationship("Conversation", backref="typing_users")
    user = relationship("User", backref="typing_status")


class OnlineStatus(Base, TimestampMixin):
    __tablename__ = "online_status"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    is_online = Column(Boolean, default=False)
    last_seen_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    status_text = Column(String(100), nullable=True)

    user = relationship("User", backref="online_status", uselist=False)


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    entity_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    content = Column(Text, nullable=True)
    extra_json = Column(Text, nullable=True)
    is_read = Column(Boolean, default=False, nullable=False, index=True)
    read_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", foreign_keys=[user_id], backref="notifications")
    actor = relationship("User", foreign_keys=[actor_id], backref="acted_notifications")
    entity_user = relationship("User", foreign_keys=[entity_user_id], backref="entity_notifications")


class AuditLog(Base, TimestampMixin):
    __tablename__ = "audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    admin_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action = Column(String(100), nullable=False, index=True)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    target_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    details_json = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)

    admin = relationship("User", foreign_keys=[admin_id], backref="audit_logs")
    target_user = relationship("User", foreign_keys=[target_user_id], backref="targeted_audit_logs")


class Report(Base, TimestampMixin):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    entity_type = Column(String(50), nullable=False, index=True)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    reason = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), default="pending", nullable=False, index=True)
    resolved_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    resolution_notes = Column(Text, nullable=True)

    reporter = relationship("User", foreign_keys=[reporter_id], backref="filed_reports")
    reported_user = relationship("User", foreign_keys=[reported_user_id], backref="received_reports")
    resolved_by = relationship("User", foreign_keys=[resolved_by_id], backref="resolved_reports")


class FeatureFlag(Base, TimestampMixin):
    __tablename__ = "feature_flags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=False, nullable=False)
    rollout_percentage = Column(Integer, default=100, nullable=False)
    allowed_user_ids = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)


class BannedUser(Base, TimestampMixin):
    __tablename__ = "banned_users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    banned_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_permanent = Column(Boolean, default=False, nullable=False)

    user = relationship("User", foreign_keys=[user_id], backref="ban_records")
    banned_by = relationship("User", foreign_keys=[banned_by_id], backref="issued_bans")


class SystemSetting(Base, TimestampMixin):
    __tablename__ = "system_settings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    key = Column(String(100), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(50), default="general", nullable=False)


class VerificationRequest(Base, TimestampMixin):
    __tablename__ = "verification_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    document_url = Column(String(500), nullable=True)
    status = Column(String(20), default="pending", nullable=False, index=True)
    reviewed_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    review_notes = Column(Text, nullable=True)

    user = relationship("User", foreign_keys=[user_id], backref="verification_requests")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id], backref="reviewed_verifications")


class SearchHistory(Base, TimestampMixin):
    __tablename__ = "search_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query = Column(String(255), nullable=False)
    search_type = Column(String(50), default="all", nullable=False)
    results_count = Column(Integer, default=0)

    user = relationship("User", backref="search_history")


# ============================================================
# Hashtag Models
# ============================================================

class Hashtag(Base, TimestampMixin):
    __tablename__ = "hashtags"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, index=True, nullable=False)
    posts_count = Column(Integer, default=0)
    followers_count = Column(Integer, default=0)
    description = Column(Text, nullable=True)


class HashtagFollow(Base, TimestampMixin):
    __tablename__ = "hashtag_follows"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "hashtag_id", name="uq_hashtag_follows_user_hashtag"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    hashtag_id = Column(UUID(as_uuid=True), ForeignKey("hashtags.id", ondelete="CASCADE"), nullable=False, index=True)

    user = relationship("User", backref="followed_hashtags")
    hashtag = relationship("Hashtag", backref="followers")


class PostHashtag(Base, TimestampMixin):
    __tablename__ = "post_hashtags"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("post_id", "hashtag_id", name="uq_post_hashtags_post_hashtag"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    post_id = Column(UUID(as_uuid=True), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False, index=True)
    hashtag_id = Column(UUID(as_uuid=True), ForeignKey("hashtags.id", ondelete="CASCADE"), nullable=False, index=True)

    post = relationship("Post", backref="post_hashtags")
    hashtag = relationship("Hashtag", backref="hashtag_posts")


class SavedSearch(Base, TimestampMixin):
    __tablename__ = "saved_searches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    query = Column(String(255), nullable=False)
    search_type = Column(String(50), default="all", nullable=False)
    filters_json = Column(Text, nullable=True)
    label = Column(String(100), nullable=True)

    user = relationship("User", backref="saved_searches")


# ============================================================
# Group Models
# ============================================================

class Group(Base, TimestampMixin):
    __tablename__ = "groups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    cover_url = Column(String(500), nullable=True)
    privacy = Column(String(20), default="public")  # public, private, hidden
    members_count = Column(Integer, default=0)
    rules = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)

    creator = relationship("User", backref="created_groups")


class GroupMember(Base, TimestampMixin):
    __tablename__ = "group_members"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "group_id", name="uq_group_members_user_group"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), default="member")  # admin, moderator, member
    status = Column(String(20), default="approved")  # pending, approved, rejected

    user = relationship("User", backref="group_memberships")
    group = relationship("Group", backref="members")


class GroupJoinRequest(Base, TimestampMixin):
    __tablename__ = "group_join_requests"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "group_id", name="uq_group_join_requests_user_group"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="pending")  # pending, approved, rejected
    message = Column(Text, nullable=True)

    user = relationship("User", backref="group_join_requests")
    group = relationship("Group", backref="join_requests")


class GroupAnnouncement(Base, TimestampMixin):
    __tablename__ = "group_announcements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)

    group = relationship("Group", backref="announcements")
    author = relationship("User", backref="group_announcements")


class GroupEvent(Base, TimestampMixin):
    __tablename__ = "group_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    cover_url = Column(String(500), nullable=True)
    attendees_count = Column(Integer, default=0)

    group = relationship("Group", backref="events")
    creator = relationship("User", backref="created_group_events")


class GroupEventAttendee(Base, TimestampMixin):
    __tablename__ = "group_event_attendees"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "event_id", name="uq_group_event_attendees_user_event"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("group_events.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="going")  # going, maybe, invited

    user = relationship("User", backref="group_event_attendances")
    event = relationship("GroupEvent", backref="attendees")


class GroupPoll(Base, TimestampMixin):
    __tablename__ = "group_polls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question = Column(String(500), nullable=False)
    options_json = Column(Text, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_anonymous = Column(Boolean, default=False)
    total_votes = Column(Integer, default=0)

    group = relationship("Group", backref="polls")
    creator = relationship("User", backref="created_group_polls")


class GroupPollVote(Base, TimestampMixin):
    __tablename__ = "group_poll_votes"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "poll_id", name="uq_group_poll_votes_user_poll"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    poll_id = Column(UUID(as_uuid=True), ForeignKey("group_polls.id", ondelete="CASCADE"), nullable=False, index=True)
    option_index = Column(Integer, nullable=False)

    user = relationship("User", backref="group_poll_votes")
    poll = relationship("GroupPoll", backref="votes")


class GroupMessage(Base, TimestampMixin):
    __tablename__ = "group_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    group_id = Column(UUID(as_uuid=True), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_announcement = Column(Boolean, default=False)

    group = relationship("Group", backref="messages")
    user = relationship("User", backref="group_messages")


# ============================================================
# Standalone Event Models
# ============================================================

class Event(Base, TimestampMixin):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    cover_url = Column(String(500), nullable=True)
    event_type = Column(String(20), default="offline")  # online, offline
    location = Column(String(500), nullable=True)
    online_link = Column(String(500), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)
    attendees_count = Column(Integer, default=0)
    invited_count = Column(Integer, default=0)
    is_cancelled = Column(Boolean, default=False)
    reminder_minutes = Column(Integer, default=60)

    creator = relationship("User", backref="created_events")


class EventRSVP(Base, TimestampMixin):
    __tablename__ = "event_rsvps"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "event_id", name="uq_event_rsvps_user_event"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(20), default="going")  # going, maybe, invited, declined

    user = relationship("User", backref="event_rsvps")
    event = relationship("Event", backref="rsvps")


class EventInvite(Base, TimestampMixin):
    __tablename__ = "event_invites"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "event_id", name="uq_event_invites_user_event"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    inviter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(20), default="pending")  # pending, accepted, declined

    user = relationship("User", foreign_keys=[user_id], backref="event_invites")
    event = relationship("Event", backref="invites")
    inviter = relationship("User", foreign_keys=[inviter_id])


class EventChatMessage(Base, TimestampMixin):
    __tablename__ = "event_chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)

    event = relationship("Event", backref="chat_messages")
    user = relationship("User", backref="event_chat_messages")


# ============================================================
# Video Platform Models
# ============================================================

class VideoCategory(Base, TimestampMixin):
    __tablename__ = "video_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    icon = Column(String(50), nullable=True)
    description = Column(Text, nullable=True)
    videos_count = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)


class Video(Base, TimestampMixin):
    __tablename__ = "videos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    media_id = Column(UUID(as_uuid=True), ForeignKey("media.id", ondelete="SET NULL"), nullable=True)
    category_id = Column(UUID(as_uuid=True), ForeignKey("video_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=False)
    duration = Column(Float, nullable=True)
    width = Column(Integer, nullable=True)
    height = Column(Integer, nullable=True)
    privacy = Column(String(20), default="everyone")
    status = Column(String(20), default="ready")  # processing, ready, failed
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    is_archived = Column(Boolean, default=False)

    user = relationship("User", backref="videos")
    media = relationship("Media", backref="videos")
    category = relationship("VideoCategory", backref="videos")


class VideoLike(Base, TimestampMixin):
    __tablename__ = "video_likes"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "video_id", name="uq_video_likes_user_video"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)

    user = relationship("User", backref="video_likes")
    video = relationship("Video", backref="likes")


class VideoComment(Base, TimestampMixin):
    __tablename__ = "video_comments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("video_comments.id", ondelete="CASCADE"), nullable=True)
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)

    user = relationship("User", backref="video_comments")
    video = relationship("Video", backref="comments")
    parent = relationship("VideoComment", remote_side="VideoComment.id", backref="replies")


class WatchLater(Base, TimestampMixin):
    __tablename__ = "watch_later"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("user_id", "video_id", name="uq_watch_later_user_video"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)

    user = relationship("User", backref="watch_later")
    video = relationship("Video", backref="watch_later_entries")


class Playlist(Base, TimestampMixin):
    __tablename__ = "playlists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    thumbnail_url = Column(String(500), nullable=True)
    privacy = Column(String(20), default="everyone")
    videos_count = Column(Integer, default=0)
    is_system = Column(Boolean, default=False)  # for watch_later, history auto-playlists

    user = relationship("User", backref="playlists")


class PlaylistVideo(Base, TimestampMixin):
    __tablename__ = "playlist_videos"
    __table_args__ = (
        sqlalchemy.UniqueConstraint("playlist_id", "video_id", name="uq_playlist_videos_playlist_video"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    playlist_id = Column(UUID(as_uuid=True), ForeignKey("playlists.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    position = Column(Integer, default=0)

    playlist = relationship("Playlist", backref="playlist_videos")
    video = relationship("Video", backref="playlist_entries")


class WatchHistory(Base, TimestampMixin):
    __tablename__ = "watch_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    video_id = Column(UUID(as_uuid=True), ForeignKey("videos.id", ondelete="CASCADE"), nullable=False, index=True)
    progress = Column(Float, default=0.0)  # seconds watched
    completed = Column(Boolean, default=False)

    user = relationship("User", backref="watch_history")
    video = relationship("Video", backref="watch_history_entries")


# ============================================================
# Analytics Models
# ============================================================

class ProfileView(Base, TimestampMixin):
    __tablename__ = "profile_views"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    viewer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    viewed_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    viewer = relationship("User", foreign_keys=[viewer_id], backref="profile_views_made")
    viewed = relationship("User", foreign_keys=[viewed_id], backref="profile_views_received")


# ============================================================
# Content Event Tracking Models
# ============================================================

class ContentEvent(Base, TimestampMixin):
    """Append-only raw event log for content engagement tracking.

    Every user action (impression, view start, watch time heartbeat, like,
    share, report, ...) is written here. The table is write-optimized and
    meant to grow unboundedly; plan to partition it by ``occurred_at`` at
    scale. Aggregations (counters, time series) read from this log or from
    the denormalized ``view_sessions`` table.
    """

    __tablename__ = "content_events"
    __table_args__ = (
        sqlalchemy.Index(
            "ix_content_events_content_event_occurred",
            "content_id", "event_type", "occurred_at",
        ),
        sqlalchemy.Index(
            "ix_content_events_user_occurred",
            "user_id", "occurred_at",
        ),
        sqlalchemy.Index(
            "ix_content_events_creator_event",
            "creator_id", "event_type",
        ),
        sqlalchemy.Index(
            "ix_content_events_type_occurred",
            "event_type", "occurred_at",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Client-generated idempotency token so network retries never double count.
    client_event_id = Column(String(64), nullable=True, unique=True, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    # Polymorphic content reference (video / reel / post / story / live / media).
    content_type = Column(String(20), nullable=False)
    content_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    # Denormalized so "follow after viewing" and creator analytics need no join.
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    event_type = Column(String(30), nullable=False, index=True)
    # Correlation id that groups view_start / watch_time / percentage / completion.
    view_session_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    # Payload value, e.g. watch_time -> seconds, view_percentage -> 0-100.
    value = Column(Float, nullable=True)
    position_seconds = Column(Float, nullable=True)
    context = Column(String(50), nullable=True)  # feed, profile, search, related, ...
    source = Column(String(50), nullable=True)   # for_you, following, trending, ...
    metadata_json = Column(Text, nullable=True)
    # Client-reported event time (as opposed to server receipt created_at).
    occurred_at = Column(DateTime(timezone=True), nullable=False, index=True)

    user = relationship("User", foreign_keys=[user_id], backref="content_events")
    creator = relationship("User", foreign_keys=[creator_id], backref="content_event_creations")


class ViewSession(Base, TimestampMixin):
    """Denormalized aggregate of a single viewing session.

    Upserted while ingesting events so watch time / percentage / completion
    for a ``view_session_id`` are available without scanning the raw log.
    """

    __tablename__ = "view_sessions"
    __table_args__ = (
        sqlalchemy.Index(
            "ix_view_sessions_content_id",
            "content_id",
        ),
        sqlalchemy.Index(
            "ix_view_sessions_user_started",
            "user_id", "started_at",
        ),
    )

    # Client-generated id, shared with the ContentEvent.view_session_id.
    id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    content_type = Column(String(20), nullable=False)
    content_id = Column(UUID(as_uuid=True), nullable=False)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    context = Column(String(50), nullable=True)
    source = Column(String(50), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=False)
    last_activity_at = Column(DateTime(timezone=True), nullable=False)
    watch_time_seconds = Column(Float, default=0.0, nullable=False)
    view_percentage = Column(Float, default=0.0, nullable=False)
    views_count = Column(Integer, default=0, nullable=False)
    replays_count = Column(Integer, default=0, nullable=False)
    completed = Column(Boolean, default=False, nullable=False)
    skipped = Column(Boolean, default=False, nullable=False)

    user = relationship("User", foreign_keys=[user_id], backref="view_sessions")
    creator = relationship("User", foreign_keys=[creator_id], backref="created_view_sessions")


# ============================================================
# User Interest Profile Models
# ============================================================

class InterestProfile(Base, TimestampMixin):
    """Per-user aggregate holding the incremental-processing watermark.

    ``last_occurred_at``/``last_event_id`` form an ordered (occurred_at, id)
    watermark so the interest build job only consumes newly arrived events.
    """

    __tablename__ = "interest_profiles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    computed_at = Column(DateTime(timezone=True), nullable=False,
                         default=lambda: datetime.now(timezone.utc))
    last_occurred_at = Column(DateTime(timezone=True), nullable=True)
    last_event_id = Column(UUID(as_uuid=True), nullable=True)
    total_interests = Column(Integer, default=0, nullable=False)
    version = Column(Integer, default=1, nullable=False)

    user = relationship("User", backref="interest_profile", uselist=False)


class UserInterest(Base, TimestampMixin):
    """One row per (user, interest dimension) with a decaying strength score."""

    __tablename__ = "user_interests"
    __table_args__ = (
        sqlalchemy.UniqueConstraint(
            "user_id", "interest_type", "interest_key",
            name="uq_user_interests_user_type_key",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interest_type = Column(String(20), nullable=False)  # category, tag, creator, topic
    interest_key = Column(String(255), nullable=False)
    interest_name = Column(String(255), nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    strength = Column(Float, default=0.0, nullable=False)
    positive_signals = Column(Integer, default=0, nullable=False)
    negative_signals = Column(Integer, default=0, nullable=False)
    total_signals = Column(Integer, default=0, nullable=False)
    first_seen_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    last_interaction_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    # Last time the Learning Loop (Phase 6) bulk-decayed this row's strength.
    # Null means "decay from first_seen_at / last_interaction_at". Prevents the
    # periodic decay pass from double-decaying interests between interactions.
    last_decayed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", backref="user_interests")


class InterestEventSignal(Base, TimestampMixin):
    """Audit trail / derived feature store: one row per (event, dimension).

    Lets Phase 3+ re-derive or explain profiles without re-reading raw event
    payloads, and makes incremental processing observable.
    """

    __tablename__ = "interest_event_signals"
    __table_args__ = (
        sqlalchemy.UniqueConstraint(
            "event_id", "interest_type", "interest_key",
            name="uq_interest_event_signals_event_dim",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("content_events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    interest_type = Column(String(20), nullable=False)
    interest_key = Column(String(255), nullable=False)
    interest_name = Column(String(255), nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    delta = Column(Float, default=0.0, nullable=False)
    base_event_type = Column(String(30), nullable=False)
    occurred_at = Column(DateTime(timezone=True), nullable=False)

    user = relationship("User", backref="interest_event_signals")
    event = relationship("ContentEvent", backref="interest_signals")


# ============================================================
# Content Profile Models
# ============================================================

class ContentProfile(Base, TimestampMixin):
    """Machine-readable profile for any content item.

    One row per (content_type, content_id) holding the derived attributes used
    by ranking / filtering later: category, tags, topics, language, creator,
    media type, duration and publish time. Built from the content's own row
    plus its media, category and hashtags.
    """

    __tablename__ = "content_profiles"
    __table_args__ = (
        sqlalchemy.UniqueConstraint(
            "content_type", "content_id",
            name="uq_content_profiles_type_id",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_type = Column(String(20), nullable=False, index=True)  # video, post, reel, story, live
    content_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(500), nullable=True)
    category_id = Column(UUID(as_uuid=True), nullable=True)
    category_name = Column(String(100), nullable=True)
    tags_json = Column(Text, nullable=True)      # JSON array of tag names
    topics_json = Column(Text, nullable=True)    # JSON array of topic tokens
    language = Column(String(10), nullable=True)
    media_type = Column(String(30), nullable=True)  # video, image, audio, text, gif, document, live
    mime_type = Column(String(100), nullable=True)
    duration_seconds = Column(Float, nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=True, index=True)
    source_updated_at = Column(DateTime(timezone=True), nullable=True)
    version = Column(Integer, default=1, nullable=False)
    # Computed metrics (configurable formulas, see core/metrics_config.py).
    popularity_score = Column(Float, default=0.0, nullable=False, index=True)
    quality_score = Column(Float, default=0.0, nullable=False, index=True)
    freshness_score = Column(Float, default=0.0, nullable=False, index=True)
    metrics_updated_at = Column(DateTime(timezone=True), nullable=True)

    creator = relationship("User", backref="content_profiles")


class MetricsState(Base, TimestampMixin):
    """Single-row watermark for the incremental content metrics job."""

    __tablename__ = "metrics_state"

    id = Column(Integer, primary_key=True, default=1)
    last_occurred_at = Column(DateTime(timezone=True), nullable=True)
    last_event_id = Column(UUID(as_uuid=True), nullable=True)


class LearningLoopState(Base, TimestampMixin):
    """Single-row control + telemetry for the Phase 6 Learning Loop.

    Tracks when each driver (interests / content metrics) last ran and how many
    signals were applied, so the scheduled loop is idempotent, observable, and
    easy to backfill. ``decay_last_run_at`` gates the bulk interest-decay pass.
    """

    __tablename__ = "learning_loop_state"

    id = Column(Integer, primary_key=True, default=1)

    # Warehouse watermarks are stored on their own tables (interest_profiles,
    # metrics_state); this row only records *aggregate progress* surfaced to ops.
    interests_last_run_at = Column(DateTime(timezone=True), nullable=True)
    interests_total_events = Column(BigInteger, default=0, nullable=False)
    interests_total_signals = Column(BigInteger, default=0, nullable=False)
    interests_version = Column(Integer, default=0, nullable=False)

    metrics_last_run_at = Column(DateTime(timezone=True), nullable=True)
    metrics_total_events = Column(BigInteger, default=0, nullable=False)
    metrics_profiles_updated = Column(BigInteger, default=0, nullable=False)

    # Bulk decay pass (fades stale interests between interactions).
    decay_last_run_at = Column(DateTime(timezone=True), nullable=True)
    decay_total_rows = Column(BigInteger, default=0, nullable=False)
    decay_removed = Column(BigInteger, default=0, nullable=False)
