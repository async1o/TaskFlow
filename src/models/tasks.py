from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import DateTime, ForeignKey, String

from db.db import Base
from schemas.tasks import TasksSchema


class TasksModel(Base):
    __tablename__ = "tasks"

    id: Mapped[int] = mapped_column(primary_key=True)
    label: Mapped[str]
    text: Mapped[str]
    status: Mapped[str] = mapped_column(String(20), default="active")
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc)
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    owner: Mapped["UsersModel"] = relationship("UsersModel", back_populates="tasks", foreign_keys=[owner_id])
    creator: Mapped["UsersModel"] = relationship("UsersModel", foreign_keys=[creator_id])

    def to_read_model(self) -> TasksSchema:
        return TasksSchema(
            task_id=self.id,
            label=self.label,
            text=self.text,
            status=self.status,
            owner_id=self.owner_id,
            owner_name=self.owner.username if self.owner else "",
            owner_avatar=self.owner.avatar_url if self.owner else None,
            creator_id=self.creator_id,
            creator_name=self.creator.username if self.creator else "",
            creator_avatar=self.creator.avatar_url if self.creator else None,
            created_at=self.created_at,
            updated_at=self.updated_at)