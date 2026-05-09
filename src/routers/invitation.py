from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends

from schemas.invitation import InviteSendSchema
from services.invitation import InvitationServices
from services.corp import CorpServices
from repositories.corp import CorpRepositories
from utils.dependencies import get_current_user
from utils.jwt_handler import TokenData

router = APIRouter(tags=["invitations"])


@router.post("/corps/{corp_id}/invite", response_model=dict)
async def send_invite(
    corp_id: int,
    data: InviteSendSchema,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    corp = await CorpServices(CorpRepositories).get_current_corp(corp_id)
    if corp["owner_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Only corp owner can send invitations")
    inv_id = await InvitationServices().send_invite(corp_id, current_user.user_id, data)
    return {"invitation_id": inv_id, "message": f"Invitation sent to '{data.username}'"}


@router.get("/invitations/pending", response_model=List[Dict[str, Any]])
async def get_pending_invites(
    current_user: TokenData = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await InvitationServices().get_pending_invites(current_user.user_id)


@router.get("/corps/{corp_id}/invitations/pending", response_model=List[Dict[str, Any]])
async def get_pending_corp_invites(
    corp_id: int,
    current_user: TokenData = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    corp = await CorpServices(CorpRepositories).get_current_corp(corp_id)
    if corp["owner_id"] != current_user.user_id:
        raise HTTPException(status_code=403, detail="Only corp owner can view invitations")
    return await InvitationServices().get_pending_for_corp(corp_id)


@router.post("/invitations/{invitation_id}/accept", response_model=dict)
async def accept_invite(
    invitation_id: int,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    await InvitationServices().accept_invite(invitation_id, current_user.user_id)
    return {"message": "Invitation accepted"}


@router.post("/invitations/{invitation_id}/reject", response_model=dict)
async def reject_invite(
    invitation_id: int,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    await InvitationServices().reject_invite(invitation_id, current_user.user_id)
    return {"message": "Invitation rejected"}
