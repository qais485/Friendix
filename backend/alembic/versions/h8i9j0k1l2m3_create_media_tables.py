"""create media tables

Revision ID: h8i9j0k1l2m3
Revises: g7h8i9j0k1l2
Create Date: 2026-07-27
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "h8i9j0k1l2m3"
down_revision = "g7h8i9j0k1l2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "media",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("media_type", sa.String(20), nullable=False),
        sa.Column("file_url", sa.String(500), nullable=False),
        sa.Column("thumbnail_url", sa.String(500), nullable=True),
        sa.Column("original_name", sa.String(255), nullable=True),
        sa.Column("mime_type", sa.String(100), nullable=True),
        sa.Column("file_size", sa.Integer, nullable=True),
        sa.Column("width", sa.Integer, nullable=True),
        sa.Column("height", sa.Integer, nullable=True),
        sa.Column("duration", sa.Float, nullable=True),
        sa.Column("alt_text", sa.String(500), nullable=True),
        sa.Column("caption", sa.Text, nullable=True),
        sa.Column("cloudinary_public_id", sa.String(500), nullable=True),
        sa.Column("is_processed", sa.Boolean, default=False),
        sa.Column("metadata_json", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_media_user_id", "media", ["user_id"])
    op.create_index("ix_media_media_type", "media", ["media_type"])

    op.create_table(
        "photo_albums",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("cover_media_id", UUID(as_uuid=True), sa.ForeignKey("media.id", ondelete="SET NULL"), nullable=True),
        sa.Column("privacy", sa.String(20), default="everyone"),
        sa.Column("media_count", sa.Integer, default=0),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_photo_albums_user_id", "photo_albums", ["user_id"])

    op.create_table(
        "album_photos",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("album_id", UUID(as_uuid=True), sa.ForeignKey("photo_albums.id", ondelete="CASCADE"), nullable=False),
        sa.Column("media_id", UUID(as_uuid=True), sa.ForeignKey("media.id", ondelete="CASCADE"), nullable=False),
        sa.Column("position", sa.Integer, default=0),
        sa.Column("caption", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_album_photos_album_id", "album_photos", ["album_id"])

    op.create_table(
        "stories",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("media_id", UUID(as_uuid=True), sa.ForeignKey("media.id", ondelete="CASCADE"), nullable=True),
        sa.Column("content", sa.Text, nullable=True),
        sa.Column("background_color", sa.String(20), nullable=True),
        sa.Column("story_type", sa.String(20), default="media"),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("views_count", sa.Integer, default=0),
        sa.Column("is_archived", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_stories_user_id", "stories", ["user_id"])
    op.create_index("ix_stories_expires_at", "stories", ["expires_at"])

    op.create_table(
        "story_views",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("story_id", UUID(as_uuid=True), sa.ForeignKey("stories.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_story_views_story_id", "story_views", ["story_id"])

    op.create_table(
        "reels",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("media_id", UUID(as_uuid=True), sa.ForeignKey("media.id", ondelete="CASCADE"), nullable=False),
        sa.Column("caption", sa.Text, nullable=True),
        sa.Column("audio_url", sa.String(500), nullable=True),
        sa.Column("audio_name", sa.String(255), nullable=True),
        sa.Column("thumbnail_url", sa.String(500), nullable=True),
        sa.Column("duration", sa.Float, nullable=True),
        sa.Column("width", sa.Integer, nullable=True),
        sa.Column("height", sa.Integer, nullable=True),
        sa.Column("privacy", sa.String(20), default="everyone"),
        sa.Column("views_count", sa.Integer, default=0),
        sa.Column("likes_count", sa.Integer, default=0),
        sa.Column("comments_count", sa.Integer, default=0),
        sa.Column("shares_count", sa.Integer, default=0),
        sa.Column("is_archived", sa.Boolean, default=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_reels_user_id", "reels", ["user_id"])


def downgrade() -> None:
    op.drop_table("reels")
    op.drop_table("story_views")
    op.drop_table("stories")
    op.drop_table("album_photos")
    op.drop_table("photo_albums")
    op.drop_table("media")
