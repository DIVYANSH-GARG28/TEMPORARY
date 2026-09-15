from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import StreamingResponse
import cv2
import logging

router = APIRouter()

logger = logging.getLogger(__name__)

# Initialize model lazily to prevent crashing if weights download fails during startup
model = None

def get_model():
    global model
    if model is None:
        try:
            from ultralytics import YOLO
            import torch
            device = 'cuda' if torch.cuda.is_available() else 'cpu'
            logger.info(f"Loading YOLOv8 on device: {device}")
            model = YOLO('yolov8n.pt')
            model.to(device)
        except Exception as e:
            logger.error(f"Failed to load YOLO model: {e}")
    return model

def generate_frames(url: str):
    yolo_model = get_model()
    if not yolo_model:
        return
        
    cap = cv2.VideoCapture(url)
    
    # Optimization for real-time streaming
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 2)
    
    frame_skip = 2
    count = 0
    
    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break
            
        count += 1
        if count % frame_skip != 0:
            continue
            
        # Run inference (detect all classes or specifically buildings/cars)
        # Yolov8n standard classes: 0 is person, 2 is car, etc. We just show all for demo.
        results = yolo_model(frame, verbose=False)
        annotated_frame = results[0].plot()
        
        # Overlay GPU text
        cv2.putText(annotated_frame, "RTX 3050 - AI INFERENCE ACTIVE", (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        ret, buffer = cv2.imencode('.jpg', annotated_frame)
        if not ret:
            continue
            
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
               
    cap.release()

@router.get("/stream")
def video_stream(url: str = Query(...)):
    """ Proxy video stream through YOLOv8 """
    return StreamingResponse(generate_frames(url), media_type="multipart/x-mixed-replace; boundary=frame")
