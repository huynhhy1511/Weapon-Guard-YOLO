
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from app.db import get_db

from app.models.user import User
from app.schemas.user import UserCreate, UserInDB

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

router = APIRouter()
class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: timedelta):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not pwd_context.verify(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.username, "role": user.role}, expires_delta=access_token_expires)
    return {"access_token": access_token, "token_type": "bearer"}

# @router.post("/register", response_model=UserInDB)
# def register(user: UserCreate, db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)):
#     # Check admin role from token
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         if payload.get("role") != "admin":
#             raise HTTPException(403, "Admin only")
#     except jwt.PyJWTError:
#         raise HTTPException(401, "Invalid token")
#     hashed_password = pwd_context.hash(user.password)
#     new_user = User(username=user.username, password_hash=hashed_password, role=user.role, email=user.email)
#     db.add(new_user)
#     db.commit()
#     db.refresh(new_user)
#     return new_user
@router.post("/register", response_model=UserInDB)
# 1. Xóa đoạn "token: str = Depends(oauth2_scheme)" trong ngoặc này đi
def register(user: UserCreate, db: Session = Depends(get_db)):
    # 2. Comment (vô hiệu hóa) toàn bộ đoạn kiểm tra quyền admin này lại
    # try:
    #     payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    #     if payload.get("role") != "admin":
    #         raise HTTPException(403, "Admin only")
    # except jwt.PyJWTError:
    #     raise HTTPException(401, "Invalid token")

    # --- Logic tạo user giữ nguyên ---
    hashed_password = pwd_context.hash(user.password)
    new_user = User(username=user.username, password_hash=hashed_password, role=user.role, email=user.email)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user