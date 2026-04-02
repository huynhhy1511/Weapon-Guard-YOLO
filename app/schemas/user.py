from pydantic import BaseModel, EmailStr
from enum import Enum
from datetime import datetime

class UserRole(str, Enum):
    admin = "admin"
    staff = "staff"

class UserBase(BaseModel):
    username: str
    email: EmailStr | None = None
    role: UserRole = UserRole.staff

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: EmailStr | None = None
    role: UserRole | None = None

class UserInDB(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True