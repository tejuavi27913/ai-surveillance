import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, ChevronLeft, ChevronRight, CheckCircle, XCircle
} from 'lucide-react';

const AuditLogs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch audit logs from backend
  useEffect(() => {
  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/audit-logs', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to load audit logs');
      setLogs(result.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load audit logs');
    } finally {
      setLoading(false);
    }
  };
  fetchLogs();
}, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 0, path: '/admin/alerts' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'face-recognition', label: 'Face Recognition', icon: ScanFace, path: '/admin/face-recognition' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch, path: '/admin/audit-logs', active: true },
    { id: 'system-health', label: 'System Health', icon: Activity, path: '/admin/system-health' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Audit Logs...</div>
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
        <header className="sticky top-0 z-40 bg-[#0b1120]/90 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white cursor-pointer">
              <Menu size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold">AUDIT LOGS</h2>
              <p className="text-sm text-gray-400">View system activity and audit logs</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="Search logs..." 
                className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64" 
              />
            </div>
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden">
            {logs.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1e293b] border-b border-white/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date & Time</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">IP Address</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {logs.slice(0, 50).map((log, index) => (
                        <tr key={log.id || index} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-300 whitespace-nowrap">
                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-white font-medium">
                            {log.user_name || `User #${log.user_id}`}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{log.action}</td>
                          <td className="px-6 py-4 text-sm text-gray-400">{log.module || 'System'}</td>
                          <td className="px-6 py-4 text-sm text-gray-400 font-mono">{log.ip_address || '127.0.0.1'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium gap-1.5 ${
                              log.status === 'Failed' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {log.status === 'Failed' ? <XCircle size={12} /> : <CheckCircle size={12} />}
                              {log.status || 'Success'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-sm text-gray-400">Showing 1 to {Math.min(logs.length, 50)} of {logs.length} logs</p>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <ChevronLeft size={18} />
                    </button>
                    <button className="w-8 h-8 rounded-lg text-sm font-medium bg-blue-600 text-white">1</button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl m-4">
                <FileSearch className="mx-auto mb-3 text-gray-600" size={48} />
                <p className="text-gray-400 text-lg font-medium mb-2">No audit logs found</p>
                <p className="text-sm text-gray-500">System activity will be recorded here</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditLogs;
