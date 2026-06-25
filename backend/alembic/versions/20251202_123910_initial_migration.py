"""Initial migration

Revision ID: 20251202_123910
Revises: 
Create Date: 2025-12-02 12:39:10

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20251202_123910'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Database schema already exists - no changes needed
    # This migration represents the current state of the database
    pass


def downgrade() -> None:
    # No downgrade needed for baseline
    pass
