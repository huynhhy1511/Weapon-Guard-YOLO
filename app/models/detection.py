from sqlalchemy import Integer, Enum, Float, DateTime, String, ForeignKey
from app.db import Base
from sqlalchemy import Column, DateTime, func

class Detection(Base):
    __tablename__ = "detections"
    id = Column(Integer, primary_key=True, index=True)
    camera_id = Column(Integer, ForeignKey("cameras.id"), nullable=False)
    weapon_type = Column(Enum('knife', 'gun', name="weapon_type"), nullable=False)
    confidence = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=func.now())
    image_path = Column(String(255))
    video_path = Column(String(255))