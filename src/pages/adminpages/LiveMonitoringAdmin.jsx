import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, Wifi, WifiOff, Mic, 
  Maximize, MoreVertical, Circle, Monitor, Minus, Plus,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';

const LiveMonitoringAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // ✅ 1. State for dynamic data
  const [camerasData, setCamerasData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ 2. Fetch real data from backend on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch both cameras and dashboard stats
        const [camerasRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/cameras', { headers }),
          fetch('http://localhost:5000/api/dashboard/stats', { headers })
        ]);
        
        const camerasJson = await camerasRes.json();
        const statsJson = await statsRes.json();
        
        if (camerasJson.success) setCamerasData(camerasJson.data);
        if (statsJson.success) setStatsData(statsJson.data);
      } catch (error) {
        console.error("Failed to fetch live monitoring data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ 3. Calculate dynamic stats from fetched data
  const totalCameras = camerasData.length;
  const onlineCameras = camerasData.filter(c => c.status === 'online').length;
  const offlineCameras = camerasData.filter(c => c.status === 'offline' || c.status === 'maintenance').length;
  const aiDetectionsCount = statsData ? statsData.threatsDetected : 0;
  const activeThreatsCount = statsData ? statsData.activeAlerts : 0;

  // ✅ 4. Dynamic AI Detections (Structure kept, counts will be 0 until specific AI endpoint is built)
  const aiDetections = [
    { type: 'Intrusion Detected', count: 0, icon: Shield, color: 'text-red-400', bg: 'bg-red-500/20' },
    { type: 'Unknown Face', count: 0, icon: ScanFace, color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
    { type: 'Fire Detected', count: 0, icon: Activity, color: 'text-orange-400', bg: 'bg-orange-500/20' },
    { type: 'Crowd Detected', count: 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { type: 'Suspicious Activity', count: 0, icon: Camera, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring', active: true },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: statsData ? statsData.activeAlerts : 0, path: '/admin/alerts' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'face-recognition', label: 'Face Recognition', icon: ScanFace, path: '/admin/face-recognition' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch, path: '/admin/audit-logs' },
    { id: 'system-health', label: 'System Health', icon: Activity, path: '/admin/system-health' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Live Monitoring...</div>
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
                <h1 className="text-xl font-bold">1. LIVE MONITORING</h1>
                <p className="text-xs text-gray-400">Real-time camera feeds and AI detections</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search cameras..." 
                  className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell size={20} className="text-gray-400" />
                  {statsData?.activeAlerts > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center">{statsData.activeAlerts}</span>
                  )}
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
          {/* Stats Cards */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Camera className="text-blue-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Total Cameras</p>
              <h3 className="text-2xl font-bold">{totalCameras}</h3>
              <p className="text-xs text-gray-500">All Locations</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Wifi className="text-green-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Online Cameras</p>
              <h3 className="text-2xl font-bold text-green-400">{onlineCameras}</h3>
              <p className="text-xs text-green-400">{totalCameras > 0 ? ((onlineCameras/totalCameras)*100).toFixed(1) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <WifiOff className="text-red-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Offline Cameras</p>
              <h3 className="text-2xl font-bold text-red-400">{offlineCameras}</h3>
              <p className="text-xs text-red-400">{totalCameras > 0 ? ((offlineCameras/totalCameras)*100).toFixed(1) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <ScanFace className="text-yellow-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">AI Detections</p>
              <h3 className="text-2xl font-bold text-yellow-400">{aiDetectionsCount}</h3>
              <p className="text-xs text-gray-500">Today</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <Shield className="text-red-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Active Threats</p>
              <h3 className="text-2xl font-bold text-red-400">{activeThreatsCount}</h3>
              <p className="text-xs text-red-400">High Priority</p>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            {/* Camera Feeds */}
            <div className="col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Live Camera Feeds</h3>
                <button onClick={() => navigate('/admin/cameras')} className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer">Manage Cameras</button>
              </div>
              
              {camerasData.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {camerasData.map((cam) => (
                    <div key={cam.id} className="relative group rounded-lg overflow-hidden bg-black border border-white/10">
                      <img 
                        src={cam.stream_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600'} 
                        alt={cam.camera_name}
                        className="w-full h-40 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                      />
                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className={`w-2 h-2 rounded-full ${cam.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                        <span className={cam.status === 'online' ? 'text-green-400' : 'text-red-400'}>
                          {cam.status === 'online' ? 'Live' : 'Offline'}
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3">
                        <p className="text-sm font-medium text-white truncate">{cam.camera_name}</p>
                        <p className="text-xs text-gray-400 truncate">{cam.location}</p>
                      </div>
                      <div className="absolute bottom-3 right-3 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 bg-black/60 backdrop-blur-sm rounded hover:bg-black/80"><Mic size={12} /></button>
                        <button className="p-1.5 bg-black/60 backdrop-blur-sm rounded hover:bg-black/80"><Maximize size={12} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl mb-6">
                  <Camera className="mx-auto mb-3 text-gray-600" size={48} />
                  <p className="text-gray-400 text-lg font-medium">No cameras added yet</p>
                  <button onClick={() => navigate('/admin/cameras')} className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                    Add Your First Camera
                  </button>
                </div>
              )}

              {/* AI Detection Summary (Live) */}
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-4">AI Detection Summary (Live)</h3>
                <div className="grid grid-cols-5 gap-3">
                  {aiDetections.map((detection, i) => (
                    <div key={i} className={`${detection.bg} rounded-lg p-4 text-center border border-white/5`}>
                      <detection.icon className={`mx-auto mb-2 ${detection.color}`} size={24} />
                      <p className={`text-2xl font-bold ${detection.color}`}>{detection.count}</p>
                      <p className="text-xs text-gray-400 mt-1">{detection.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel */}
            <div className="space-y-6">
              {/* Camera Controls */}
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-4">Camera Controls</h3>
                
                {/* PTZ Directional Pad */}
                <div className="flex justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <button className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#1e293b] hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                      <ChevronUp size={20} />
                    </button>
                    <button className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#1e293b] hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                      <ChevronDown size={20} />
                    </button>
                    <button className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1e293b] hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                      <ChevronLeft size={20} />
                    </button>
                    <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1e293b] hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                      <ChevronRight size={20} />
                    </button>
                    <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center transition-colors">
                      <div className="w-4 h-4 rounded-full bg-white" />
                    </button>
                  </div>
                </div>

                {/* Zoom and Focus Controls */}
                <div className="space-y-4 mb-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-400">Zoom</label>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 bg-[#1e293b] hover:bg-[#334155] rounded transition-colors"><Minus size={14} /></button>
                        <div className="w-24 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                          <div className="w-1/2 h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <button className="p-1 bg-[#1e293b] hover:bg-[#334155] rounded transition-colors"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-gray-400">Focus</label>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 bg-[#1e293b] hover:bg-[#334155] rounded transition-colors"><Minus size={14} /></button>
                        <div className="w-24 h-1.5 bg-[#1e293b] rounded-full overflow-hidden">
                          <div className="w-3/4 h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <button className="p-1 bg-[#1e293b] hover:bg-[#334155] rounded transition-colors"><Plus size={14} /></button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preset and Action Buttons */}
                <div className="space-y-3">
                  <select className="w-full bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
                    <option>Preset 1</option>
                    <option>Preset 2</option>
                    <option>Preset 3</option>
                  </select>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex items-center justify-center space-x-2 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors">
                      <Circle size={14} className="fill-current" />
                      <span>Record</span>
                    </button>
                    <button className="flex items-center justify-center space-x-2 py-2 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-sm font-medium transition-colors">
                      <Monitor size={14} />
                      <span>Screenshot</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button className="py-2 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-sm transition-colors">Talk</button>
                    <button className="py-2 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-sm transition-colors">Fullscreen</button>
                  </div>
                </div>
              </div>

              {/* Camera Status */}
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
                <h3 className="text-sm font-semibold mb-4">Camera Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      <span className="text-sm text-gray-300">Online</span>
                    </div>
                    <span className="text-sm font-medium text-white">{onlineCameras} ({totalCameras > 0 ? ((onlineCameras/totalCameras)*100).toFixed(1) : 0}%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                      <span className="text-sm text-gray-300">Offline</span>
                    </div>
                    <span className="text-sm font-medium text-white">{offlineCameras} ({totalCameras > 0 ? ((offlineCameras/totalCameras)*100).toFixed(1) : 0}%)</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      <span className="text-sm text-gray-300">Maintenance</span>
                    </div>
                    <span className="text-sm font-medium text-white">0 (0%)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LiveMonitoringAdmin;