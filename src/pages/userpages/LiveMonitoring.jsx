import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Bell, FileText, User, LogOut, 
  Menu, X, Camera, Mic, Maximize, Shield, Search,
  Filter, Grid, List, Plus, Minus, RotateCcw, ChevronDown,
  Home, Edit
} from 'lucide-react';

const LiveMonitoring = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [gridView, setGridView] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);
  
  // Dynamic state
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch assigned cameras from backend
  useEffect(() => {
    const fetchCameras = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser?.id) {
          setLoading(false);
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/users/${storedUser.id}/cameras`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
          setCameras(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch cameras:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCameras();
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

  // Dynamic counts
  const onlineCount = cameras.filter(c => c.status === 'online').length;
  const offlineCount = cameras.length - onlineCount;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
    { id: 'monitoring', label: 'Live Monitoring', icon: Video, path: '/user/monitoring', active: true },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 0, path: '/user/alerts' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/user/reports' },
    { id: 'profile', label: 'Profile', icon: User, path: '/user/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Cameras...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a1120] text-white">
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
            </button>
            
            {/* ✅ UPDATED: Dropdown Menu */}
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
                  
                  <div className="p-4 border-b border-white/10 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <p className="text-sm font-semibold text-white">{userData?.full_name || 'Security Guard'}</p>
                    <p className="text-xs text-gray-400 truncate">{userData?.email || 'user@example.com'}</p>
                  </div>

                  <div className="py-2">
                    <button 
                      onClick={() => { setDropdownOpen(false); navigate('/user/dashboard'); }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <LayoutDashboard size={16} className="text-purple-400" />
                      <span>Dashboard</span>
                    </button>
                    <button 
                      onClick={() => { setDropdownOpen(false); navigate('/user/dashboard'); }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Home size={16} className="text-purple-400" />
                      <span>Home</span>
                    </button>
                    <button 
                      onClick={() => { setDropdownOpen(false); navigate('/user/edit-profile'); }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Edit size={16} className="text-purple-400" />
                      <span>Edit Profile</span>
                    </button>
                  </div>

                  <div className="border-t border-white/10"></div>

                  <div className="py-2">
                    <button 
                      onClick={() => { setDropdownOpen(false); localStorage.clear(); navigate('/user/login'); }}
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
                    {item.badge > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
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

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">LIVE MONITORING</h2>
            <p className="text-gray-400 text-sm">Real-time camera feeds</p>
          </div>

          {/* Controls Bar */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <select 
                value="All Cameras"
                onChange={(e) => console.log(e.target.value)}
                className="bg-[#1e293b] border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-purple-500 text-gray-300"
              >
                <option>All Cameras</option>
                {cameras.map(c => <option key={c.id}>{c.camera_name}</option>)}
              </select>
              
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-gray-400">Total Cameras</span>
                <span className="text-white font-bold">{cameras.length}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-green-400">Online</span>
                <span className="text-green-400 font-bold">{onlineCount}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-red-400">Offline</span>
                <span className="text-red-400 font-bold">{offlineCount}</span>
              </div>
            </div>
            <button 
              onClick={() => setGridView(!gridView)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
            >
              {gridView ? <Grid size={18} /> : <List size={18} />}
              <span>{gridView ? 'Grid View' : 'List View'}</span>
            </button>
          </div>

          {/* Camera Grid */}
          {cameras.length > 0 ? (
            <>
              <div className={`grid gap-4 mb-6 ${gridView ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                {cameras.map((camera) => (
                  <div key={camera.id} className="relative group rounded-xl overflow-hidden bg-black border border-white/10">
                    <img 
                      src={camera.stream_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600'} 
                      alt={camera.camera_name}
                      className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-md text-sm font-medium border border-white/10 flex items-center space-x-2">
                      <Camera size={14} />
                      <span>{camera.camera_name}</span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center space-x-1.5 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-md border border-white/10">
                      <span className={`w-2 h-2 rounded-full ${camera.status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                      <span className={`text-xs font-bold ${camera.status === 'online' ? 'text-green-400' : 'text-red-400'}`}>
                        {camera.status === 'online' ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center space-x-3">
                        <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Camera size={16} /></button>
                        <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Mic size={16} /></button>
                      </div>
                      <button className="p-2 hover:bg-white/20 rounded-full transition-colors"><Maximize size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Camera Status & PTZ */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Camera Status */}
                <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Camera Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cameras.map((camera) => (
                      <div key={camera.id} className="flex items-center justify-between p-3 bg-[#1e293b] rounded-lg border border-white/5">
                        <div className="flex items-center space-x-2">
                          <Camera size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-300">{camera.camera_name}</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          camera.status === 'online' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {camera.status === 'online' ? 'Online' : 'Offline'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PTZ Control */}
                <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">PTZ Control</h3>
                  <div className="flex items-center justify-center space-x-8">
                    {/* Directional Pad */}
                    <div className="relative w-32 h-32">
                      <button className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#1e293b] hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors border border-white/10">
                        <span className="text-lg">↑</span>
                      </button>
                      <button className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-[#1e293b] hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors border border-white/10">
                        <span className="text-lg">↓</span>
                      </button>
                      <button className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1e293b] hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors border border-white/10">
                        <span className="text-lg">←</span>
                      </button>
                      <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#1e293b] hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors border border-white/10">
                        <span className="text-lg">→</span>
                      </button>
                      <button className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-[#1e293b] hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors border border-white/10">
                        <Plus size={18} />
                      </button>
                    </div>
                    {/* Zoom Controls */}
                    <div className="flex flex-col space-y-2">
                      <button className="w-12 h-12 bg-[#1e293b] hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors border border-white/10">
                        <Plus size={20} />
                      </button>
                      <button className="w-12 h-12 bg-[#1e293b] hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors border border-white/10">
                        <Minus size={20} />
                      </button>
                      <button className="w-12 h-12 bg-[#1e293b] hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors border border-white/10">
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-xl">
              <Camera className="mx-auto mb-4 text-gray-600" size={64} />
              <p className="text-gray-400 text-xl font-medium mb-2">No Cameras Assigned</p>
              <p className="text-sm text-gray-500 mb-6">Contact your administrator to assign cameras to your account</p>
              <button 
                onClick={() => navigate('/user/dashboard')}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LiveMonitoring;