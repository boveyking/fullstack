"""add user reset password token

Revision ID: 921ca48ad6b2
Revises: add_password_hash
Create Date: 2025-12-04 22:08:08.771566

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '921ca48ad6b2'
down_revision: Union[str, None] = 'add_password_hash'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tbl_user', sa.Column('verify_token', sa.String(), nullable=True))
    

def downgrade() -> None:
    op.drop_column('tbl_user', 'verify_token')
  