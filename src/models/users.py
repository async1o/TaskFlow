from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, UniqueConstraint, String

from db.db import Base
from schemas.users import UserSchema


class UsersModel(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password: Mapped[str]
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    __table_args__ = (
        UniqueConstraint('email', name='uq_user_email'),
        UniqueConstraint('username', name='uq_user_username'),
    )

    tasks: Mapped[list["TasksModel"]] = relationship("TasksModel", back_populates="owner", foreign_keys="TasksModel.owner_id", cascade="all, delete-orphan")

    def to_read_model(self) -> UserSchema:
        return UserSchema(
            user_id=self.id,
            username=self.username,
            email=self.email,
            avatar_url=self.avatar_url,
            created_at=self.created_at,
            updated_at=self.updated_at)