"""add is_public  in tbl_organization

Revision ID: 22b679d60889
Revises: 937cbf8c4f44
Create Date: 2025-11-27 17:59:24.747559

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '22b679d60889'
down_revision: Union[str, None] = '937cbf8c4f44'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_public column to tbl_organization
    op.add_column('tbl_organization', sa.Column('is_public', sa.Boolean(), nullable=True))


def downgrade() -> None:
    # Remove is_public column from tbl_organization
    op.drop_column('tbl_organization', 'is_public')
