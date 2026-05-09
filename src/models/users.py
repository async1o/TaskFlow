from __future__ import annotations

from datetime import datetime, timezone


from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, ForeignKey, UniqueConstraint, String

from db.db import Base
from schemas.users import UserSchema


class UsersModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password: Mapped[str]
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True, default=None)
    corp_id: Mapped[int | None] = mapped_column(ForeignKey("corps.id", use_alter=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        # onupdate=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        UniqueConstraint('email', name='uq_user_email'),
        UniqueConstraint('username', name='uq_user_username'),
    )

    tasks = relationship("TasksModel", foreign_keys="TasksModel.owner_id", back_populates="owner", cascade="all, delete-orphan")
    corp = relationship("CorpModel", foreign_keys=[corp_id])
    owned_corps = relationship("CorpModel", foreign_keys="CorpModel.owner_id", back_populates="owner")
    member_corps = relationship("CorpModel", secondary="corp_members", back_populates="members")

    def to_read_model(self) -> UserSchema:
        return UserSchema(
            user_id=self.id,
            username=self.username,
            email=self.email,
            avatar_url=self.avatar_url,
            created_at=self.created_at,
            updated_at=self.updated_at,
        )
