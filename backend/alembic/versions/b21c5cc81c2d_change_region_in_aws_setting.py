"""change region in aws_setting

Revision ID: b21c5cc81c2d
Revises: b042d1cb5d0c
Create Date: 2025-11-22 09:53:06.384848

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b21c5cc81c2d'
down_revision: Union[str, None] = 'b042d1cb5d0c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Update regions from Southeast to Northeast
    # ap-southeast-1 (Singapore) -> ap-northeast-1 (Tokyo)
    # ap-southeast-2 (Sydney) -> ap-northeast-2 (Seoul)
    
    connection = op.get_bind()
    
    # Replace ap-southeast-1 with ap-northeast-1
    connection.execute(
        sa.text(
            "UPDATE tbl_aws_setting SET region = 'ap-northeast-1' WHERE region = 'ap-southeast-1'"
        )
    )
    
    # Replace ap-southeast-2 with ap-northeast-2
    connection.execute(
        sa.text(
            "UPDATE tbl_aws_setting SET region = 'ap-northeast-2' WHERE region = 'ap-southeast-2'"
        )
    )


def downgrade() -> None:
    # Revert regions from Northeast back to Southeast
    # ap-northeast-1 (Tokyo) -> ap-southeast-1 (Singapore)
    # ap-northeast-2 (Seoul) -> ap-southeast-2 (Sydney)
    
    pass
