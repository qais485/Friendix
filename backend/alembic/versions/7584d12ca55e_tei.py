"""Tei

Revision ID: 7584d12ca55e
Revises: b0c1d2e3f4a5, fb6d0e26be72
Create Date: 2026-08-02 07:37:56.014920

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7584d12ca55e'
down_revision: Union[str, None] = ('b0c1d2e3f4a5', 'fb6d0e26be72')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
