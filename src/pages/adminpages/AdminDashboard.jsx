import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, AlertTriangle, Flame, 
  Users as UsersIcon, Brain, Database, HardDrive, Cloud, Mail
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // ✅ 1. Initialize with ZERO/EMPTY data
  const [dashboardData, setDashboardData] = useState({
    totalCameras: 0,
    activeAlerts: 0,
    threatsDetected: 0,
    totalUsers: 0,
    onlineUsers: 0,
    recentAlerts: [],
    liveCameras: []
  });
  const [loading, setLoading] = useState(true);

  // ✅ 2. Fetch REAL data from backend on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ✅ 3. Helper to map threat types to icons
  const getAlertIcon = (type) => {
    if (type?.includes('Intrusion')) return Shield;
    if (type?.includes('Face')) return ScanFace;
    if (type?.includes('Fire')) return Flame;
    if (type?.includes('Crowd')) return UsersIcon;
    return AlertTriangle;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', active: true },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: dashboardData.activeAlerts, path: '/admin/alerts' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'face-recognition', label: 'Face Recognition', icon: ScanFace, path: '/admin/face-recognition' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch, path: '/admin/audit-logs' },
    { id: 'system-health', label: 'System Health', icon: Activity, path: '/admin/system-health' },
  ];

  // ✅ 4. Dynamic Stats (Shows 0 if empty, design remains intact)
  const stats = [
    { title: 'Total Cameras', value: dashboardData.totalCameras.toString(), subtext: dashboardData.totalCameras > 0 ? 'Active' : 'None added yet', icon: Camera, color: 'bg-blue-500' },
    { title: 'Active Alerts', value: dashboardData.activeAlerts.toString(), subtext: dashboardData.activeAlerts > 0 ? 'View all alerts →' : 'No active alerts', icon: Bell, color: 'bg-red-500' },
    { title: 'Threats Detected', value: dashboardData.threatsDetected.toString(), subtext: dashboardData.threatsDetected > 0 ? 'Total threats' : 'None detected', icon: Shield, color: 'bg-orange-500' },
    { title: 'Total Users', value: dashboardData.totalUsers.toString(), subtext: `${dashboardData.onlineUsers} Online`, icon: UsersIcon, color: 'bg-green-500' },
    { title: 'System Uptime', value: '99.9%', subtext: 'Running Smoothly', icon: Activity, color: 'bg-purple-500' },
  ];

  // ✅ 5. Dynamic Cameras (Empty array if none, UI shows "Add Camera" prompt)
  const cameras = dashboardData.liveCameras.map(cam => ({
    id: cam.id,
    name: cam.camera_name,
    location: cam.location,
    status: cam.status === 'online' ? 'live' : 'offline',
    image: cam.stream_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600'
  }));

  // ✅ 6. Dynamic Alerts (Empty array if none)
  const recentAlerts = dashboardData.recentAlerts.map(alert => ({
    id: alert.id,
    type: alert.threat_type,
    location: alert.camera_name || alert.location,
    time: new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    severity: alert.priority === 'critical' || alert.priority === 'high' ? 'High' : alert.priority === 'medium' ? 'Medium' : 'Low',
    icon: getAlertIcon(alert.threat_type)
  }));

  // ✅ 7. Charts Data: ALWAYS rendered, but shows 0/"No Data" when database is empty.
  // When you add real data, these arrays will be populated with real API data.
  const analyticsData = dashboardData.threatsDetected > 0 
    ? [{ date: 'Today', threats: dashboardData.threatsDetected }] 
    : [{ date: 'Day 1', threats: 0 }, { date: 'Day 2', threats: 0 }, { date: 'Day 3', threats: 0 }];

  const threatTypeData = dashboardData.threatsDetected > 0
    ? [{ name: 'Pending Breakdown', value: 100, color: '#6b7280' }]
    : [{ name: 'No Data', value: 100, color: '#334155' }];

  const systemStatus = [
    { name: 'AI Engine', status: 'Online', icon: Brain },
    { name: 'Database', status: 'Online', icon: Database },
    { name: 'Storage', status: 'Available', icon: HardDrive },
    { name: 'All Cameras', status: dashboardData.totalCameras > 0 ? `${dashboardData.liveCameras.length} Online` : '0 Online', icon: Video },
    { name: 'Email Service', status: 'Online', icon: Mail },
    { name: 'Backup', status: 'Online', icon: Cloud },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Dashboard...</div>
        <div className="ml-3 w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white font-sans">
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
              <h2 className="text-xl font-bold">Admin Dashboard</h2>
              <p className="text-sm text-gray-400">Welcome back, Admin!</p>
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input type="text" placeholder="Search anything..." className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64" />
            </div>
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
              <Bell size={20} />
              {dashboardData.activeAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {dashboardData.activeAlerts}
                </span>
                )}
            </button>
            <div className="flex items-center space-x-3 pl-6 border-l border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer">
                <Users size={20} />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium">Admin User</p>
                <p className="text-xs text-gray-400">Super Admin</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-[#0f172a] border border-white/10 rounded-xl p-5 hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.color}/20 flex items-center justify-center`}>
                    <stat.icon className={`${stat.color.replace('bg-', 'text-')}`} size={24} />
                  </div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium mb-1">{stat.title}</h3>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <p className={`text-xs ${stat.value === '0' ? 'text-gray-500' : 'text-green-400'}`}>{stat.subtext}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cameras & Alerts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Live Camera Feeds */}
            <div className="lg:col-span-2 bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Live Camera Feeds</h3>
                <button onClick={() => navigate('/admin/cameras')} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">Manage Cameras</button>
              </div>
              
              {cameras.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {cameras.map((cam) => (
                    <div key={cam.id} className="relative group rounded-lg overflow-hidden bg-black border border-white/10 cursor-pointer">
                      <img src={cam.image} alt={cam.name} className="w-full h-32 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className={`w-2 h-2 rounded-full ${cam.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={cam.status === 'live' ? 'text-green-400' : 'text-red-400'}>{cam.status === 'live' ? 'Live' : 'Offline'}</span>
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-white truncate">{cam.name}</p>
                        <p className="text-xs text-gray-400">{cam.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl">
                  <Camera className="mx-auto mb-3 text-gray-600" size={48} />
                  <p className="text-gray-400 text-lg font-medium">No cameras added yet</p>
                  <button onClick={() => navigate('/admin/cameras')} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                    Add Your First Camera
                  </button>
                </div>
              )}
            </div>

            {/* Recent Alerts */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Recent Alerts</h3>
                <button onClick={() => navigate('/admin/alerts')} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">View All</button>
              </div>
              
              {recentAlerts.length > 0 ? (
                <div className="space-y-4">
                  {recentAlerts.map((alert) => (
                    <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        alert.severity === 'High' ? 'bg-red-500/20' : alert.severity === 'Medium' ? 'bg-orange-500/20' : 'bg-green-500/20'
                      }`}>
                        <alert.icon className={
                          alert.severity === 'High' ? 'text-red-400' : alert.severity === 'Medium' ? 'text-orange-400' : 'text-green-400'
                        } size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{alert.type}</p>
                        <p className="text-xs text-gray-400 truncate">{alert.location}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">{alert.time}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            alert.severity === 'High' ? 'border-red-500/30 text-red-400 bg-red-500/10' :
                            alert.severity === 'Medium' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                            'border-green-500/30 text-green-400 bg-green-500/10'
                          }`}>
                            {alert.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl">
                  <Bell className="mx-auto mb-3 text-gray-600" size={48} />
                  <p className="text-gray-400 text-lg font-medium">No alerts detected</p>
                  <p className="text-sm text-gray-500 mt-1">System is running smoothly</p>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Section: CHARTS ARE ALWAYS RENDERED HERE */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Analytics Chart */}
            <div className="lg:col-span-2 bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Analytics Overview</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                    <defs>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                    <Area type="monotone" dataKey="threats" stroke="#8b5cf6" fill="url(#colorThreats)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Threats by Type Chart */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">Threats by Type</h3>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={threatTypeData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value">
                      {threatTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {threatTypeData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                      <span className="text-gray-300">{item.name}</span>
                    </div>
                    <span className="text-gray-400">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status & Quick Actions */}
            <div className="space-y-6">
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">System Status</h3>
                <div className="space-y-3">
                  {systemStatus.map((sys) => (
                    <div key={sys.name} className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{sys.name}</span>
                      <span className="text-green-400">{sys.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => navigate('/admin/cameras')} className="px-4 py-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium cursor-pointer">
                    Add Camera
                  </button>
                  <button onClick={() => navigate('/admin/users')} className="px-4 py-3 bg-purple-600/20 text-purple-400 rounded-lg hover:bg-purple-600/30 transition-colors text-sm font-medium cursor-pointer">
                    Add User
                  </button>
                  <button onClick={() => navigate('/admin/reports')} className="px-4 py-3 bg-green-600/20 text-green-400 rounded-lg hover:bg-green-600/30 transition-colors text-sm font-medium cursor-pointer">
                    View Reports
                  </button>
                  <button onClick={() => navigate('/admin/settings')} className="px-4 py-3 bg-orange-600/20 text-orange-400 rounded-lg hover:bg-orange-600/30 transition-colors text-sm font-medium cursor-pointer">
                    Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
