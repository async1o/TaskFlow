from typing import List, Dict, Any

from fastapi import APIRouter, Depends

from services.notification import NotificationServices
from utils.dependencies import get_current_user
from utils.jwt_handler import TokenData

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("", response_model=List[Dict[str, Any]])
async def get_notifications(
    current_user: TokenData = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    return await NotificationServices().get_notifications(current_user.user_id)


@router.post("/{notification_id}/read", response_model=dict)
async def mark_read(
    notification_id: int,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    await NotificationServices().mark_read(notification_id, current_user.user_id)
    return {"message": "Marked as read"}
