import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Bell, FileText, User, LogOut, 
  Menu, X, Camera, Shield, AlertTriangle, Users, Flame, 
  Search, Filter, Eye, ChevronLeft, ChevronRight, ChevronDown,
  Home, Edit
} from 'lucide-react';

const Alerts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All Alerts');
  
  // ✅ NEW: Dropdown state and user data
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const dropdownRef = useRef(null);
  
  // Dynamic state
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch alerts for assigned cameras
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser?.id) {
          setLoading(false);
          return;
        }
        
        // First get assigned cameras
        const camerasRes = await fetch(`http://localhost:5000/api/users/${storedUser.id}/cameras`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const camerasResult = await camerasRes.json();
        
        if (camerasResult.success && camerasResult.data.length > 0) {
          const cameraIds = camerasResult.data.map(c => c.id);
          
          // Fetch all alerts and filter for assigned cameras
          const alertsRes = await fetch('http://localhost:5000/api/alerts', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const alertsResult = await alertsRes.json();
          
          if (alertsResult.success) {
            const filteredAlerts = alertsResult.data.filter(a => cameraIds.includes(a.camera_id));
            setAlerts(filteredAlerts);
          }
        }
      } catch (error) {
        console.error("Failed to fetch alerts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
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

  // Dynamic filter counts
  const filterCounts = {
    'All Alerts': alerts.length,
    'High Priority': alerts.filter(a => a.priority === 'high' || a.priority === 'critical').length,
    'Medium Priority': alerts.filter(a => a.priority === 'medium').length,
    'Low Priority': alerts.filter(a => a.priority === 'low').length
  };

  // Filter alerts based on active filter
  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'All Alerts') return true;
    if (activeFilter === 'High Priority') return alert.priority === 'high' || alert.priority === 'critical';
    if (activeFilter === 'Medium Priority') return alert.priority === 'medium';
    if (activeFilter === 'Low Priority') return alert.priority === 'low';
    return true;
  });

  // Map threat types to icons
  const getAlertIcon = (type) => {
    if (type?.includes('Intrusion')) return Shield;
    if (type?.includes('Face')) return Users;
    if (type?.includes('Fire')) return Flame;
    if (type?.includes('Crowd')) return Users;
    return AlertTriangle;
  };

  const getAlertIconColor = (type) => {
    if (type?.includes('Intrusion') || type?.includes('Fire')) return 'text-red-400';
    if (type?.includes('Face') || type?.includes('Suspicious')) return 'text-yellow-400';
    if (type?.includes('Crowd')) return 'text-green-400';
    return 'text-yellow-400';
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
    { id: 'monitoring', label: 'Live Monitoring', icon: Video, path: '/user/monitoring' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: filterCounts['All Alerts'], path: '/user/alerts', active: true },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/user/reports' },
    { id: 'profile', label: 'Profile', icon: User, path: '/user/profile' },
  ];

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high':
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': 
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': 
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: 
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'new': 
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'viewed': 
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'resolved':
      case 'closed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: 
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Alerts...</div>
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
              {filterCounts['All Alerts'] > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-xs rounded-full flex items-center justify-center">
                  {filterCounts['All Alerts']}
                </span>
              )}
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
            <h2 className="text-2xl font-bold text-white mb-1">ALERTS</h2>
            <p className="text-gray-400 text-sm">All security alerts and notifications</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {Object.keys(filterCounts).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeFilter === filter 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-[#1e293b] text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {filter} <span className="ml-1 opacity-70">{filterCounts[filter]}</span>
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search alerts..." 
                    className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 w-48"
                  />
                </div>
                <button className="flex items-center space-x-2 px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">
                  <Filter size={16} />
                  <span>Filter</span>
                </button>
              </div>
            </div>
          </div>

          {/* Alerts Table */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden">
            {filteredAlerts.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1e293b] border-b border-white/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Alert ID</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Camera</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Priority</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredAlerts.map((alert) => {
                        const Icon = getAlertIcon(alert.threat_type);
                        return (
                          <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-gray-300">ALT-{String(alert.id).padStart(5, '0')}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <Icon className={getAlertIconColor(alert.threat_type)} size={16} />
                                <span className="text-sm text-white">{alert.threat_type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">{alert.camera_name || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-400">
                              {alert.created_at ? new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getPriorityColor(alert.priority)}`}>
                                {alert.priority}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(alert.status)}`}>
                                {alert.status}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <Eye size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-sm text-gray-400">Showing 1 to {filteredAlerts.length} of {filteredAlerts.length} alerts</p>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <ChevronLeft size={18} />
                    </button>
                    <button className="w-8 h-8 rounded-lg text-sm font-medium bg-purple-600 text-white">1</button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20">
                <Bell className="mx-auto mb-4 text-gray-600" size={64} />
                <p className="text-gray-400 text-xl font-medium mb-2">
                  {alerts.length === 0 ? 'No Alerts Available' : 'No Alerts Match Filter'}
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  {alerts.length === 0 
                    ? 'No security alerts for your assigned cameras' 
                    : 'Try adjusting your filter criteria'}
                </p>
                {alerts.length === 0 && (
                  <button 
                    onClick={() => navigate('/user/dashboard')}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors"
                  >
                    Back to Dashboard
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Alerts;