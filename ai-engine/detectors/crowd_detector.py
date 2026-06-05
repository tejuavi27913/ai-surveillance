import cv2
from datetime import datetime
import config
import sqlite3

class CrowdDetector:
    def __init__(self, threshold=None):
        self.threshold = threshold or config.Config.CROWD_THRESHOLD
        
    def detect(self, person_detections, camera_id=1, frame=None):
        """
        Detect crowd if person count exceeds threshold
        """
        person_count = person_detections['count']
        
        if person_count >= self.threshold:
            alert = {
                'camera_id': camera_id,
                'threat_type': 'CROWD DETECTED',
                'priority': 'medium',
                'location': f'Camera {camera_id}',
                'person_count': person_count,
                'threshold': self.threshold,
                'timestamp': datetime.now().isoformat()
            }
            
            # Draw warning
            if frame is not None:
                cv2.putText(frame, f'CROWD ALERT: {person_count} people', (10, 50),
                           cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 255), 3)
                alert['frame'] = frame
            
            # Save to database
            self.save_alert(alert)
            
            return {
                'detected': True,
                'alert': alert
            }
        
        return {
            'detected': False,
            'person_count': person_count
        }
    
    def save_alert(self, alert):
        """Save crowd alert to database"""
        try:
            conn = sqlite3.connect(config.Config.SQLITE_DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO alerts (camera_id, threat_type, priority, location, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                alert['camera_id'],
                alert['threat_type'],
                alert['priority'],
                alert['location'],
                'new',
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving crowd alert: {e}")