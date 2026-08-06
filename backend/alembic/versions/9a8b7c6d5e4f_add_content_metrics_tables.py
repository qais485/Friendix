"""add content metrics columns and metrics state table

Revision ID: 9a8b7c6d5e4f
Revises: f6a5b4c3d2e1
Create Date: 2026-08-06 12:00:00.000000

Adds popularity/quality/freshness scores to content_profiles plus the
single-row watermark table driving the incremental metrics pass.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "9a8b7c6d5e4f"
down_revision: Union[str, None] = "f6a5b4c3d2e1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "content_profiles",
        sa.Column("popularity_score", sa.Float, server_default="0", nullable=False),
    )
    op.add_column(
        "content_profiles",
        sa.Column("quality_score", sa.Float, server_default="0", nullable=False),
    )
    op.add_column(
        "content_profiles",
        sa.Column("freshness_score", sa.Float, server_default="0", nullable=False),
    )
    op.add_column(
        "content_profiles",
        sa.Column("metrics_updated_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_content_profiles_popularity_score", "content_profiles", ["popularity_score"])
    op.create_index("ix_content_profiles_quality_score", "content_profiles", ["quality_score"])
    op.create_index("ix_content_profiles_freshness_score", "content_profiles", ["freshness_score"])

    op.create_table(
        "metrics_state",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("last_occurred_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_event_id", UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("metrics_state")
    op.drop_index("ix_content_profiles_freshness_score", table_name="content_profiles")
    op.drop_index("ix_content_profiles_quality_score", table_name="content_profiles")
    op.drop_index("ix_content_profiles_popularity_score", table_name="content_profiles")
    op.drop_column("content_profiles", "metrics_updated_at")
    op.drop_column("content_profiles", "freshness_score")
    op.drop_column("content_profiles", "quality_score")
    op.drop_column("content_profiles", "popularity_score")