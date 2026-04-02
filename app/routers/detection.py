from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.detection import Detection
from app.services.ai_inference import detect_weapons  # Function from ai_inference.py

router = APIRouter()

@router.post("/detect")
def detect(image_base64: dict):
    # Decode base64 to image
    import base64
    import numpy as np
    from io import BytesIO
    from PIL import Image
    img_data = base64.b64decode(image_base64["image"])
    img = np.array(Image.open(BytesIO(img_data)))
    results = detect_weapons(img)
    return {"detections": results}

@router.get("/history")
def get_history(start_time: str = None, end_time: str = None, camera_id: int = None, weapon_type: str = None, db: Session = Depends(get_db)):
    query = db.query(Detection)
    if start_time:
        query = query.filter(Detection.timestamp >= start_time)
    if end_time:
        query = query.filter(Detection.timestamp <= end_time)
    if camera_id:
        query = query.filter(Detection.camera_id == camera_id)
    if weapon_type:
        query = query.filter(Detection.weapon_type == weapon_type)
    return query.all()