# app/models/__init__.py
from app.db import Base
from .user import User
from .camera import Camera
from .camera_group import CameraGroup
from .detection import Detection
from .alert import Alert
from .system_settings import SystemSettings

# File này giúp gom tất cả models lại để Alembic hoặc main.py dễ dàng nhận diện