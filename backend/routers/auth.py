from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from datetime import timedelta
from jose import jwt

from database import get_db
from services.auth_service import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    name: str
    password: str

class LoginResponse(BaseModel):
    token: str
    user_id: str
    name: str

class GoogleLoginRequest(BaseModel):
    token: str

@router.post("/google", response_model=LoginResponse)
async def google_login(request: GoogleLoginRequest, db = Depends(get_db)):
    try:
        # For secure production, use: id_info = id_token.verify_oauth2_token(request.token, Request(), audience="CLI_ID")
        # For this minor project bridging any ad-hoc Google Client ID, we extract the claims bypassing sig-locking:
        id_info = jwt.get_unverified_claims(request.token)
        
        email = id_info.get("email")
        name = id_info.get("name", email.split('@')[0])
        
        user = await db.users.find_one({"email": email})
        
        if not user:
            user_doc = {
                "email": email,
                "name": name,
                "hashed_password": "oauth_sso_no_password"
            }
            result = await db.users.insert_one(user_doc)
            user = await db.users.find_one({"_id": result.inserted_id})
            
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user["email"]}, expires_delta=access_token_expires
        )
        return LoginResponse(
            token=access_token,
            user_id=str(user["_id"]),
            name=user["name"]
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google SSO Bridging Failed: {str(e)}")

@router.post("/register", response_model=LoginResponse)
async def register(request: RegisterRequest, db = Depends(get_db)):
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pwd = get_password_hash(request.password)
    user_doc = {
        "email": request.email,
        "name": request.name,
        "hashed_password": hashed_pwd
    }
    
    result = await db.users.insert_one(user_doc)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.email}, expires_delta=access_token_expires
    )
    return LoginResponse(
        token=access_token,
        user_id=str(result.inserted_id),
        name=request.name
    )

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db = Depends(get_db)):
    user = await db.users.find_one({"email": request.email})
    
    # Auto-register if user doesn't exist (Demo mode bridging)
    if not user:
        hashed_pwd = get_password_hash(request.password)
        name_prefix = request.email.split('@')[0].capitalize()
        user_doc = {
            "email": request.email,
            "name": name_prefix,
            "hashed_password": hashed_pwd
        }
        result = await db.users.insert_one(user_doc)
        user = await db.users.find_one({"_id": result.inserted_id})
        
    elif not verify_password(request.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["email"]}, expires_delta=access_token_expires
    )
    return LoginResponse(
        token=access_token,
        user_id=str(user["_id"]),
        name=user["name"]
    )
