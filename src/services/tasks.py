from typing import Dict, List, Optional

from utils.repositories import AbstractRepositories
from schemas.tasks import TasksSchema, TasksAddSchema


class TasksServices:
    def __init__(self, tasks_repo: type(AbstractRepositories)):  # type: ignore
        self.tasks_repo: AbstractRepositories = tasks_repo()

    async def get_all_tasks(self, limit: int = 100, offset: int = 0, status_filter: str | None = None, user_id: int | None = None) -> List[TasksSchema]:
        res = await self.tasks_repo.find_all(limit=limit, offset=offset, status_filter=status_filter, user_id=user_id)
        return res

    async def get_current_task(self, task_id) -> TasksSchema:
        res = await self.tasks_repo.find_current(task_id)
        return res

    async def add_task(self, creator_id: int, data: TasksAddSchema, creator_username: Optional[str] = None) -> int:
        data_dict = data.model_dump()
        data_dict["owner_id"] = creator_id
        data_dict["creator_id"] = creator_id
        data_dict["status"] = "active"
        res = await self.tasks_repo.add_one(data_dict)
        if data.assignee_id and creator_username:
            from services.notification import NotificationServices
            await NotificationServices().create_task_assigned_notification(
                data.assignee_id, res, data.label, creator_username,
            )
        return res

    async def update_task(self, task_id: int, data: TasksAddSchema, updater_username: Optional[str] = None) -> TasksSchema:
        old = await self.tasks_repo.find_current(task_id)
        data_dict = data.model_dump()
        res = await self.tasks_repo.update_one(task_id, data_dict)
        new_assignee = data.assignee_id
        if new_assignee and new_assignee != (old.assignee_id if old else None) and updater_username:
            from services.notification import NotificationServices
            await NotificationServices().create_task_assigned_notification(
                new_assignee, task_id, data.label, updater_username,
            )
        return res

    async def complete_task(self, task_id: int, status: str) -> TasksSchema:
        res = await self.tasks_repo.complete_task(task_id, status)
        return res

    async def delete_task(self, task_id: int) -> Dict:
        await self.tasks_repo.delete_one(task_id)
        return {"message": "Task deleted"}