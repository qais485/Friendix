"""merge Search

Revision ID: cbb506df7178
Revises: 187ff269a0bc, e7f8a9b0c1d2
Create Date: 2026-08-01 19:21:49.599955

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cbb506df7178'
down_revision: Union[str, None] = ('187ff269a0bc', 'e7f8a9b0c1d2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
