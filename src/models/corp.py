from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, Table, DateTime
from sqlalchemy.orm import relationship

from db.db import Base
from schemas.corp import CorpSchema


# Association table for many-to-many Corp <-> User
corp_members = Table(
    "corp_members",
    Base.metadata,
    Column("corp_id", Integer, ForeignKey("corps.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
)


class CorpModel(Base):
    __tablename__ = "corps"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    owner_id = Column(Integer, ForeignKey("users.id", use_alter=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    owner = relationship("UsersModel", foreign_keys=[owner_id], back_populates="owned_corps")
    members = relationship("UsersModel", secondary=corp_members, back_populates="member_corps")

    def to_read_model(self) -> CorpSchema:
        return CorpSchema(
            corp_id=self.id,
            name=self.name,
            owner_id=self.owner_id,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )
