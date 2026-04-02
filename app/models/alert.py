from sqlalchemy import Column, Integer, Boolean, Enum, DateTime, ForeignKey, func
from app.db import Base

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    detection_id = Column(Integer, ForeignKey("detections.id"), nullable=False)
    notified = Column(Boolean, default=False)
    notification_type = Column(Enum('email', 'telegram', 'zalo', 'sms', name="notification_type"))
    timestamp = Column(DateTime, default=func.now())