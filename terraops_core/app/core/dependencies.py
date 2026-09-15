from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from app.core.security import SECRET_KEY, ALGORITHM
from typing import List

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class SecurityException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_401_UNAUTHORIZED):
        super().__init__(status_code=status_code, detail=detail, headers={"WWW-Authenticate": "Bearer"})

def get_current_user_token(token: str = Depends(oauth2_scheme)) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") is None:
            raise SecurityException(detail="Could not validate credentials")
        return payload
    except JWTError:
        raise SecurityException(detail="Could not validate credentials")

def require_role(allowed_roles: List[str]):
    def role_checker(token_payload: dict = Depends(get_current_user_token)):
        user_roles = token_payload.get("roles", [])
        # Check if user has at least one of the allowed roles
        if not any(role in user_roles for role in allowed_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation forbidden. Requires one of roles: {allowed_roles}"
            )
        return token_payload
    return role_checker
