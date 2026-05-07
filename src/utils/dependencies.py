from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from utils.jwt_handler import TokenData, decode_token
from repositories.users import UserRepositories
from services.users import UserServices

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> TokenData:
    token = credentials.credentials
    try:
        token_data = decode_token(token)
        if token_data.user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
        return token_data
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        ) from exc


async def get_current_user_full(
    token_data: TokenData = Depends(get_current_user),
) -> TokenData:
    user = await UserServices(UserRepositories).get_current_user(token_data.user_id)
    return user