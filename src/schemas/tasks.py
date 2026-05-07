from pydantic import BaseModel, ConfigDict
from datetime import datetime


class TasksSchema(BaseModel):
    task_id: int
    label: str
    text: str
    status: str = "active"
    owner_id: int
    owner_name: str
    owner_avatar: str | None = None
    creator_id: int
    creator_name: str
    creator_avatar: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TasksAddSchema(BaseModel):
    label: str
    text: str


class TasksCompleteSchema(BaseModel):
    status: str = "completed"


class TasksUpdateSchema(BaseModel):
    label: str
    text: str
    status: str | None = None