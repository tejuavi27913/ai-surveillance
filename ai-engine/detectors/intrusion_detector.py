import cv2
import numpy as np
from datetime import datetime
import config
import sqlite3

class IntrusionDetector:
    def __init__(self):
        self.zone = np.array(config.Config.INTRUSION_ZONE, np.int32)
        self.alert_triggered = False
        
    def is_in_zone(self, point):
        """Check if point is inside restricted zone"""
        result = cv2.pointPolygonTest(self.zone, point, False)
        return result >= 0
    
    def detect(self, frame, person_detections, camera_id=1):
        """
        Detect intrusion in restricted zone
        person_detections: output from PersonDetector
        """
        alerts = []
        
        # Draw zone
        cv2.polylines(frame, [self.zone], True, (0, 0, 255), 2)
        cv2.putText(frame, 'RESTRICTED ZONE', (self.zone[0][0], self.zone[0][1]-10),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        # Check each person
        for detection in person_detections['detections']:
            bbox = detection['bbox']
            center_x = (bbox[0] + bbox[2]) // 2
            center_y = (bbox[1] + bbox[3]) // 2
            
            if self.is_in_zone((center_x, center_y)):
                # Intrusion detected!
                cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 0, 255), 3)
                cv2.putText(frame, 'INTRUSION!', (bbox[0], bbox[1]-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                
                alert = {
                    'camera_id': camera_id,
                    'threat_type': 'INTRUSION DETECTED',
                    'priority': 'high',
                    'location': f'Camera {camera_id} - Restricted Zone',
                    'confidence': detection['confidence'],
                    'timestamp': datetime.now().isoformat()
                }
                alerts.append(alert)
                
                # Save to database
                self.save_alert(alert, frame)
        
        return {
            'alerts': alerts,
            'frame': frame
        }
    
    def save_alert(self, alert, frame):
        """Save alert to SQLite database"""
        try:
            conn = sqlite3.connect(config.Config.SQLITE_DB_PATH)
            cursor = conn.cursor()
            
            # Save evidence image
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            image_path = f"{config.Config.ALERTS_DIR}/intrusion_{timestamp}.jpg"
            cv2.imwrite(image_path, frame)
            
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
            print(f"Error saving alert: {e}")