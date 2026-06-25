"""add user table

Revision ID: 7747b8a4006e
Revises: 6ff8b0cdb19d
Create Date: 2025-12-04 17:51:07.620645

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = '7747b8a4006e'
down_revision: Union[str, None] = '6ff8b0cdb19d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Check if tables already exist
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Create tbl_user table
    if 'tbl_user' not in tables:
        # Create table first without self-referential FK (for SQLite compatibility)
        op.create_table(
            'tbl_user',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('plan_id', sa.Integer(), nullable=True),
            sa.Column('email', sa.String(), nullable=False),
            sa.Column('user_name', sa.String(), nullable=False),
            sa.Column('group_id', sa.Integer(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default='1'),
            sa.Column('create_datetime', sa.DateTime(), nullable=False),
            sa.Column('uuid', sa.String(), nullable=True),
            sa.Column('ref_code', sa.String(), nullable=True),
            sa.Column('ref_user_id', sa.Integer(), nullable=True),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['plan_id'], ['tbl_plan.id'], name='fk_tbl_user_plan_id'),
            sa.ForeignKeyConstraint(['group_id'], ['tbl_group.id'], name='fk_tbl_user_group_id')
        )
        op.create_index(op.f('ix_tbl_user_id'), 'tbl_user', ['id'], unique=False)
        op.create_index('ix_tbl_user_plan_id', 'tbl_user', ['plan_id'], unique=False)
        op.create_index('ix_tbl_user_group_id', 'tbl_user', ['group_id'], unique=False)
        
        # Add self-referential foreign key using batch_alter_table for SQLite compatibility
        with op.batch_alter_table('tbl_user', schema=None) as batch_op:
            batch_op.create_foreign_key('fk_tbl_user_ref_user_id', 'tbl_user', ['ref_user_id'], ['id'])
            batch_op.create_index('ix_tbl_user_ref_user_id', ['ref_user_id'], unique=False)
    
    # Create tbl_payment table
    if 'tbl_payment' not in tables:
        op.create_table(
            'tbl_payment',
            sa.Column('id', sa.Integer(), nullable=False, autoincrement=True),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('account', sa.Integer(), nullable=False),
            sa.Column('create_datetime', sa.DateTime(), nullable=False),
            sa.Column('status', sa.String(length=20), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.ForeignKeyConstraint(['user_id'], ['tbl_user.id'], name='fk_tbl_payment_user_id')
        )
        op.create_index(op.f('ix_tbl_payment_id'), 'tbl_payment', ['id'], unique=False)
        op.create_index('ix_tbl_payment_user_id', 'tbl_payment', ['user_id'], unique=False)
    
    # Add connection column to tbl_plan if table exists
    if 'tbl_plan' in tables:
        columns = [col['name'] for col in inspector.get_columns('tbl_plan')]
        
        if 'connection' not in columns:
            with op.batch_alter_table('tbl_plan', schema=None) as batch_op:
                batch_op.add_column(sa.Column('connection', sa.Integer(), nullable=True, server_default='3'))


def downgrade() -> None:
    # Check if tables exist before dropping
    conn = op.get_bind()
    inspector = inspect(conn)
    tables = inspector.get_table_names()
    
    # Drop tbl_payment table
    if 'tbl_payment' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_payment')]
        if 'ix_tbl_payment_user_id' in indexes:
            op.drop_index('ix_tbl_payment_user_id', table_name='tbl_payment')
        if 'ix_tbl_payment_id' in indexes:
            op.drop_index(op.f('ix_tbl_payment_id'), table_name='tbl_payment')
        op.drop_table('tbl_payment')
    
    # Drop tbl_user table
    if 'tbl_user' in tables:
        indexes = [idx['name'] for idx in inspector.get_indexes('tbl_user')]
        # Drop self-referential foreign key and index using batch_alter_table
        if 'ix_tbl_user_ref_user_id' in indexes:
            with op.batch_alter_table('tbl_user', schema=None) as batch_op:
                batch_op.drop_index('ix_tbl_user_ref_user_id')
                batch_op.drop_constraint('fk_tbl_user_ref_user_id', type_='foreignkey')
        if 'ix_tbl_user_group_id' in indexes:
            op.drop_index('ix_tbl_user_group_id', table_name='tbl_user')
        if 'ix_tbl_user_plan_id' in indexes:
            op.drop_index('ix_tbl_user_plan_id', table_name='tbl_user')
        if 'ix_tbl_user_id' in indexes:
            op.drop_index(op.f('ix_tbl_user_id'), table_name='tbl_user')
        op.drop_table('tbl_user')
    
    # Remove connection column from tbl_plan if table exists
    if 'tbl_plan' in tables:
        columns = [col['name'] for col in inspector.get_columns('tbl_plan')]
        
        if 'connection' in columns:
            with op.batch_alter_table('tbl_plan', schema=None) as batch_op:
                batch_op.drop_column('connection')
