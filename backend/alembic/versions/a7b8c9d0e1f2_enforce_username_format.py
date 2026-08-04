"""enforce_username_format

Revision ID: a7b8c9d0e1f2
Revises: 1ae28b327b62, f6a7b8c9d0e1
Create Date: 2026-08-01 15:00:00.000000

"""
from typing import Sequence, Union

from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'a7b8c9d0e1f2'
down_revision: Union[str, Sequence[str], None] = ('1ae28b327b62', 'f6a7b8c9d0e1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

USERNAME_PATTERN = r'^[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*$'


def upgrade() -> None:
    # Normalize any legacy usernames that do not match the allowed
    # character set so the CHECK constraint can be added safely.
    op.execute("UPDATE users SET username = NULL WHERE username = ''")
    op.execute(
        "UPDATE users SET username = NULL "
        "WHERE username IS NOT NULL AND username !~ '" + USERNAME_PATTERN + "'"
    )
    op.execute(
        "ALTER TABLE users ADD CONSTRAINT chk_users_username_format "
        "CHECK (username IS NULL OR username ~ '" + USERNAME_PATTERN + "')"
    )


def downgrade() -> None:
    op.execute("ALTER TABLE users DROP CONSTRAINT chk_users_username_format")
