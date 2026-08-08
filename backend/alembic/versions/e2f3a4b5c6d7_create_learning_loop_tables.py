"""create learning loop tables

Revision ID: e2f3a4b5c6d7
Revises: 9a8b7c6d5e4f
Create Date: 2026-08-06 12:00:00.000000

Phase 6: the learning loop. Adds the single-row control/telemetry table and
the ``last_decayed_at`` anchor used by the bulk interest-decay pass so stale
interests fade between interactions (and double-decay is impossible).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision: str = "e2f3a4b5c6d7"
down_revision: Union[str, None] = "9a8b7c6d5e4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "user_interests",
        sa.Column("last_decayed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "learning_loop_state",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("interests_last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("interests_total_events", sa.BigInteger, server_default="0", nullable=False),
        sa.Column("interests_total_signals", sa.BigInteger, server_default="0", nullable=False),
        sa.Column("interests_version", sa.Integer, server_default="0", nullable=False),
        sa.Column("metrics_last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("metrics_total_events", sa.BigInteger, server_default="0", nullable=False),
        sa.Column("metrics_profiles_updated", sa.BigInteger, server_default="0", nullable=False),
        sa.Column("decay_last_run_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("decay_total_rows", sa.BigInteger, server_default="0", nullable=False),
        sa.Column("decay_removed", sa.BigInteger, server_default="0", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("learning_loop_state")
    op.drop_column("user_interests", "last_decayed_at")
