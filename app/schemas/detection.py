from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class WeaponType(str, Enum):
    knife = "knife"
    gun = "gun"

class DetectionBase(BaseModel):
    camera_id: int
    weapon_type: WeaponType
    confidence: float
    image_path: str | None = None
    video_path: str | None = None

class DetectionCreate(DetectionBase):
    timestamp: datetime | None = None

class DetectionInDB(DetectionBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True