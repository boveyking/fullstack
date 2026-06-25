"""add status in tbl_organization

Revision ID: 937cbf8c4f44
Revises: e886366f6f9b
Create Date: 2025-11-27 17:52:15.135956

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '937cbf8c4f44'
down_revision: Union[str, None] = 'e886366f6f9b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add status column to tbl_organization with default 'pending'
    op.add_column('tbl_organization', sa.Column('status', sa.String(length=20), server_default='pending', nullable=True))


def downgrade() -> None:
    # Remove status column from tbl_organization
    op.drop_column('tbl_organization', 'status')
