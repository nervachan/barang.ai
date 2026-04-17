import asyncio
import os
import time
import urllib.request
from contextlib import asynccontextmanager
from dataclasses import dataclass
from typing import AsyncGenerator

import cv2
import mediapipe as mp
import numpy as np
from mediapipe.tasks import python as mp_tasks
from mediapipe.tasks.python import vision as mp_vision
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

RTSP_URL = os.getenv("RTSP_URL", "0")
COOLDOWN_SEC = 2.0

MODEL_PATH = os.path.join(os.path.dirname(__file__), "pose_landmarker_lite.task")
MODEL_URL = (
    "https://storage.googleapis.com/mediapipe-models/"
    "pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task"
)

LEFT_WRIST    = 15
RIGHT_WRIST   = 16
LEFT_SHOULDER = 11
RIGHT_SHOULDER= 12
LEFT_HIP      = 23
RIGHT_HIP     = 24

latest_frame: bytes | None = None
subscribers: set[WebSocket] = set()
last_alert_time = 0.0

# Pose detection stability
consecutive_x_pose_frames = 0
REQUIRED_CONSECUTIVE_FRAMES = 3  # Require 3 frames to reduce false positives
X_POSE_MARGIN = 0.05  # Hysteresis margin for crossing detection


# ── Smoothing ──────────────────────────────────────────────────────────────────

@dataclass
class Landmark:
    x: float
    y: float
    z: float
    visibility: float


class LandmarkSmoother:
    """
    Adaptive exponential moving average for landmark smoothing.
    Uses higher alpha for large movements (responsive) and lower for small movements (stable).
    """
    BASE_ALPHA = 0.5
    VELOCITY_THRESHOLD = 0.02  # Movement threshold (normalized coords)

    def __init__(self) -> None:
        self._prev: list[list[float]] | None = None
        self._prev_velocity: list[list[float]] | None = None

    def update(self, raw: list) -> list[Landmark]:
        values = [[lm.x, lm.y, lm.z, lm.visibility] for lm in raw]
        
        if self._prev is None:
            self._prev = [v[:] for v in values]
            self._prev_velocity = [[0.0, 0.0, 0.0, 0.0] for _ in values]
            return [Landmark(*p) for p in self._prev]
        
        for i, v in enumerate(values):
            for j in range(4):
                raw_val = v[j]
                prev_val = self._prev[i][j]
                velocity = abs(raw_val - prev_val)
                
                # Responsive to movement, stable when still
                alpha = self.BASE_ALPHA if velocity > self.VELOCITY_THRESHOLD else 0.15
                
                smoothed = alpha * raw_val + (1 - alpha) * prev_val
                self._prev[i][j] = smoothed
        
        return [Landmark(*p) for p in self._prev]

    def reset(self) -> None:
        self._prev = None
        self._prev_velocity = None


# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_placeholder(text: str) -> bytes:
    img = np.zeros((480, 640, 3), dtype=np.uint8)
    cv2.putText(img, text, (80, 240), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (160, 160, 160), 2)
    _, jpeg = cv2.imencode(".jpg", img)
    return jpeg.tobytes()


NO_SIGNAL_FRAME  = _make_placeholder("No camera signal")
CONNECTING_FRAME = _make_placeholder("Connecting to camera...")


def download_model() -> None:
    if not os.path.exists(MODEL_PATH):
        print("Downloading MediaPipe pose model (~10 MB)...", flush=True)
        urllib.request.urlretrieve(MODEL_URL, MODEL_PATH)
        print("Model ready.", flush=True)


# ── Pose detection ─────────────────────────────────────────────────────────────

def check_x_pose(landmarks: list[Landmark]) -> bool:
    """
    Detect crossed wrists anywhere on the body.
    Uses hysteresis to prevent flickering.
    """
    global consecutive_x_pose_frames
    
    lw = landmarks[LEFT_WRIST]
    rw = landmarks[RIGHT_WRIST]
    ls = landmarks[LEFT_SHOULDER]
    rs = landmarks[RIGHT_SHOULDER]

    # Require good visibility of both wrists and shoulders
    if min(lw.visibility, rw.visibility, ls.visibility, rs.visibility) < 0.5:
        consecutive_x_pose_frames = 0
        return False

    # Arms crossed: in image space for a front-facing person,
    # the anatomical left wrist normally sits at higher x (right side of image).
    # When arms form an X, left wrist crosses to lower x than right wrist.
    # Add hysteresis margin to prevent flickering at the boundary
    margin = X_POSE_MARGIN if consecutive_x_pose_frames > 0 else 0
    arms_crossed = lw.x < (rw.x - margin)

    if arms_crossed:
        consecutive_x_pose_frames += 1
    else:
        consecutive_x_pose_frames = 0
    
    # Only trigger after detecting pose for several consecutive frames
    return consecutive_x_pose_frames >= REQUIRED_CONSECUTIVE_FRAMES


def draw_landmarks(frame: np.ndarray, landmarks: list[Landmark]) -> None:
    h, w = frame.shape[:2]
    connections = [
        (11, 12), (11, 13), (13, 15), (12, 14), (14, 16),
        (11, 23), (12, 24), (23, 24), (23, 25), (24, 26),
        (25, 27), (26, 28), (27, 29), (28, 30), (29, 31), (30, 32),
        (15, 17), (16, 18), (17, 19), (18, 20), (19, 21), (20, 22),
        (0, 1), (1, 2), (2, 3), (3, 7), (0, 4), (4, 5), (5, 6), (6, 8),
    ]
    for a, b in connections:
        la, lb = landmarks[a], landmarks[b]
        if la.visibility > 0.5 and lb.visibility > 0.5:
            cv2.line(
                frame,
                (int(la.x * w), int(la.y * h)),
                (int(lb.x * w), int(lb.y * h)),
                (0, 180, 255), 2,
            )
    for lm in landmarks:
        if lm.visibility > 0.5:
            cv2.circle(frame, (int(lm.x * w), int(lm.y * h)), 4, (0, 255, 128), -1)


# ── Capture loop ───────────────────────────────────────────────────────────────

async def process_stream() -> None:
    global latest_frame, last_alert_time, consecutive_x_pose_frames

    loop = asyncio.get_event_loop()
    src: int | str = int(RTSP_URL) if RTSP_URL.isdigit() else RTSP_URL

    latest_frame = CONNECTING_FRAME
    cap = cv2.VideoCapture(src)

    if cap.isOpened():
        print(f"Camera opened: {src}", flush=True)
    else:
        print(f"WARNING: could not open camera '{src}'", flush=True)
        latest_frame = NO_SIGNAL_FRAME

    options = mp_vision.PoseLandmarkerOptions(
        base_options=mp_tasks.BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=mp_vision.RunningMode.VIDEO,
        num_poses=1,
        min_pose_detection_confidence=0.7,
        min_pose_presence_confidence=0.7,
        min_tracking_confidence=0.7,
    )
    start_mono = time.monotonic()
    smoother = LandmarkSmoother()
    consecutive_failures = 0

    with mp_vision.PoseLandmarker.create_from_options(options) as landmarker:
        while True:
            ret, frame = await loop.run_in_executor(None, cap.read)

            if not ret:
                consecutive_failures += 1
                latest_frame = NO_SIGNAL_FRAME
                smoother.reset()
                consecutive_x_pose_frames = 0  # Reset counter on camera failure
                if consecutive_failures % 10 == 1:
                    print(f"Camera read failed (attempt {consecutive_failures}), retrying...", flush=True)
                await asyncio.sleep(0.5)
                cap.release()
                cap = cv2.VideoCapture(src)
                if cap.isOpened():
                    consecutive_failures = 0
                    print("Camera reconnected.", flush=True)
                continue

            consecutive_failures = 0
            timestamp_ms = int((time.monotonic() - start_mono) * 1000)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)
            result = landmarker.detect_for_video(mp_image, timestamp_ms)

            detected = False
            if result.pose_landmarks:
                smoothed = smoother.update(result.pose_landmarks[0])
                draw_landmarks(frame, smoothed)
                detected = check_x_pose(smoothed)
            else:
                smoother.reset()
                consecutive_x_pose_frames = 0  # Reset counter when no pose detected

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

            await asyncio.sleep(0)

    cap.release()


# ── FastAPI app ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    download_model()
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
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


async def frame_generator() -> AsyncGenerator[bytes, None]:
    while True:
        frame = latest_frame or CONNECTING_FRAME
        yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
        await asyncio.sleep(0.033)


@app.get("/video_feed")
async def video_feed():
    return StreamingResponse(
        frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@app.get("/health")
async def health():
    return {"status": "ok", "camera": latest_frame not in (NO_SIGNAL_FRAME, CONNECTING_FRAME)}


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    subscribers.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        subscribers.discard(websocket)
