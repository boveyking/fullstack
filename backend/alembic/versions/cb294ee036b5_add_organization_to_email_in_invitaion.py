"""add organization to email in invitaion

Revision ID: cb294ee036b5
Revises: 6807f9094267
Create Date: 2025-11-28 18:47:01.292598

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cb294ee036b5'
down_revision: Union[str, None] = '6807f9094267'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tbl_invitation', sa.Column('organization', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('tbl_invitation', 'organization')
