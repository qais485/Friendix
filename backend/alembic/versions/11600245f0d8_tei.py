"""Tei

Revision ID: 11600245f0d8
Revises: c1d2e3f4a5b6, c4bf98bb24e3
Create Date: 2026-08-02 08:47:46.384302

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '11600245f0d8'
down_revision: Union[str, None] = ('c1d2e3f4a5b6', 'c4bf98bb24e3')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
