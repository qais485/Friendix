"""Tei

Revision ID: 32ed657fed96
Revises: 405eb20d0e17, d2e3f4a5b6c7
Create Date: 2026-08-02 10:40:06.318893

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '32ed657fed96'
down_revision: Union[str, None] = ('405eb20d0e17', 'd2e3f4a5b6c7')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
