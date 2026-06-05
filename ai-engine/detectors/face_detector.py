import cv2
import numpy as np
import os
import pickle
from datetime import datetime
import config
import sqlite3

class FaceDetector:
    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.known_faces = []
        self.known_face_names = []
        self.face_encodings_file = os.path.join(config.Config.RECOGNIZED_FACES_DIR, 'face_encodings.pkl')
        self.load_known_faces()
        
    def load_known_faces(self):
        if os.path.exists(self.face_encodings_file):
            with open(self.face_encodings_file, 'rb') as f:
                data = pickle.load(f)
                self.known_faces = data['encodings']
                self.known_face_names = data['names']
    
    def save_known_faces(self):
        with open(self.face_encodings_file, 'wb') as f:
            pickle.dump({
                'encodings': self.known_faces,
                'names': self.known_face_names
            }, f)
    
    def get_face_encoding(self, face_img):
        face_resized = cv2.resize(face_img, (100, 100))
        face_gray = cv2.cvtColor(face_resized, cv2.COLOR_BGR2GRAY)
        hist = cv2.calcHist([face_gray], [0], None, [256], [0, 256])
        cv2.normalize(hist, hist)
        return hist.flatten()
    
    def register_face(self, image_path, name):
        image = cv2.imread(image_path)
        if image is None:
            return {'error': 'Could not load image'}
        
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            return {'error': 'No face detected in image'}
        
        (x, y, w, h) = faces[0]
        face_img = image[y:y+h, x:x+w]
        encoding = self.get_face_encoding(face_img)
        
        self.known_faces.append(encoding)
        self.known_face_names.append(name)
        self.save_known_faces()
        
        return {'success': True, 'message': f'Face registered for {name}'}
    
    def detect(self, frame, camera_id=1):
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
        
        detections = []
        unknown_faces = []
        
        for (x, y, w, h) in faces:
            face_img = frame[y:y+h, x:x+w]
            face_encoding = self.get_face_encoding(face_img)
            
            name = "Unknown"
            best_distance = float('inf')
            
            if len(self.known_faces) > 0:
                for i, known_encoding in enumerate(self.known_faces):
                    distance = cv2.compareHist(
                        face_encoding.reshape(-1, 1).astype(np.float32),
                        known_encoding.reshape(-1, 1).astype(np.float32),
                        cv2.HISTCMP_CHISQR
                    )
                    
                    if distance < best_distance:
                        best_distance = distance
                        if distance < 500:
                            name = self.known_face_names[i]
            
            if name != "Unknown":
                color = (0, 255, 0)
            else:
                color = (0, 0, 255)
                unknown_faces.append({'location': (x, y, w, h), 'confidence': 0.8})
            
            cv2.rectangle(frame, (x, y), (x+w, y+h), color, 2)
            cv2.putText(frame, name, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
            detections.append({'name': name, 'bbox': [x, y, x+w, y+h], 'confidence': 0.8})
        
        if len(unknown_faces) > 0:
            alert = {
                'camera_id': camera_id,
                'threat_type': 'UNKNOWN FACE DETECTED',
                'priority': 'medium',
                'location': f'Camera {camera_id}',
                'unknown_count': len(unknown_faces),
                'timestamp': datetime.now().isoformat()
            }
            self.save_face_log(alert, frame)
            return {'detections': detections, 'unknown_faces': unknown_faces, 'alert': alert, 'frame': frame}
        
        return {'detections': detections, 'unknown_faces': [], 'frame': frame}
    
    def save_face_log(self, alert, frame):
        try:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            image_path = f"{config.Config.ALERTS_DIR}/face_{timestamp}.jpg"
            cv2.imwrite(image_path, frame)
            
            conn = sqlite3.connect(config.Config.SQLITE_DB_PATH)
            cursor = conn.cursor()
            
            cursor.execute('INSERT INTO face_recognition_logs (person_name, camera_id, confidence, image_path, detected_at) VALUES (?, ?, ?, ?, ?)', 
                          ('Unknown', alert['camera_id'], 0.0, image_path, datetime.now().isoformat()))
            
            cursor.execute('INSERT INTO alerts (camera_id, threat_type, priority, location, evidence_image, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                          (alert['camera_id'], alert['threat_type'], alert['priority'], alert['location'], image_path, 'new', datetime.now().isoformat()))
            
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"Error saving face log: {e}")