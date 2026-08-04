"""2merge

Revision ID: ef4c66398fb8
Revises: 91e24c377545, b2c3d4e5f6a8
Create Date: 2026-07-28 14:45:57.732915

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ef4c66398fb8'
down_revision: Union[str, None] = ('91e24c377545', 'b2c3d4e5f6a8')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
