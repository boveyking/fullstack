"""add_password_reset_token_to_user

Revision ID: 86414e2729f5
Revises: 22341fd138b5
Create Date: 2025-12-02 09:15:41.071655

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '86414e2729f5'
down_revision: Union[str, None] = '22341fd138b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tbl_user', sa.Column('password_reset_token', sa.String(length=36), nullable=True))


def downgrade() -> None:
    pass
