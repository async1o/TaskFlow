from typing import List, Dict, Any

from repositories.notification import NotificationRepositories
from repositories.invitation import InvitationRepositories


class NotificationServices:
    def __init__(self):
        self.notif_repo = NotificationRepositories()
        self.invite_repo = InvitationRepositories()

    async def get_notifications(self, user_id: int) -> List[Dict[str, Any]]:
        notifs = await self.notif_repo.find_for_user(user_id)
        invites = await self.invite_repo.find_pending_for_recipient(user_id)
        combined = []
        for n in notifs:
            combined.append({
                "id": f"n_{n['notification_id']}",
                "type": n["type"],
                "message": n["message"],
                "related_id": n["related_id"],
                "read": n["read"],
                "created_at": n["created_at"],
                "notification_id": n["notification_id"],
            })
        for i in invites:
            combined.append({
                "id": f"i_{i['invitation_id']}",
                "type": "invitation",
                "message": f"You've been invited to join '{i['corp_name']}'",
                "related_id": i["corp_id"],
                "read": False,
                "created_at": i["created_at"],
                "invitation_id": i["invitation_id"],
            })
        combined.sort(key=lambda x: x["created_at"], reverse=True)
        return combined

    async def create_task_assigned_notification(self, user_id: int, task_id: int, task_label: str, assigned_by_username: str) -> None:
        message = f"{assigned_by_username} assigned you to task '{task_label}'"
        await self.notif_repo.create(user_id, "task_assigned", message, task_id)

    async def mark_read(self, notification_id: int, user_id: int) -> None:
        await self.notif_repo.mark_read(notification_id, user_id)
