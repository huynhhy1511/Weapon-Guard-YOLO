# app/services/notification.py
import smtplib
import requests
import os
from threading import Thread
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.image import MIMEImage

# --- CẤU HÌNH ---
GMAIL_USER = "huynhhuy15112k5@gmail.com"
GMAIL_APP_PASSWORD = "tevt agcb erin veuq"

TELEGRAM_TOKEN = "8286785237:AAF70SBX5JLhRepiXAly_eF0vZpT_MJcvEU"
TELEGRAM_CHAT_ID = "8104320743"

# Đường dẫn thư mục lưu ảnh (Phải khớp với cấu hình trong video_processor.py)
SNAPSHOT_DIR = "app/static/snapshots"


def send_email_thread(subject, body, image_path=None):
    try:
        # 1. Tạo container tin nhắn (MIMEMultipart)
        msg = MIMEMultipart()
        msg['Subject'] = subject
        msg['From'] = GMAIL_USER
        msg['To'] = GMAIL_USER

        # 2. Đính kèm nội dung chữ
        msg.attach(MIMEText(body, 'plain'))

        # 3. Đính kèm ảnh (Nếu có và tồn tại)
        if image_path and os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                img_data = f.read()
                # Tạo object ảnh
                image = MIMEImage(img_data, name=os.path.basename(image_path))
                msg.attach(image)
        else:
            print(f"⚠️ Email: Không tìm thấy ảnh tại {image_path}")

        # 4. Gửi mail
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_USER, GMAIL_USER, msg.as_string())
        server.quit()
        print("✅ Email (kèm ảnh) sent successfully!")
    except Exception as e:
        print(f"❌ Failed to send Email: {e}")


def send_telegram_thread(message, image_path=None):
    try:
        # Nếu có ảnh và file tồn tại -> Dùng endpoint sendPhoto
        if image_path and os.path.exists(image_path):
            url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendPhoto"

            with open(image_path, 'rb') as photo_file:
                # 'caption' là dòng chữ đi kèm ảnh
                payload = {'chat_id': TELEGRAM_CHAT_ID, 'caption': message}
                files = {'photo': photo_file}

                resp = requests.post(url, data=payload, files=files)

            if resp.status_code == 200:
                print("✅ Telegram Photo sent successfully!")
            else:
                print(f"⚠️ Telegram Error: {resp.text}")

        # Nếu không có ảnh -> Gửi tin nhắn thường như cũ
        else:
            url = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage"
            payload = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
            requests.post(url, json=payload)
            print("✅ Telegram Text sent (No image found)!")

    except Exception as e:
        print(f"❌ Failed to send Telegram: {e}")


# Hàm chính được gọi từ video_processor
def send_alert(detection_id, weapon_type, camera_id):
    # 1. Soạn nội dung tin nhắn
    time_now = datetime.now().strftime("%H:%M:%S %d/%m/%Y")

    # Tạo đường dẫn tới file ảnh vừa chụp
    # File ảnh được lưu dạng: app/static/snapshots/{id}.jpg
    image_path = os.path.join(SNAPSHOT_DIR, f"{detection_id}.jpg")

    # Nội dung ngắn cho Telegram
    tele_msg = (
        f"🚨 CẢNH BÁO VŨ KHÍ!\n"
        f"📷 Camera: {camera_id}\n"
        f"🔪 Loại: {weapon_type.upper()}\n"
        f"⏰ Lúc: {time_now}"
    )

    # Nội dung dài cho Email
    email_body = (
        f"Hệ thống phát hiện hành vi nguy hiểm.\n\n"
        f"THÔNG TIN CHI TIẾT:\n"
        f"- Camera ID: {camera_id}\n"
        f"- Loại vũ khí: {weapon_type}\n"
        f"- Detection ID: {detection_id}\n"
        f"- Thời gian: {time_now}\n\n"
        f"Ảnh hiện trường được đính kèm bên dưới."
    )

    # 2. Chạy 2 luồng gửi song song kèm đường dẫn ảnh
    print(f"🚀 Sending notifications with IMAGE for Detection #{detection_id}...")

    # Truyền thêm image_path vào thread
    Thread(target=send_email_thread, args=("⚠️ CẢNH BÁO AN NINH [CÓ ẢNH]", email_body, image_path)).start()
    Thread(target=send_telegram_thread, args=(tele_msg, image_path)).start()