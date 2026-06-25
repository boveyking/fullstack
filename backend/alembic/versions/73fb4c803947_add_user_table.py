"""add user table

Revision ID: 73fb4c803947
Revises: b1592f66e069
Create Date: 2025-11-27 14:17:30.210492

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '73fb4c803947'
down_revision: Union[str, None] = 'b1592f66e069'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create tbl_address table
    op.create_table(
        'tbl_address',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('city', sa.String(), nullable=True),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('zip', sa.String(), nullable=True),
        sa.Column('country', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create tbl_organization table
    op.create_table(
        'tbl_organization',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('org_name', sa.String(), nullable=True),
        sa.Column('org_desc', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('address_id', sa.Integer(), nullable=True),
        sa.Column('create_datetime', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['address_id'], ['tbl_address.id'], )
    )
    
    # Create tbl_user table
    op.create_table(
        'tbl_user',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_name', sa.String(), nullable=True),
        sa.Column('password', sa.String(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('create_datetime', sa.DateTime(), nullable=True),
        sa.Column('org_id', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['org_id'], ['tbl_organization.id'], )
    )


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign key dependencies)
    op.drop_table('tbl_user')
    op.drop_table('tbl_organization')
    op.drop_table('tbl_address')
