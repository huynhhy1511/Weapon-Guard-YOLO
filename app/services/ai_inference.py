# app/services/ai_inference.py
import os
from ultralytics import YOLO
import torch
import numpy as np # <--- 1. Thêm dòng này

# Cấu hình GPU
device = 'cuda:0' if torch.cuda.is_available() else 'cpu'
print(f"🚀 AI Inference running on: {device.upper()}")

# Cấu hình Model
model_path = "app/models_ai/last_fixed.pt"
if not os.path.exists(model_path):
    model_path = "app/models_ai/last_fixed.onnx"
    if not os.path.exists(model_path):
        model_path = "yolov8n.pt"

print(f"✅ Loading Model: {model_path}")
model = YOLO(model_path)

# 👇 2. THÊM ĐOẠN WARMUP NÀY (QUAN TRỌNG NHẤT) 👇
# Mục đích: Chạy thử 1 lần để model khởi tạo hết các lớp backend
# trước khi các luồng Camera tranh nhau dùng.
print("🔥 Warming up AI Model... (Tránh xung đột đa luồng)")
try:
    # Tạo một ảnh đen giả lập kích thước 640x640
    dummy_frame = np.zeros((640, 640, 3), dtype=np.uint8)
    # Chạy thử chế độ track
    model.track(dummy_frame, device=device, verbose=False, persist=True, tracker="botsort.yaml")
    print("✅ Model Warmup Complete! Ready for Multi-threading.")
except Exception as e:
    print(f"⚠️ Warmup Warning: {e}")
# 👆 HẾT ĐOẠN WARMUP 👆

# Ngưỡng lọc
THRESHOLDS = {
    'knife': 0.3,
    'pistol': 0.8,
    'gun': 0.8
}


def get_tracker_config():
    # Lấy đường dẫn tới file custom_tracker.yaml vừa tạo
    base_dir = os.path.dirname(os.path.abspath(__file__))  # Thư mục app/services
    # Nhảy ra ngoài 1 cấp (về app) rồi vào trackers
    config_path = os.path.join(base_dir, "..", "trackers", "custom_tracker.yaml")

    # Nếu không tìm thấy file custom thì dùng mặc định của hệ thống
    if os.path.exists(config_path):
        return config_path


def detect_weapons(frame):
    tracker_config = get_tracker_config()
    # Code bên dưới giữ nguyên y hệt cũ
    results = model.track(
        frame,
        device=device,
        verbose=False,
        conf=0.15,  # <--- GIẢM XUỐNG 0.15 (Siêu nhạy)
        iou=0.5,  # <--- THÊM DÒNG NÀY (Giúp nhận diện tốt hơn khi 2 vật thể gần nhau)
        half=True,
        persist=True,
        tracker=tracker_config
    )

    detections = []
    for result in results:
        boxes = result.boxes
        for box in boxes:
            conf = box.conf[0].item()
            cls = int(box.cls[0].item())
            class_name = model.names[cls]

            track_id = int(box.id[0].item()) if box.id is not None else None

            required_conf = THRESHOLDS.get(class_name, 0.5)
            if conf < required_conf:
                continue

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            detections.append({
                "box": [x1, y1, x2, y2],
                "conf": conf,
                "class": class_name,
                "track_id": track_id
            })

    return detections
