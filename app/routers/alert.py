from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Detection
from app.models.alert import Alert
from app.schemas.alert import AlertInDB
from app.services.notification import send_alert

router = APIRouter()

@router.get("/", response_model=list[AlertInDB])
def get_alerts(date: str = None, camera_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if date:
        query = query.filter(Alert.timestamp.like(f"{date}%"))
    if camera_id:
        # Join with detection to filter by camera
        query = query.join(Detection).filter(Detection.camera_id == camera_id)
    return query.all()

@router.post("/test")
def test_alert_notification():
    """
    API này dùng để test gửi cảnh báo giả
    """
    try:
        # Gửi cảnh báo giả (Detection ID 999, Súng Test, Cam 0)
        send_alert(999, "TEST_GUN", 0)
        return {"message": "Đã gửi yêu cầu cảnh báo (Check Terminal/Mail/Tele)"}
    except Exception as e:
        return {"error": str(e)}