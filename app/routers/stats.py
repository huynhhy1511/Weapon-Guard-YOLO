# app/routers/stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import get_db
from app.models.detection import Detection
from app.models.camera import Camera
from datetime import datetime, timedelta

router = APIRouter(prefix="/stats", tags=["Statistics"])

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Số lượng Camera
    total_cameras = db.query(Camera).count()

    # 2. Tổng số cảnh báo hôm nay
    today = datetime.now().date()
    # Lọc từ 00:00 hôm nay
    alerts_today = db.query(Detection).filter(
        func.date(Detection.timestamp) == today
    ).count()

    # 3. Dữ liệu biểu đồ đường (Line Chart): Số lượng phát hiện theo giờ (24h qua)
    # Logic: Group by Hour
    last_24h = datetime.now() - timedelta(hours=24)
    detections_by_hour = db.query(
        func.to_char(Detection.timestamp, 'HH24:00').label('hour'),
        func.count(Detection.id)
    ).filter(Detection.timestamp >= last_24h)\
     .group_by('hour')\
     .order_by('hour').all()

    # Chuyển đổi dữ liệu cho Frontend dễ dùng
    chart_labels = [row[0] for row in detections_by_hour]
    chart_values = [row[1] for row in detections_by_hour]

    # 4. Dữ liệu biểu đồ tròn (Pie Chart): Tỷ lệ các loại vũ khí
    weapon_stats = db.query(
        Detection.weapon_type,
        func.count(Detection.id)
    ).group_by(Detection.weapon_type).all()

    weapon_labels = [row[0] for row in weapon_stats]
    weapon_values = [row[1] for row in weapon_stats]

    # 5. Lấy 5 cảnh báo gần nhất
    recent_alerts = db.query(Detection).order_by(Detection.timestamp.desc()).limit(5).all()

    return {
        "summary": {
            "total_cameras": total_cameras,
            "alerts_today": alerts_today,
            "system_status": "Online"
        },
        "hourly_trend": {
            "labels": chart_labels,
            "data": chart_values
        },
        "weapon_distribution": {
            "labels": weapon_labels,
            "data": weapon_values
        },
        "recent_alerts": recent_alerts
    }