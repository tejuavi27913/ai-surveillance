import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, Calendar, ChevronDown,
  AlertTriangle, Flame, Users as UsersIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';

const Analytics = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');
    

  // ✅ Fetch analytics data from backend
 useEffect(() => {
  const fetchAnalytics = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/analytics', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to load analytics');
      setAnalytics(result.data);
    } catch (err) {
      setError(err.message || 'Unable to load analytics');
    } finally {
      setLoading(false);
    }
  };
  fetchAnalytics();
}, []);

  const colors = ['#ef4444', '#f59e0b', '#eab308', '#3b82f6', '#22c55e', '#8b5cf6'];
  const analyticsData = {
    threats: analytics?.trends?.length ? analytics.trends : [{ date: 'No Data', threats: 0 }],
    distribution: analytics?.threats?.length
      ? analytics.threats.map((item, index) => ({
          name: item.threat_type,
          value: Number(item.count || 0),
          color: colors[index % colors.length]
        }))
      : [{ name: 'No Data', value: 1, color: '#334155' }],
    cameras: analytics?.cameraActivity?.length
      ? analytics.cameraActivity.map(item => ({ name: item.name, activity: Number(item.activity || 0) }))
      : [{ name: 'No Cameras', activity: 0 }]
  };

  // ✅ Calculate dynamic stats
  const totalThreats = analyticsData.distribution.reduce((acc, curr) => acc + (curr.value || 0), 0);
  const intrusions = analyticsData.distribution.find(d => d.name.toLowerCase().includes('intrusion'))?.value || 0;
  const unknownFaces = analyticsData.distribution.find(d => d.name.toLowerCase().includes('face'))?.value || 0;
  const fireAlerts = analyticsData.distribution.find(d => d.name.toLowerCase().includes('fire'))?.value || 0;
  const crowdDetected = analyticsData.distribution.find(d => d.name.toLowerCase().includes('crowd'))?.value || 0;

  // ✅ Safe fallbacks for charts (prevents Recharts width/height errors)
  const safeThreats = analyticsData.threats.length > 0 ? analyticsData.threats : [{ date: 'No Data', threats: 0 }];
  const safeDistribution = analyticsData.distribution.length > 0 ? analyticsData.distribution : [{ name: 'No Data', value: 1, color: '#334155' }];
  const safeCameras = analyticsData.cameras.length > 0 ? analyticsData.cameras : [{ name: 'No Cameras', activity: 0 }];
  const maxActivity = Math.max(...safeCameras.map(c => c.activity), 1);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 0, path: '/admin/alerts' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'face-recognition', label: 'Face Recognition', icon: ScanFace, path: '/admin/face-recognition' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics', active: true },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch, path: '/admin/audit-logs' },
    { id: 'system-health', label: 'System Health', icon: Activity, path: '/admin/system-health' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Analytics...</div>
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
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white cursor-pointer"><Menu size={24} /></button>
            <div>
              <h2 className="text-xl font-bold">ANALYTICS</h2>
              <p className="text-sm text-gray-400">View analytics and security insights</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-sm text-gray-300">
            <Calendar size={16} /><span>All Time</span><ChevronDown size={16} />
          </div>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Threats Detected', value: totalThreats, sub: totalThreats > 0 ? 'Active' : 'None', icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/20' },
              { label: 'Intrusions', value: intrusions, sub: intrusions > 0 ? 'Detected' : 'None', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/20' },
              { label: 'Unknown Faces', value: unknownFaces, sub: unknownFaces > 0 ? 'Detected' : 'None', icon: UsersIcon, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
              { label: 'Fire Alerts', value: fireAlerts, sub: fireAlerts > 0 ? 'Detected' : 'None', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-500/20' },
              { label: 'Crowd Detected', value: crowdDetected, sub: crowdDetected > 0 ? 'Detected' : 'None', icon: UsersIcon, color: 'text-green-400', bg: 'bg-green-500/20' },
            ].map((card, i) => (
              <div key={i} className="bg-[#0f172a] border border-white/10 rounded-xl p-4 cursor-pointer hover:border-white/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                    <card.icon className={card.color} size={20} />
                  </div>
                </div>
                <p className="text-gray-400 text-xs mb-1">{card.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  <p className={`text-xs ${card.value > 0 ? 'text-green-400' : 'text-gray-500'}`}>{card.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Threats Over Time */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Threats Overview</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={safeThreats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="threats" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Threat Distribution */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Threat Distribution</h3>
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={safeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {safeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    <Legend layout="vertical" align="right" verticalAlign="middle" formatter={(value, entry) => {
                      const item = safeDistribution.find(t => t.name === value);
                      const pct = totalThreats > 0 ? ((item?.value / totalThreats) * 100).toFixed(1) : 0;
                      return <span className="text-gray-400 text-sm">{value} - {pct}%</span>;
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Camera Activity & Top Cameras */}
          <div className="grid grid-cols-2 gap-6">
            {/* Camera Activity */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Camera Activity</h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={safeCameras}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="activity" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Active Cameras */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Top Active Cameras</h3>
              <div className="space-y-4 mt-8">
                {safeCameras.map((cam, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-300">{cam.name}</span>
                      <span className="text-gray-400">{cam.activity}</span>
                    </div>
                    <div className="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${(cam.activity / maxActivity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {safeCameras[0]?.name === 'No Cameras' && (
                  <p className="text-center text-gray-500 text-sm mt-4">No camera activity data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analytics;
