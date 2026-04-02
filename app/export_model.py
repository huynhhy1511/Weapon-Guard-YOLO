import os
from ultralytics import YOLO

def export_to_onnx():
    # Model đường dẫn
    model_path = "d:/NCKH/FastAPI/app/models_ai/last_fixed.pt"
    
    if not os.path.exists(model_path):
        print(f"Không tìm thấy model tại {model_path}!")
        return
    
    print(f"Đang tải mô hình từ: {model_path}...")
    # Khởi tạo mô hình
    model = YOLO(model_path)
    
    print("Bắt đầu chuyển đổi (Export) sang ONNX FP16 (Half-Precision)...")
    # Export model ra định dạng ONNX thư viện onnx tự động sinh trong cùng thư mục
    # Chỉnh params: half=True, opset=12 (chuẩn ổn định nhất)
    exported_path = model.export(format="onnx", half=True, dynamic=False, opset=12)
    print(f"Thành công! Trọng số ONNX FP16 đã được lưu tại: {exported_path}")

if __name__ == "__main__":
    export_to_onnx()
