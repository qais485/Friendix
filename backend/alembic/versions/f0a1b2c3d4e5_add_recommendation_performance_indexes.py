"""Add performance indexes for the recommendation / tracking read paths

Revision ID: f0a1b2c3d4e5
Revises: e2f3a4b5c6d7
Create Date: 2026-08-07 12:00:00.000000

Phase 8 (production hardening) indexes the hot read paths of the ranking
engine: completion-rate aggregation over view sessions, interest lookups by
strength, and the learning-loop event watermark scans.
"""
from typing import Sequence, Union

from alembic import op


revision: str = "f0a1b2c3d4e5"
down_revision: Union[str, None] = "e2f3a4b5c6d7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Completion-rate aggregate: WHERE content_id IN (...) AND completed.
    op.create_index(
        "ix_view_sessions_content_completed",
        "view_sessions",
        ["content_id", "completed"],
        unique=False,
    )
    # Interest scoring: WHERE user_id = ? AND strength != 0 ORDER BY strength DESC.
    op.create_index(
        "ix_user_interests_user_strength",
        "user_interests",
        ["user_id", "strength"],
        unique=False,
    )
    # Learning-loop watermark scans: ORDER BY occurred_at, id.
    op.create_index(
        "ix_content_events_occurred_id",
        "content_events",
        ["occurred_at", "id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_content_events_occurred_id", table_name="content_events")
    op.drop_index("ix_user_interests_user_strength", table_name="user_interests")
    op.drop_index("ix_view_sessions_content_completed", table_name="view_sessions")
