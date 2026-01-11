"""add ex_lider flag to users

Revision ID: c9a1e2f3a4b5
Revises: 7b13ed7d1618
Create Date: 2026-01-11 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c9a1e2f3a4b5'
down_revision = '7b13ed7d1618'
branch_labels = None
depends_on = None


def upgrade():
    # Add ex_lider column to users with default False (Postgres-friendly)
    op.add_column('users', sa.Column('ex_lider', sa.Boolean(), nullable=False, server_default=sa.text('FALSE')))


def downgrade():
    # Drop ex_lider column
    op.drop_column('users', 'ex_lider')
