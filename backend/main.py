import asyncio
import os
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import cv2
import mediapipe as mp
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

# Set RTSP_URL env var to your camera stream, e.g. "rtsp://user:pass@192.168.1.10/stream"
# Defaults to "0" which opens the first local webcam.
RTSP_URL = os.getenv("RTSP_URL", "0")
COOLDOWN_SEC = 2.0  # seconds between consecutive alert events

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

latest_frame: bytes | None = None
subscribers: set[WebSocket] = set()
last_alert_time = 0.0


def check_x_pose(landmarks) -> bool:
    lm = landmarks.landmark
    lw = lm[mp_pose.PoseLandmark.LEFT_WRIST]
    rw = lm[mp_pose.PoseLandmark.RIGHT_WRIST]
    ls = lm[mp_pose.PoseLandmark.LEFT_SHOULDER]
    rs = lm[mp_pose.PoseLandmark.RIGHT_SHOULDER]

    if min(lw.visibility, rw.visibility, ls.visibility, rs.visibility) < 0.5:
        return False

    # For a front-facing person in image space:
    #   normal (uncrossed): person's left wrist appears on the RIGHT side of the image (higher x)
    #   X pose (crossed):   person's left wrist crosses to LEFT side of image (lower x)
    # So arms_crossed == True when left_wrist.x < right_wrist.x
    arms_crossed = lw.x < rw.x

    # Both wrists must be raised above their respective shoulders
    # (lower y value = higher position in image)
    wrists_raised = lw.y < ls.y and rw.y < rs.y

    return arms_crossed and wrists_raised


async def process_stream() -> None:
    global latest_frame, last_alert_time

    loop = asyncio.get_event_loop()
    src: int | str = int(RTSP_URL) if RTSP_URL.isdigit() else RTSP_URL
    cap = cv2.VideoCapture(src)

    with mp_pose.Pose(
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
        model_complexity=0,  # fastest model variant
    ) as pose:
        while True:
            ret, frame = await loop.run_in_executor(None, cap.read)

            if not ret:
                await asyncio.sleep(0.5)
                cap.release()
                cap = cv2.VideoCapture(src)
                continue

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb.flags.writeable = False
            results = pose.process(rgb)
            rgb.flags.writeable = True

            detected = False
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    frame,
                    results.pose_landmarks,
                    mp_pose.POSE_CONNECTIONS,
                    mp_drawing.DrawingSpec(color=(0, 255, 128), thickness=2, circle_radius=3),
                    mp_drawing.DrawingSpec(color=(0, 180, 255), thickness=2),
                )
                detected = check_x_pose(results.pose_landmarks)

            now = time.time()
            if detected and (now - last_alert_time) > COOLDOWN_SEC:
                last_alert_time = now
                dead: set[WebSocket] = set()
                for ws in subscribers:
                    try:
                        await ws.send_json({"type": "x_pose"})
                    except Exception:
                        dead.add(ws)
                subscribers.difference_update(dead)

            if detected:
                cv2.putText(
                    frame, "X POSE!", (10, 50),
                    cv2.FONT_HERSHEY_SIMPLEX, 1.8, (0, 255, 0), 3,
                )

            _, jpeg = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 75])
            latest_frame = jpeg.tobytes()

            await asyncio.sleep(0)  # yield to event loop between frames

    cap.release()


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(process_stream())
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)


async def frame_generator() -> AsyncGenerator[bytes, None]:
    while True:
        if latest_frame:
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + latest_frame + b"\r\n"
        await asyncio.sleep(0.033)  # ~30 fps cap


@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(
        frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    subscribers.add(websocket)
    try:
        while True:
            await websocket.receive_text()  # keep-alive; client can send anything
    except WebSocketDisconnect:
        subscribers.discard(websocket)
