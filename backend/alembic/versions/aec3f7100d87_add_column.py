"""add column  

Revision ID: aec3f7100d87
Revises: 46f70862414b
Create Date: 2026-06-27 15:49:50.809684

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'aec3f7100d87'
down_revision: Union[str, None] = '46f70862414b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tbl_game', sa.Column('max_score', sa.Integer(), server_default='0', nullable=True))


def downgrade() -> None:
    op.drop_column('tbl_game', 'max_score')
