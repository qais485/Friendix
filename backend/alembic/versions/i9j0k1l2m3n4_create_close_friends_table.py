"""create close friends table and update friendships

Revision ID: i9j0k1l2m3n4
Revises: h8i9j0k1l2m3
Create Date: 2026-08-02

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = 'i9j0k1l2m3n4'
down_revision = 'h8i9j0k1l2m3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'close_friends',
        sa.Column('id', UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('friend_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint('user_id', 'friend_id', name='uq_close_friends_user_friend'),
    )

    op.add_column('friendships', sa.Column('rejected_at', sa.DateTime(timezone=True), nullable=True))

    op.execute("""
        INSERT INTO close_friends (id, user_id, friend_id, created_at, updated_at)
        SELECT 
            gen_random_uuid(),
            requester_id,
            addressee_id,
            created_at,
            updated_at
        FROM friendships
        WHERE status = 'accepted' AND is_close_friend = true
        UNION
        SELECT 
            gen_random_uuid(),
            addressee_id,
            requester_id,
            created_at,
            updated_at
        FROM friendships
        WHERE status = 'accepted' AND is_close_friend = true
        ON CONFLICT (user_id, friend_id) DO NOTHING;
    """)

    op.drop_column('friendships', 'is_close_friend')


def downgrade() -> None:
    op.add_column('friendships', sa.Column('is_close_friend', sa.Boolean(), server_default='false', nullable=False))

    op.execute("""
        UPDATE friendships
        SET is_close_friend = true
        WHERE id IN (
            SELECT f.id
            FROM friendships f
            JOIN close_friends cf ON (
                (f.requester_id = cf.user_id AND f.addressee_id = cf.friend_id)
                OR (f.addressee_id = cf.user_id AND f.requester_id = cf.friend_id)
            )
            WHERE f.status = 'accepted'
        );
    """)

    op.drop_table('close_friends')
    op.drop_column('friendships', 'rejected_at')
