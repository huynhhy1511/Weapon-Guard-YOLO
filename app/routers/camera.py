# app/routers/camera.py
import asyncio
import json
import cv2
from threading import Thread

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from app.models.detection import Detection
from app.db import get_db
from app.models.camera import Camera
from app.schemas.camera import CameraCreate, CameraUpdate, CameraInDB
# Import biến camera_streams và hàm process_camera để điều khiển luồng
from app.services.video_processor import camera_streams, process_camera

router = APIRouter()


@router.post("/", response_model=CameraInDB)
def add_camera(camera: CameraCreate, db: Session = Depends(get_db)):
    if not camera.rtsp_url or camera.rtsp_url.strip() == "":
        raise HTTPException(400, "Đường dẫn RTSP không được để trống")

    new_camera = Camera(**camera.model_dump())
    db.add(new_camera)
    db.commit()
    db.refresh(new_camera)

    print(f"🚀 Starting thread for new camera: {new_camera.id}")
    t = Thread(target=process_camera, args=(new_camera.id, new_camera.rtsp_url))
    t.daemon = True
    t.start()

    return new_camera


@router.get("/", response_model=list[CameraInDB])
def get_cameras(db: Session = Depends(get_db)):
    return db.query(Camera).all()


@router.put("/{id}", response_model=CameraInDB)
def update_camera(id: int, camera: CameraUpdate, db: Session = Depends(get_db)):
    db_camera = db.query(Camera).filter(Camera.id == id).first()
    if not db_camera:
        raise HTTPException(404, "Camera not found")

    # 1. Cập nhật thông tin vào Database
    update_data = camera.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_camera, key, value)
    db.commit()
    db.refresh(db_camera)

    # 2. KHỞI ĐỘNG LẠI STREAM (Fix lỗi Edit không ăn video mới)
    print(f"🔄 Restarting stream for Cam {id}...")

    # Xóa Queue cũ để ngắt kết nối thread cũ (Thread cũ sẽ tự hủy khi check cap.isOpened hoặc loop lỗi)
    if id in camera_streams:
        del camera_streams[id]

        # Khởi động thread mới với thông tin mới
    t = Thread(target=process_camera, args=(db_camera.id, db_camera.rtsp_url))
    t.daemon = True
    t.start()

    return db_camera


@router.delete("/{id}")
def delete_camera(id: int, db: Session = Depends(get_db)):
    db_camera = db.query(Camera).filter(Camera.id == id).first()
    if not db_camera:
        raise HTTPException(404, "Camera not found")

    # 1. Dừng luồng Video trước (Quan trọng: để nó không cố ghi thêm dữ liệu vào lúc đang xóa)
    if id in camera_streams:
        del camera_streams[id]
        print(f"🗑️ Stopped stream for camera {id}")

    try:
        # 2. XÓA SẠCH LỊCH SỬ DETECTION CỦA CAMERA NÀY (Fix lỗi không xóa được)
        # Lệnh này sẽ xóa tất cả detection có camera_id = id
        db.query(Detection).filter(Detection.camera_id == id).delete()

        # 3. Sau đó mới xóa Camera
        db.delete(db_camera)

        # Commit một lần cho tất cả hành động
        db.commit()

        print(f"✅ Deleted camera {id} and its history.")
        return {"msg": "Deleted successfully"}

    except Exception as e:
        db.rollback()  # Hoàn tác nếu có lỗi
        print(f"❌ Error deleting camera: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test")
def test_camera(data: dict, db: Session = Depends(get_db)):
    rtsp_url = data["rtsp_url"]
    if str(rtsp_url).isdigit():
        rtsp_url = int(rtsp_url)

    cap = cv2.VideoCapture(rtsp_url)
    if not cap.isOpened():
        return {"status": "offline", "fps": 0, "ping": "N/A"}
    fps = cap.get(cv2.CAP_PROP_FPS)
    cap.release()
    return {"status": "online", "fps": fps, "ping": "OK"}


# --- WEBSOCKET ENDPOINT ---
@router.websocket("/stream/{camera_id}")
async def websocket_endpoint(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    # print(f"🔌 Client connected Cam {camera_id}") # Comment bớt cho đỡ spam log

    try:
        retries = 0
        target_queue = None

        while True:
            # Tìm Queue (Ưu tiên Int, dự phòng String)
            if camera_id in camera_streams:
                target_queue = camera_streams[camera_id]
                break
            if str(camera_id) in camera_streams:
                target_queue = camera_streams[str(camera_id)]
                break

            if retries > 50:  # 5 giây timeout
                await websocket.close()
                return

            await asyncio.sleep(0.1)
            retries += 1

        # Gửi dữ liệu
        while True:
            if not target_queue.empty():
                data = target_queue.get()
                await websocket.send_text(json.dumps(data))
            else:
                await asyncio.sleep(0.01)

    except WebSocketDisconnect:
        pass  # Client tự ngắt, không cần log lỗi
    except Exception as e:
        print(f"🔥 WS Error: {e}")
        try:
            await websocket.close()
        except:
            pass