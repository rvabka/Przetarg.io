from datetime import datetime
from typing import Optional

from sqlalchemy import Integer, Text, DateTime, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base

class Attachment(Base):
    __tablename__ = "attachments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    tender_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
    )

    filename: Mapped[str] = mapped_column(Text, nullable=False)

    url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    path: Mapped[str] = mapped_column(Text, nullable=False)

    hash: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    tender: Mapped["Tender"] = relationship(
        "Tender",
        back_populates="attachments"
    )

    __table_args__ = (
        UniqueConstraint("tender_id", "filename", name="uq_tender_attachment_filename"),
    )

    def __repr__(self) -> str:
        return f"<Attachment(id={self.id}, filename={self.filename})>"
