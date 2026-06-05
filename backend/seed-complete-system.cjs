const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'database', 'surveillance.db');
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'tejuavi27913@gmail.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Awini@27';
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user',
    admin_id TEXT UNIQUE,
    employee_id TEXT UNIQUE,
    department TEXT,
    assigned_area TEXT,
    organization_name TEXT,
    password_hash TEXT NOT NULL,
    profile_photo TEXT,
    status TEXT CHECK(status IN ('active', 'inactive')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS cameras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camera_name TEXT NOT NULL,
    location TEXT NOT NULL,
    ip_address TEXT,
    stream_url TEXT,
    camera_type TEXT DEFAULT 'IP',
    status TEXT CHECK(status IN ('online', 'offline', 'maintenance')) DEFAULT 'online',
    storage_used TEXT DEFAULT '0 GB',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camera_id INTEGER,
    threat_type TEXT NOT NULL,
    location TEXT NOT NULL,
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
    status TEXT CHECK(status IN ('new', 'open', 'viewed', 'closed', 'resolved')) DEFAULT 'new',
    evidence_image TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_name TEXT NOT NULL,
    report_type TEXT NOT NULL,
    report_file TEXT,
    generated_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(generated_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS face_recognition_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_name TEXT,
    camera_id INTEGER,
    confidence REAL,
    image_path TEXT,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS system_health (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cpu_usage REAL,
    ram_usage REAL,
    storage_usage REAL,
    network_usage REAL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS detection_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    camera_id INTEGER,
    detection_type TEXT NOT NULL,
    confidence REAL,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(camera_id) REFERENCES cameras(id) ON DELETE SET NULL
  );
`);

db.exec(`
  DELETE FROM detection_logs;
  DELETE FROM alerts;
  DELETE FROM face_recognition_logs;
  DELETE FROM reports;
  DELETE FROM audit_logs;
  DELETE FROM system_health;
  DELETE FROM cameras;
  DELETE FROM users WHERE email != '${ADMIN_EMAIL}';
`);

const adminEmail = ADMIN_EMAIL;
const adminPasswordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
let adminId;

if (existingAdmin) {
  db.prepare(`
    UPDATE users
    SET full_name = 'Admin User',
        password_hash = ?,
        role = 'admin',
        status = 'active',
        admin_id = 'ADMIN-001',
        organization_name = 'AI Smart Surveillance'
    WHERE email = ?
  `).run(adminPasswordHash, adminEmail);
  adminId = existingAdmin.id;
} else {
  const result = db.prepare(`
    INSERT INTO users (full_name, email, password_hash, role, status, admin_id, organization_name)
    VALUES ('Admin User', ?, ?, 'admin', 'active', 'ADMIN-001', 'AI Smart Surveillance')
  `).run(adminEmail, adminPasswordHash);
  adminId = result.lastInsertRowid;
}

const cameraStmt = db.prepare(`
  INSERT INTO cameras (camera_name, location, ip_address, stream_url, camera_type, status, storage_used, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
`);

const cameras = [
  ['Main Entrance Camera', 'Main Entrance', '192.168.1.101', '/videos/normal.mp4', 'IP', 'online', '45.2 GB'],
  ['Warehouse Camera', 'Warehouse', '192.168.1.102', '/videos/burglary.mp4', 'IP', 'online', '38.7 GB'],
  ['Parking Area Camera', 'Parking Area', '192.168.1.103', '/videos/fighting.mp4', 'IP', 'online', '42.1 GB'],
  ['Cash Counter Camera', 'Cash Counter', '192.168.1.104', '/videos/robbery.mp4', 'IP', 'online', '28.5 GB'],
  ['Property Monitoring Camera', 'Property Monitoring', '192.168.1.105', '/videos/vandalism.mp4', 'IP', 'online', '51.3 GB']
];

const cameraIds = cameras.map(camera => cameraStmt.run(...camera).lastInsertRowid);

const alertStmt = db.prepare(`
  INSERT INTO alerts (camera_id, threat_type, location, priority, status, evidence_image, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

[
  [cameraIds[1], 'Intrusion Detected', 'Warehouse', 'critical', 'new', '/evidence/burglary.jpg', '-3 hours'],
  [cameraIds[3], 'Weapon Detected', 'Cash Counter', 'critical', 'new', '/evidence/robbery.jpg', '-2 hours'],
  [cameraIds[4], 'Property Damage', 'Property Monitoring', 'medium', 'viewed', '/evidence/vandalism.jpg', '-1 hours'],
  [cameraIds[2], 'Suspicious Activity', 'Parking Area', 'high', 'resolved', '/evidence/fighting.jpg', '-45 minutes']
].forEach(alert => {
  alertStmt.run(alert[0], alert[1], alert[2], alert[3], alert[4], alert[5], new Date(Date.now() + parseRelative(alert[6])).toISOString());
});

const faceStmt = db.prepare(`
  INSERT INTO face_recognition_logs (person_name, camera_id, confidence, image_path, detected_at)
  VALUES (?, ?, ?, ?, ?)
`);

[
  ['Admin User', cameraIds[0], 98.4, '/uploads/faces/admin.jpg', -300],
  ['Unknown', cameraIds[1], 71.2, '/uploads/faces/unknown-1.jpg', -260],
  ['Security Staff', cameraIds[2], 94.1, '/uploads/faces/security-staff.jpg', -180],
  ['Unknown', cameraIds[3], 67.8, '/uploads/faces/unknown-2.jpg', -90],
  ['Maintenance User', cameraIds[4], 91.6, '/uploads/faces/maintenance.jpg', -30]
].forEach(face => {
  faceStmt.run(face[0], face[1], face[2], face[3], new Date(Date.now() + face[4] * 60000).toISOString());
});

const auditStmt = db.prepare('INSERT INTO audit_logs (user_id, action, module, timestamp) VALUES (?, ?, ?, ?)');
[
  ['Admin Login', 'AUTH'],
  ['Seeded demo cameras', 'CAMERAS'],
  ['AI engine health check', 'SYSTEM'],
  ['Viewed live monitoring', 'MONITORING'],
  ['Intrusion alert created', 'ALERTS'],
  ['Weapon alert created', 'ALERTS'],
  ['Generated daily report', 'REPORTS'],
  ['Reviewed face recognition logs', 'FACE_RECOGNITION'],
  ['Updated camera status', 'CAMERAS'],
  ['System health snapshot recorded', 'SYSTEM_HEALTH']
].forEach((audit, index) => {
  auditStmt.run(adminId, audit[0], audit[1], new Date(Date.now() - (10 - index) * 3600000).toISOString());
});

const healthStmt = db.prepare(`
  INSERT INTO system_health (cpu_usage, ram_usage, storage_usage, network_usage, recorded_at)
  VALUES (?, ?, ?, ?, ?)
`);

for (let hour = 23; hour >= 0; hour -= 1) {
  healthStmt.run(
    Number((28 + Math.sin(hour / 3) * 9 + (hour % 4)).toFixed(1)),
    Number((46 + Math.cos(hour / 4) * 8 + (hour % 5)).toFixed(1)),
    Number((61 + hour * 0.25).toFixed(1)),
    Number((18 + Math.sin(hour / 2) * 12 + (hour % 6)).toFixed(1)),
    new Date(Date.now() - hour * 3600000).toISOString()
  );
}

const reportStmt = db.prepare(`
  INSERT INTO reports (report_name, report_type, report_file, generated_by, created_at)
  VALUES (?, ?, ?, ?, ?)
`);

[
  ['Daily Security Summary', 'Daily', '/reports/daily-security-summary.txt', -2],
  ['Weekly Threat Analysis', 'Weekly', '/reports/weekly-threat-analysis.txt', -1],
  ['Incident Report - Warehouse Intrusion', 'Incident', '/reports/warehouse-intrusion.txt', 0]
].forEach(report => {
  reportStmt.run(report[0], report[1], report[2], adminId, new Date(Date.now() + report[3] * 86400000).toISOString());
});

db.pragma('foreign_keys = ON');
db.close();

console.log('Complete system seed finished.');
console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

function parseRelative(value) {
  const [amount, unit] = value.split(' ');
  const number = Number(amount);
  if (unit.startsWith('hour')) return number * 3600000;
  if (unit.startsWith('minute')) return number * 60000;
  return 0;
}
