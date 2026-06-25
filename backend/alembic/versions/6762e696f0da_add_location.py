"""add location

Revision ID: 6762e696f0da
Revises: 366c610d9e90
Create Date: 2025-12-06 11:04:46.976407

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '6762e696f0da'
down_revision: Union[str, None] = '366c610d9e90'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_location' not in tables:
        op.create_table(
            'tbl_location',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('count', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tbl_location_id'), 'tbl_location', ['id'], unique=False)
    
    # Insert initial location records
    location_table = sa.table(
        'tbl_location',
        sa.column('name', sa.String),
        sa.column('count', sa.Integer),
        sa.column('is_active', sa.Boolean)
    )
    
    # Check if records already exist to avoid duplicates
    result = conn.execute(sa.text("SELECT COUNT(*) FROM tbl_location"))
    count = result.scalar()
    
    if count == 0:
        op.bulk_insert(location_table, [
            {'name': '小强叔', 'count': 0, 'is_active': True},
            {'name': '小强姐', 'count': 0, 'is_active': True},
            {'name': '小强爹', 'count': 0, 'is_active': True},
            {'name': '小强妹', 'count': 0, 'is_active': True},
            {'name': '小强爷', 'count': 0, 'is_active': True},
            {'name': '小强婶', 'count': 0, 'is_active': True},
            {'name': '小强哥', 'count': 0, 'is_active': True},
            {'name': '小强弟', 'count': 0, 'is_active': True},
            {'name': '小强伯', 'count': 0, 'is_active': True},
            {'name': '小强妈', 'count': 0, 'is_active': True},
            {'name': '小强友', 'count': 0, 'is_active': True},
            {'name': '小强姨', 'count': 0, 'is_active': True},
            {'name': '小强舅', 'count': 0, 'is_active': True},
            {'name': '小强姑', 'count': 0, 'is_active': True},
            {'name': '小强婆婆', 'count': 0, 'is_active': True},
            {'name': '小强公公', 'count': 0, 'is_active': True},
            {'name': '小强姥姥', 'count': 0, 'is_active': True},
            {'name': '小强侄', 'count': 0, 'is_active': True},
            {'name': '小强甥', 'count': 0, 'is_active': True},
        ])


def downgrade() -> None:
    # Check if table exists before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_location' in tables:
        # Check if index exists before dropping
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_location')]
        if 'ix_tbl_location_id' in indexes:
            op.drop_index(op.f('ix_tbl_location_id'), table_name='tbl_location')
        op.drop_table('tbl_location')
