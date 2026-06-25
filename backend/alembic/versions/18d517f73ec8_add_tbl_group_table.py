"""add tbl_group  table

Revision ID: 18d517f73ec8
Revises: 5f3fc573c9e4
Create Date: 2025-12-03 21:29:04.315199

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '18d517f73ec8'
down_revision: Union[str, None] = '5f3fc573c9e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Create tbl_group table
    if 'tbl_group' not in tables:
        op.create_table(
            'tbl_group',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(length=30), nullable=False),
            sa.Column('description', sa.String(length=200), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tbl_group_id'), 'tbl_group', ['id'], unique=False)
    
    # Add columns to tbl_node if table exists
    if 'tbl_node' in tables:
        # Check if columns already exist before adding
        columns = [col['name'] for col in inspector.get_columns('tbl_node')]
        
        # Use batch operations for SQLite to add foreign key constraint
        needs_batch = 'group_id' not in columns
        
        if needs_batch:
            # Use batch_alter_table for SQLite to add foreign key constraint
            with op.batch_alter_table('tbl_node', schema=None) as batch_op:
                if 'group_id' not in columns:
                    batch_op.add_column(sa.Column('group_id', sa.Integer(), nullable=True))
                    batch_op.create_foreign_key('fk_tbl_node_group_id', 'tbl_group', ['group_id'], ['id'])
                    batch_op.create_index('ix_tbl_node_group_id', ['group_id'], unique=False)
                
                if 'is_active' not in columns:
                    batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=True, server_default='1'))
                
                if 'create_datetime' not in columns:
                    batch_op.add_column(sa.Column('create_datetime', sa.DateTime(), nullable=True))
        else:
            # If group_id already exists, just add other columns normally
            if 'is_active' not in columns:
                op.add_column('tbl_node', sa.Column('is_active', sa.Boolean(), nullable=True, server_default='1'))
            
            if 'create_datetime' not in columns:
                op.add_column('tbl_node', sa.Column('create_datetime', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Check if table exists before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Remove columns from tbl_node if table exists
    if 'tbl_node' in tables:
        columns = [col['name'] for col in inspector.get_columns('tbl_node')]
        
        # Use batch operations for SQLite to drop foreign key constraint
        needs_batch = 'group_id' in columns
        
        if needs_batch:
            # Use batch_alter_table for SQLite to drop foreign key constraint
            with op.batch_alter_table('tbl_node', schema=None) as batch_op:
                if 'create_datetime' in columns:
                    batch_op.drop_column('create_datetime')
                
                if 'is_active' in columns:
                    batch_op.drop_column('is_active')
                
                if 'group_id' in columns:
                    # Drop index and foreign key constraint before dropping column
                    indexes = [idx['name'] for idx in inspector.get_indexes('tbl_node')]
                    if 'ix_tbl_node_group_id' in indexes:
                        batch_op.drop_index('ix_tbl_node_group_id')
                    
                    # Drop foreign key constraint
                    batch_op.drop_constraint('fk_tbl_node_group_id', type_='foreignkey')
                    batch_op.drop_column('group_id')
        else:
            # If group_id doesn't exist, just drop other columns normally
            if 'create_datetime' in columns:
                op.drop_column('tbl_node', 'create_datetime')
            
            if 'is_active' in columns:
                op.drop_column('tbl_node', 'is_active')
    
    # Drop tbl_group table
    if 'tbl_group' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_group')]
        if 'ix_tbl_group_id' in indexes:
            op.drop_index(op.f('ix_tbl_group_id'), table_name='tbl_group')
        op.drop_table('tbl_group')
