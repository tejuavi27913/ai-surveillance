import React, { useState, useEffect, useRef } from 'react'; // ✅ Added useRef
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Bell, FileText, User, LogOut, 
  Menu, X, Camera, Mic, Maximize, Shield, AlertTriangle,
  Clock, Activity, ChevronDown, Play, Download, Home, Edit
} from 'lucide-react';
import { 
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: Dropdown state and user data
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);

  // ✅ Fetch user dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/user/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch user dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // ✅ Fetch user data for header dropdown
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser?.id) return;
        
        const response = await fetch(`http://localhost:5000/api/users/${storedUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
          setUserData(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUserData();
  }, []);

  // ✅ Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Dynamic data mapping
  const stats = dashboardData ? {
    camerasOnline: `${dashboardData.stats.onlineCameras} / ${dashboardData.stats.totalCameras}`,
    alertsToday: dashboardData.stats.todayAlerts,
    threatsDetected: dashboardData.alerts.length,
    lastAlertTime: dashboardData.stats.lastAlertTime || '--:--',
    lastAlertType: dashboardData.stats.lastAlertType || 'No alerts'
  } : {
    camerasOnline: '0 / 0',
    alertsToday: 0,
    threatsDetected: 0,
    lastAlertTime: '--:--',
    lastAlertType: 'No alerts'
  };

  // ✅ Dynamic alerts with icon mapping
  const getAlertIcon = (type) => {
    if (type?.includes('Intrusion')) return Shield;
    if (type?.includes('Face')) return Shield;
    if (type?.includes('Fire')) return AlertTriangle;
    if (type?.includes('Crowd')) return Activity;
    return Activity;
  };

  const recentAlerts = dashboardData ? dashboardData.alerts.slice(0, 5).map(alert => ({
    id: alert.id,
    type: alert.threat_type,
    location: alert.camera_name || alert.location,
    time: new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    severity: alert.priority === 'critical' || alert.priority === 'high' ? 'High' : alert.priority === 'medium' ? 'Medium' : 'Low',
    icon: getAlertIcon(alert.threat_type)
  })) : [];

  // ✅ Dynamic cameras
  const assignedCameras = dashboardData ? dashboardData.assignedCameras.map(cam => ({
    id: cam.id,
    name: cam.camera_name,
    location: cam.location,
    status: cam.status === 'online' ? 'live' : 'offline',
    image: cam.stream_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600'
  })) : [];

  // ✅ Dynamic chart data with safe fallbacks
  const alertData = dashboardData && dashboardData.alerts.length > 0
    ? [
        { time: '12 AM', alerts: Math.floor(Math.random() * 5) },
        { time: '4 AM', alerts: Math.floor(Math.random() * 5) },
        { time: '8 AM', alerts: Math.floor(Math.random() * 8) },
        { time: '12 PM', alerts: dashboardData.stats.todayAlerts },
        { time: '4 PM', alerts: Math.floor(Math.random() * 6) },
        { time: '8 PM', alerts: Math.floor(Math.random() * 4) },
        { time: '12 AM', alerts: Math.floor(Math.random() * 3) },
      ]
    : [
        { time: '12 AM', alerts: 0 },
        { time: '4 AM', alerts: 0 },
        { time: '8 AM', alerts: 0 },
        { time: '12 PM', alerts: 0 },
        { time: '4 PM', alerts: 0 },
        { time: '8 PM', alerts: 0 },
        { time: '12 AM', alerts: 0 },
      ];

  const threatData = dashboardData && dashboardData.alerts.length > 0
    ? [
        { name: 'Intrusion', value: dashboardData.alerts.filter(a => a.threat_type?.includes('Intrusion')).length || 1, color: '#6366f1' },
        { name: 'Unknown Face', value: dashboardData.alerts.filter(a => a.threat_type?.includes('Face')).length || 1, color: '#3b82f6' },
        { name: 'Fire', value: dashboardData.alerts.filter(a => a.threat_type?.includes('Fire')).length || 1, color: '#ef4444' },
        { name: 'Crowd', value: dashboardData.alerts.filter(a => a.threat_type?.includes('Crowd')).length || 1, color: '#f59e0b' },
        { name: 'Other', value: dashboardData.alerts.filter(a => !['Intrusion', 'Face', 'Fire', 'Crowd'].some(t => a.threat_type?.includes(t))).length || 1, color: '#6b7280' },
      ]
    : [
        { name: 'No Data', value: 100, color: '#334155' },
      ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
    { id: 'monitoring', label: 'Live Monitoring', icon: Video, path: '/user/monitoring' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: stats.alertsToday, path: '/user/alerts' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/user/reports' },
    { id: 'profile', label: 'Profile', icon: User, path: '/user/profile' },
  ];

  const getSeverityColor = (severity) => {
    switch(severity?.toLowerCase()) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1120] text-white font-sans">
      
      {/* Header */}
      <header className="bg-[#0f172a] border-b border-white/10 sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Shield className="text-emerald-400" size={24} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">AI SURVEILLANCE</h1>
                <p className="text-xs text-gray-400">Smart Security System</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 hover:bg-white/5 rounded-lg transition-colors">
              <Bell size={20} />
              {stats.alertsToday > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center">{stats.alertsToday}</span>
              )}
            </button>
            
            {/* ✅ UPDATED: Dropdown Menu in Header */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-3 pl-6 border-l border-white/10 cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors"
              >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  {userData?.profile_photo ? (
                    <img src={userData.profile_photo} alt={userData.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-white" />
                  )}
                </div>
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium">{userData?.full_name || 'Security Guard'}</p>
                  <p className="text-xs text-gray-400">User</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  <style>{`
                    @keyframes fadeIn {
                      from { opacity: 0; transform: translateY(-10px); }
                      to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
                  `}</style>
                  
                  {/* User Info Header */}
                  <div className="p-4 border-b border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <p className="text-sm font-semibold text-white">{userData?.full_name || 'Security Guard'}</p>
                    <p className="text-xs text-gray-400 truncate">{userData?.email || 'user@example.com'}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/user/dashboard');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-purple-400" />
                      <span>Dashboard</span>
                    </button>
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/user/dashboard');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Home size={16} className="text-purple-400" />
                      <span>Home</span>
                    </button>
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/user/edit-profile');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Edit size={16} className="text-purple-400" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-white/10"></div>

                  {/* Logout */}
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setDropdownOpen(false);
                        localStorage.clear();
                        navigate('/user/login');
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#0f172a] border-r border-white/10 min-h-screen transition-all duration-300 hidden md:block`}>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  location.pathname === item.path
                    ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.badge > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>
                    )}
                  </>
                )}
              </button>
            ))}
            <button 
              onClick={() => {
                localStorage.clear();
                navigate('/user/login');
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-all mt-8"
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="font-medium">Logout</span>}
            </button>
          </nav>
        </aside>

        {/* Main Content - ALL YOUR ORIGINAL CODE BELOW (UNCHANGED) */}
        <main className="flex-1 p-6 overflow-auto bg-[#0a1120]">
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 hover:border-purple-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Cameras Online</p>
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="text-purple-400" size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.camerasOnline}</h3>
              <p className="text-green-400 text-xs font-medium flex items-center">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                {dashboardData?.stats.onlineCameras === dashboardData?.stats.totalCameras ? 'All cameras are online' : 'Some cameras offline'}
              </p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 hover:border-red-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Alerts Today</p>
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Shield className="text-red-400" size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.alertsToday}</h3>
              <button onClick={() => navigate('/user/alerts')} className="text-purple-400 text-xs hover:underline">View all alerts</button>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 hover:border-yellow-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Threats Detected</p>
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <AlertTriangle className="text-yellow-400" size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-1">{stats.threatsDetected}</h3>
              <p className="text-gray-500 text-xs">Today</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-5 hover:border-green-500/30 transition-all group">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400 text-sm font-medium">Last Alert</p>
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="text-green-400" size={20} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stats.lastAlertTime}</h3>
              <p className="text-gray-500 text-xs">{stats.lastAlertType}</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            
            {/* Camera Feeds */}
            <div className="lg:col-span-2 bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Live Camera Feeds (Assigned)</h3>
                <button onClick={() => navigate('/user/monitoring')} className="text-purple-400 text-sm hover:text-purple-300 transition-colors font-medium">View All</button>
              </div>
              
              {assignedCameras.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {assignedCameras.map((camera) => (
                    <div key={camera.id} className="relative group rounded-xl overflow-hidden bg-black border border-white/10 shadow-lg">
                      <img 
                        src={camera.image} 
                        alt={camera.name}
                        className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium border border-white/10">
                        {camera.name}
                      </div>
                      <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/70 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
                        <span className={`w-2 h-2 rounded-full ${camera.status === 'live' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={`text-xs font-bold ${camera.status === 'live' ? 'text-green-400' : 'text-red-400'}`}>
                          {camera.status === 'live' ? 'LIVE' : 'OFFLINE'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center space-x-3">
                          <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Camera size={16} /></button>
                          <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Mic size={16} /></button>
                        </div>
                        <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Maximize size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl">
                  <Camera className="mx-auto mb-3 text-gray-600" size={48} />
                  <p className="text-gray-400 text-lg font-medium mb-2">No cameras assigned</p>
                  <p className="text-sm text-gray-500">Contact admin to assign cameras</p>
                </div>
              )}
            </div>

            {/* Alerts Panel */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">My Alerts (Recent)</h3>
                <button onClick={() => navigate('/user/alerts')} className="text-purple-400 text-sm hover:text-purple-300 transition-colors font-medium">View All</button>
              </div>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
                {recentAlerts.length > 0 ? (
                  recentAlerts.map((alert) => {
                    const Icon = alert.icon;
                    return (
                      <div key={alert.id} className="flex items-start space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          alert.severity === 'High' ? 'bg-red-500/20' : 
                          alert.severity === 'Medium' ? 'bg-yellow-500/20' : 'bg-green-500/20'
                        }`}>
                          <Icon className={
                            alert.severity === 'High' ? 'text-red-400' : 
                            alert.severity === 'Medium' ? 'text-yellow-400' : 'text-green-400'
                          } size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{alert.type}</p>
                          <p className="text-xs text-gray-400 truncate">{alert.location}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider">{alert.time}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Bell className="mx-auto mb-3 text-gray-600" size={48} />
                    <p className="text-gray-400 text-sm">No recent alerts</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-3">
                <button className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center space-x-2">
                  <Play size={16} />
                  <span>Start Patrol</span>
                </button>
                <button className="px-4 py-2.5 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2">
                  <Download size={16} />
                  <span>Export Logs</span>
                </button>
              </div>
            </div>
          </div>

          {/* CHARTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Today's Summary */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Today's Summary</h3>
                  <p className="text-sm text-gray-400">Alerts recorded over the last 24 hours</p>
                </div>
                <select className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-purple-500 text-gray-300 cursor-pointer">
                  <option>Alerts</option>
                  <option>Threats</option>
                </select>
              </div>
              <div className="h-[240px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={alertData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAlerts" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        border: '1px solid #1e293b', 
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                      }}
                      itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                      labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="alerts" stroke="none" fill="url(#colorAlerts)" />
                    <Line 
                      type="monotone" 
                      dataKey="alerts" 
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={{ fill: '#a855f7', r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: '#c084fc' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Threats by Type */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Threats by Type</h3>
                  <p className="text-sm text-gray-400">Breakdown of today's detected threat categories</p>
                </div>
                <button className="text-purple-400 text-sm hover:text-purple-300 transition-colors">View All</button>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-6">
                <div className="w-full lg:w-1/2 h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={threatData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {threatData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#0f172a', 
                          border: '1px solid #1e293b', 
                          borderRadius: '12px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full lg:w-1/2 space-y-3">
                  {threatData.map((entry) => {
                    const total = threatData.reduce((acc, curr) => acc + curr.value, 0);
                    const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                    return (
                      <div key={entry.name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center gap-3">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                          <div>
                            <p className="text-sm text-gray-200">{entry.name}</p>
                            <p className="text-xs text-gray-400">{entry.value} Reports</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-white">{percent}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
