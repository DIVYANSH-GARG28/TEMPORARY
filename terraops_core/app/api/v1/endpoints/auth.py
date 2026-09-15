from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.core.security import verify_password, create_access_token
from app.core.dependencies import limiter, Request

router = APIRouter()

# Dummy database for testing
db_users = {
    "tehsildar": {
        "username": "tehsildar",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", # "password"
        "roles": ["cadastre:read", "cadastre:simulate", "cadastre:commit"]
    },
    "surveyor": {
        "username": "surveyor",
        "hashed_password": "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", # "password"
        "roles": ["field:submit_gnss", "cadastre:read"]
    }
}

@router.post("/login")
@limiter.limit("5/minute")
def login_for_access_token(request: Request, form_data: OAuth2PasswordRequestForm = Depends()):
    user = db_users.get(form_data.username)
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        subject=user["username"], 
        roles=user["roles"]
    )
    return {"access_token": access_token, "token_type": "bearer"}
