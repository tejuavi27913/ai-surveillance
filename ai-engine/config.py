import os

class Config:
    # Flask Config (use environment variables in production)
    SECRET_KEY = os.environ.get('AI_ENGINE_SECRET') or os.environ.get('SECRET_KEY') or 'your-secret-key-change-in-production'
    DEBUG = os.environ.get('AI_ENGINE_DEBUG', 'False').lower() in ('1', 'true', 'yes')
    HOST = os.environ.get('AI_ENGINE_HOST', '0.0.0.0')
    PORT = int(os.environ.get('AI_ENGINE_PORT', 5001))
    
    # Paths
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    MODELS_DIR = os.path.join(BASE_DIR, 'models')
    UPLOADS_DIR = os.path.join(BASE_DIR, 'uploads')
    RECOGNIZED_FACES_DIR = os.path.join(BASE_DIR, 'recognized_faces')
    LOGS_DIR = os.path.join(BASE_DIR, 'logs')
    ALERTS_DIR = os.path.join(BASE_DIR, 'alerts')
    
    # Model Paths
    YOLO_MODEL_PATH = os.path.join(MODELS_DIR, 'yolov8n.pt')
    FIRE_MODEL_PATH = os.path.join(MODELS_DIR, 'fire_detection.pt')
    WEAPON_MODEL_PATH = os.path.join(MODELS_DIR, 'weapon_detection.pt')
    
    # Detection Thresholds
    CROWD_THRESHOLD = 10
    PERSON_CONFIDENCE = 0.5
    FIRE_CONFIDENCE = 0.6
    SMOKE_CONFIDENCE = 0.6
    FACE_CONFIDENCE = 0.6
    
    # Intrusion Detection
    INTRUSION_ZONE = [(100, 100), (400, 100), (400, 300), (100, 300)]  # Polygon coordinates
    
    # Suspicious Activity
    LOITERING_TIME_THRESHOLD = 30  # seconds
    LOITERING_MOVEMENT_THRESHOLD = 50  # pixels
    
    # Database (override with env var in production)
    SQLITE_DB_PATH = os.environ.get('AI_ENGINE_DB_PATH') or os.path.join(BASE_DIR, '..', 'backend', 'database', 'surveillance.db')
    
    # Create directories
    for directory in [UPLOADS_DIR, RECOGNIZED_FACES_DIR, LOGS_DIR, ALERTS_DIR, MODELS_DIR]:
        os.makedirs(directory, exist_ok=True)