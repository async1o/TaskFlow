from typing import List, Dict, Any

from fastapi import HTTPException

from schemas.invitation import InviteSendSchema
from repositories.invitation import InvitationRepositories


class InvitationServices:
    def __init__(self):
        self.repo = InvitationRepositories()

    async def send_invite(self, corp_id: int, sender_id: int, data: InviteSendSchema) -> int:
        recipient = await self.repo.find_user_by_username(data.username)
        if recipient is None:
            raise HTTPException(status_code=404, detail=f"User '{data.username}' not found")

        recipient_id = recipient["user_id"]

        if recipient_id == sender_id:
            raise HTTPException(status_code=400, detail="Cannot invite yourself")

        already_member = await self.repo.is_member(corp_id, recipient_id)
        if already_member:
            raise HTTPException(status_code=400, detail="User is already a member")

        existing = await self.repo.find_pending_for_corp_recipient(corp_id, recipient_id)
        if existing:
            raise HTTPException(status_code=400, detail="Invitation already sent to this user")

        inv_id = await self.repo.create_invitation(corp_id, sender_id, recipient_id)
        return inv_id

    async def get_pending_invites(self, user_id: int) -> List[Dict[str, Any]]:
        return await self.repo.find_pending_for_recipient(user_id)

    async def get_pending_for_corp(self, corp_id: int) -> List[Dict[str, Any]]:
        return await self.repo.find_pending_for_corp(corp_id)

    async def accept_invite(self, invitation_id: int, user_id: int) -> None:
        inv = await self.repo.find_by_id(invitation_id)
        if inv is None:
            raise HTTPException(status_code=404, detail="Invitation not found")
        if inv["recipient_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your invitation")
        if inv["status"] != "pending":
            raise HTTPException(status_code=400, detail="Invitation is not pending")

        await self.repo.update_status(invitation_id, "accepted")
        await self.repo.add_member(inv["corp_id"], user_id)

    async def reject_invite(self, invitation_id: int, user_id: int) -> None:
        inv = await self.repo.find_by_id(invitation_id)
        if inv is None:
            raise HTTPException(status_code=404, detail="Invitation not found")
        if inv["recipient_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not your invitation")
        if inv["status"] != "pending":
            raise HTTPException(status_code=400, detail="Invitation is not pending")

        await self.repo.update_status(invitation_id, "rejected")
