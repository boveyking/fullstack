"""add record into  tbl_group

Revision ID: 274bccbe7b05
Revises: 18d517f73ec8
Create Date: 2025-12-03 21:39:31.422861

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '274bccbe7b05'
down_revision: Union[str, None] = '18d517f73ec8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_group' in tables:
        # Check if records already exist to avoid duplicates
        result = conn.execute(sa.text("SELECT COUNT(*) FROM tbl_group WHERE name IN ('default', 'premium', 'enterprise')"))
        count = result.scalar()
        
        if count == 0:
            # Create table reference for bulk insert
            group_table = sa.table(
                'tbl_group',
                sa.column('name', sa.String),
                sa.column('description', sa.String),
                sa.column('is_active', sa.Boolean)
            )
            
            # Insert initial group records
            op.bulk_insert(group_table, [
                {'name': 'default', 'description': 'Default Group', 'is_active': True},
                {'name': 'premium', 'description': 'Premium Group', 'is_active': True},
                {'name': 'enterprise', 'description': 'Enterprise Group', 'is_active': True}
            ])


def downgrade() -> None:
    # Remove the inserted records
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_group' in tables:
        conn.execute(sa.text("DELETE FROM tbl_group WHERE name IN ('default', 'premium', 'enterprise')"))
