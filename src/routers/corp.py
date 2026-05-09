from typing import List, Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.exc import IntegrityError

from schemas.corp import CorpSchema, CorpAddSchema, CorpUpdateSchema, CorpAddMemberSchema
from services.corp import CorpServices
from repositories.corp import CorpRepositories
from utils.exceptions import EntityNotFoundError
from utils.dependencies import get_current_user
from utils.jwt_handler import TokenData

router = APIRouter(prefix="/corps", tags=["corporations"])


@router.get("", response_model=List[CorpSchema])
async def get_all_corps(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    current_user: TokenData = Depends(get_current_user),
) -> List[Dict[str, Any]]:
    res = await CorpServices(CorpRepositories).get_my_corps(current_user.user_id, limit=limit, offset=offset)
    return res


@router.get("/{corp_id}", response_model=CorpSchema)
async def get_corp(
    corp_id: int,
    _current_user: TokenData = Depends(get_current_user),
) -> Dict[str, Any]:
    res = await CorpServices(CorpRepositories).get_current_corp(corp_id)
    if not res:
        raise HTTPException(status_code=404, detail="Corp not found")
    return res


@router.post("", response_model=int)
async def add_corp(
    data: CorpAddSchema,
    current_user: TokenData = Depends(get_current_user),
) -> int:
    try:
        corp_id = await CorpServices(CorpRepositories).add_corp(current_user.user_id, data)
        return corp_id
    except IntegrityError as exc:
        msg = str(exc.orig)
        if "violates foreign key constraint" in msg:
            raise HTTPException(status_code=400, detail="User account not found — please log out and log in again") from exc
        raise HTTPException(status_code=400, detail="Corp name already exists") from exc


@router.put("/{corp_id}", response_model=CorpSchema)
async def update_corp(
    corp_id: int,
    data: CorpUpdateSchema,
    current_user: TokenData = Depends(get_current_user),
) -> Dict[str, Any]:
    try:
        res = await CorpServices(CorpRepositories).update_corp(corp_id, data, current_user.user_id)
        return res
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/{corp_id}", response_model=dict)
async def delete_corp(
    corp_id: int,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    try:
        res = await CorpServices(CorpRepositories).delete_corp(corp_id, current_user.user_id)
        return res
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/{corp_id}/members", response_model=List[int])
async def get_members(
    corp_id: int,
    _current_user: TokenData = Depends(get_current_user),
) -> List[int]:
    return await CorpServices(CorpRepositories).get_members(corp_id)


@router.post("/{corp_id}/members", response_model=dict)
async def add_member(
    corp_id: int,
    data: CorpAddMemberSchema,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    try:
        await CorpServices(CorpRepositories).add_member(corp_id, data.user_id, current_user.user_id)
        return {"message": "Member added"}
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/{corp_id}/members/{user_id}", response_model=dict)
async def remove_member(
    corp_id: int,
    user_id: int,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    try:
        await CorpServices(CorpRepositories).remove_member(corp_id, user_id, current_user.user_id)
        return {"message": "Member removed"}
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
