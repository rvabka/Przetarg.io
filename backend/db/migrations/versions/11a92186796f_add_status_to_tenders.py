"""add status to tenders

Revision ID: 11a92186796f
Revises: 63fa7d48f77b
Create Date: 2026-02-19 23:01:19.290405

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '11a92186796f'
down_revision: Union[str, None] = '63fa7d48f77b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('tenders', sa.Column('status', sa.Text(), nullable=True))


def downgrade() -> None:
    op.drop_column('tenders', 'status')
