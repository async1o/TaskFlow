from typing import List, Dict, Any

from sqlalchemy import select, insert, update, desc

from db.db import async_session_maker
from models.notification import NotificationModel


class NotificationRepositories:

    async def create(self, user_id: int, type: str, message: str, related_id: int | None = None) -> int:
        async with async_session_maker() as session:
            stmt = insert(NotificationModel).values(
                user_id=user_id,
                type=type,
                message=message,
                related_id=related_id,
                read=False,
            ).returning(NotificationModel.id)
            result = await session.execute(stmt)
            notif_id = result.scalar_one()
            await session.commit()
            return notif_id

    async def find_for_user(self, user_id: int) -> List[Dict[str, Any]]:
        async with async_session_maker() as session:
            stmt = (
                select(NotificationModel)
                .where(NotificationModel.user_id == user_id)
                .order_by(desc(NotificationModel.created_at))
                .limit(50)
            )
            result = await session.execute(stmt)
            rows = result.scalars().all()
            return [
                {
                    "notification_id": n.id,
                    "user_id": n.user_id,
                    "type": n.type,
                    "message": n.message,
                    "related_id": n.related_id,
                    "read": n.read,
                    "created_at": n.created_at,
                }
                for n in rows
            ]

    async def mark_read(self, notification_id: int, user_id: int) -> None:
        async with async_session_maker() as session:
            stmt = (
                update(NotificationModel)
                .where(
                    NotificationModel.id == notification_id,
                    NotificationModel.user_id == user_id,
                )
                .values(read=True)
            )
            await session.execute(stmt)
            await session.commit()
