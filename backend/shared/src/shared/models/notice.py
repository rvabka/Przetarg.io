import enum
from datetime import datetime
from typing import Optional, Any

from sqlalchemy import Integer, Text, DateTime, func, Enum, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .enums import NoticeSourceType

class Notice(Base):
    __tablename__ = "notices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    source: Mapped[NoticeSourceType] = mapped_column(
        Enum(NoticeSourceType, name="notice_source_type"),
        nullable=False,
    )

    notice_id: Mapped[str] = mapped_column(Text, nullable=False)

    tender_id: Mapped[int] = mapped_column(
        ForeignKey("tenders.id", ondelete="CASCADE"),
        nullable=False,
    )

    title: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    notice_data: Mapped[Optional[dict[str, Any]]] = mapped_column(
        JSONB,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    tender: Mapped["Tender"] = relationship(
        back_populates="notices"
    )

    __table_args__ = (
        UniqueConstraint("source", "notice_id", name="uq_source_notice"),
    )

    def __repr__(self) -> str:
        return f"<Notice(id={self.id}, source={self.source}, notice_id={self.notice_id})>"
