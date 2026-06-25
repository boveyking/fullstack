"""add user email

Revision ID: 154c97215739
Revises: 73fb4c803947
Create Date: 2025-11-27 14:27:25.686788

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '154c97215739'
down_revision: Union[str, None] = '73fb4c803947'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to tbl_user
    op.add_column('tbl_user', sa.Column('email', sa.String(length=150), nullable=True))
    op.add_column('tbl_user', sa.Column('role', sa.String(length=20), nullable=True))
    op.add_column('tbl_user', sa.Column('title', sa.String(length=20), nullable=True))


def downgrade() -> None:
    # Remove columns from tbl_user
    op.drop_column('tbl_user', 'title')
    op.drop_column('tbl_user', 'role')
    op.drop_column('tbl_user', 'email')
