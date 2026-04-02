from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json

from app.services.video_processor import camera_streams

router = APIRouter()

@router.websocket("/{camera_id}")
async def websocket_endpoint(websocket: WebSocket, camera_id: int):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            action = json.loads(data).get("action")
            if action == "start":
                while True:
                    if camera_id in camera_streams:
                        frame_data = camera_streams[camera_id].get()
                        await websocket.send_json(frame_data)
    except WebSocketDisconnect:
        pass