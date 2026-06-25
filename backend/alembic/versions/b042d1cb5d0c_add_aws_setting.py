"""add aws_setting

Revision ID: b042d1cb5d0c
Revises: b1592f66e069
Create Date: 2025-11-21 11:29:03.550569

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b042d1cb5d0c'
down_revision: Union[str, None] = 'b1592f66e069'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    
    # Check if table exists, create only if it doesn't
    if 'tbl_aws_setting' not in inspector.get_table_names():
        op.create_table(
            'tbl_aws_setting',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('region', sa.String(), nullable=False),
            sa.Column('ami_id', sa.String(), nullable=False),
            sa.Column('city', sa.String(), nullable=False),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tbl_aws_setting_id'), 'tbl_aws_setting', ['id'], unique=False)
    
    # Always insert initial AWS settings
    aws_setting_table = sa.table(
        'tbl_aws_setting',
        sa.column('region', sa.String),
        sa.column('ami_id', sa.String),
        sa.column('city', sa.String)
    )
    
    op.bulk_insert(aws_setting_table, [
        {'region': 'ap-southeast-1', 'ami_id': 'ami-0aec5ae807cea9ce0', 'city': 'tokyo'},
        {'region': 'ap-southeast-1', 'ami_id': 'ami-00d8fc944fb171e29', 'city': 'singapore'},
        {'region': 'us-west-2', 'ami_id': 'ami-00f46ccd1cbfb363e', 'city': 'oregon'},
        {'region': 'ap-southeast-2', 'ami_id': 'ami-0a71e3eb8b23101ed', 'city': 'seoul'},
        {'region': 'eu-central-1', 'ami_id': 'ami-004e960cde33f9146', 'city': 'frankfurt'},
        {'region': 'us-west-1', 'ami_id': 'ami-0e6a50b0059fd2cc3', 'city': 'California'}
    ])


def downgrade() -> None:
    op.drop_index(op.f('ix_tbl_aws_setting_id'), table_name='tbl_aws_setting')
    op.drop_table('tbl_aws_setting')
