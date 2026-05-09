from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime

from db.db import Base
from schemas.invitation import InvitationSchema


class InvitationModel(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True)
    corp_id = Column(Integer, ForeignKey("corps.id"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    def to_read_model(self, recipient_username: str, corp_name: str) -> InvitationSchema:
        return InvitationSchema(
            invitation_id=self.id,
            corp_id=self.corp_id,
            sender_id=self.sender_id,
            recipient_id=self.recipient_id,
            recipient_username=recipient_username,
            corp_name=corp_name,
            status=self.status,
            created_at=self.created_at,
        )
