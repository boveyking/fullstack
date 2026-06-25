"""add alias in org table

Revision ID: ba9813e9a0a8
Revises: 154c97215739
Create Date: 2025-11-27 17:04:15.654225

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ba9813e9a0a8'
down_revision: Union[str, None] = '154c97215739'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add alias_name column to tbl_organization
    op.add_column('tbl_organization', sa.Column('alias_name', sa.String(length=20), nullable=True))


def downgrade() -> None:
    # Remove alias_name column from tbl_organization
    op.drop_column('tbl_organization', 'alias_name')
