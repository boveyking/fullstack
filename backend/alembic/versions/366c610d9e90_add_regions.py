"""add regions

Revision ID: 366c610d9e90
Revises: 3a6c783c906c
Create Date: 2025-12-06 10:24:15.275208

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '366c610d9e90'
down_revision: Union[str, None] = '3a6c783c906c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_aws_setting' in tables:
        # Check if records already exist to avoid duplicates
        result = conn.execute(sa.text("SELECT COUNT(*) FROM tbl_aws_setting WHERE region IN ('ap-east-1', 'ap-northeast-3', 'ap-east-2', 'ap-southeast-7')"))
        count = result.scalar()
        
        if count == 0:
            # Insert region records using direct SQL for better SQLite compatibility
            conn.execute(sa.text("""
                INSERT INTO tbl_aws_setting (city, region, ami_id) VALUES
                ('Hong Kong', 'ap-east-1', 'ami-0d6e1a2f8241fb073'),
                ('Osaka', 'ap-northeast-3', 'ami-09a38e2e7a3cc42de'),
                ('Tapipei', 'ap-east-2', 'ami-016208b12b4e0d3d7'),
                ('Thailand', 'ap-southeast-7', 'ami-055e4b00b041f3034')
            """))



def downgrade() -> None:
    # Remove the inserted records
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_aws_setting' in tables:
        conn.execute(sa.text("DELETE FROM tbl_aws_setting WHERE region IN ('ap-east-1', 'ap-northeast-3', 'ap-east-2', 'ap-southeast-7')"))
