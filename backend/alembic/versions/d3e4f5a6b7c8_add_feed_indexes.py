"""Add feed performance indexes to posts

Revision ID: d3e4f5a6b7c8
Revises: c2d3e4f5a6b7
Create Date: 2026-08-05 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3e4f5a6b7c8'
down_revision: Union[str, None] = 'c2d3e4f5a6b7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Keyset pagination: newest-first ordering + cursor lookups.
    op.create_index('ix_posts_user_id', 'posts', ['user_id'], unique=False)
    op.create_index('ix_posts_created_at', 'posts', ['created_at'], unique=False)
    # Privacy/visibility filtering (everyone/friends/... OR predicates).
    op.create_index('ix_posts_privacy', 'posts', ['privacy'], unique=False)
    op.create_index('ix_posts_privacy_created_at', 'posts', ['privacy', 'created_at'], unique=False)
    # Trending feed ordering.
    op.create_index('ix_posts_trending_score', 'posts', ['trending_score'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_posts_trending_score', table_name='posts')
    op.drop_index('ix_posts_privacy_created_at', table_name='posts')
    op.drop_index('ix_posts_privacy', table_name='posts')
    op.drop_index('ix_posts_created_at', table_name='posts')
    op.drop_index('ix_posts_user_id', table_name='posts')
