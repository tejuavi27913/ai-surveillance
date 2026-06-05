from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import cv2
import os
import base64
import numpy as np
from datetime import datetime
import sqlite3
import config

# Import detectors
from detectors import (
    PersonDetector,
    IntrusionDetector,
    CrowdDetector,
    FireDetector,
    SmokeDetector,
    FaceDetector,
    SuspiciousDetector
)

app = Flask(__name__)
CORS(app)

# Initialize detectors
print("🤖 Initializing AI Detectors...")
person_detector = PersonDetector()
intrusion_detector = IntrusionDetector()
crowd_detector = CrowdDetector()
fire_detector = FireDetector()
smoke_detector = SmokeDetector()
face_detector = FaceDetector()
suspicious_detector = SuspiciousDetector()
print("✅ All detectors initialized!")

# Database connection
def get_db():
    conn = sqlite3.connect(config.Config.SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def home():
    return jsonify({
        'message': 'AI Surveillance Engine API',
        'version': '1.0.0',
        'endpoints': {
            'POST /detect/video': 'Detect threats in video',
            'POST /detect/webcam': 'Detect from webcam',
            'POST /detect/face': 'Face recognition',
            'POST /register/face': 'Register new face',
            'GET /alerts': 'Get all alerts',
            'GET /detections': 'Get detection logs',
            'GET /analytics': 'Get analytics data'
        }
    })

@app.route('/detect/video', methods=['POST'])
def detect_video():
    """
    Detect threats in uploaded video
    """
    if 'video' not in request.files:
        return jsonify({'error': 'No video file provided'}), 400
    
    video_file = request.files['video']
    camera_id = request.form.get('camera_id', 1)
    
    # Save video temporarily
    video_path = os.path.join(config.Config.UPLOADS_DIR, video_file.filename)
    video_file.save(video_path)
    
    # Process video
    cap = cv2.VideoCapture(video_path)
    
    all_alerts = []
    frame_count = 0
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        frame_count += 1
        
        # Process every 5th frame for efficiency
        if frame_count % 5 != 0:
            continue
        
        # Run all detectors
        person_result = person_detector.detect(frame)
        intrusion_result = intrusion_detector.detect(frame, person_result, camera_id)
        crowd_result = crowd_detector.detect(person_result, camera_id, frame)
        fire_result = fire_detector.detect(frame, camera_id)
        smoke_result = smoke_detector.detect(frame, camera_id)
        face_result = face_detector.detect(frame, camera_id)
        suspicious_result = suspicious_detector.detect(frame, person_result, camera_id)
        
        # Collect alerts
        all_alerts.extend(intrusion_result.get('alerts', []))
        if crowd_result.get('detected'):
            all_alerts.append(crowd_result['alert'])
        if fire_result.get('detected'):
            all_alerts.append(fire_result['alert'])
        if smoke_result.get('detected'):
            all_alerts.append(smoke_result['alert'])
        if face_result.get('alert'):
            all_alerts.append(face_result['alert'])
        all_alerts.extend(suspicious_result.get('alerts', []))
    
    cap.release()
    os.remove(video_path)  # Clean up
    
    return jsonify({
        'success': True,
        'message': f'Processed {frame_count} frames',
        'alerts': all_alerts,
        'total_alerts': len(all_alerts)
    })

@app.route('/detect/webcam', methods=['POST'])
def detect_webcam():
    """
    Detect from webcam (real-time)
    """
    camera_id = request.json.get('camera_id', 1)
    duration = request.json.get('duration', 10)  # seconds
    
    cap = cv2.VideoCapture(0)  # 0 = default webcam
    
    if not cap.isOpened():
        return jsonify({'error': 'Could not open webcam'}), 500
    
    all_alerts = []
    start_time = datetime.now()
    
    while (datetime.now() - start_time).total_seconds() < duration:
        ret, frame = cap.read()
        if not ret:
            break
        
        # Run detectors
        person_result = person_detector.detect(frame)
        intrusion_result = intrusion_detector.detect(frame, person_result, camera_id)
        crowd_result = crowd_detector.detect(person_result, camera_id, frame)
        fire_result = fire_detector.detect(frame, camera_id)
        smoke_result = smoke_detector.detect(frame, camera_id)
        face_result = face_detector.detect(frame, camera_id)
        suspicious_result = suspicious_detector.detect(frame, person_result, camera_id)
        
        # Collect alerts
        all_alerts.extend(intrusion_result.get('alerts', []))
        if crowd_result.get('detected'):
            all_alerts.append(crowd_result['alert'])
        if fire_result.get('detected'):
            all_alerts.append(fire_result['alert'])
        if smoke_result.get('detected'):
            all_alerts.append(smoke_result['alert'])
        if face_result.get('alert'):
            all_alerts.append(face_result['alert'])
        all_alerts.extend(suspicious_result.get('alerts', []))
    
    cap.release()
    
    return jsonify({
        'success': True,
        'message': f'Processed webcam for {duration} seconds',
        'alerts': all_alerts,
        'total_alerts': len(all_alerts)
    })

@app.route('/detect/image', methods=['POST'])
def detect_image():
    """
    Detect threats in uploaded image
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    image_file = request.files['image']
    camera_id = request.form.get('camera_id', 1)
    
    # Read image
    file_bytes = np.frombuffer(image_file.read(), np.uint8)
    frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    if frame is None:
        return jsonify({'error': 'Could not read image'}), 400
    
    # Run all detectors
    person_result = person_detector.detect(frame)
    intrusion_result = intrusion_detector.detect(frame, person_result, camera_id)
    crowd_result = crowd_detector.detect(person_result, camera_id, frame)
    fire_result = fire_detector.detect(frame, camera_id)
    smoke_result = smoke_detector.detect(frame, camera_id)
    face_result = face_detector.detect(frame, camera_id)
    suspicious_result = suspicious_detector.detect(frame, person_result, camera_id)
    
    # Collect all results
    results = {
        'persons': {
            'count': person_result['count'],
            'detections': person_result['detections']
        },
        'intrusion': intrusion_result.get('alerts', []),
        'crowd': crowd_result.get('detected', False),
        'fire': fire_result.get('detected', False),
        'smoke': smoke_result.get('detected', False),
        'faces': face_result.get('detections', []),
        'suspicious': suspicious_result.get('alerts', [])
    }
    
    # Encode processed frame
    _, buffer = cv2.imencode('.jpg', frame)
    processed_image = base64.b64encode(buffer).decode('utf-8')
    
    return jsonify({
        'success': True,
        'results': results,
        'processed_image': f'data:image/jpeg;base64,{processed_image}'
    })

@app.route('/detect/face', methods=['POST'])
def detect_face():
    """
    Face recognition endpoint
    """
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    image_file = request.files['image']
    camera_id = request.form.get('camera_id', 1)
    
    # Read image
    file_bytes = np.frombuffer(image_file.read(), np.uint8)
    frame = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    
    if frame is None:
        return jsonify({'error': 'Could not read image'}), 400
    
    # Detect faces
    result = face_detector.detect(frame, camera_id)
    
    return jsonify({
        'success': True,
        'detections': result['detections'],
        'unknown_faces': len(result['unknown_faces']),
        'alert': result.get('alert')
    })

@app.route('/register/face', methods=['POST'])
def register_face():
    """
    Register a new face
    """
    if 'image' not in request.files or 'name' not in request.form:
        return jsonify({'error': 'Image and name required'}), 400
    
    image_file = request.files['image']
    name = request.form['name']
    
    # Save image temporarily
    image_path = os.path.join(config.Config.RECOGNIZED_FACES_DIR, f"{name}.jpg")
    image_file.save(image_path)
    
    # Register face
    result = face_detector.register_face(image_path, name)
    
    return jsonify(result)

@app.route('/alerts', methods=['GET'])
def get_alerts():
    """
    Get all alerts from database
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT a.*, c.camera_name 
            FROM alerts a
            LEFT JOIN cameras c ON a.camera_id = c.id
            ORDER BY a.created_at DESC
            LIMIT 100
        ''')
        
        alerts = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({
            'success': True,
            'data': alerts,
            'count': len(alerts)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/detections', methods=['GET'])
def get_detections():
    """
    Get detection logs
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM face_recognition_logs
            ORDER BY detected_at DESC
            LIMIT 100
        ''')
        
        detections = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        return jsonify({
            'success': True,
            'data': detections,
            'count': len(detections)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/analytics', methods=['GET'])
def get_analytics():
    """
    Get analytics data for dashboard
    """
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Total alerts by type
        cursor.execute('''
            SELECT threat_type, COUNT(*) as count
            FROM alerts
            GROUP BY threat_type
        ''')
        alerts_by_type = [dict(row) for row in cursor.fetchall()]
        
        # Alerts by priority
        cursor.execute('''
            SELECT priority, COUNT(*) as count
            FROM alerts
            GROUP BY priority
        ''')
        alerts_by_priority = [dict(row) for row in cursor.fetchall()]
        
        # Recent alerts (last 24 hours)
        cursor.execute('''
            SELECT COUNT(*) as count
            FROM alerts
            WHERE created_at >= datetime('now', '-1 day')
        ''')
        recent_alerts = cursor.fetchone()['count']
        
        # Total cameras
        cursor.execute('SELECT COUNT(*) as count FROM cameras')
        total_cameras = cursor.fetchone()['count']
        
        # Online cameras
        cursor.execute("SELECT COUNT(*) as count FROM cameras WHERE status = 'online'")
        online_cameras = cursor.fetchone()['count']
        
        # Total users
        cursor.execute('SELECT COUNT(*) as count FROM users')
        total_users = cursor.fetchone()['count']
        
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'alerts_by_type': alerts_by_type,
                'alerts_by_priority': alerts_by_priority,
                'recent_alerts': recent_alerts,
                'total_cameras': total_cameras,
                'online_cameras': online_cameras,
                'total_users': total_users
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"🚀 AI Engine starting on http://localhost:{config.Config.PORT}")
    app.run(
        host=config.Config.HOST,
        port=config.Config.PORT,
        debug=config.Config.DEBUG
    )
