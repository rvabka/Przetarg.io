from sqlalchemy import Column, Integer, String, Text, ForeignKey, Computed
from sqlalchemy.orm import relationship, Mapped, mapped_column
from pgvector.sqlalchemy import Vector
from src.db.base import Base

class NoticeChunk(Base):
    __tablename__ = "notice_chunks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    
    notice_id: Mapped[int] = mapped_column(
        Integer, 
        ForeignKey("notices.id", ondelete="CASCADE"), 
        nullable=False
    )
    
    # "4.1.9" or "HEADER"
    sub_id: Mapped[str] = mapped_column(String, nullable=True)
    
    # "SEKCJA IV - ..."
    section_title: Mapped[str] = mapped_column(String, nullable=True)
    
    content: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Embedding vector (3072 for gemini-embedding-001)
    embedding = mapped_column(Vector(3072))

    notice = relationship("Notice", backref="chunks")

    def __repr__(self):
        return f"<NoticeChunk(id={self.id}, sub_id={self.sub_id})>"
