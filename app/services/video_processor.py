# app/services/video_processor.py
import cv2
import time
import base64
import os
import threading
import numpy as np
from queue import Queue, Full, Empty
from threading import Thread
from app.db import SessionLocal
from app.models.camera import Camera
from app.models.detection import Detection
from app.services.ai_inference import detect_weapons
from app.services.notification import send_alert

camera_streams = {}

# --- CẤU HÌNH TỐI ƯU CHO NHIỀU CAMERA ---
# 1. Giảm độ phân giải xuống SD để nhẹ gánh cho GPU
SEND_WIDTH = 640
JPEG_QUALITY = 70

# 2. Tăng AI Interval: Soi 1 frame, bỏ qua 2 frame (AI nghỉ ngơi)
# ByteTrack sẽ tự nối điểm nên tracking vẫn mượt.
AI_INTERVAL = 3

# --- CẤU HÌNH CHỐNG SPAM ---
alerted_tracks_registry = {}
camera_last_alert_time = {}
ALERT_COOLDOWN_SECONDS = 15.0


class VideoStream:
    """
    Luồng đọc Camera Fast-Mode:
    - Luôn chạy Realtime bất kể là Webcam hay Video File.
    - Nếu xử lý không kịp -> Vứt frame cũ (Drop Frame) để giữ nhịp thời gian thực.
    """

    def __init__(self, src):
        self.is_webcam = False
        
        # Kiểm tra xem có phải webcam (nguồn số không)
        raw_src = str(src).strip()
        if raw_src.isdigit():
            self.is_webcam = True
            cam_idx = int(raw_src)
            self.stream = cv2.VideoCapture(cam_idx, cv2.CAP_DSHOW)
            if not self.stream.isOpened():
                print(f"⚠️ Không thể mở Webcam với DSHOW, đang thử backend mặc định...")
                self.stream = cv2.VideoCapture(cam_idx)
        else:
            # Nếu là đường dẫn RTSP hoặc File Video Local
            print(f"📂 Đang mở luồng Video: {raw_src}")
            self.stream = cv2.VideoCapture(raw_src)

        # Queue maxsize=1: Chỉ giữ đúng 1 frame mới nhất.
        # Nếu đầy thì vứt cái cũ đi ngay lập tức.
        self.Q = Queue(maxsize=1)

        self.stopped = False

    def start(self):
        t = Thread(target=self.update, args=(), daemon=True)
        t.start()
        return self

    def update(self):
        while not self.stopped:
            if not self.stream.isOpened():
                print("Luồng Video chưa mở hoặc đã bị đóng!")
                time.sleep(1.0)
                # Thử khởi tạo lại
                if not self.is_webcam:
                    try:
                        # Lưu ý: Cần lưu lại raw_src lúc init để mở lại
                        pass
                    except: pass
                continue

            ret, frame = self.stream.read()

            if not ret:
                # Nếu là Video File hết phim -> Tua lại từ đầu
                if not self.is_webcam:
                    self.stream.set(cv2.CAP_PROP_POS_FRAMES, 0)
                    continue
                else:
                    self.stop()
                    break

            # --- LOGIC FAST MODE (CHO CẢ WEBCAM VÀ VIDEO) ---
            # Luôn tìm cách nhét frame mới nhất vào.
            # Nếu Queue đầy (do AI xử lý chậm), vứt frame đang chờ đi để nhét cái mới này vào.
            if self.Q.full():
                try:
                    self.Q.get_nowait()  # Vứt rác
                except Empty:
                    pass

            self.Q.put(frame)  # Nhét cái mới vào

            # Giới hạn tốc độ đọc cho video file để không bị tua nhanh như đèn kéo quân
            if not self.is_webcam:
                time.sleep(0.03)  # Giả lập khoảng 30 FPS (1/30 = 0.033)

    def read(self):
        try:
            # Lấy frame ngay lập tức, không chờ đợi
            return True, self.Q.get_nowait()
        except Empty:
            return False, None

    def stop(self):
        self.stopped = True
        self.stream.release()


def process_camera(camera_id: int, rtsp_url: str):
    if not rtsp_url or str(rtsp_url).strip() == "":
        print(f"🛑 [Cam {camera_id}] Bỏ qua vì nguồn cấp Video rỗng hoặc không hợp lệ.")
        return

    camera_id = int(camera_id)
    video_source = str(rtsp_url).strip() # Giữ nguyên chuỗi để class VideoStream phân tích
    
    # Init Anti-Spam
    if camera_id not in alerted_tracks_registry:
        alerted_tracks_registry[camera_id] = set()
    if camera_id not in camera_last_alert_time:
        camera_last_alert_time[camera_id] = 0.0

    print(f"🚀 [Cam {camera_id}] FAST-TRACKING Mode: {video_source}")

    vs = VideoStream(video_source).start()
    time.sleep(1.0)

    # Queue gửi ra Frontend (Maxsize nhỏ để không bị trễ hình)
    queue = Queue(maxsize=2)
    camera_streams[camera_id] = queue

    last_detections = []
    frame_count = 0

    while True:
        if camera_id not in camera_streams:
            print(f"🛑 [Cam {camera_id}] Dừng xử lý.")
            break
        if vs.stopped: break

        # 1. Lấy frame từ luồng đọc
        ret, frame = vs.read()

        # Nếu không có frame (do đọc nhanh quá hoặc lỗi), bỏ qua vòng này
        if not ret or frame is None:
            time.sleep(0.01)
            continue

        # 2. Resize về 640px cho nhẹ
        h, w = frame.shape[:2]
        if w != SEND_WIDTH:
            scale = SEND_WIDTH / w
            new_h = int(h * scale)
            frame = cv2.resize(frame, (SEND_WIDTH, new_h), interpolation=cv2.INTER_LINEAR)

        frame_count += 1

        # --- AI PROCESSING ---
        # Chỉ chạy AI mỗi 3 frame (AI_INTERVAL = 3)
        if frame_count % AI_INTERVAL == 0:
            detections = detect_weapons(frame)
            last_detections = detections

            current_time = time.time()
            time_since_last = current_time - camera_last_alert_time[camera_id]
            is_in_cooldown = time_since_last < ALERT_COOLDOWN_SECONDS

            for det in detections:
                track_id = det['track_id']
                w_type = det['class']
                should_alert = False

                if track_id is not None:
                    if track_id not in alerted_tracks_registry[camera_id]:
                        if not is_in_cooldown:
                            should_alert = True
                            alerted_tracks_registry[camera_id].add(track_id)
                else:
                    if not is_in_cooldown:
                        should_alert = True

                if should_alert:
                    print(f"🔥 [Cam {camera_id}] Cảnh báo! ID: {track_id}")
                    trigger_alert(camera_id, w_type, frame)
                    camera_last_alert_time[camera_id] = current_time
                    break

                    # 3. Vẽ hình
        if last_detections:
            for det in last_detections:
                x1, y1, x2, y2 = map(int, det["box"])
                tid = det['track_id'] if det['track_id'] is not None else "?"
                conf = det['conf']

                color = (0, 0, 255)
                if conf > 0.8: color = (0, 0, 255)

                label = f"{det['class']} {tid} ({conf:.2f})"

                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                t_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)[0]
                cv2.rectangle(frame, (x1, y1 - 25), (x1 + t_size[0] + 10, y1), color, -1)
                cv2.putText(frame, label, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # 4. Gửi ra Frontend
        if not queue.full():
            _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), JPEG_QUALITY])
            base64_frame = base64.b64encode(buffer).decode('utf-8')

            data_packet = {
                "frame": base64_frame,
                "detections": last_detections,
                "status": "online"
            }
            queue.put(data_packet)

        time.sleep(0.001)

    vs.stop()
    if camera_id in camera_streams: del camera_streams[camera_id]
    if camera_id in alerted_tracks_registry: del alerted_tracks_registry[camera_id]
    if camera_id in camera_last_alert_time: del camera_last_alert_time[camera_id]


# --- CÁC HÀM PHỤ TRỢ GIỮ NGUYÊN ---
def start_camera_threads():
    try:
        with SessionLocal() as db:
            cameras = db.query(Camera).all()
            for cam in cameras:
                if cam.id not in camera_streams:
                    Thread(target=process_camera, args=(cam.id, cam.rtsp_url), daemon=True).start()
    except Exception as e:
        print(f"Error starting threads: {e}")


def trigger_alert(camera_id, weapon_type, frame):
    def save_task():
        db = None
        try:
            db = SessionLocal()
            normalized_weapon = weapon_type.lower()
            if normalized_weapon == 'pistol': normalized_weapon = 'gun'

            detection = Detection(camera_id=camera_id, weapon_type=normalized_weapon, confidence=0.95)
            db.add(detection)
            db.commit()
            db.refresh(detection)

            save_snapshot(frame, detection.id, db)
            try:
                send_alert(detection.id, normalized_weapon, camera_id)
            except:
                pass
        except Exception as e:
            print(f"Error alert: {e}")
        finally:
            if db: db.close()

    Thread(target=save_task).start()


def save_snapshot(frame, detection_id, db):
    try:
        directory = "app/static/snapshots"
        if not os.path.exists(directory): os.makedirs(directory)
        filename = f"{detection_id}.jpg"
        cv2.imwrite(os.path.join(directory, filename), frame)
        det = db.query(Detection).filter(Detection.id == detection_id).first()
        if det:
            det.image_path = f"static/snapshots/{filename}"
            db.commit()
    except Exception as e:
        print(f"Error snapshot: {e}")