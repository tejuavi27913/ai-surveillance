import cv2
import numpy as np
from datetime import datetime
import config
import sqlite3

class SmokeDetector:
    def __init__(self):
        # Smoke detection using color and texture
        self.lower_smoke = np.array([0, 0, 100])
        self.upper_smoke = np.array([180, 50, 255])
        
    def detect(self, frame, camera_id=1):
        """
        Detect smoke using color thresholding
        """
        # Convert to HSV
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Create mask for smoke (grayish/white)
        mask = cv2.inRange(hsv, self.lower_smoke, self.upper_smoke)
        
        # Apply Gaussian blur
        blurred = cv2.GaussianBlur(mask, (5, 5), 0)
        
        # Threshold
        _, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Morphological operations
        kernel = np.ones((5, 5), np.uint8)
        thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        smoke_detected = False
        smoke_regions = []
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 5000:  # Larger area for smoke
                smoke_detected = True
                x, y, w, h = cv2.boundingRect(contour)
                smoke_regions.append({
                    'bbox': [x, y, w, h],
                    'area': area
                })
                
                # Draw bounding box
                cv2.rectangle(frame, (x, y), (x+w, y+h), (128, 128, 128), 3)
                cv2.putText(frame, 'SMOKE DETECTED', (x, y-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (128, 128, 128), 2)
        
        if smoke_detected:
            alert = {
                'camera_id': camera_id,
                'threat_type': 'SMOKE DETECTED',
                'priority': 'high',
                'location': f'Camera {camera_id}',
                'smoke_regions': len(smoke_regions),
                'timestamp': datetime.now().isoformat()
            }
            
            self.save_alert(alert, frame)
            
            return {
                'detected': True,
                'alert': alert,
                'frame': frame
            }
        
        return {
            'detected': False,
            'frame': frame
        }
    
    def save_alert(self, alert, frame):
        """Save smoke alert"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            image_path = f"{config.Config.ALERTS_DIR}/smoke_{timestamp}.jpg"
            cv2.imwrite(image_path, frame)
            
            conn = sqlite3.connect(config.Config.SQLITE_DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO alerts (camera_id, threat_type, priority, location, evidence_image, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                alert['camera_id'],
                alert['threat_type'],
                alert['priority'],
                alert['location'],
                image_path,
                'new',
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving smoke alert: {e}")