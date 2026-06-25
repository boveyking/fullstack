"""change name to email in invitaion

Revision ID: 6807f9094267
Revises: 57afcffad468
Create Date: 2025-11-28 18:34:19.771693

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '6807f9094267'
down_revision: Union[str, None] = '57afcffad468'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table and column exist before renaming
    bind = op.get_bind()
    inspector = inspect(bind)
    
    if 'tbl_invitation' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('tbl_invitation')]
        if 'organization' in columns and 'email' not in columns:
            with op.batch_alter_table('tbl_invitation') as batch_op:
                batch_op.alter_column('organization',
                                     new_column_name='email',
                                     existing_type=sa.String(length=100),
                                     nullable=True)


def downgrade() -> None:
    # Revert email back to organization
    bind = op.get_bind()
    inspector = inspect(bind)
    
    if 'tbl_invitation' in inspector.get_table_names():
        columns = [col['name'] for col in inspector.get_columns('tbl_invitation')]
        if 'email' in columns and 'organization' not in columns:
            with op.batch_alter_table('tbl_invitation') as batch_op:
                batch_op.alter_column('email',
                                     new_column_name='organization',
                                     existing_type=sa.String(length=100),
                                     nullable=True)
