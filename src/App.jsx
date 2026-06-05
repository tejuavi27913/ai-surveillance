import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages (from authpages folder)
import AdminLogin from './pages/authpages/AdminLogin';
import UserLogin from './pages/authpages/UserLogin';
import AdminRegister from './pages/authpages/AdminRegister';
import UserRegister from './pages/authpages/UserRegister';
import HomePage from './pages/authpages/HomePage';

// Admin Pages (from adminpages folder)
import AdminDashboard from './pages/adminpages/AdminDashboard';
import AlertsAdmin from './pages/adminpages/AlertsAdmin';
import ReportsAdmin from './pages/adminpages/ReportsAdmin';
import UsersAdmin from './pages/adminpages/UsersAdmin';
import Cameras from './pages/adminpages/Cameras';
import FaceRecognition from './pages/adminpages/FaceRecognition';
import Analytics from './pages/adminpages/Analytics';
import Settings from './pages/adminpages/Settings';
import AuditLogs from './pages/adminpages/AuditLogs';
import SystemHealth from './pages/adminpages/SystemHealth';

// User Pages (from userpages folder)
import UserDashboard from './pages/userpages/UserDashboard';
import LiveMonitoringUser from './pages/userpages/LiveMonitoring';
import AlertsUser from './pages/userpages/Alerts';
import ReportsUser from './pages/userpages/Reports';
import Profile from './pages/userpages/Profile';
import EditProfile from './pages/userpages/EditProfile';
import VideoMonitoring from './pages/adminpages/VideoMonitoring';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
};

const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.clear();
      return false;
    }
    return true;
  } catch {
    localStorage.clear();
    return false;
  }
};

const ProtectedRoute = ({ children, role }) => {
  const user = getStoredUser();
  if (!isTokenValid() || !user) {
    return <Navigate to={role === 'admin' ? '/admin/login' : '/user/login'} replace />;
  }
  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'} replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/admin/register" element={<AdminRegister />} />
        <Route path="/user/register" element={<UserRegister />} />
        
        {/* User Routes */}
        <Route path="/user/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/user/monitoring" element={<ProtectedRoute role="user"><LiveMonitoringUser /></ProtectedRoute>} />
        <Route path="/user/alerts" element={<ProtectedRoute role="user"><AlertsUser /></ProtectedRoute>} />
        <Route path="/user/reports" element={<ProtectedRoute role="user"><ReportsUser /></ProtectedRoute>} />
        <Route path="/user/profile" element={<ProtectedRoute role="user"><Profile /></ProtectedRoute>} />
        <Route path="/user/edit-profile" element={<ProtectedRoute role="user"><EditProfile /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/live-monitoring" element={<ProtectedRoute role="admin"><VideoMonitoring /></ProtectedRoute>} />
        <Route path="/admin/cameras" element={<ProtectedRoute role="admin"><Cameras /></ProtectedRoute>} />
        <Route path="/admin/alerts" element={<ProtectedRoute role="admin"><AlertsAdmin /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute role="admin"><UsersAdmin /></ProtectedRoute>} />
        <Route path="/admin/face-recognition" element={<ProtectedRoute role="admin"><FaceRecognition /></ProtectedRoute>} />
        <Route path="/admin/reports" element={<ProtectedRoute role="admin"><ReportsAdmin /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><Analytics /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute role="admin"><AuditLogs /></ProtectedRoute>} />
        <Route path="/admin/system-health" element={<ProtectedRoute role="admin"><SystemHealth /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
