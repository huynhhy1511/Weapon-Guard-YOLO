from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Enum, ForeignKey
from app.db import Base

class Camera(Base):
    __tablename__ = "cameras"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    rtsp_url = Column(String(255), nullable=False)
    group_id = Column(Integer, ForeignKey("camera_groups.id"))
    is_active = Column(Boolean, default=True)
    last_ping = Column(DateTime)
    fps = Column(Float)
    status = Column(Enum('online', 'offline', name="camera_status"), default='offline')