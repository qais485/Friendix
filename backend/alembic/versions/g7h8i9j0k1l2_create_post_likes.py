"""create_post_likes_and_fix_feed_position

Revision ID: g7h8i9j0k1l2
Revises: f6a7b8c9d0e1
Create Date: 2026-07-27
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "g7h8i9j0k1l2"
down_revision = "f6a7b8c9d0e1"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "post_likes",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("post_id", UUID(as_uuid=True), sa.ForeignKey("posts.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_post_likes_user_id", "post_likes", ["user_id"])
    op.create_index("ix_post_likes_post_id", "post_likes", ["post_id"])
    op.create_unique_constraint("uq_post_likes_user_post", "post_likes", ["user_id", "post_id"])


def downgrade() -> None:
    op.drop_constraint("uq_post_likes_user_post", "post_likes", type_="unique")
    op.drop_index("ix_post_likes_post_id", table_name="post_likes")
    op.drop_index("ix_post_likes_user_id", table_name="post_likes")
    op.drop_table("post_likes")
