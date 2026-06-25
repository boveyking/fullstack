""""<message>"

Revision ID: 6ff8b0cdb19d
Revises: bc3b39fa04eb
Create Date: 2025-12-04 17:33:39.242091

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6ff8b0cdb19d'
down_revision: Union[str, None] = 'bc3b39fa04eb'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
