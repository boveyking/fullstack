"""remove client_id from tbl_sub_combine

Revision ID: 552374b2ad63
Revises: 8b51cd42f6a3
Create Date: 2025-12-10 19:31:54.108482

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '552374b2ad63'
down_revision: Union[str, None] = '8b51cd42f6a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if column exists before trying to drop it
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('tbl_sub_combine')]
    
    if 'client_id' in columns:
        # Drop index first if it exists
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_sub_combine')]
        if 'ix_tbl_sub_combine_client_id' in indexes:
            try:
                op.drop_index('ix_tbl_sub_combine_client_id', table_name='tbl_sub_combine')
            except Exception:
                pass
        
        # Get foreign keys to check if constraint exists
        foreign_keys = inspector.get_foreign_keys('tbl_sub_combine')
        fk_constraint_name = None
        for fk in foreign_keys:
            if fk.get('constrained_columns') == ['client_id']:
                fk_constraint_name = fk.get('name') or 'fk_tbl_sub_combine_client_id'
                break
        
        # Use batch_alter_table for SQLite to drop foreign key and column
        with op.batch_alter_table('tbl_sub_combine', schema=None) as batch_op:
            # Drop foreign key constraint if it exists
            if fk_constraint_name:
                try:
                    batch_op.drop_constraint(fk_constraint_name, type_='foreignkey')
                except Exception:
                    pass
            
            # Drop the column
            batch_op.drop_column('client_id')


def downgrade() -> None:
    # Check if column doesn't exist before adding it back
    conn = op.get_bind()
    inspector = inspect(conn)
    columns = [col['name'] for col in inspector.get_columns('tbl_sub_combine')]
    
    if 'client_id' not in columns:
        # Use batch_alter_table for SQLite to add column, foreign key, and index
        with op.batch_alter_table('tbl_sub_combine', schema=None) as batch_op:
            # Add the column back
            # Note: If there are existing rows, you may need to provide a default client_id value
            batch_op.add_column(sa.Column('client_id', sa.Integer(), nullable=False))
            # Recreate the foreign key constraint
            batch_op.create_foreign_key('fk_tbl_sub_combine_client_id', 'tbl_client', ['client_id'], ['id'])
            # Recreate the index
            batch_op.create_index('ix_tbl_sub_combine_client_id', ['client_id'], unique=False)
