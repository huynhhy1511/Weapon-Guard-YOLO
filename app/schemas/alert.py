from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class NotificationType(str, Enum):
    email = "email"
    telegram = "telegram"
    zalo = "zalo"
    sms = "sms"

class AlertBase(BaseModel):
    detection_id: int
    notified: bool = False
    notification_type: NotificationType | None = None

class AlertCreate(AlertBase):
    timestamp: datetime | None = None

class AlertInDB(AlertBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True