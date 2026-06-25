"""add sub table

Revision ID: 7dc45d625d1d
Revises: 921ca48ad6b2
Create Date: 2025-12-05 10:15:49.765545

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '7dc45d625d1d'
down_revision: Union[str, None] = '921ca48ad6b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if tables already exist
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Create tbl_client table
    if 'tbl_client' not in tables:
        op.create_table(
            'tbl_client',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('OS', sa.String(), nullable=False),
            sa.Column('download_url', sa.String(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_tbl_client_id'), 'tbl_client', ['id'], unique=False)
    
    # Create tbl_vless_url table
    if 'tbl_vless_url' not in tables:
        op.create_table(
            'tbl_vless_url',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.Column('create_datetime', sa.DateTime(), nullable=False),
            sa.Column('node_id', sa.Integer(), nullable=False),
            sa.Column('sub_url', sa.String(length=200), nullable=False),
            sa.Column('vless_url', sa.String(length=1000), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['tbl_user.id'], name='fk_tbl_vless_url_user_id'),
            sa.ForeignKeyConstraint(['node_id'], ['tbl_node.id'], name='fk_tbl_vless_url_node_id')
        )
        op.create_index(op.f('ix_tbl_vless_url_id'), 'tbl_vless_url', ['id'], unique=False)
        op.create_index('ix_tbl_vless_url_user_id', 'tbl_vless_url', ['user_id'], unique=False)
        op.create_index('ix_tbl_vless_url_node_id', 'tbl_vless_url', ['node_id'], unique=False)
    
    # Create tbl_sub_combine table
    if 'tbl_sub_combine' not in tables:
        op.create_table(
            'tbl_sub_combine',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('client_id', sa.Integer(), nullable=False),
            sa.Column('sub_content', sa.String(), nullable=False),
            sa.Column('vless', sa.String(), nullable=False),
            sa.Column('create_datetime', sa.DateTime(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['tbl_user.id'], name='fk_tbl_sub_combine_user_id'),
            sa.ForeignKeyConstraint(['client_id'], ['tbl_client.id'], name='fk_tbl_sub_combine_client_id')
        )
        op.create_index(op.f('ix_tbl_sub_combine_id'), 'tbl_sub_combine', ['id'], unique=False)
        op.create_index('ix_tbl_sub_combine_user_id', 'tbl_sub_combine', ['user_id'], unique=False)
        op.create_index('ix_tbl_sub_combine_client_id', 'tbl_sub_combine', ['client_id'], unique=False)


def downgrade() -> None:
    # Check if tables exist before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Drop tbl_sub_combine table
    if 'tbl_sub_combine' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_sub_combine')]
        if 'ix_tbl_sub_combine_client_id' in indexes:
            op.drop_index('ix_tbl_sub_combine_client_id', table_name='tbl_sub_combine')
        if 'ix_tbl_sub_combine_user_id' in indexes:
            op.drop_index('ix_tbl_sub_combine_user_id', table_name='tbl_sub_combine')
        if 'ix_tbl_sub_combine_id' in indexes:
            op.drop_index(op.f('ix_tbl_sub_combine_id'), table_name='tbl_sub_combine')
        op.drop_table('tbl_sub_combine')
    
    # Drop tbl_vless_url table
    if 'tbl_vless_url' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_vless_url')]
        if 'ix_tbl_vless_url_node_id' in indexes:
            op.drop_index('ix_tbl_vless_url_node_id', table_name='tbl_vless_url')
        if 'ix_tbl_vless_url_user_id' in indexes:
            op.drop_index('ix_tbl_vless_url_user_id', table_name='tbl_vless_url')
        if 'ix_tbl_vless_url_id' in indexes:
            op.drop_index(op.f('ix_tbl_vless_url_id'), table_name='tbl_vless_url')
        op.drop_table('tbl_vless_url')
    
    # Drop tbl_client table
    if 'tbl_client' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_client')]
        if 'ix_tbl_client_id' in indexes:
            op.drop_index(op.f('ix_tbl_client_id'), table_name='tbl_client')
        op.drop_table('tbl_client')
