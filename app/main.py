# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles # Thêm cái này
from app.db import engine, Base
from app.routers import auth, camera, detection, stream, alert, stats
from app.services.video_processor import start_camera_threads

import uvicorn
import os

# Tạo folder static nếu chưa có
if not os.path.exists("app/static"):
    os.makedirs("app/static")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Khởi động Camera threads khi server bật
    print("🚀 Server starting... Launching camera threads...")
    start_camera_threads()
    yield
    # Dọn dẹp nếu cần thiết khi tắt server
    print("🛑 Server shutting down...")

app = FastAPI(title="WDSS API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount folder static để xem ảnh cảnh báo
app.mount("/static", StaticFiles(directory="app/static"), name="static")

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(camera.router, prefix="/cameras", tags=["cameras"])
app.include_router(detection.router, prefix="/detections", tags=["detections"]) # Bật nếu có file này
app.include_router(alert.router, prefix="/alerts", tags=["alerts"]) # Bật nếu có file này
app.include_router(stats.router)
# @app.on_event("startup")
# async def startup_event():
#     print("🚀 Server starting... Launching camera threads...")
#     start_camera_threads()

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
