"""refine mapping between note and group

Revision ID: bc3b39fa04eb
Revises: 369508a8fbe4
Create Date: 2025-12-04 16:14:29.708405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = 'bc3b39fa04eb'
down_revision: Union[str, None] = '369508a8fbe4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Create the new junction table tbl_node_group if it doesn't exist
    if 'tbl_node_group' not in tables:
        op.create_table(
            'tbl_node_group',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('node_id', sa.Integer(), nullable=False),
            sa.Column('group_id', sa.Integer(), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.Column('create_datetime', sa.DateTime(), nullable=False),
            sa.ForeignKeyConstraint(['node_id'], ['tbl_node.id'], ),
            sa.ForeignKeyConstraint(['group_id'], ['tbl_group.id'], ),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tbl_node_group_node_id'), 'tbl_node_group', ['node_id'], unique=False)
        op.create_index(op.f('ix_tbl_node_group_group_id'), 'tbl_node_group', ['group_id'], unique=False)
    else:
        # Table exists, check if indexes exist and create them if missing
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_node_group')]
        if 'ix_tbl_node_group_node_id' not in indexes:
            try:
                op.create_index(op.f('ix_tbl_node_group_node_id'), 'tbl_node_group', ['node_id'], unique=False)
            except Exception:
                pass
        if 'ix_tbl_node_group_group_id' not in indexes:
            try:
                op.create_index(op.f('ix_tbl_node_group_group_id'), 'tbl_node_group', ['group_id'], unique=False)
            except Exception:
                pass
    
    # Migrate existing data from tbl_node.group_id to tbl_node_group
    # Only migrate if there are nodes with group_id that aren't already in the junction table
    connection = op.get_bind()
    
    # Check if there are any existing records in tbl_node_group
    existing_count = connection.execute(sa.text("SELECT COUNT(*) FROM tbl_node_group")).scalar()
    
    # Only migrate if junction table is empty and group_id column still exists
    columns = [col['name'] for col in inspector.get_columns('tbl_node')]
    if existing_count == 0 and 'group_id' in columns:
        result = connection.execute(sa.text("SELECT id, group_id FROM tbl_node WHERE group_id IS NOT NULL"))
        nodes_with_groups = result.fetchall()
        
        # Insert into junction table
        for node_id, group_id in nodes_with_groups:
            connection.execute(
                sa.text("INSERT INTO tbl_node_group (node_id, group_id, is_active, create_datetime) VALUES (:node_id, :group_id, 1, datetime('now'))"),
                {"node_id": node_id, "group_id": group_id}
            )
    
    # Drop the foreign key constraint and index on group_id
    # Check if group_id column exists before trying to drop it
    columns = [col['name'] for col in inspector.get_columns('tbl_node')]
    
    if 'group_id' in columns:
        # Drop index outside batch context if it exists
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_node')]
        if 'ix_tbl_node_group_id' in indexes:
            try:
                op.drop_index('ix_tbl_node_group_id', table_name='tbl_node')
            except Exception:
                # Index might not exist or already dropped, continue
                pass
        
        # Get foreign keys to check if constraint exists
        foreign_keys = inspector.get_foreign_keys('tbl_node')
        fk_constraint_name = None
        for fk in foreign_keys:
            if fk.get('constrained_columns') == ['group_id']:
                fk_constraint_name = fk.get('name') or 'fk_tbl_node_group_id'
                break
        
        # Use batch_alter_table for SQLite to drop foreign key and column
        with op.batch_alter_table('tbl_node', schema=None) as batch_op:
            # Drop foreign key constraint if it exists
            if fk_constraint_name:
                try:
                    batch_op.drop_constraint(fk_constraint_name, type_='foreignkey')
                except Exception:
                    # Constraint might not exist, continue
                    pass
            
            # Drop the column
            batch_op.drop_column('group_id')


def downgrade() -> None:
    # Check if table exists before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Add back the group_id column to tbl_node if it doesn't exist
    columns = [col['name'] for col in inspector.get_columns('tbl_node')]
    if 'group_id' not in columns:
        with op.batch_alter_table('tbl_node', schema=None) as batch_op:
            batch_op.add_column(sa.Column('group_id', sa.Integer(), nullable=True))
            batch_op.create_foreign_key('fk_tbl_node_group_id', 'tbl_group', ['group_id'], ['id'])
            batch_op.create_index('ix_tbl_node_group_id', ['group_id'], unique=False)
    
    # Migrate data back from junction table to tbl_node.group_id
    # Note: This will only keep the first group for each node if multiple exist
    if 'tbl_node_group' in tables:
        connection = op.get_bind()
        result = connection.execute(sa.text("SELECT node_id, group_id FROM tbl_node_group WHERE is_active = 1 ORDER BY create_datetime"))
        node_groups = result.fetchall()
        
        # Update nodes with their first group
        for node_id, group_id in node_groups:
            connection.execute(
                sa.text("UPDATE tbl_node SET group_id = :group_id WHERE id = :node_id AND group_id IS NULL"),
                {"node_id": node_id, "group_id": group_id}
            )
    
    # Drop the junction table if it exists
    if 'tbl_node_group' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_node_group')]
        if 'ix_tbl_node_group_group_id' in indexes:
            try:
                op.drop_index(op.f('ix_tbl_node_group_group_id'), table_name='tbl_node_group')
            except Exception:
                pass
        if 'ix_tbl_node_group_node_id' in indexes:
            try:
                op.drop_index(op.f('ix_tbl_node_group_node_id'), table_name='tbl_node_group')
            except Exception:
                pass
        op.drop_table('tbl_node_group')
