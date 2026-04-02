# check_video.py
import cv2
import os

# --- THAY ĐƯỜNG DẪN CỦA BẠN VÀO DƯỚI ĐÂY ---
# Lưu ý: Dùng dấu gạch chéo / (không dùng \)
video_path = "D:/NCKH/FastAPI/videos/muadao.mp4"

print(f"📂 Đang kiểm tra file: {video_path}")

if not os.path.exists(video_path):
    print("❌ LỖI: File không tồn tại! Kiểm tra lại đường dẫn.")
else:
    print("✅ File có tồn tại.")

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("❌ LỖI: OpenCV không mở được file này (Lỗi Codec hoặc xung đột).")
    else:
        ret, frame = cap.read()
        if ret:
            print(f"✅ THÀNH CÔNG: Đọc được video! Kích thước: {frame.shape}")
            print("👉 Backend của bạn ổn, lỗi có thể do chưa restart server.")
        else:
            print("❌ LỖI: Mở được file nhưng không đọc được hình (File bị lỗi hoặc chưa hỗ trợ).")

    cap.release()