"""rename notice_id and add tenders table

Revision ID: d54652329f0b
Revises: c2f5d73f60c9
Create Date: 2026-02-19 13:45:57.816882

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd54652329f0b'
down_revision: Union[str, None] = 'c2f5d73f60c9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


from sqlalchemy.dialects import postgresql

def upgrade() -> None:
    # Używamy postgresql.ENUM z flaga create_type=False, aby uniknąć DuplicateObject
    enum_type = postgresql.ENUM(
        "ezamowienia", "ted", "platformazakupowa", 
        name="notice_source_type",
        create_type=False
    )

    # 1️⃣ Tworzymy tabelę tenders
    op.create_table(
        "tenders",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("source", enum_type, nullable=False),
        sa.Column("external_id", sa.Text(), nullable=False),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.UniqueConstraint("source", "external_id", name="uq_source_tender"),
    )

    # 2️⃣ Dodajemy kolumnę tender_id do notices
    op.add_column(
        "notices",
        sa.Column("tender_id", sa.Integer(), nullable=True),
    )

    # 3️⃣ Tworzymy klucz obcy
    op.create_foreign_key(
        "fk_notices_tender",
        "notices",
        "tenders",
        ["tender_id"],
        ["id"],
        ondelete="CASCADE",  # jeśli usuniesz tender → usuną się notices
    )

    # 4️⃣ (opcjonalnie) indeks
    op.create_index(
        "ix_notices_tender_id",
        "notices",
        ["tender_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_notices_tender_id", table_name="notices")

    op.drop_constraint(
        "fk_notices_tender",
        "notices",
        type_="foreignkey"
    )

    op.drop_column("notices", "tender_id")

    op.drop_table("tenders")

