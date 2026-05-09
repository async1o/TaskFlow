from typing import Dict, List, Any
from fastapi import HTTPException

from utils.repositories import AbstractRepositories
from schemas.corp import CorpAddSchema, CorpUpdateSchema


class CorpServices:
    def __init__(self, corp_repo: type(AbstractRepositories)):  # type: ignore
        self.corp_repo: AbstractRepositories = corp_repo()

    async def get_all_corps(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        res = await self.corp_repo.find_all(limit=limit, offset=offset)
        return res

    async def get_my_corps(self, user_id: int, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        return await self.corp_repo.find_all_for_user(user_id, limit, offset)

    async def get_current_corp(self, corp_id: int) -> Dict[str, Any]:
        res = await self.corp_repo.find_current(corp_id)
        if not res:
            raise HTTPException(status_code=404, detail="Corp not found")
        return res

    async def add_corp(self, owner_id: int, data: CorpAddSchema) -> int:
        data_dict = data.model_dump()
        data_dict["owner_id"] = owner_id
        res = await self.corp_repo.add_one(data_dict)
        return res

    async def update_corp(self, corp_id: int, data: CorpUpdateSchema, current_user_id: int) -> Dict[str, Any]:
        corp = await self.corp_repo.find_current(corp_id)
        if not corp:
            raise HTTPException(status_code=404, detail="Corp not found")
        if corp["owner_id"] != current_user_id:
            raise HTTPException(status_code=403, detail="Only owner can update corp")
        data_dict = {k: v for k, v in data.model_dump().items() if v is not None}
        res = await self.corp_repo.update_one(corp_id, data_dict)
        return res

    async def delete_corp(self, corp_id: int, current_user_id: int) -> Dict[str, str]:
        corp = await self.corp_repo.find_current(corp_id)
        if not corp:
            raise HTTPException(status_code=404, detail="Corp not found")
        if corp["owner_id"] != current_user_id:
            raise HTTPException(status_code=403, detail="Only owner can delete corp")
        res = await self.corp_repo.delete_one(corp_id)
        return res

    async def get_members(self, corp_id: int) -> List[int]:
        return await self.corp_repo.get_members(corp_id)

    async def add_member(self, corp_id: int, user_id: int, current_user_id: int) -> None:
        corp = await self.corp_repo.find_current(corp_id)
        if not corp:
            raise HTTPException(status_code=404, detail="Corp not found")
        if corp["owner_id"] != current_user_id:
            raise HTTPException(status_code=403, detail="Only owner can add members")
        await self.corp_repo.add_member(corp_id, user_id)

    async def remove_member(self, corp_id: int, user_id: int, current_user_id: int) -> None:
        corp = await self.corp_repo.find_current(corp_id)
        if not corp:
            raise HTTPException(status_code=404, detail="Corp not found")
        if corp["owner_id"] != current_user_id:
            raise HTTPException(status_code=403, detail="Only owner can remove members")
        await self.corp_repo.remove_member(corp_id, user_id)
