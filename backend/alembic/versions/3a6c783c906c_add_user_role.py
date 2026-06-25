"""add user role

Revision ID: 3a6c783c906c
Revises: 7dc45d625d1d
Create Date: 2025-12-05 11:44:11.362803

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3a6c783c906c'
down_revision: Union[str, None] = '7dc45d625d1d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add role column to tbl_user table
    op.add_column('tbl_user', sa.Column('role', sa.String(), nullable=True, server_default='user'))
    # Update existing rows where role is NULL to 'user'
    op.execute(
        "UPDATE tbl_user SET role = 'user' WHERE role IS NULL"
    )


def downgrade() -> None:
    # Remove role column from tbl_user table
    op.drop_column('tbl_user', 'role')
