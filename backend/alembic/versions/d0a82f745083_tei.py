"""Tei

Revision ID: d0a82f745083
Revises: a7cab7e5ea44, j0k1l2m3n4o5
Create Date: 2026-08-02 19:51:37.410644

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd0a82f745083'
down_revision: Union[str, None] = ('a7cab7e5ea44', 'j0k1l2m3n4o5')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
