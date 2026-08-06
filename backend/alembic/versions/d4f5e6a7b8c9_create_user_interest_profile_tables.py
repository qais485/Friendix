"""create user interest profile tables

Revision ID: d4f5e6a7b8c9
Revises: c9f8e7d6a5b4
Create Date: 2026-08-06 12:00:00.000000

Phase 2: user interest profiles. Adds the per-user profile watermark, the
decaying-strength interest rows, and the derived-signal audit/feature store.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "d4f5e6a7b8c9"
down_revision: Union[str, None] = "c9f8e7d6a5b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "interest_profiles",
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("computed_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("last_occurred_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_event_id", UUID(as_uuid=True), nullable=True),
        sa.Column("total_interests", sa.Integer, server_default="0", nullable=False),
        sa.Column("version", sa.Integer, server_default="1", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "user_interests",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("interest_type", sa.String(20), nullable=False),
        sa.Column("interest_key", sa.String(255), nullable=False),
        sa.Column("interest_name", sa.String(255), nullable=True),
        sa.Column("entity_id", UUID(as_uuid=True), nullable=True),
        sa.Column("strength", sa.Float, server_default="0", nullable=False),
        sa.Column("positive_signals", sa.Integer, server_default="0", nullable=False),
        sa.Column("negative_signals", sa.Integer, server_default="0", nullable=False),
        sa.Column("total_signals", sa.Integer, server_default="0", nullable=False),
        sa.Column("first_seen_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("last_interaction_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("user_id", "interest_type", "interest_key", name="uq_user_interests_user_type_key"),
    )
    op.create_index("ix_user_interests_user_id", "user_interests", ["user_id"])
    op.create_index("ix_user_interests_entity_id", "user_interests", ["entity_id"])

    op.create_table(
        "interest_event_signals",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("event_id", UUID(as_uuid=True), sa.ForeignKey("content_events.id", ondelete="CASCADE"), nullable=False),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("interest_type", sa.String(20), nullable=False),
        sa.Column("interest_key", sa.String(255), nullable=False),
        sa.Column("interest_name", sa.String(255), nullable=True),
        sa.Column("entity_id", UUID(as_uuid=True), nullable=True),
        sa.Column("delta", sa.Float, server_default="0", nullable=False),
        sa.Column("base_event_type", sa.String(30), nullable=False),
        sa.Column("occurred_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("event_id", "interest_type", "interest_key", name="uq_interest_event_signals_event_dim"),
    )
    op.create_index("ix_interest_event_signals_event_id", "interest_event_signals", ["event_id"])
    op.create_index("ix_interest_event_signals_user_id", "interest_event_signals", ["user_id"])


def downgrade() -> None:
    op.drop_table("interest_event_signals")
    op.drop_table("user_interests")
    op.drop_table("interest_profiles")