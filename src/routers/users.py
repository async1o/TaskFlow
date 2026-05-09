from typing import List

from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.exc import IntegrityError

from fastapi import UploadFile, File

from schemas.users import UserAddSchema, UserUpdateSchema, UserSchema, UserLoginSchema, TokenSchema
from services.users import UserServices
from repositories.users import UserRepositories
from utils.exceptions import EntityNotFoundError
from utils.dependencies import get_current_user
from utils.jwt_handler import TokenData
from utils.file_handler import save_avatar

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserSchema)
async def get_me(
    current_user: TokenData = Depends(get_current_user),
):
    res = await UserServices(UserRepositories).get_current_user(current_user.user_id)
    return res


@router.get("/{user_id}", response_model=UserSchema)
async def get_current_user_endpoint(
    user_id: int,
    _current_user: TokenData = Depends(get_current_user),
):
    res = await UserServices(UserRepositories).get_current_user(user_id)
    return res


@router.get("", response_model=List[UserSchema])
async def get_all_users(
    limit: int = Query(default=100, le=1000),
    offset: int = Query(default=0, ge=0),
    _current_user: TokenData = Depends(get_current_user),
) -> List[UserSchema]:
    res = await UserServices(UserRepositories).get_all_users(limit=limit, offset=offset)
    return res


@router.post("", response_model=int)
async def add_user(data: UserAddSchema) -> int:
    try:
        user_id = await UserServices(UserRepositories).add_user(data)
        return user_id
    except IntegrityError as exc:
        raise HTTPException(status_code=400, detail="User with this email already exists") from exc


@router.post("/login", response_model=TokenSchema)
async def login(data: UserLoginSchema) -> TokenSchema:
    try:
        token = await UserServices(UserRepositories).authenticate_user(data)
        return token
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc


@router.post("/avatar", response_model=UserSchema)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: TokenData = Depends(get_current_user),
) -> UserSchema:
    avatar_url = await save_avatar(file)
    res = await UserServices(UserRepositories).upload_avatar(current_user.user_id, avatar_url)
    return res


@router.put("", response_model=UserSchema)
async def update_user(
    user_id: int,
    data: UserUpdateSchema,
    current_user: TokenData = Depends(get_current_user),
) -> UserSchema:
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to modify this user")
    try:
        model = await UserServices(UserRepositories).update_user(user_id, data)
        return model
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("", response_model=dict)
async def delete_user(
    user_id: int,
    current_user: TokenData = Depends(get_current_user),
) -> dict:
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this user")
    try:
        res = await UserServices(UserRepositories).delete_user(user_id)
        return res
    except EntityNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc