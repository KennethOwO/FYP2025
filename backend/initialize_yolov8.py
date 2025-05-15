# python_scripts/initialize_yolov8.py
import os
import sys
import json
import logging
from ultralytics import YOLO

# Configure logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def main():
    try:
        if len(sys.argv) < 2:
            logger.error("Missing model path argument")
            print(json.dumps({"success": False, "error": "Missing model path argument"}))
            sys.exit(1)

        model_path = sys.argv[1]

        if not os.path.exists(model_path):
            logger.error(f"Model not found: {model_path}")
            print(json.dumps({"success": False, "error": f"Model not found: {model_path}"}))
            sys.exit(1)

        logger.info(f"Loading YOLOv8 model from {model_path}")
        model = YOLO(model_path)

        logger.info("Model loaded successfully.")
        print(json.dumps({
            "success": True,
            "message": "YOLOv8 model initialized successfully",
            "model_path": model_path
        }))
        
    except Exception as e:
        logger.error(f"Initialization error: {str(e)}")
        print(json.dumps({"success": False, "error": f"Initialization error: {str(e)}"}))
        sys.exit(1)

if __name__ == "__main__":
    main()
