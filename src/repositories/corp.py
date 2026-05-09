from typing import List, Dict, Any
from sqlalchemy import select, delete, insert, update

from utils.repositories import AbstractRepositories
from models.corp import CorpModel, corp_members
from db.db import async_session_maker


class CorpRepositories(AbstractRepositories):
    async def find_all(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        async with async_session_maker() as session:
            result = await session.execute(
                select(CorpModel).limit(limit).offset(offset)
            )
            return [row[0].to_read_model().model_dump() for row in result.all()]

    async def find_all_for_user(self, user_id: int, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        async with async_session_maker() as session:
            member_subq = select(corp_members.c.corp_id).where(corp_members.c.user_id == user_id)
            stmt = (
                select(CorpModel)
                .where(
                    (CorpModel.owner_id == user_id) | (CorpModel.id.in_(member_subq))
                )
                .limit(limit)
                .offset(offset)
            )
            result = await session.execute(stmt)
            return [row[0].to_read_model().model_dump() for row in result.all()]

    async def find_current(self, corp_id: int) -> Dict[str, Any] | None:
        async with async_session_maker() as session:
            result = await session.execute(
                select(CorpModel).where(CorpModel.id == corp_id)
            )
            row = result.first()
            return row[0].to_read_model().model_dump() if row else None

    async def add_one(self, data: Dict[str, Any]) -> int:
        async with async_session_maker() as session:
            corp = CorpModel(name=data["name"], owner_id=data["owner_id"])
            session.add(corp)
            await session.flush()
            await session.execute(
                insert(corp_members).values(corp_id=corp.id, user_id=data["owner_id"])
            )
            await session.commit()
            return corp.id

    async def update_one(self, corp_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        async with async_session_maker() as session:
            await session.execute(
                update(CorpModel)
                .where(CorpModel.id == corp_id)
                .values(**data)
            )
            await session.commit()
        return await self.find_current(corp_id)

    async def delete_one(self, corp_id: int) -> Dict[str, str]:
        async with async_session_maker() as session:
            await session.execute(
                delete(corp_members).where(corp_members.c.corp_id == corp_id)
            )
            await session.execute(
                delete(CorpModel).where(CorpModel.id == corp_id)
            )
            await session.commit()
            return {"message": "Corp deleted"}

    async def add_member(self, corp_id: int, user_id: int) -> None:
        async with async_session_maker() as session:
            result = await session.execute(
                select(corp_members).where(
                    corp_members.c.corp_id == corp_id,
                    corp_members.c.user_id == user_id,
                )
            )
            if result.first():
                return
            await session.execute(
                insert(corp_members).values(corp_id=corp_id, user_id=user_id)
            )
            await session.commit()

    async def remove_member(self, corp_id: int, user_id: int) -> None:
        async with async_session_maker() as session:
            await session.execute(
                delete(corp_members).where(
                    corp_members.c.corp_id == corp_id,
                    corp_members.c.user_id == user_id,
                )
            )
            await session.commit()

    async def find_by_email(self, email: str):
        raise NotImplementedError("Corp model does not support email lookup")

    async def get_members(self, corp_id: int) -> List[int]:
        async with async_session_maker() as session:
            result = await session.execute(
                select(corp_members.c.user_id).where(corp_members.c.corp_id == corp_id)
            )
            return [row[0] for row in result.all()]
