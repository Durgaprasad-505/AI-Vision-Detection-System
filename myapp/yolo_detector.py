
import torch
import cv2
import numpy as np
import base64, io, os
from PIL import Image

# ----------------------------
# FIND MODEL PATH DYNAMICALLY
# ----------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "yolov3.pt")

# ----------------------------
# LOAD YOLOv3 MODEL
# ----------------------------
print("🔄 Loading YOLOv3 model...")
model = torch.hub.load('ultralytics/yolov3', 'custom', path=MODEL_PATH, force_reload=False)
model.eval()
device = 'cuda' if torch.cuda.is_available() else 'cpu'
model.to(device)
print(f"✅ Model loaded successfully on {device}")

# ----------------------------
# DETECTION FUNCTION
# ----------------------------
def run_detection(image_bytes):
    # Read image from bytes
    img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    img_np = np.array(img)

    # Run inference
    results = model(img_np, size=640)

    detections = []

    # Convert to BGR for OpenCV drawing
    img_cv = cv2.cvtColor(img_np, cv2.COLOR_RGB2BGR)

    # Parse results
    for *xyxy, conf, cls in results.xyxy[0].tolist():
        x1, y1, x2, y2 = map(int, xyxy)
        label = model.names[int(cls)]
        detections.append({
            "label": label,
            "confidence": round(conf, 3),
            "box": [x1, y1, x2, y2]
        })
        cv2.rectangle(img_cv, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(img_cv, f"{label} {conf:.2f}", (x1, y1 - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 0, 0), 2)

    # Encode image result
    _, buffer = cv2.imencode('.jpg', img_cv)
    encoded_img = base64.b64encode(buffer).decode('utf-8')

    return {"image": encoded_img, "detections": detections}



