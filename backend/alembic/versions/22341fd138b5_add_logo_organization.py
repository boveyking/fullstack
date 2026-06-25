"""add logo  organization 

Revision ID: 22341fd138b5
Revises: d4fd6821b58d
Create Date: 2025-11-30 19:43:45.263336

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '22341fd138b5'
down_revision: Union[str, None] = 'd4fd6821b58d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tbl_organization', sa.Column('logo', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('tbl_organization', 'logo')
