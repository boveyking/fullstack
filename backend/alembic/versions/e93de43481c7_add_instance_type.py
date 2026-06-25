"""add instance_type

Revision ID: e93de43481c7
Revises: b042d1cb5d0c
Create Date: 2025-11-21 16:33:41.008831

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e93de43481c7'
down_revision: Union[str, None] = 'b042d1cb5d0c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add instance_type column to tbl_aws_instance
    op.add_column('tbl_aws_instance', sa.Column('instance_type', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove instance_type column from tbl_aws_instance
    op.drop_column('tbl_aws_instance', 'instance_type')
