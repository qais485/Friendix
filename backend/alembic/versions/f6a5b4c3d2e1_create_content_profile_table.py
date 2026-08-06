"""create content profile table

Revision ID: e5f6a7b8c9d0
Revises: d4f5e6a7b8c9
Create Date: 2026-08-06 12:00:00.000000

Phase 3: machine-readable profile for every post/video/reel/story/live.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "f6a5b4c3d2e1"
down_revision: Union[str, None] = "d4f5e6a7b8c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "content_profiles",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("content_type", sa.String(20), nullable=False),
        sa.Column("content_id", UUID(as_uuid=True), nullable=False),
        sa.Column("creator_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("title", sa.String(500), nullable=True),
        sa.Column("category_id", UUID(as_uuid=True), nullable=True),
        sa.Column("category_name", sa.String(100), nullable=True),
        sa.Column("tags_json", sa.Text, nullable=True),
        sa.Column("topics_json", sa.Text, nullable=True),
        sa.Column("language", sa.String(10), nullable=True),
        sa.Column("media_type", sa.String(30), nullable=True),
        sa.Column("mime_type", sa.String(100), nullable=True),
        sa.Column("duration_seconds", sa.Float, nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("source_updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("version", sa.Integer, server_default="1", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("content_type", "content_id", name="uq_content_profiles_type_id"),
    )
    op.create_index("ix_content_profiles_content_type", "content_profiles", ["content_type"])
    op.create_index("ix_content_profiles_content_id", "content_profiles", ["content_id"])
    op.create_index("ix_content_profiles_creator_id", "content_profiles", ["creator_id"])
    op.create_index("ix_content_profiles_published_at", "content_profiles", ["published_at"])


def downgrade() -> None:
    op.drop_table("content_profiles")