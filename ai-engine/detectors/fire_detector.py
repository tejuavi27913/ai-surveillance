import cv2
import numpy as np
from datetime import datetime
import config
import sqlite3

class FireDetector:
    def __init__(self):
        # Color-based fire detection (red/orange/yellow)
        self.lower_fire = np.array([0, 100, 100])
        self.upper_fire = np.array([20, 255, 255])
        
    def detect(self, frame, camera_id=1):
        """
        Detect fire using color thresholding
        """
        # Convert to HSV
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # Create mask for fire colors
        mask = cv2.inRange(hsv, self.lower_fire, self.upper_fire)
        
        # Morphological operations
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.dilate(mask, kernel, iterations=2)
        mask = cv2.erode(mask, kernel, iterations=1)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        fire_detected = False
        fire_regions = []
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > 1000:  # Minimum area threshold
                fire_detected = True
                x, y, w, h = cv2.boundingRect(contour)
                fire_regions.append({
                    'bbox': [x, y, w, h],
                    'area': area
                })
                
                # Draw bounding box
                cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 0, 255), 3)
                cv2.putText(frame, 'FIRE DETECTED', (x, y-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 255), 2)
        
        if fire_detected:
            alert = {
                'camera_id': camera_id,
                'threat_type': 'FIRE DETECTED',
                'priority': 'critical',
                'location': f'Camera {camera_id}',
                'fire_regions': len(fire_regions),
                'timestamp': datetime.now().isoformat()
            }
            
            # Save evidence
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
        """Save fire alert with evidence"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            image_path = f"{config.Config.ALERTS_DIR}/fire_{timestamp}.jpg"
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
            print(f"Error saving fire alert: {e}")