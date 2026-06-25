"""add plan table

Revision ID: d5bef2094bf3
Revises: 274bccbe7b05
Create Date: 2025-12-04 15:49:21.299828

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = 'd5bef2094bf3'
down_revision: Union[str, None] = '274bccbe7b05'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Create tbl_plan table
    if 'tbl_plan' not in tables:
        op.create_table(
            'tbl_plan',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=30), nullable=False),
            sa.Column('description', sa.String(length=100), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.Column('month_price', sa.Integer(), nullable=True),
            sa.Column('bandwidth', sa.Integer(), nullable=True),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tbl_plan_id'), 'tbl_plan', ['id'], unique=False)
    
    # Add plan_id column to tbl_group if table exists
    if 'tbl_group' in tables:
        columns = [col['name'] for col in inspector.get_columns('tbl_group')]
        
        if 'plan_id' not in columns:
            # Use batch operations for SQLite to add foreign key constraint
            with op.batch_alter_table('tbl_group', schema=None) as batch_op:
                batch_op.add_column(sa.Column('plan_id', sa.Integer(), nullable=True))
                batch_op.create_foreign_key('fk_tbl_group_plan_id', 'tbl_plan', ['plan_id'], ['id'])
                batch_op.create_index('ix_tbl_group_plan_id', ['plan_id'], unique=False)


def downgrade() -> None:
    # Check if table exists before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Remove plan_id column from tbl_group if table exists
    if 'tbl_group' in tables:
        columns = [col['name'] for col in inspector.get_columns('tbl_group')]
        
        if 'plan_id' in columns:
            # Use batch operations for SQLite to drop foreign key constraint
            with op.batch_alter_table('tbl_group', schema=None) as batch_op:
                # Drop index and foreign key constraint before dropping column
                indexes = [idx['name'] for idx in inspector.get_indexes('tbl_group')]
                if 'ix_tbl_group_plan_id' in indexes:
                    batch_op.drop_index('ix_tbl_group_plan_id')
                
                # Drop foreign key constraint
                batch_op.drop_constraint('fk_tbl_group_plan_id', type_='foreignkey')
                batch_op.drop_column('plan_id')
    
    # Drop tbl_plan table
    if 'tbl_plan' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_plan')]
        if 'ix_tbl_plan_id' in indexes:
            op.drop_index(op.f('ix_tbl_plan_id'), table_name='tbl_plan')
        op.drop_table('tbl_plan')
