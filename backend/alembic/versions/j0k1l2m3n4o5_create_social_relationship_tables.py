"""create social relationship tables

Revision ID: j0k1l2m3n4o5
Revises: i9j0k1l2m3n4
Create Date: 2026-08-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = 'j0k1l2m3n4o5'
down_revision = 'i9j0k1l2m3n4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'follow_requests',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('requester_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('target_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', sa.String(20), server_default='pending', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('requester_id', 'target_id', name='uq_follow_requests_requester_target'),
    )
    op.create_index('ix_follow_requests_requester_id', 'follow_requests', ['requester_id'])
    op.create_index('ix_follow_requests_target_id', 'follow_requests', ['target_id'])

    op.create_table(
        'mutes',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('muted_user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('mute_posts', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('mute_stories', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('mute_notes', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('mute_notifications', sa.Boolean(), server_default='true', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('user_id', 'muted_user_id', name='uq_mutes_user_muted'),
    )
    op.create_index('ix_mutes_user_id', 'mutes', ['user_id'])
    op.create_index('ix_mutes_muted_user_id', 'mutes', ['muted_user_id'])

    op.create_table(
        'restricts',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('restricted_user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('user_id', 'restricted_user_id', name='uq_restricts_user_restricted'),
    )
    op.create_index('ix_restricts_user_id', 'restricts', ['user_id'])
    op.create_index('ix_restricts_restricted_user_id', 'restricts', ['restricted_user_id'])

    op.add_column('privacy_settings', sa.Column('hide_last_seen', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('privacy_settings', sa.Column('hide_birthday', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('privacy_settings', sa.Column('hide_phone', sa.Boolean(), server_default='true', nullable=False))
    op.add_column('privacy_settings', sa.Column('hide_email', sa.Boolean(), server_default='true', nullable=False))
    op.add_column('privacy_settings', sa.Column('hide_work', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('privacy_settings', sa.Column('hide_education', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('privacy_settings', sa.Column('reel_privacy', sa.String(20), server_default='everyone', nullable=False))
    op.add_column('privacy_settings', sa.Column('photo_privacy', sa.String(20), server_default='everyone', nullable=False))
    op.add_column('privacy_settings', sa.Column('video_privacy', sa.String(20), server_default='everyone', nullable=False))
    op.add_column('privacy_settings', sa.Column('friend_request_permissions', sa.String(20), server_default='everyone', nullable=False))
    op.add_column('privacy_settings', sa.Column('message_permissions', sa.String(20), server_default='everyone', nullable=False))
    op.add_column('privacy_settings', sa.Column('call_permissions', sa.String(20), server_default='everyone', nullable=False))
    op.add_column('privacy_settings', sa.Column('hide_followers_list', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('privacy_settings', sa.Column('hide_following_list', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('privacy_settings', sa.Column('download_media_permissions', sa.String(20), server_default='everyone', nullable=False))
    op.add_column('privacy_settings', sa.Column('invite_permissions', sa.String(20), server_default='everyone', nullable=False))


def downgrade() -> None:
    op.drop_column('privacy_settings', 'invite_permissions')
    op.drop_column('privacy_settings', 'download_media_permissions')
    op.drop_column('privacy_settings', 'hide_following_list')
    op.drop_column('privacy_settings', 'hide_followers_list')
    op.drop_column('privacy_settings', 'call_permissions')
    op.drop_column('privacy_settings', 'message_permissions')
    op.drop_column('privacy_settings', 'friend_request_permissions')
    op.drop_column('privacy_settings', 'video_privacy')
    op.drop_column('privacy_settings', 'photo_privacy')
    op.drop_column('privacy_settings', 'reel_privacy')
    op.drop_column('privacy_settings', 'hide_education')
    op.drop_column('privacy_settings', 'hide_work')
    op.drop_column('privacy_settings', 'hide_email')
    op.drop_column('privacy_settings', 'hide_phone')
    op.drop_column('privacy_settings', 'hide_birthday')
    op.drop_column('privacy_settings', 'hide_last_seen')

    op.drop_index('ix_restricts_restricted_user_id', 'restricts')
    op.drop_index('ix_restricts_user_id', 'restricts')
    op.drop_table('restricts')

    op.drop_index('ix_mutes_muted_user_id', 'mutes')
    op.drop_index('ix_mutes_user_id', 'mutes')
    op.drop_table('mutes')

    op.drop_index('ix_follow_requests_target_id', 'follow_requests')
    op.drop_index('ix_follow_requests_requester_id', 'follow_requests')
    op.drop_table('follow_requests')
