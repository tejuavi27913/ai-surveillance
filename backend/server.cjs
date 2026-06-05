const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-before-production';
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'database', 'surveillance.db');

const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/videos', express.static(path.join(__dirname, '..', 'public', 'videos')));

// Normalize video file requests: case-insensitive and handle common misspellings
try {
  const videosDir = path.join(__dirname, '..', 'public', 'videos');
  if (fs.existsSync(videosDir)) {
    const files = fs.readdirSync(videosDir);
    const videoMap = files.reduce((acc, f) => {
      acc[f.toLowerCase()] = f;
      return acc;
    }, {});

    app.get('/videos/:file', (req, res, next) => {
      const requested = (req.params.file || '').toLowerCase();
      const resolved = videoMap[requested] || videoMap[requested.replace('vandalism', 'vandallism')];
      if (resolved) return res.sendFile(path.join(videosDir, resolved));
      return next();
    });
  }
} catch (e) {
  console.warn('Video normalization middleware error', e.message);
}

app.use('/evidence', express.static(path.join(__dirname, 'evidence')));
app.use('/reports', express.static(path.join(__dirname, 'reports')));

// Serve frontend build if present (production)
try {
  const distDir = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(distDir)) {
    app.use(express.static(distDir));
    app.use((req, res, next) => {
      // let API, uploads and video routes pass through
      if (req.path.startsWith('/api') || req.path.startsWith('/videos') || req.path.startsWith('/uploads') || req.path.startsWith('/reports') || req.path.startsWith('/evidence')) return next();
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }
} catch (e) {
  console.warn('Frontend static serving setup failed', e.message);
}

const run = (res, handler) => {
  try {
    Promise.resolve(handler()).catch(error => {
      console.error(error);
      if (!res.headersSent) res.status(500).json({ success: false, message: error.message || 'Server error' });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

const normalizePriority = (priority = 'medium') => {
  const value = String(priority).toLowerCase();
  return ['low', 'medium', 'high', 'critical'].includes(value) ? value : 'medium';
};

const normalizeStatus = (status = 'active', allowed = ['active', 'inactive']) => {
  const value = String(status).toLowerCase();
  return allowed.includes(value) ? value : allowed[0];
};

const signToken = user => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

const publicUser = user => {
  if (!user) return null;
  const { password_hash, ...safe } = user;
  return safe;
};

const authMiddleware = (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (_error) {
      req.user = null;
    }
  }
  next();
};

app.use(authMiddleware);

// Require authentication for protected endpoints
const requireAuth = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized: missing or invalid token' });
  next();
};

const requireAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized: missing or invalid token' });
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Forbidden: admin only' });
  next();
};

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

const normalizeEmail = email => String(email || '').trim().toLowerCase();

const DEFAULT_ADMIN_EMAIL = normalizeEmail(process.env.ADMIN_EMAIL || 'tejuavi27913@gmail.com');
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Awini@27';

const seedAdmin = () => {
  const email = DEFAULT_ADMIN_EMAIL;
  const existing = db.prepare('SELECT id FROM users WHERE LOWER(email) = ?').get(email);
  const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASSWORD, 12);
  if (existing) {
    db.prepare(`
      UPDATE users
      SET full_name = ?, password_hash = ?, role = 'admin', status = 'active'
      WHERE LOWER(email) = ?
    `).run('Admin User', passwordHash, email);
    return;
  }

  db.prepare(`
    INSERT INTO users (full_name, email, password_hash, role, status, admin_id, organization_name)
    VALUES (?, ?, ?, 'admin', 'active', ?, ?)
  `).run('Admin User', email, passwordHash, 'ADMIN-001', 'AI Smart Surveillance');
};

seedAdmin();

const addAudit = (userId, action, module) => {
  db.prepare('INSERT INTO audit_logs (user_id, action, module) VALUES (?, ?, ?)').run(userId || null, action, module);
};

const loginHandler = role => (req, res) => run(res, async () => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

  const sql = role
    ? 'SELECT * FROM users WHERE (LOWER(email) = ? OR admin_id = ? OR employee_id = ?) AND role = ?'
    : 'SELECT * FROM users WHERE LOWER(email) = ? OR admin_id = ? OR employee_id = ?';
  const user = role
    ? db.prepare(sql).get(normalizedEmail, normalizedEmail, normalizedEmail, role)
    : db.prepare(sql).get(normalizedEmail, normalizedEmail, normalizedEmail);

  if (!user) {
    const account = db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR admin_id = ? OR employee_id = ?').get(normalizedEmail, normalizedEmail, normalizedEmail);
    if (account && role === 'user' && account.role === 'admin') {
      return res.status(401).json({ success: false, message: 'This email belongs to an admin. Please use the admin login page.' });
    }
    if (account && role === 'admin' && account.role === 'user') {
      return res.status(401).json({ success: false, message: 'This email is registered as a normal user. Please use the user login page.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid email or password' });
  if (user.status !== 'active') return res.status(403).json({ success: false, message: 'Account is inactive' });

  addAudit(user.id, 'LOGIN', 'AUTH');
  res.json({ success: true, message: 'Login successful', token: signToken(user), user: publicUser(user) });
});

const registerUser = (role = 'user') => (req, res) => run(res, () => {
  const {
    name,
    fullName,
    full_name,
    email,
    password,
    phoneNumber,
    phone_number,
    employeeId,
    employee_id,
    department,
    assignedArea,
    assigned_area,
    organizationName,
    organization_name,
    adminId,
    admin_id,
    profilePhoto,
    profile_photo
  } = req.body;

  const displayName = name || fullName || full_name;
  const normalizedEmail = normalizeEmail(email);
  if (!displayName || !normalizedEmail || !password) return res.status(400).json({ success: false, message: 'Full name, email and password are required' });

  const existing = db.prepare('SELECT id, role FROM users WHERE LOWER(email) = ? OR admin_id = ? OR employee_id = ?').get(normalizedEmail, adminId || admin_id || '', employeeId || employee_id || '');
  if (existing) {
    const message = existing.role === 'admin'
      ? 'This email is already registered as an admin. Please use the admin login page or choose a different email.'
      : 'Email or ID already exists';
    return res.status(409).json({ success: false, message });
  }

  const result = db.prepare(`
    INSERT INTO users (
      full_name, email, phone_number, role, admin_id, employee_id, department,
      assigned_area, organization_name, password_hash, profile_photo, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
  `).run(
    displayName,
    normalizedEmail,
    phoneNumber || phone_number || null,
    role,
    adminId || admin_id || null,
    employeeId || employee_id || null,
    department || null,
    assignedArea || assigned_area || null,
    organizationName || organization_name || null,
    bcrypt.hashSync(password, 12),
    profilePhoto || profile_photo || null
  );

  addAudit(req.user?.id || result.lastInsertRowid, `${role.toUpperCase()}_REGISTER`, 'AUTH');
  res.status(201).json({ success: true, message: `${role === 'admin' ? 'Admin' : 'User'} registered successfully`, id: result.lastInsertRowid });
});

app.post('/api/auth/login', loginHandler(null));
app.post('/api/auth/register', registerUser('user'));
app.post('/api/admin/login', loginHandler('admin'));
app.post('/api/user/login', loginHandler('user'));
app.post('/api/admin/register', requireAdmin, registerUser('admin'));
app.post('/api/user/register', requireAuth, registerUser('user'));

app.get('/api/users', (_req, res) => run(res, () => {
  const users = db.prepare(`
    SELECT id, full_name, email, phone_number, role, employee_id, department, assigned_area, status, created_at
    FROM users
    WHERE role != 'admin'
    ORDER BY created_at DESC
  `).all();
  res.json({ success: true, data: users });
}));

app.post('/api/users', requireAuth, registerUser('user'));

app.get('/api/users/:id', (req, res) => run(res, () => {
  const user = db.prepare(`
    SELECT id, full_name, email, phone_number, role, admin_id, employee_id, department, assigned_area,
           organization_name, profile_photo, status, created_at
    FROM users WHERE id = ?
  `).get(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
}));

app.put('/api/users/:id', (req, res) => run(res, () => {
  const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'User not found' });

  const fullName = req.body.fullName || req.body.full_name || existing.full_name;
  const email = req.body.email || existing.email;
  const status = req.body.status ? normalizeStatus(req.body.status) : existing.status;

  db.prepare(`
    UPDATE users
    SET full_name = ?, email = ?, phone_number = ?, department = ?, assigned_area = ?, status = ?, profile_photo = ?
    WHERE id = ?
  `).run(
    fullName,
    email,
    req.body.phoneNumber || req.body.phone_number || existing.phone_number,
    req.body.department || existing.department,
    req.body.assignedArea || req.body.assigned_area || existing.assigned_area,
    status,
    req.body.profilePhoto || req.body.profile_photo || existing.profile_photo,
    req.params.id
  );

  addAudit(req.user?.id, 'UPDATE_USER', 'USERS');
  res.json({ success: true, message: 'User updated successfully' });
}));

app.delete('/api/users/:id', (req, res) => run(res, () => {
  const result = db.prepare("DELETE FROM users WHERE id = ? AND role != 'admin'").run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'User not found' });
  addAudit(req.user?.id, 'DELETE_USER', 'USERS');
  res.json({ success: true, message: 'User deleted successfully' });
}));

// User dashboard summary for the logged-in user
app.get('/api/user/dashboard', requireAuth, (req, res) => run(res, () => {
  const userId = req.user.id;
  const cameras = db.prepare(`
    SELECT c.* FROM cameras c
    JOIN camera_assignments ca ON ca.camera_id = c.id
    WHERE ca.user_id = ?
  `).all(userId);

  const alerts = db.prepare(`
    SELECT a.* FROM alerts a
    WHERE a.camera_id IN (SELECT camera_id FROM camera_assignments WHERE user_id = ?)
    ORDER BY a.created_at DESC
    LIMIT 25
  `).all(userId);

  res.json({ success: true, data: { cameras, alerts } });
}));

// Get cameras assigned to a specific user
app.get('/api/users/:id/cameras', requireAuth, (req, res) => run(res, () => {
  const id = Number(req.params.id);
  const cameras = db.prepare(`
    SELECT c.* FROM cameras c
    JOIN camera_assignments ca ON ca.camera_id = c.id
    WHERE ca.user_id = ?
  `).all(id);
  res.json({ success: true, data: cameras });
}));

app.get('/api/cameras', (_req, res) => run(res, () => {
  const cameras = db.prepare('SELECT * FROM cameras ORDER BY id ASC').all();
  res.json({ success: true, data: cameras });
}));

app.post('/api/cameras', requireAuth, (req, res) => run(res, () => {
  const { camera_name, cameraName, location, ip_address, ipAddress, stream_url, streamUrl, camera_type, cameraType, status, storage_used } = req.body;
  const name = camera_name || cameraName;
  if (!name || !location) return res.status(400).json({ success: false, message: 'Camera name and location are required' });

  const result = db.prepare(`
    INSERT INTO cameras (camera_name, location, ip_address, stream_url, camera_type, status, storage_used)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    name,
    location,
    ip_address || ipAddress || null,
    stream_url || streamUrl || '/videos/normal.mp4',
    camera_type || cameraType || 'IP',
    normalizeStatus(status || 'online', ['online', 'offline', 'maintenance']),
    storage_used || '0 GB'
  );

  addAudit(req.user?.id, 'CREATE_CAMERA', 'CAMERAS');
  res.status(201).json({ success: true, message: 'Camera added successfully', id: result.lastInsertRowid });
}));

app.put('/api/cameras/:id', requireAuth, (req, res) => run(res, () => {
  const existing = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Camera not found' });

  db.prepare(`
    UPDATE cameras
    SET camera_name = ?, location = ?, ip_address = ?, stream_url = ?, camera_type = ?, status = ?, storage_used = ?
    WHERE id = ?
  `).run(
    req.body.camera_name || req.body.cameraName || existing.camera_name,
    req.body.location || existing.location,
    req.body.ip_address || req.body.ipAddress || existing.ip_address,
    req.body.stream_url || req.body.streamUrl || existing.stream_url,
    req.body.camera_type || req.body.cameraType || existing.camera_type,
    normalizeStatus(req.body.status || existing.status, ['online', 'offline', 'maintenance']),
    req.body.storage_used || existing.storage_used,
    req.params.id
  );

  addAudit(req.user?.id, 'UPDATE_CAMERA', 'CAMERAS');
  res.json({ success: true, message: 'Camera updated successfully' });
}));

app.delete('/api/cameras/:id', requireAuth, (req, res) => run(res, () => {
  const result = db.prepare('DELETE FROM cameras WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Camera not found' });
  addAudit(req.user?.id, 'DELETE_CAMERA', 'CAMERAS');
  res.json({ success: true, message: 'Camera deleted successfully' });
}));

app.get('/api/alerts', (_req, res) => run(res, () => {
  const alerts = db.prepare(`
    SELECT a.*, c.camera_name, c.stream_url
    FROM alerts a
    LEFT JOIN cameras c ON a.camera_id = c.id
    ORDER BY a.created_at DESC
  `).all();
  res.json({ success: true, data: alerts });
}));

app.put('/api/alerts/:id', requireAuth, (req, res) => run(res, () => {
  const status = normalizeStatus(req.body.status || 'viewed', ['new', 'open', 'viewed', 'closed', 'resolved']);
  const result = db.prepare('UPDATE alerts SET status = ? WHERE id = ?').run(status, req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Alert not found' });
  addAudit(req.user?.id, `UPDATE_ALERT_${status.toUpperCase()}`, 'ALERTS');
  res.json({ success: true, message: 'Alert updated successfully' });
}));

app.delete('/api/alerts/:id', requireAuth, (req, res) => run(res, () => {
  const result = db.prepare('DELETE FROM alerts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ success: false, message: 'Alert not found' });
  addAudit(req.user?.id, 'DELETE_ALERT', 'ALERTS');
  res.json({ success: true, message: 'Alert deleted successfully' });
}));

app.get('/api/face-logs', (_req, res) => run(res, () => {
  const logs = db.prepare(`
    SELECT f.*, c.camera_name, c.location
    FROM face_recognition_logs f
    LEFT JOIN cameras c ON f.camera_id = c.id
    ORDER BY f.detected_at DESC
  `).all();
  res.json({ success: true, data: logs });
}));

app.get('/api/reports', (_req, res) => run(res, () => {
  const reports = db.prepare(`
    SELECT r.*, u.full_name AS generated_by_name
    FROM reports r
    LEFT JOIN users u ON r.generated_by = u.id
    ORDER BY r.created_at DESC
  `).all();
  res.json({ success: true, data: reports });
}));

app.post('/api/reports', requireAuth, (req, res) => run(res, () => {
  const reportName = req.body.report_name || req.body.reportName || `${req.body.report_type || 'Security'} Report`;
  const reportType = req.body.report_type || req.body.reportType || 'Daily';
  const fileName = `report_${Date.now()}.txt`;
  const reportsDir = path.join(__dirname, 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, fileName), `${reportName}\nGenerated ${new Date().toISOString()}\n`);

  const result = db.prepare(`
    INSERT INTO reports (report_name, report_type, report_file, generated_by)
    VALUES (?, ?, ?, ?)
  `).run(reportName, reportType, `/reports/${fileName}`, req.body.generated_by || req.user?.id || 1);

  addAudit(req.user?.id, 'GENERATE_REPORT', 'REPORTS');
  res.status(201).json({ success: true, message: 'Report generated successfully', id: result.lastInsertRowid });
}));

app.get('/api/audit-logs', (req, res) => run(res, () => {
  const moduleFilter = req.query.module;
  const logs = moduleFilter
    ? db.prepare(`
        SELECT a.*, u.full_name AS user_name
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        WHERE a.module = ?
        ORDER BY a.timestamp DESC
        LIMIT 200
      `).all(moduleFilter)
    : db.prepare(`
        SELECT a.*, u.full_name AS user_name
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.timestamp DESC
        LIMIT 200
      `).all();
  res.json({ success: true, data: logs });
}));

app.get('/api/system-health', (_req, res) => run(res, () => {
  const health = db.prepare('SELECT * FROM system_health ORDER BY recorded_at DESC LIMIT 24').all();
  res.json({ success: true, data: health });
}));

app.get('/api/dashboard/stats', (_req, res) => run(res, () => {
  const totalCameras = db.prepare('SELECT COUNT(*) AS count FROM cameras').get().count;
  const activeAlerts = db.prepare("SELECT COUNT(*) AS count FROM alerts WHERE status IN ('new', 'open')").get().count;
  const threatsDetected = db.prepare('SELECT COUNT(*) AS count FROM alerts').get().count;
  const totalUsers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'user'").get().count;
  const onlineUsers = db.prepare("SELECT COUNT(*) AS count FROM users WHERE role = 'user' AND status = 'active'").get().count;
  const recentAlerts = db.prepare(`
    SELECT a.*, c.camera_name
    FROM alerts a
    LEFT JOIN cameras c ON a.camera_id = c.id
    ORDER BY a.created_at DESC
    LIMIT 5
  `).all();
  const liveCameras = db.prepare("SELECT * FROM cameras WHERE status = 'online' ORDER BY id ASC LIMIT 8").all();
  res.json({ success: true, data: { totalCameras, activeAlerts, threatsDetected, totalUsers, onlineUsers, recentAlerts, liveCameras } });
}));

app.get('/api/analytics', (_req, res) => run(res, () => {
  const alerts = db.prepare(`
    SELECT COUNT(*) AS total,
           SUM(CASE WHEN status IN ('new', 'open') THEN 1 ELSE 0 END) AS active,
           SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolved,
           SUM(CASE WHEN priority = 'critical' THEN 1 ELSE 0 END) AS critical,
           SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) AS high
    FROM alerts
  `).get();
  const cameras = db.prepare(`
    SELECT COUNT(*) AS total,
           SUM(CASE WHEN status = 'online' THEN 1 ELSE 0 END) AS online,
           SUM(CASE WHEN status = 'offline' THEN 1 ELSE 0 END) AS offline,
           SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance
    FROM cameras
  `).get();
  const threats = db.prepare(`
    SELECT threat_type, COUNT(*) AS count
    FROM alerts
    GROUP BY threat_type
    ORDER BY count DESC
  `).all();
  const trends = db.prepare(`
    SELECT strftime('%H:00', created_at) AS date, COUNT(*) AS threats
    FROM alerts
    GROUP BY strftime('%Y-%m-%d %H', created_at)
    ORDER BY MIN(created_at)
    LIMIT 24
  `).all();
  const cameraActivity = db.prepare(`
    SELECT c.camera_name AS name, COUNT(a.id) AS activity
    FROM cameras c
    LEFT JOIN alerts a ON a.camera_id = c.id
    GROUP BY c.id
    ORDER BY activity DESC, c.id ASC
  `).all();
  const users = db.prepare("SELECT COUNT(*) AS total_users FROM users WHERE role = 'user'").get();

  res.json({ success: true, data: { alerts, cameras, threats, trends, cameraActivity, users } });
}));

const videoThreatMap = {
  'normal.mp4': { threat_type: 'Normal Activity', priority: 'low', alert: false },
  'burglary.mp4': { threat_type: 'Intrusion Detected', priority: 'critical', alert: true },
  'fighting.mp4': { threat_type: 'Suspicious Activity', priority: 'high', alert: true },
  'robbery.mp4': { threat_type: 'Weapon Detected', priority: 'critical', alert: true },
  'vandalism.mp4': { threat_type: 'Property Damage', priority: 'medium', alert: true }
};

const inferVideoFile = camera => {
  const source = `${camera.camera_name || ''} ${camera.location || ''} ${camera.stream_url || ''}`.toLowerCase();
  if (source.includes('warehouse') || source.includes('burglary')) return 'burglary.mp4';
  if (source.includes('parking') || source.includes('fighting')) return 'fighting.mp4';
  if (source.includes('cash') || source.includes('robbery')) return 'robbery.mp4';
  if (source.includes('property') || source.includes('vandal')) return 'vandalism.mp4';
  return 'normal.mp4';
};

app.get('/api/video-cameras', (_req, res) => run(res, () => {
  const cameras = db.prepare('SELECT * FROM cameras ORDER BY id ASC').all();
  const data = cameras.map(camera => {
    const video_file = inferVideoFile(camera);
    return {
      ...camera,
      video_file,
      videoUrl: `/videos/${video_file}`,
      threatInfo: videoThreatMap[video_file]
    };
  });
  res.json({ success: true, data });
}));

app.post('/api/simulate-detection/:cameraId', requireAuth, (req, res) => run(res, () => {
  const camera = db.prepare('SELECT * FROM cameras WHERE id = ?').get(req.params.cameraId);
  if (!camera) return res.status(404).json({ success: false, message: 'Camera not found' });

  const videoFile = inferVideoFile(camera);
  const detection = videoThreatMap[videoFile];
  let alertId = null;
  if (detection.alert) {
    const result = db.prepare(`
      INSERT INTO alerts (camera_id, threat_type, location, priority, status, evidence_image)
      VALUES (?, ?, ?, ?, 'new', ?)
    `).run(camera.id, detection.threat_type, camera.location, normalizePriority(detection.priority), `/evidence/${videoFile.replace('.mp4', '.jpg')}`);
    alertId = result.lastInsertRowid;
  }

  db.prepare(`
    INSERT INTO detection_logs (camera_id, detection_type, confidence, metadata)
    VALUES (?, ?, ?, ?)
  `).run(camera.id, detection.threat_type, detection.alert ? 0.96 : 0.99, JSON.stringify({ video: videoFile, simulated: true }));
  addAudit(req.user?.id || 1, `AI Detection: ${detection.threat_type}`, 'AI Detection');

  res.json({
    success: true,
    detection: {
      camera_id: camera.id,
      camera_name: camera.camera_name,
      threat_type: detection.threat_type,
      priority: detection.priority,
      video_file: videoFile,
      alert_created: detection.alert,
      alert_id: alertId,
      timestamp: new Date().toISOString()
    }
  });
}));

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok', message: 'AI Surveillance Backend Running' });
});

app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
  if (!process.env.JWT_SECRET || JWT_SECRET === 'change-this-secret-before-production') {
    console.warn('WARNING: JWT_SECRET is using the default value. Set JWT_SECRET in environment for production.');
  }
});
