"""add tbl_node table

Revision ID: 5f3fc573c9e4
Revises: 4e831fddb236
Create Date: 2025-12-03 21:18:54.380926

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '5f3fc573c9e4'
down_revision: Union[str, None] = '4e831fddb236'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if table already exists
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_node' not in tables:
        op.create_table(
            'tbl_node',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('server_id', sa.Integer(), nullable=False),
            sa.Column('remark', sa.String(length=50), nullable=True),
            sa.Column('port', sa.Integer(), nullable=True),
            sa.Column('protocol', sa.String(length=30), nullable=True),
            sa.Column('short_id', sa.String(length=30), nullable=True),
            sa.Column('target', sa.String(length=20), nullable=True),
            sa.Column('security', sa.String(length=30), nullable=True, server_default='vless'),
            sa.Column('fingerprint', sa.String(length=30), nullable=True),
            sa.Column('sni', sa.String(length=30), nullable=True),
            sa.Column('inbound_id', sa.Integer(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['server_id'], ['tbl_aws_instance.id'], ),
        )
        op.create_index(op.f('ix_tbl_node_id'), 'tbl_node', ['id'], unique=False)
        op.create_index(op.f('ix_tbl_node_server_id'), 'tbl_node', ['server_id'], unique=False)


def downgrade() -> None:
    # Check if table exists before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    if 'tbl_node' in tables:
        # Check if indexes exist before dropping
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_node')]
        if 'ix_tbl_node_server_id' in indexes:
            op.drop_index(op.f('ix_tbl_node_server_id'), table_name='tbl_node')
        if 'ix_tbl_node_id' in indexes:
            op.drop_index(op.f('ix_tbl_node_id'), table_name='tbl_node')
        op.drop_table('tbl_node')
