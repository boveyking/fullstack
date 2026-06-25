"""add invitaion

Revision ID: 57afcffad468
Revises: d8fae38da38d
Create Date: 2025-11-28 18:24:43.158470

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '57afcffad468'
down_revision: Union[str, None] = 'd8fae38da38d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table exists before creating
    bind = op.get_bind()
    inspector = inspect(bind)
    
    if 'tbl_invitation' not in inspector.get_table_names():
        op.create_table(
            'tbl_invitation',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('organization', sa.String(length=100), nullable=True),
            sa.Column('is_active', sa.Boolean(), server_default='1', nullable=True),
            sa.Column('create_datetime', sa.DateTime(), nullable=True),
            sa.Column('token', sa.String(length=60), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
  

def downgrade() -> None:
    # Check if table exists before dropping
    bind = op.get_bind()
    inspector = inspect(bind)
    
    if 'tbl_invitation' in inspector.get_table_names():
        op.drop_table('tbl_invitation')
