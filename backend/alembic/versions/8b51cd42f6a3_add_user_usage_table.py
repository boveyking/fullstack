"""add user usage table

Revision ID: 8b51cd42f6a3
Revises: 6762e696f0da
Create Date: 2025-12-09 10:41:26.666641

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '8b51cd42f6a3'
down_revision: Union[str, None] = '6762e696f0da'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if tables already exist
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Create tbl_usage table
    if 'tbl_usage' not in tables:
        op.create_table(
            'tbl_usage',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('due_days', sa.Integer(), nullable=False),
            sa.Column('total_traffic', sa.Integer(), nullable=False),
            sa.Column('max_concurrent', sa.Integer(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['tbl_user.id'], name='fk_tbl_usage_user_id')
        )
        op.create_index(op.f('ix_tbl_usage_id'), 'tbl_usage', ['id'], unique=False)
        op.create_index('ix_tbl_usage_user_id', 'tbl_usage', ['user_id'], unique=False)
    
    # Create tbl_accounting table
    if 'tbl_accounting' not in tables:
        op.create_table(
            'tbl_accounting',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('transaction_amount', sa.Integer(), nullable=False),
            sa.Column('transaction_date', sa.DateTime(), nullable=False),
            sa.Column('status', sa.String(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['tbl_user.id'], name='fk_tbl_accounting_user_id')
        )
        op.create_index(op.f('ix_tbl_accounting_id'), 'tbl_accounting', ['id'], unique=False)
        op.create_index('ix_tbl_accounting_user_id', 'tbl_accounting', ['user_id'], unique=False)
    
    # Create tbl_reference_payment table
    if 'tbl_reference_payment' not in tables:
        op.create_table(
            'tbl_reference_payment',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('to_user_id', sa.Integer(), nullable=False),
            sa.Column('from_user_id', sa.Integer(), nullable=False),
            sa.Column('amount', sa.Integer(), nullable=False),
            sa.Column('create_datetime', sa.DateTime(), nullable=False),
            sa.Column('status', sa.String(), nullable=False),
            sa.Column('percentage', sa.Integer(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['to_user_id'], ['tbl_user.id'], name='fk_tbl_reference_payment_to_user_id'),
            sa.ForeignKeyConstraint(['from_user_id'], ['tbl_user.id'], name='fk_tbl_reference_payment_from_user_id')
        )
        op.create_index(op.f('ix_tbl_reference_payment_id'), 'tbl_reference_payment', ['id'], unique=False)
        op.create_index('ix_tbl_reference_payment_to_user_id', 'tbl_reference_payment', ['to_user_id'], unique=False)
        op.create_index('ix_tbl_reference_payment_from_user_id', 'tbl_reference_payment', ['from_user_id'], unique=False)


def downgrade() -> None:
    # Check if tables exist before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Drop tbl_reference_payment table
    if 'tbl_reference_payment' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_reference_payment')]
        if 'ix_tbl_reference_payment_from_user_id' in indexes:
            op.drop_index('ix_tbl_reference_payment_from_user_id', table_name='tbl_reference_payment')
        if 'ix_tbl_reference_payment_to_user_id' in indexes:
            op.drop_index('ix_tbl_reference_payment_to_user_id', table_name='tbl_reference_payment')
        if 'ix_tbl_reference_payment_id' in indexes:
            op.drop_index(op.f('ix_tbl_reference_payment_id'), table_name='tbl_reference_payment')
        op.drop_table('tbl_reference_payment')
    
    # Drop tbl_accounting table
    if 'tbl_accounting' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_accounting')]
        if 'ix_tbl_accounting_user_id' in indexes:
            op.drop_index('ix_tbl_accounting_user_id', table_name='tbl_accounting')
        if 'ix_tbl_accounting_id' in indexes:
            op.drop_index(op.f('ix_tbl_accounting_id'), table_name='tbl_accounting')
        op.drop_table('tbl_accounting')
    
    # Drop tbl_usage table
    if 'tbl_usage' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_usage')]
        if 'ix_tbl_usage_user_id' in indexes:
            op.drop_index('ix_tbl_usage_user_id', table_name='tbl_usage')
        if 'ix_tbl_usage_id' in indexes:
            op.drop_index(op.f('ix_tbl_usage_id'), table_name='tbl_usage')
        op.drop_table('tbl_usage')
