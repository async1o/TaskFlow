from pydantic import BaseModel
from datetime import datetime


class NotificationSchema(BaseModel):
    notification_id: int
    user_id: int
    type: str
    message: str
    related_id: int | None = None
    read: bool
    created_at: datetime
