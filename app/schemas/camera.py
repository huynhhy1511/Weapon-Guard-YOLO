from pydantic import BaseModel
from enum import Enum
from datetime import datetime

class CameraStatus(str, Enum):
    online = "online"
    offline = "offline"

class CameraBase(BaseModel):
    name: str
    rtsp_url: str
    group_id: int | None = None
    is_active: bool = True

class CameraCreate(CameraBase):
    pass

class CameraUpdate(BaseModel):
    name: str | None = None
    rtsp_url: str | None = None
    group_id: int | None = None
    is_active: bool | None = None
    last_ping: datetime | None = None
    fps: float | None = None
    status: CameraStatus | None = None

class CameraInDB(CameraBase):
    id: int
    last_ping: datetime | None = None
    fps: float | None = None
    status: CameraStatus = CameraStatus.offline

    class Config:
        from_attributes = True