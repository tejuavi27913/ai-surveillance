import cv2
import numpy as np
from datetime import datetime, timedelta
import config
import sqlite3

class SuspiciousDetector:
    def __init__(self):
        self.tracking_history = {}  # Track person positions over time
        self.loitering_threshold = config.Config.LOITERING_TIME_THRESHOLD
        self.movement_threshold = config.Config.LOITERING_MOVEMENT_THRESHOLD
        
    def detect(self, frame, person_detections, camera_id=1):
        """
        Detect suspicious activity like loitering
        """
        alerts = []
        current_time = datetime.now()
        
        # Track each person
        for i, detection in enumerate(person_detections['detections']):
            person_id = f"person_{i}"
            bbox = detection['bbox']
            center_x = (bbox[0] + bbox[2]) // 2
            center_y = (bbox[1] + bbox[3]) // 2
            
            # Initialize tracking
            if person_id not in self.tracking_history:
                self.tracking_history[person_id] = {
                    'positions': [(center_x, center_y)],
                    'first_seen': current_time,
                    'last_moved': current_time
                }
            else:
                # Update tracking
                history = self.tracking_history[person_id]
                last_pos = history['positions'][-1]
                
                # Calculate movement
                distance = np.sqrt((center_x - last_pos[0])**2 + (center_y - last_pos[1])**2)
                
                if distance > self.movement_threshold:
                    history['last_moved'] = current_time
                
                history['positions'].append((center_x, center_y))
                
                # Keep only last 100 positions
                if len(history['positions']) > 100:
                    history['positions'] = history['positions'][-100:]
                
                # Check for loitering
                time_standing = (current_time - history['last_moved']).total_seconds()
                
                if time_standing > self.loitering_threshold:
                    # Suspicious activity detected!
                    cv2.rectangle(frame, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (255, 0, 255), 3)
                    cv2.putText(frame, 'SUSPICIOUS!', (bbox[0], bbox[1]-10),
                               cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 255), 2)
                    
                    alert = {
                        'camera_id': camera_id,
                        'threat_type': 'SUSPICIOUS ACTIVITY DETECTED',
                        'priority': 'medium',
                        'location': f'Camera {camera_id}',
                        'activity': 'Loitering',
                        'duration': time_standing,
                        'timestamp': current_time.isoformat()
                    }
                    alerts.append(alert)
                    
                    # Save alert
                    self.save_alert(alert, frame)
        
        return {
            'alerts': alerts,
            'frame': frame
        }
    
    def save_alert(self, alert, frame):
        """Save suspicious activity alert"""
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            image_path = f"{config.Config.ALERTS_DIR}/suspicious_{timestamp}.jpg"
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
            print(f"Error saving suspicious alert: {e}")