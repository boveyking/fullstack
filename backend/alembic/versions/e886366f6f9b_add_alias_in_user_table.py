"""add alias in user  table

Revision ID: e886366f6f9b
Revises: ba9813e9a0a8
Create Date: 2025-11-27 17:47:04.262852

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e886366f6f9b'
down_revision: Union[str, None] = 'ba9813e9a0a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add alias_name column to tbl_user
    op.add_column('tbl_user', sa.Column('alias_name', sa.String(length=20), nullable=True))
    # Remove alias_name column from tbl_organization
    op.drop_column('tbl_organization', 'alias_name')


def downgrade() -> None:
    # Revert: Remove alias_name column from tbl_user
    op.drop_column('tbl_user', 'alias_name')
    # Revert: Add alias_name column back to tbl_organization
    op.add_column('tbl_organization', sa.Column('alias_name', sa.String(length=20), nullable=True))
