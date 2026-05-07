from typing import Dict, List

from utils.repositories import AbstractRepositories
from schemas.users import UserAddSchema, UserSchema, UserLoginSchema, TokenSchema
from utils.auth import hash_password, verify_password
from utils.jwt_handler import create_access_token


class UserServices:
    def __init__(self, users_repo: type(AbstractRepositories)):  # type: ignore
        self.users_repo: AbstractRepositories = users_repo()

    async def get_all_users(self, limit: int = 100, offset: int = 0) -> List[UserSchema]:
        res = await self.users_repo.find_all(limit=limit, offset=offset)
        return res

    async def get_current_user(self, user_id: int) -> UserSchema:
        res = await self.users_repo.find_current(user_id)
        return res

    async def add_user(self, data: UserAddSchema) -> int:
        data_dict = data.model_dump()
        data_dict["password"] = hash_password(data_dict["password"])
        res = await self.users_repo.add_one(data_dict)
        return res

    async def update_user(self, user_id: int, data: UserAddSchema) -> UserSchema:
        data_dict = data.model_dump()
        data_dict["password"] = hash_password(data_dict["password"])
        res = await self.users_repo.update_one(user_id, data_dict)
        return res

    async def delete_user(self, user_id: int) -> Dict:
        await self.users_repo.delete_one(user_id)
        return {"message": "User deleted"}

    async def authenticate_user(self, data: UserLoginSchema) -> TokenSchema:
        user = await self.users_repo.find_by_email(data.email)
        if not user or not verify_password(data.password, user.password):
            raise ValueError("Invalid credentials")
        token = create_access_token(data={"sub": str(user.id)})
        return TokenSchema(access_token=token)