"""extend_posts_add_polls

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-07-28 01:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6a7b8c9d0e1'
down_revision: Union[str, None] = 'e5f6a7b8c9d0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('posts', sa.Column('video_url', sa.String(length=500), nullable=True))
    op.add_column('posts', sa.Column('audio_url', sa.String(length=500), nullable=True))
    op.add_column('posts', sa.Column('gif_url', sa.String(length=500), nullable=True))
    op.add_column('posts', sa.Column('document_url', sa.String(length=500), nullable=True))
    op.add_column('posts', sa.Column('document_name', sa.String(length=255), nullable=True))
    op.add_column('posts', sa.Column('location_name', sa.String(length=255), nullable=True))
    op.add_column('posts', sa.Column('location_lat', sa.Float(), nullable=True))
    op.add_column('posts', sa.Column('location_lng', sa.Float(), nullable=True))
    op.add_column('posts', sa.Column('feeling_type', sa.String(length=50), nullable=True))
    op.add_column('posts', sa.Column('feeling_text', sa.String(length=255), nullable=True))
    op.add_column('posts', sa.Column('post_type', sa.String(length=20), nullable=True))
    op.add_column('posts', sa.Column('is_archived', sa.Boolean(), nullable=True))
    op.add_column('posts', sa.Column('is_draft', sa.Boolean(), nullable=True))
    op.add_column('posts', sa.Column('is_scheduled', sa.Boolean(), nullable=True))
    op.add_column('posts', sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('posts', sa.Column('shared_post_id', sa.UUID(), nullable=True))
    op.add_column('posts', sa.Column('quote_text', sa.Text(), nullable=True))
    op.add_column('posts', sa.Column('cross_posted_from', sa.String(length=255), nullable=True))
    op.add_column('posts', sa.Column('repost_count', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_posts_shared_post', 'posts', 'posts', ['shared_post_id'], ['id'], ondelete='SET NULL')

    op.create_table('polls',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('post_id', sa.UUID(), nullable=False),
    sa.Column('question', sa.Text(), nullable=False),
    sa.Column('ends_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('is_anonymous', sa.Boolean(), nullable=True),
    sa.Column('total_votes', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['post_id'], ['posts.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('post_id')
    )
    op.create_table('poll_options',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('poll_id', sa.UUID(), nullable=False),
    sa.Column('text', sa.String(length=500), nullable=False),
    sa.Column('votes_count', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['poll_id'], ['polls.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('poll_votes',
    sa.Column('id', sa.UUID(), nullable=False),
    sa.Column('poll_id', sa.UUID(), nullable=False),
    sa.Column('option_id', sa.UUID(), nullable=False),
    sa.Column('user_id', sa.UUID(), nullable=False),
    sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    sa.ForeignKeyConstraint(['option_id'], ['poll_options.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['poll_id'], ['polls.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    op.drop_table('poll_votes')
    op.drop_table('poll_options')
    op.drop_table('polls')
    op.drop_constraint('fk_posts_shared_post', 'posts', type_='foreignkey')
    op.drop_column('posts', 'repost_count')
    op.drop_column('posts', 'cross_posted_from')
    op.drop_column('posts', 'quote_text')
    op.drop_column('posts', 'shared_post_id')
    op.drop_column('posts', 'scheduled_at')
    op.drop_column('posts', 'is_scheduled')
    op.drop_column('posts', 'is_draft')
    op.drop_column('posts', 'is_archived')
    op.drop_column('posts', 'post_type')
    op.drop_column('posts', 'feeling_text')
    op.drop_column('posts', 'feeling_type')
    op.drop_column('posts', 'location_lng')
    op.drop_column('posts', 'location_lat')
    op.drop_column('posts', 'location_name')
    op.drop_column('posts', 'document_name')
    op.drop_column('posts', 'document_url')
    op.drop_column('posts', 'gif_url')
    op.drop_column('posts', 'audio_url')
    op.drop_column('posts', 'video_url')
