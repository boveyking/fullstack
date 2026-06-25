"""update singapore region

Revision ID: 4e831fddb236
Revises: 5d1c416f2cf8
Create Date: 2025-12-03 00:54:48.869901

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e831fddb236'
down_revision: Union[str, None] = '5d1c416f2cf8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    connection = op.get_bind()
    
    # Replace ap-southeast-1 with ap-northeast-1
    connection.execute(
        sa.text(
            "UPDATE tbl_aws_setting SET region = 'ap-southeast-1' WHERE city = 'singapore'"
        )
    )


def downgrade() -> None:
    pass
