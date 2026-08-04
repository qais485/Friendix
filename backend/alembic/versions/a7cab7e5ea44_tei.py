"""Tei

Revision ID: a7cab7e5ea44
Revises: fda2808bcdab, i9j0k1l2m3n4
Create Date: 2026-08-02 15:47:56.089544

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a7cab7e5ea44'
down_revision: Union[str, None] = ('fda2808bcdab', 'i9j0k1l2m3n4')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
