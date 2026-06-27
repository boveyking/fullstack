"""add new table, name is tbl_game

Revision ID: 46f70862414b
Revises: 
Create Date: 2026-06-26 21:24:39.124563

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect as sa_inspect


# revision identifiers, used by Alembic.
revision: str = '46f70862414b'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa_inspect(bind)

    if not inspector.has_table('tbl_game'):
        op.create_table(
            'tbl_game',
            sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column('game_name', sa.String(length=300), nullable=True),
            sa.Column('published_date', sa.DateTime(), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default='1', nullable=True),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa_inspect(bind)

    if inspector.has_table('tbl_game'):
        op.drop_table('tbl_game')
