from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class CorpSchema(BaseModel):
    corp_id: int
    name: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CorpAddSchema(BaseModel):
    name: str


class CorpUpdateSchema(BaseModel):
    name: Optional[str] = None


class CorpAddMemberSchema(BaseModel):
    user_id: int
