from abc import ABC, abstractmethod
from sqlalchemy import select, insert, delete, update, desc

from db.db import async_session_maker
from utils.exceptions import EntityNotFoundError


class AbstractRepositories(ABC):
    @abstractmethod
    async def find_all(self, limit: int = 100, offset: int = 0):
        raise NotImplementedError

    @abstractmethod
    async def find_current(self, entity_id: int):
        raise NotImplementedError

    @abstractmethod
    async def add_one(self, data: dict):
        raise NotImplementedError

    @abstractmethod
    async def update_one(self, entity_id: int, data: dict):
        raise NotImplementedError

    @abstractmethod
    async def delete_one(self, entity_id: int):
        raise NotImplementedError

    @abstractmethod
    async def find_by_email(self, email: str):
        raise NotImplementedError


class SQLAlchemyRepositories(AbstractRepositories):
    model = None

    async def find_all(self, limit: int = 100, offset: int = 0):
        async with async_session_maker() as session:
            stmt = select(self.model).order_by(desc(self.model.updated_at), desc(self.model.created_at)).limit(limit).offset(offset)
            models = await session.execute(stmt)
            models = [row[0].to_read_model() for row in models.all()]
            return models

    async def find_current(self, entity_id: int):
        async with async_session_maker() as session:
            stmt = select(self.model).where(self.model.id == entity_id)
            model = await session.execute(stmt)
            model = model.scalar_one_or_none()
            if model is None:
                raise EntityNotFoundError(self.model.__name__, entity_id)
            model = model.to_read_model()
            return model

    async def add_one(self, data: dict):
        async with async_session_maker() as session:
            stmt = insert(self.model).values(**data).returning(self.model.id)
            entity_id = await session.execute(stmt)
            entity_id = entity_id.scalar_one()
            await session.commit()
            return entity_id

    async def update_one(self, entity_id: int, data: dict):
        async with async_session_maker() as session:
            stmt = (
                update(self.model)
                .where(self.model.id == entity_id)
                .values(**data)
                .returning(self.model.id)
            )
            result = await session.execute(stmt)
            entity_id_db = result.scalar_one_or_none()
            if entity_id_db is None:
                raise EntityNotFoundError(self.model.__name__, entity_id)
            await session.commit()
            stmt = select(self.model)
            if hasattr(self.model, "owner"):
                from sqlalchemy.orm import selectinload
                stmt = stmt.options(selectinload(self.model.owner))
            stmt = stmt.where(self.model.id == entity_id)
            model = await session.execute(stmt)
            model = model.scalar_one_or_none()
            model = model.to_read_model()
            return model

    async def delete_one(self, entity_id: int):
        async with async_session_maker() as session:
            stmt = delete(self.model).where(self.model.id == entity_id)
            result = await session.execute(stmt)
            if result.rowcount == 0:
                raise EntityNotFoundError(self.model.__name__, entity_id)
            await session.commit()

    async def find_by_email(self, email: str):
        if not hasattr(self.model, "email"):
            raise NotImplementedError("This model does not support email lookup")
        async with async_session_maker() as session:
            stmt = select(self.model).where(self.model.email == email)
            model = await session.execute(stmt)
            return model.scalar_one_or_none()
