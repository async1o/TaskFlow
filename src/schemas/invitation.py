from pydantic import BaseModel, ConfigDict
from datetime import datetime


class InvitationSchema(BaseModel):
    invitation_id: int
    corp_id: int
    sender_id: int
    recipient_id: int
    recipient_username: str
    corp_name: str
    status: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class InviteSendSchema(BaseModel):
    username: str
