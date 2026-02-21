import enum
from datetime import datetime
from typing import Optional, Any, List

from sqlalchemy import (
    Integer,
    Text,
    DateTime,
    func,
    Enum,
    UniqueConstraint,
    ForeignKey,
)

from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base
from .enums import NoticeSourceType

class Tender(Base):
    __tablename__ = "tenders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    source: Mapped[NoticeSourceType] = mapped_column(
        Enum(NoticeSourceType, name="notice_source_type"),
        nullable=False,
    )

    external_id: Mapped[str] = mapped_column(Text, nullable=False)

    title: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    status: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )

    notices: Mapped[List["Notice"]] = relationship(
        back_populates="tender",
        cascade="all, delete-orphan",
    )

    attachments: Mapped[List["Attachment"]] = relationship(
        "Attachment",
        back_populates="tender",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        UniqueConstraint("source", "external_id", name="uq_source_tender"),
    )

    def __repr__(self) -> str:
        return f"<Tender(id={self.id}, source={self.source}, external_id={self.external_id})>"
