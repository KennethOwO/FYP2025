# # python_scripts/process_video_yolov8.py
# import os
# import sys
# import json
# import cv2
# import torch
# import logging
# from typing import List, Dict, Any
# from ultralytics import YOLO

# # Logging setup
# logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
# logger = logging.getLogger(__name__)

# # Sign class mapping (adjust as needed)
# SIGN_LABELS = {
#     0: "hello",
#     1: "thank you",
#     2: "please",
#     3: "sorry",
#     4: "good",
#     5: "bad",
#     6: "yes",
#     7: "no",
#     8: "help",
#     9: "how are you"
# }

# def process_video(video_path: str, model_path: str, confidence_threshold: float = 0.7) -> Dict[str, Any]:
#     if not os.path.exists(video_path):
#         return {"success": False, "error": f"Video not found: {video_path}"}
    
#     if not os.path.exists(model_path):
#         return {"success": False, "error": f"Model not found: {model_path}"}
    
#     logger.info(f"Loading YOLOv8 model from {model_path}")
#     model = YOLO(model_path)

#     logger.info(f"Opening video {video_path}")
#     cap = cv2.VideoCapture(video_path)
#     if not cap.isOpened():
#         return {"success": False, "error": "Failed to open video"}

#     detection_results = []

#     while True:
#         ret, frame = cap.read()
#         if not ret:
#             break

#         results = model(frame)[0]
#         for box in results.boxes:
#             cls_id = int(box.cls[0].item())
#             conf = float(box.conf[0].item())
#             if conf >= confidence_threshold:
#                 label = SIGN_LABELS.get(cls_id, f"Unknown({cls_id})")
#                 logger.info(f"Detected {label} with confidence {conf:.2f}")
#                 detection_results.append((cls_id, conf))

#     cap.release()

#     if not detection_results:
#         return {
#             "success": True,
#             "text": "No confident detections",
#             "confidence": 0.0
#         }

#     # Aggregate detections
#     counts = {}
#     for cls_id, conf in detection_results:
#         counts[cls_id] = counts.get(cls_id, 0) + 1

#     top_cls = max(counts.items(), key=lambda x: x[1])[0]
#     label = SIGN_LABELS.get(top_cls, f"Unknown({top_cls})")
    
#     return {
#         "success": True,
#         "text": label,
#         "detections": counts
#     }

# def main():
#     if len(sys.argv) < 3:
#         print(json.dumps({
#             "success": False,
#             "error": "Usage: python process_video_yolov8.py <video_path> <model_path> [confidence_threshold]"
#         }))
#         sys.exit(1)

#     video_path = sys.argv[1]
#     model_path = sys.argv[2]
#     confidence_threshold = float(sys.argv[3]) if len(sys.argv) > 3 else 0.7

#     result = process_video(video_path, model_path, confidence_threshold)
#     print(json.dumps(result))

# if __name__ == "__main__":
#     main()


import sys
import os
import json
import cv2
import traceback
from ultralytics import YOLO

def process_video(video_path, model_path, threshold=0.2, imgsz=224):
    if not os.path.exists(video_path):
        raise FileNotFoundError(f"Video not found: {video_path}")
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found: {model_path}")

    print(f"Loading model from: {model_path}", file=sys.stderr)
    model = YOLO(model_path)

    print(f"Opening video: {video_path}", file=sys.stderr)
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        raise RuntimeError("Failed to open video")

    detected_words = []
    frame_idx = 0

    while True:
        ret, frame = cap.read()
        if not ret:
            print("End of video or failed read", file=sys.stderr)
            break

        frame_idx += 1

        # Preprocess frame
        img = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        img_resized = cv2.resize(img, (imgsz, imgsz))

        # Predict
        results = model.predict(source=img_resized, save=False, verbose=False)
        probs = results[0].probs

        if probs is not None:
            top_idx = int(probs.top1)
            top_conf = float(probs.data[top_idx])
            full_class_name = model.names[top_idx]
            word = full_class_name.split('_')[0]

            print(f"[Frame {frame_idx}] Prediction: {full_class_name}, Confidence: {top_conf:.2f}", file=sys.stderr)

            if top_conf >= threshold:
                print(f"Above threshold: {top_conf:.2f} ≥ {threshold}", file=sys.stderr)
                if word not in detected_words:
                    detected_words.append(word)
            else:
                print(f"Below threshold: {top_conf:.2f} < {threshold}", file=sys.stderr)

    cap.release()

    final_sentence = ' '.join(detected_words)
    return {
        "success": True,
        "sentence": final_sentence,
        "words": detected_words
    }

def main():
    try:
        if len(sys.argv) < 3:
            raise ValueError("Usage: python process_video_yolov8.py <video_path> <model_path> [threshold]")

        video_path = sys.argv[1]
        model_path = sys.argv[2]
        threshold = float(sys.argv[3]) if len(sys.argv) > 3 else 0.2

        print(f"Starting video processing with threshold {threshold}", file=sys.stderr)
        result = process_video(video_path, model_path, threshold)

        # Final structured output for Node.js to parse
        print(json.dumps(result))

    except Exception as e:
        traceback.print_exc(file=sys.stderr)
        print(json.dumps({"success": False, "error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

