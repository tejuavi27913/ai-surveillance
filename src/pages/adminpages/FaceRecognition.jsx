import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, Upload, CheckCircle, XCircle, 
  User, UserCheck, UserX, Target, Upload as UploadIcon
} from 'lucide-react';

const FaceRecognition = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('All Faces');
  
  // ✅ Dynamic state
  const [faceLogs, setFaceLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch face logs from backend
 useEffect(() => {
  const fetchFaceLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/face-logs', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to load face logs');
      setFaceLogs(result.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load face recognition logs');
    } finally {
      setLoading(false);
    }
  };
  fetchFaceLogs();
}, []);

  // ✅ Calculate dynamic stats
  const totalDetections = faceLogs.length;
  const recognizedFacesCount = faceLogs.filter(log => log.person_name && log.person_name !== 'Unknown').length;
  const unknownFacesCount = faceLogs.filter(log => !log.person_name || log.person_name === 'Unknown').length;
  
  // Unique registered faces
  const registeredFacesCount = new Set(
    faceLogs.filter(log => log.person_name && log.person_name !== 'Unknown').map(log => log.person_name)
  ).size;

  // Accuracy calculation (based on confidence >= 80%)
  const highConfidenceCount = faceLogs.filter(log => log.confidence >= 80).length;
  const accuracy = totalDetections > 0 ? ((highConfidenceCount / totalDetections) * 100).toFixed(1) : 0;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 0, path: '/admin/alerts' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'face-recognition', label: 'Face Recognition', icon: ScanFace, path: '/admin/face-recognition', active: true },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch, path: '/admin/audit-logs' },
    { id: 'system-health', label: 'System Health', icon: Activity, path: '/admin/system-health' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Face Recognition Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-[#0f172a] border-r border-white/10 transition-all duration-300 z-50 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <Shield className="text-emerald-400" size={24} />
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="text-lg font-bold">AI SURVEILLANCE</h1>
                <p className="text-xs text-gray-400">Smart Security System</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                location.pathname === item.path 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  {item.badge > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
                </>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 shrink-0">
          <button 
            onClick={() => {
              localStorage.clear();
              navigate('/admin/login');
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="bg-[#0f172a] border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white cursor-pointer">
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold">FACE RECOGNITION</h1>
                <p className="text-xs text-gray-400">Monitor facial recognition system</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Search faces..." className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell size={20} className="text-gray-400" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-gray-400">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <User className="text-blue-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Registered Faces</p>
              <h3 className="text-2xl font-bold">{registeredFacesCount}</h3>
              <p className="text-xs text-gray-500">All Time</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <UserX className="text-red-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Unknown Faces</p>
              <h3 className="text-2xl font-bold text-red-400">{unknownFacesCount}</h3>
              <p className="text-xs text-red-400">Total Detections</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <UserCheck className="text-green-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Recognized Faces</p>
              <h3 className="text-2xl font-bold text-green-400">{recognizedFacesCount}</h3>
              <p className="text-xs text-green-400">{totalDetections > 0 ? ((recognizedFacesCount/totalDetections)*100).toFixed(1) : 0}% of total</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Target className="text-purple-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Recognition Accuracy</p>
              <h3 className="text-2xl font-bold text-purple-400">{accuracy}%</h3>
              <p className="text-xs text-purple-400">High Confidence</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Upload Face */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Upload Face</h3>
              <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-8 text-center hover:border-blue-500/50 transition-colors cursor-pointer">
                <UploadIcon className="mx-auto mb-3 text-blue-400" size={32} />
                <p className="text-sm text-gray-400 mb-2">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                <button className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                  Upload
                </button>
              </div>
            </div>

            {/* Search Face */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Search Face</h3>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input type="text" placeholder="Search by name or ID..." className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-2 block">Detection Filter</label>
                  <div className="flex space-x-2">
                    <select className="flex-1 bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
                      <option>All Cameras</option>
                    </select>
                    <select className="flex-1 bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
                      <option>All Time</option>
                      <option>Today</option>
                      <option>This Week</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Detections */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Recent Detections</h3>
              {faceLogs.length > 0 ? (
                <div className="space-y-3 max-h-[200px] overflow-y-auto">
                  {faceLogs.slice(0, 6).map((log, index) => (
                    <div key={log.id || index} className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                          {(log.person_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{log.person_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-400">{log.camera_name || log.location || 'N/A'}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-medium ${log.confidence >= 80 ? 'text-green-400' : 'text-red-400'}`}>
                        {log.confidence ? `${log.confidence}%` : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <ScanFace className="mx-auto mb-2 opacity-50" size={32} />
                    <p className="text-sm">No detections yet</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Face Detection Logs Table */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold">Face Detection Logs</h3>
            </div>
            
            {faceLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1e293b]">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Face</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Name / ID</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Camera</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Confidence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {faceLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                            {(log.person_name || 'U').charAt(0).toUpperCase()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-white">{log.person_name || 'Unknown'}</p>
                            <p className="text-xs text-gray-400">ID: {log.id}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{log.camera_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{log.location || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {log.detected_at ? new Date(log.detected_at).toLocaleString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-sm font-medium ${log.confidence >= 80 ? 'text-green-400' : log.confidence ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {log.confidence ? `${log.confidence}%` : '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl m-4">
                <ScanFace className="mx-auto mb-3 text-gray-600" size={48} />
                <p className="text-gray-400 text-lg font-medium mb-2">No face detections logged</p>
                <p className="text-sm text-gray-500">System is actively monitoring</p>
              </div>
            )}
          </div>

          {/* Recognition Accuracy */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Recognition Accuracy</h3>
                <p className="text-sm text-gray-400">Based on all logged detections</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-400">{accuracy}%</p>
                  <p className="text-sm text-green-400">High Accuracy</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default FaceRecognition;
