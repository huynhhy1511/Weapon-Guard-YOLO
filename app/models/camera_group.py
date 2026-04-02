from sqlalchemy import Column, Integer, String, Text
from app.db import Base

class CameraGroup(Base):
    __tablename__ = "camera_groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)