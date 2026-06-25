"""add sib tempalte to  tbl_client

Revision ID: 008a30828457
Revises: 552374b2ad63
Create Date: 2025-12-10 20:03:37.350425

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '008a30828457'
down_revision: Union[str, None] = '552374b2ad63'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tbl_client', sa.Column('sub_template', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('tbl_client', 'sub_template')
