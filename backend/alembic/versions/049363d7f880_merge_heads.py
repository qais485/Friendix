"""merge heads

Revision ID: 049363d7f880
Revises: 4c310e24a3ae, h8i9j0k1l2m3
Create Date: 2026-07-27 23:22:36.173892

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '049363d7f880'
down_revision: Union[str, None] = ('4c310e24a3ae', 'h8i9j0k1l2m3')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
