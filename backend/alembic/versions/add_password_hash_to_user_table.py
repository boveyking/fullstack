"""add password_hash to user table

Revision ID: add_password_hash
Revises: 7747b8a4006e
Create Date: 2025-01-20 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = 'add_password_hash'
down_revision: Union[str, None] = '7747b8a4006e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if password_hash column already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    
    if 'tbl_user' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('tbl_user')]
        
        # Add password_hash column if it doesn't exist
        if 'password_hash' not in columns:
            op.add_column('tbl_user', sa.Column('password_hash', sa.String(), nullable=False, server_default=''))
        
        # Make email unique if it's not already
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_user')]
        if 'ix_tbl_user_email' not in indexes:
            # Check if there's already a unique constraint
            try:
                op.create_index('ix_tbl_user_email', 'tbl_user', ['email'], unique=True)
            except Exception:
                # Index might already exist, skip
                pass


def downgrade() -> None:
    # Remove password_hash column
    conn = op.get_bind()
    inspector = inspect(conn)
    
    if 'tbl_user' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('tbl_user')]
        
        if 'password_hash' in columns:
            op.drop_column('tbl_user', 'password_hash')
        
        # Remove unique index on email
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_user')]
        if 'ix_tbl_user_email' in indexes:
            op.drop_index('ix_tbl_user_email', table_name='tbl_user')

