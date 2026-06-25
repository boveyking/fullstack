"""add webbase cloumn into tbl_aws_instance

Revision ID: 5d1c416f2cf8
Revises: 9346413b6774
Create Date: 2025-12-03 00:11:23.864730

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5d1c416f2cf8'
down_revision: Union[str, None] = '9346413b6774'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add webbase column to tbl_aws_instance
    op.add_column('tbl_aws_instance', sa.Column('webbase', sa.String(20), nullable=True))


def downgrade() -> None:
    # Remove webbase column from tbl_aws_instance
    op.drop_column('tbl_aws_instance', 'webbase')
