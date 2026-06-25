"""add full name into tbl_user

Revision ID: d8fae38da38d
Revises: 22b679d60889
Create Date: 2025-11-27 22:27:53.777075

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd8fae38da38d'
down_revision: Union[str, None] = '22b679d60889'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add name column to tbl_user
    op.add_column('tbl_user', sa.Column('name', sa.String(length=30), nullable=True))


def downgrade() -> None:
    # Remove name column from tbl_user
    op.drop_column('tbl_user', 'name')
