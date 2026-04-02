import os
from ultralytics import YOLO

# 1. Lấy đường dẫn tuyệt đối của thư mục chứa file fix.py này
# (Tức là lấy đường dẫn D:\NCKH\FastAPI\app)
base_dir = os.path.dirname(os.path.abspath(__file__))

# 2. Tạo đường dẫn chính xác tới file model
# Nó sẽ ghép thành: D:\NCKH\FastAPI\app\models_ai\last.pt
model_path = os.path.join(base_dir, "models_ai", "last.pt")
save_path = os.path.join(base_dir, "models_ai", "last_fixed.pt")

print(f"🔍 Đang tìm model tại: {model_path}")

# Kiểm tra xem file có thật sự tồn tại không
if not os.path.exists(model_path):
    print("❌ LỖI: Không tìm thấy file model!")
    print(f"👉 Hãy kiểm tra xem file 'last.pt' có nằm trong thư mục '{os.path.join(base_dir, 'models_ai')}' không?")
else:
    try:
        print("🔄 Đang load model cũ (YOLO11)...")
        model = YOLO(model_path)

        print("💾 Đang cập nhật cấu trúc file...")
        model.save(save_path)

        print("✅ THÀNH CÔNG! Đã tạo file mới: last_fixed.pt")
        print("👉 Hãy vào file code chính sửa đường dẫn thành 'last_fixed.pt' để chạy.")

    except Exception as e:
        print(f"❌ Vẫn bị lỗi khi load: {e}")