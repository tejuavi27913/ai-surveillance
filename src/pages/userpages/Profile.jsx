import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Bell, FileText, User, LogOut, 
  Menu, X, Camera, Shield, Mail, Phone, IdCard, MapPin,
  Eye, EyeOff, ChevronDown, Edit, Home
} from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const [userData, setUserData] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [assignedCameras, setAssignedCameras] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser?.id) {
          setLoading(false);
          return;
        }
        
        const headers = { 'Authorization': `Bearer ${token}` };
        
        const userRes = await fetch(`http://localhost:5000/api/users/${storedUser.id}`, { headers });
        const userResult = await userRes.json();
        
        if (userResult.success) {
          setUserData(userResult.data);
        }
        
        const camerasRes = await fetch(`http://localhost:5000/api/users/${storedUser.id}/cameras`, { headers });
        const camerasResult = await camerasRes.json();
        
        if (camerasResult.success) {
          setAssignedCameras(camerasResult.data);
        }
        
        const activityRes = await fetch(`http://localhost:5000/api/audit-logs?user_id=${storedUser.id}&limit=5`, { headers });
        const activityResult = await activityRes.json();
        
        if (activityResult.success) {
          setRecentActivity(activityResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const profileInfo = userData ? [
    { label: 'Full Name', value: userData.full_name || 'Not Set', icon: User },
    { label: 'Email', value: userData.email || 'Not Set', icon: Mail },
    { label: 'Phone', value: userData.phone_number || 'Not Set', icon: Phone },
    { label: 'Employee ID', value: userData.employee_id || 'Not Set', icon: IdCard },
    { label: 'Role', value: userData.role === 'admin' ? 'Administrator' : 'Security Guard', icon: Shield },
    { label: 'Assigned Area', value: assignedCameras.length > 0 
      ? assignedCameras.map(c => c.location).join(', ') 
      : 'Not Assigned', icon: MapPin },
  ] : [];

  const activityList = recentActivity.length > 0
    ? recentActivity.map(log => ({
        action: log.action || 'Activity',
        time: new Date(log.timestamp).toLocaleString('en-US', { 
          month: 'short', day: 'numeric', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
        }),
        type: log.action?.toLowerCase().includes('login') ? 'login' :
              log.action?.toLowerCase().includes('view') ? 'view' :
              log.action?.toLowerCase().includes('alert') ? 'alert' :
              log.action?.toLowerCase().includes('download') ? 'download' : 'other'
      }))
    : [{ action: 'No recent activity', time: 'N/A', type: 'other' }];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/user/dashboard' },
    { id: 'monitoring', label: 'Live Monitoring', icon: Video, path: '/user/monitoring' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 0, path: '/user/alerts' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/user/reports' },
    { id: 'profile', label: 'Profile', icon: User, path: '/user/profile', active: true },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Profile...</div>
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
                  <p className="text-sm font-medium">{userData?.full_name || 'User'}</p>
                  <p className="text-xs text-gray-400">Security Guard</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* ✅ Dropdown Menu */}
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
                    <p className="text-sm font-semibold text-white">{userData?.full_name || 'User'}</p>
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
            <h2 className="text-2xl font-bold text-white mb-1">PROFILE</h2>
            <p className="text-gray-400 text-sm">User profile and account settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Information */}
            <div className="lg:col-span-1 bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Profile Information</h3>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 border-4 border-white/10">
                  {userData?.profile_photo ? (
                    <img src={userData.profile_photo} alt={userData.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>
                <h4 className="text-xl font-bold text-white">{userData?.full_name || 'User'}</h4>
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium mt-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></span>
                  {userData?.status === 'active' ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="space-y-4">
                {profileInfo.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-[#1e293b] rounded-lg border border-white/5">
                    <item.icon className="text-purple-400 mt-0.5 flex-shrink-0" size={16} />
                    <div>
                      <p className="text-xs text-gray-400">{item.label}</p>
                      <p className="text-sm text-white font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ UPDATED: Edit Profile button now navigates to edit page */}
              <button 
                onClick={() => navigate('/user/edit-profile')}
                className="w-full mt-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <Edit size={16} />
                <span>Edit Profile</span>
              </button>
            </div>

            {/* Right Side */}
            <div className="lg:col-span-2 space-y-6">
              {/* Change Password */}
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Change Password</h3>
                <div className="space-y-4">
                  <div className="relative">
                    <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPass ? "text" : "password"} 
                        placeholder="Enter current password"
                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-3 pl-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                    <div className="relative">
                      <input 
                        type={showNewPass ? "text" : "password"} 
                        placeholder="Enter new password"
                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-3 pl-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input 
                        type={showConfirmPass ? "text" : "password"} 
                        placeholder="Confirm new password"
                        className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-3 pl-4 pr-10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-semibold transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
                <div className="space-y-4">
                  {activityList.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-[#1e293b] rounded-lg border border-white/5">
                      <div className="flex items-center space-x-3">
                        <span className={`w-2 h-2 rounded-full ${
                          activity.type === 'login' ? 'bg-green-400' :
                          activity.type === 'view' ? 'bg-blue-400' :
                          activity.type === 'alert' ? 'bg-yellow-400' :
                          activity.type === 'download' ? 'bg-purple-400' : 'bg-gray-400'
                        }`}></span>
                        <span className="text-sm text-white">{activity.action}</span>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;