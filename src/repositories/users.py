from sqlalchemy import select

from utils.repositories import SQLAlchemyRepositories
from models.users import UsersModel
from db.db import async_session_maker
from utils.exceptions import EntityNotFoundError


class UserRepositories(SQLAlchemyRepositories):
    model = UsersModel

    async def update_one(self, entity_id: int, data: dict):
        async with async_session_maker() as session:
            stmt = select(self.model).where(self.model.id == entity_id)
            model = await session.execute(stmt)
            model = model.scalar_one_or_none()
            if model is None:
                raise EntityNotFoundError(self.model.__name__, entity_id)
            for key, value in data.items():
                setattr(model, key, value)
            await session.commit()
            await session.refresh(model)
            return model.to_read_model()