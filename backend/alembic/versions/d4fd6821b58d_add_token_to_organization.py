"""add token to  organization 

Revision ID: d4fd6821b58d
Revises: cb294ee036b5
Create Date: 2025-11-29 10:33:26.040943

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4fd6821b58d'
down_revision: Union[str, None] = 'cb294ee036b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop the tbl_invitation table
    op.drop_table('tbl_invitation')
    
    # Add token column to tbl_organization
    op.add_column('tbl_organization', sa.Column('token', sa.String(length=36), nullable=True))
    
    # Add verified column to tbl_organization
    op.add_column('tbl_organization', sa.Column('verified', sa.Boolean(), nullable=True))


def downgrade() -> None:
    # Remove the columns from tbl_organization
    op.drop_column('tbl_organization', 'verified')
    op.drop_column('tbl_organization', 'token')
    
    # Recreate the tbl_invitation table
    op.create_table(
        'tbl_invitation',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), server_default='1', nullable=True),
        sa.Column('create_datetime', sa.DateTime(), nullable=True),
        sa.Column('token', sa.String(length=60), nullable=True),
        sa.Column('organization', sa.String(length=100), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
