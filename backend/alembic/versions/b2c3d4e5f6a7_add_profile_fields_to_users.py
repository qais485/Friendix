"""add_profile_fields_to_users

Revision ID: b2c3d4e5f6a7
Revises: a84cac798839
Create Date: 2026-07-27 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b2c3d4e5f6a7'
down_revision: Union[str, None] = 'a84cac798839'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('cover_photo_url', sa.String(length=500), nullable=True))
    op.add_column('users', sa.Column('username', sa.String(length=30), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('website', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('gender', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('birthday', sa.String(length=10), nullable=True))
    op.add_column('users', sa.Column('relationship_status', sa.String(length=30), nullable=True))
    op.add_column('users', sa.Column('education', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('work', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('location', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('languages', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('interests', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('profile_theme', sa.String(length=50), nullable=True))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=True))
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.execute("UPDATE users SET profile_theme = 'default'")
    op.execute("UPDATE users SET is_verified = false")


def downgrade() -> None:
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'profile_theme')
    op.drop_column('users', 'interests')
    op.drop_column('users', 'languages')
    op.drop_column('users', 'location')
    op.drop_column('users', 'work')
    op.drop_column('users', 'education')
    op.drop_column('users', 'relationship_status')
    op.drop_column('users', 'birthday')
    op.drop_column('users', 'gender')
    op.drop_column('users', 'website')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'username')
    op.drop_column('users', 'cover_photo_url')
