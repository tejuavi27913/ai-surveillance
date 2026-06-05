import cv2
import numpy as np
from ultralytics import YOLO
from datetime import datetime
import config

class PersonDetector:
    def __init__(self):
        self.model = YOLO(config.Config.YOLO_MODEL_PATH)
        self.person_class_id = 0  # COCO dataset person class
        
    def detect(self, frame):
        """
        Detect persons in frame
        Returns: list of detections with count, confidence, timestamp
        """
        results = self.model(frame, verbose=False)
        
        detections = []
        person_count = 0
        
        for result in results:
            boxes = result.boxes
            if boxes is not None:
                for box in boxes:
                    cls = int(box.cls[0])
                    conf = float(box.conf[0])
                    
                    if cls == self.person_class_id and conf > config.Config.PERSON_CONFIDENCE:
                        person_count += 1
                        x1, y1, x2, y2 = map(int, box.xyxy[0])
                        
                        detections.append({
                            'bbox': [x1, y1, x2, y2],
                            'confidence': round(conf, 2),
                            'class': 'person'
                        })
                        
                        # Draw bounding box
                        cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        cv2.putText(frame, f'Person {conf:.2f}', (x1, y1-10),
                                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        return {
            'count': person_count,
            'detections': detections,
            'timestamp': datetime.now().isoformat(),
            'frame': frame
        }
    
    def detect_from_image(self, image_path):
        """Detect persons from image file"""
        frame = cv2.imread(image_path)
        if frame is None:
            return {'error': 'Could not load image'}
        return self.detect(frame)