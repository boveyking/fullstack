"""add tbl_domain

Revision ID: 9346413b6774
Revises: b21c5cc81c2d
Create Date: 2025-12-02 21:33:20.749814

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '9346413b6774'
down_revision: Union[str, None] = 'b21c5cc81c2d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_domain' not in tables:
        op.create_table(
            'tbl_domain',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('root_domain', sa.String(length=50), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tbl_domain_id'), 'tbl_domain', ['id'], unique=False)


def downgrade() -> None:
    # Check if table exists before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_domain' in tables:
        # Check if index exists before dropping
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_domain')]
        if 'ix_tbl_domain_id' in indexes:
            op.drop_index(op.f('ix_tbl_domain_id'), table_name='tbl_domain')
        op.drop_table('tbl_domain')
