"""merge multiple heads

Revision ID: c16968e0acb0
Revises: 16ba4cf67a2e, d6e7f8a9b0c1
Create Date: 2026-08-01 18:51:48.902931

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c16968e0acb0'
down_revision: Union[str, None] = ('16ba4cf67a2e', 'd6e7f8a9b0c1')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
