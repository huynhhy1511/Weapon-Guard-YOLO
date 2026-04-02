from sqlalchemy import Column, Integer, String, Enum, DateTime
from app.db import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(Enum('admin', 'staff', name="user_role"))
    email = Column(String(100))
    created_at = Column(DateTime, default=datetime.now)