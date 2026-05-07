from utils.repositories import SQLAlchemyRepositories
from models.tasks import TasksModel
from sqlalchemy import select, update
from sqlalchemy.orm import joinedload, selectinload
from db.db import async_session_maker


class TasksRepositories(SQLAlchemyRepositories):
    model = TasksModel

    async def find_all(self, limit: int = 100, offset: int = 0, status_filter: str | None = None):
        async with async_session_maker() as session:
            stmt = (
                select(self.model)
                .options(
                    joinedload(self.model.owner),
                    joinedload(self.model.creator)
                )
                .order_by(self.model.updated_at.desc(), self.model.created_at.desc())
            )

            if status_filter:
                stmt = stmt.where(self.model.status == status_filter)

            stmt = stmt.limit(limit).offset(offset)
            models = await session.execute(stmt)
            models = [row[0].to_read_model() for row in models.unique().all()]
            return models

    async def find_current(self, entity_id: int):
        async with async_session_maker() as session:
            stmt = (
                select(self.model)
                .options(
                    joinedload(self.model.owner),
                    joinedload(self.model.creator)
                )
                .where(self.model.id == entity_id)
            )
            model = await session.execute(stmt)
            model = model.scalar_one_or_none()
            if model is None:
                from utils.exceptions import EntityNotFoundError
                raise EntityNotFoundError(self.model.__name__, entity_id)
            model = model.to_read_model()
            return model

    async def complete_task(self, entity_id: int, status: str):
        async with async_session_maker() as session:
            stmt = (
                update(self.model)
                .where(self.model.id == entity_id)
                .values(status=status)
                .returning(self.model.id)
            )
            result = await session.execute(stmt)
            entity_id_db = result.scalar_one_or_none()
            if entity_id_db is None:
                from utils.exceptions import EntityNotFoundError
                raise EntityNotFoundError(self.model.__name__, entity_id)
            await session.commit()
            stmt = (
                select(self.model)
                .options(
                    joinedload(self.model.owner),
                    joinedload(self.model.creator)
                )
                .where(self.model.id == entity_id)
            )
            model = await session.execute(stmt)
            model = model.scalar_one_or_none()
            model = model.to_read_model()
            return model