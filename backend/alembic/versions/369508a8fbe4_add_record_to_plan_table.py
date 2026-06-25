"""add record to plan table

Revision ID: 369508a8fbe4
Revises: d5bef2094bf3
Create Date: 2025-12-04 15:56:50.261588

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '369508a8fbe4'
down_revision: Union[str, None] = 'd5bef2094bf3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_plan' in tables:
        # Check if records already exist to avoid duplicates
        result = conn.execute(sa.text("SELECT COUNT(*) FROM tbl_plan WHERE name IN ('standard', 'premium')"))
        count = result.scalar()
        
        if count == 0:
            # Create table reference for bulk insert
            plan_table = sa.table(
                'tbl_plan',
                sa.column('name', sa.String),
                sa.column('description', sa.String),
                sa.column('month_price', sa.Integer),
                sa.column('bandwidth', sa.Integer),
                sa.column('is_active', sa.Boolean)
            )
            
            # Insert initial plan records
            op.bulk_insert(plan_table, [
                {'name': 'standard', 'description': 'Stardard license', 'month_price': 15, 'bandwidth': 50, 'is_active': True},
                {'name': 'premium', 'description': 'Premium license', 'month_price': 20, 'bandwidth': 100, 'is_active': True}
            ])


def downgrade() -> None:
    # Remove the inserted records
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_plan' in tables:
        conn.execute(sa.text("DELETE FROM tbl_plan WHERE name IN ('standard', 'premium')"))
