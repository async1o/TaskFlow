from typing import List, Optional, Dict, Any

from sqlalchemy import select, insert, update

from db.db import async_session_maker
from models.invitation import InvitationModel
from models.corp import CorpModel
from models.users import UsersModel


class InvitationRepositories:

    async def find_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        async with async_session_maker() as session:
            stmt = select(UsersModel).where(UsersModel.username == username)
            result = await session.execute(stmt)
            user = result.scalar_one_or_none()
            if user is None:
                return None
            return {"user_id": user.id, "username": user.username, "email": user.email}

    async def create_invitation(self, corp_id: int, sender_id: int, recipient_id: int) -> int:
        async with async_session_maker() as session:
            stmt = insert(InvitationModel).values(
                corp_id=corp_id,
                sender_id=sender_id,
                recipient_id=recipient_id,
                status="pending",
            ).returning(InvitationModel.id)
            result = await session.execute(stmt)
            inv_id = result.scalar_one()
            await session.commit()
            return inv_id

    async def find_pending_for_recipient(self, recipient_id: int) -> List[Dict[str, Any]]:
        async with async_session_maker() as session:
            stmt = (
                select(InvitationModel, UsersModel.username, CorpModel.name)
                .join(UsersModel, InvitationModel.recipient_id == UsersModel.id)
                .join(CorpModel, InvitationModel.corp_id == CorpModel.id)
                .where(
                    InvitationModel.recipient_id == recipient_id,
                    InvitationModel.status == "pending",
                )
            )
            result = await session.execute(stmt)
            rows = result.all()
            return [
                {
                    "invitation_id": row.InvitationModel.id,
                    "corp_id": row.InvitationModel.corp_id,
                    "sender_id": row.InvitationModel.sender_id,
                    "recipient_id": row.InvitationModel.recipient_id,
                    "recipient_username": row.username,
                    "corp_name": row.name,
                    "status": row.InvitationModel.status,
                    "created_at": row.InvitationModel.created_at,
                }
                for row in rows
            ]

    async def find_by_id(self, invitation_id: int) -> Optional[Dict[str, Any]]:
        async with async_session_maker() as session:
            stmt = (
                select(InvitationModel, UsersModel.username, CorpModel.name)
                .join(UsersModel, InvitationModel.recipient_id == UsersModel.id)
                .join(CorpModel, InvitationModel.corp_id == CorpModel.id)
                .where(InvitationModel.id == invitation_id)
            )
            result = await session.execute(stmt)
            row = result.first()
            if row is None:
                return None
            return {
                "invitation_id": row.InvitationModel.id,
                "corp_id": row.InvitationModel.corp_id,
                "sender_id": row.InvitationModel.sender_id,
                "recipient_id": row.InvitationModel.recipient_id,
                "recipient_username": row.username,
                "corp_name": row.name,
                "status": row.InvitationModel.status,
                "created_at": row.InvitationModel.created_at,
            }

    async def find_pending_for_corp_recipient(self, corp_id: int, recipient_id: int) -> Optional[Dict[str, Any]]:
        async with async_session_maker() as session:
            stmt = select(InvitationModel).where(
                InvitationModel.corp_id == corp_id,
                InvitationModel.recipient_id == recipient_id,
                InvitationModel.status == "pending",
            )
            result = await session.execute(stmt)
            inv = result.scalar_one_or_none()
            if inv is None:
                return None
            return {
                "invitation_id": inv.id,
                "corp_id": inv.corp_id,
                "sender_id": inv.sender_id,
                "recipient_id": inv.recipient_id,
                "status": inv.status,
            }

    async def is_member(self, corp_id: int, user_id: int) -> bool:
        from models.corp import corp_members
        async with async_session_maker() as session:
            stmt = select(corp_members.c.user_id).where(
                corp_members.c.corp_id == corp_id,
                corp_members.c.user_id == user_id,
            )
            result = await session.execute(stmt)
            return result.first() is not None

    async def update_status(self, invitation_id: int, status: str) -> None:
        async with async_session_maker() as session:
            stmt = (
                update(InvitationModel)
                .where(InvitationModel.id == invitation_id)
                .values(status=status)
            )
            await session.execute(stmt)
            await session.commit()

    async def add_member(self, corp_id: int, user_id: int) -> None:
        from models.corp import corp_members
        async with async_session_maker() as session:
            stmt = select(corp_members).where(
                corp_members.c.corp_id == corp_id,
                corp_members.c.user_id == user_id,
            )
            result = await session.execute(stmt)
            if result.first():
                return
            await session.execute(
                insert(corp_members).values(corp_id=corp_id, user_id=user_id)
            )
            await session.commit()

    async def find_pending_for_corp(self, corp_id: int) -> List[Dict[str, Any]]:
        async with async_session_maker() as session:
            stmt = (
                select(InvitationModel, UsersModel.username, CorpModel.name)
                .join(UsersModel, InvitationModel.recipient_id == UsersModel.id)
                .join(CorpModel, InvitationModel.corp_id == CorpModel.id)
                .where(
                    InvitationModel.corp_id == corp_id,
                    InvitationModel.status == "pending",
                )
            )
            result = await session.execute(stmt)
            rows = result.all()
            return [
                {
                    "invitation_id": row.InvitationModel.id,
                    "corp_id": row.InvitationModel.corp_id,
                    "sender_id": row.InvitationModel.sender_id,
                    "recipient_id": row.InvitationModel.recipient_id,
                    "recipient_username": row.username,
                    "corp_name": row.name,
                    "status": row.InvitationModel.status,
                    "created_at": row.InvitationModel.created_at,
                }
                for row in rows
            ]
