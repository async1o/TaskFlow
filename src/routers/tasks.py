from typing import List

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.exc import IntegrityError

from schemas.tasks import TasksSchema, TasksAddSchema, TasksCompleteSchema
from services.tasks import TasksServices
from repositories.tasks import TasksRepositories
from utils.exceptions import EntityNotFoundError
from utils.dependencies import get_current_user
from utils.jwt_handler import TokenData

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[TasksSchema])
async def get_all_tasks(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    status_filter: str | None = Query(default=None, alias="status"),
    _current_user: TokenData = Depends(get_current_user),
) -> List[TasksSchema]:
    res = await TasksServices(TasksRepositories).get_all_tasks(limit=limit, offset=offset, status_filter=status_filter)
    return res


@router.get("/{task_id}", response_model=TasksSchema)
async def get_current_task(
    task_id: int,
    _current_user: TokenData = Depends(get_current_user),
):
    res = await TasksServices(TasksRepositories).get_current_task(task_id)
    return res


@router.post("", response_model=int)
async def add_task(
    data: TasksAddSchema,
    current_user: TokenData = Depends(get_current_user),
) -> int:
    try:
        task_id = await TasksServices(TasksRepositories).add_task(current_user.user_id, data)
        return task_id
    except IntegrityError as exc:
        raise HTTPException(status_code=400, detail="Invalid task payload") from exc


@router.put("", response_model=TasksSchema)
async def update_task(
    task_id: int,
    data: TasksAddSchema,
    current_user: TokenData = Depends(get_current_user),
) -> TasksSchema:
    try:
        task = await TasksServices(TasksRepositories).get_current_task(task_id)
        if task.owner_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to modify this task")
        model = await TasksServices(TasksRepositories).update_task(task_id, data)
        return model
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch("/{task_id}/complete", response_model=TasksSchema)
async def complete_task(
    task_id: int,
    data: TasksCompleteSchema,
    current_user: TokenData = Depends(get_current_user),
) -> TasksSchema:
    try:
        task = await TasksServices(TasksRepositories).get_current_task(task_id)
        if task.owner_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="Only task owner can complete this task")
        model = await TasksServices(TasksRepositories).complete_task(task_id, data.status)
        return model
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("", response_model=dict)
async def delete_task(
    task_id: int,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    try:
        task = await TasksServices(TasksRepositories).get_current_task(task_id)
        if task.owner_id != current_user.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this task")
        res = await TasksServices(TasksRepositories).delete_task(task_id)
        return res
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc