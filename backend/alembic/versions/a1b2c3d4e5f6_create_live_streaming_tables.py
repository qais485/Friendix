"""create live streaming tables

Revision ID: a1b2c3d4e5f6
Revises: h8i9j0k1l2m3
Create Date: 2026-07-28

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'a1b2c3d4e5f6'
down_revision = 'h8i9j0k1l2m3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create live_streams table
    op.create_table(
        'live_streams',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text, nullable=True),
        sa.Column('thumbnail_url', sa.String(500), nullable=True),
        sa.Column('stream_key', sa.String(255), unique=True, nullable=False),
        sa.Column('stream_url', sa.String(500), nullable=True),
        sa.Column('playback_url', sa.String(500), nullable=True),
        sa.Column('status', sa.String(20), server_default='scheduled'),
        sa.Column('privacy', sa.String(20), server_default='everyone'),
        sa.Column('is_recording', sa.Boolean, server_default='false'),
        sa.Column('replay_url', sa.String(500), nullable=True),
        sa.Column('replay_duration', sa.Integer, nullable=True),
        sa.Column('scheduled_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('ended_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('viewers_count', sa.Integer, server_default='0'),
        sa.Column('peak_viewers_count', sa.Integer, server_default='0'),
        sa.Column('likes_count', sa.Integer, server_default='0'),
        sa.Column('comments_count', sa.Integer, server_default='0'),
        sa.Column('donations_count', sa.Integer, server_default='0'),
        sa.Column('donations_total', sa.Float, server_default='0'),
        sa.Column('allow_chat', sa.Boolean, server_default='true'),
        sa.Column('allow_reactions', sa.Boolean, server_default='true'),
        sa.Column('allow_donations', sa.Boolean, server_default='true'),
        sa.Column('allow_guests', sa.Boolean, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Create live_chat_messages table
    op.create_table(
        'live_chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('stream_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('live_streams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('content', sa.Text, nullable=False),
        sa.Column('is_pinned', sa.Boolean, server_default='false'),
        sa.Column('is_deleted', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Create live_reactions table
    op.create_table(
        'live_reactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('stream_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('live_streams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('emoji', sa.String(10), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Create live_donations table
    op.create_table(
        'live_donations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('stream_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('live_streams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('amount', sa.Float, nullable=False),
        sa.Column('currency', sa.String(10), server_default='USD'),
        sa.Column('message', sa.Text, nullable=True),
        sa.Column('is_anonymous', sa.Boolean, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Create live_guests table
    op.create_table(
        'live_guests',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('stream_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('live_streams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending'),
        sa.Column('joined_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('left_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Create live_moderators table
    op.create_table(
        'live_moderators',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('stream_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('live_streams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )

    # Create live_viewers table
    op.create_table(
        'live_viewers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('stream_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('live_streams.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('last_seen_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('live_viewers')
    op.drop_table('live_moderators')
    op.drop_table('live_guests')
    op.drop_table('live_donations')
    op.drop_table('live_reactions')
    op.drop_table('live_chat_messages')
    op.drop_table('live_streams')
