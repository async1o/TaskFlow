from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr


class UserSchema(BaseModel):
    user_id: int
    username: str
    email: str
    avatar_url: str | None = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserAddSchema(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLoginSchema(BaseModel):
    email: EmailStr
    password: str


class UserSchemaWithPassword(BaseModel):
    user_id: int
    username: str
    email: str
    avatar_url: str | None = None
    password: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserUpdateSchema(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
    password: str | None = None
    avatar_url: str | None = None