"""create_privacy_settings_and_blocked_users_tables

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-27 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3d4e5f6a7b8'
down_revision: Union[str, None] = 'b2c3d4e5f6a7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('privacy_settings',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('profile_visibility', sa.String(length=20), nullable=True),
    sa.Column('hide_online_status', sa.Boolean(), nullable=True),
    sa.Column('story_privacy', sa.String(length=20), nullable=True),
    sa.Column('post_privacy', sa.String(length=20), nullable=True),
    sa.Column('comment_privacy', sa.String(length=20), nullable=True),
    sa.Column('tag_review', sa.Boolean(), nullable=True),
    sa.Column('timeline_review', sa.Boolean(), nullable=True),
    sa.Column('search_engine_visibility', sa.Boolean(), nullable=True),
    sa.Column('mention_permissions', sa.String(length=20), nullable=True),
    sa.Column('follow_permissions', sa.String(length=20), nullable=True),
    sa.Column('hide_friends_list', sa.Boolean(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id')
    )
    op.create_table('blocked_users',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('blocked_user_id', sa.UUID(), nullable=False),
    sa.Column('block_type', sa.String(length=20), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['blocked_user_id'], ['users.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('blocked_users')
    op.drop_table('privacy_settings')
