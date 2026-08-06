"""create content event tracking tables

Revision ID: c9f8e7d6a5b4
Revises: d3e4f5a6b7c8
Create Date: 2026-08-06 12:00:00.000000

Adds the append-only ``content_events`` raw event log and the denormalized
``view_sessions`` aggregate used by the Phase 1 engagement tracking pipeline.

Expected growth: ``content_events`` is write-heavy and append-only. At scale,
partition the table by ``occurred_at`` and (optionally) move ingestion through
a message queue; the ingest endpoint is designed to accept large batches so
the per-row cost stays negligible.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "c9f8e7d6a5b4"
down_revision: Union[str, None] = "d3e4f5a6b7c8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "content_events",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("client_event_id", sa.String(64), nullable=True, unique=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("content_type", sa.String(20), nullable=False),
        sa.Column("content_id", UUID(as_uuid=True), nullable=False),
        sa.Column("creator_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("event_type", sa.String(30), nullable=False),
        sa.Column("view_session_id", UUID(as_uuid=True), nullable=True),
        sa.Column("value", sa.Float, nullable=True),
        sa.Column("position_seconds", sa.Float, nullable=True),
        sa.Column("context", sa.String(50), nullable=True),
        sa.Column("source", sa.String(50), nullable=True),
        sa.Column("metadata_json", sa.Text, nullable=True),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_content_events_client_event_id", "content_events", ["client_event_id"], unique=True)
    op.create_index("ix_content_events_user_id", "content_events", ["user_id"])
    op.create_index("ix_content_events_content_id", "content_events", ["content_id"])
    op.create_index("ix_content_events_event_type", "content_events", ["event_type"])
    op.create_index("ix_content_events_view_session_id", "content_events", ["view_session_id"])
    op.create_index("ix_content_events_occurred_at", "content_events", ["occurred_at"])
    op.create_index(
        "ix_content_events_content_event_occurred",
        "content_events",
        ["content_id", "event_type", "occurred_at"],
    )
    op.create_index(
        "ix_content_events_user_occurred",
        "content_events",
        ["user_id", "occurred_at"],
    )
    op.create_index(
        "ix_content_events_creator_event",
        "content_events",
        ["creator_id", "event_type"],
    )
    op.create_index(
        "ix_content_events_type_occurred",
        "content_events",
        ["event_type", "occurred_at"],
    )

    op.create_table(
        "view_sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("content_type", sa.String(20), nullable=False),
        sa.Column("content_id", UUID(as_uuid=True), nullable=False),
        sa.Column("creator_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("context", sa.String(50), nullable=True),
        sa.Column("source", sa.String(50), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_activity_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("watch_time_seconds", sa.Float, server_default="0", nullable=False),
        sa.Column("view_percentage", sa.Float, server_default="0", nullable=False),
        sa.Column("views_count", sa.Integer, server_default="0", nullable=False),
        sa.Column("replays_count", sa.Integer, server_default="0", nullable=False),
        sa.Column("completed", sa.Boolean, server_default=sa.text("false"), nullable=False),
        sa.Column("skipped", sa.Boolean, server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_view_sessions_user_id", "view_sessions", ["user_id"])
    op.create_index("ix_view_sessions_content_id", "view_sessions", ["content_id"])
    op.create_index(
        "ix_view_sessions_user_started",
        "view_sessions",
        ["user_id", "started_at"],
    )


def downgrade() -> None:
    op.drop_table("view_sessions")
    op.drop_table("content_events")