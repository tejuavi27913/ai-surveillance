import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users as UsersIcon, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, Plus, Edit, Trash2,
  MoreVertical, UserCheck, UserX, Crown, Calendar, PieChart as PieChartIcon,
  User
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell, Legend 
} from 'recharts';

const UsersAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // ✅ KEEP THESE ORIGINAL LINES
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch('http://localhost:5000/api/users', { 
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
  })
    .then(res => res.json())
    .then(result => { 
      if (result.success) setUsers(result.data); 
      setLoading(false); 
    })
    .catch(() => setLoading(false));
}, []);

  // ✅ Calculate stats dynamically
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;
  const newUsers = users.filter(u => {
    const created = new Date(u.created_at);
    const today = new Date();
    return created.toDateString() === today.toDateString();
  }).length;

  // ✅ Dynamic Charts Data (Always renders, safe fallbacks)
  const usersByRole = [
    { name: 'Admin', value: adminUsers || 1, color: '#8b5cf6', percentage: totalUsers > 0 ? ((adminUsers/totalUsers)*100).toFixed(1) + '%' : '0%' },
    { name: 'Standard User', value: regularUsers || 1, color: '#3b82f6', percentage: totalUsers > 0 ? ((regularUsers/totalUsers)*100).toFixed(1) + '%' : '0%' },
  ];

  const userActivityData = totalUsers > 0 
    ? [{ date: 'Recent', activity: totalUsers }] 
    : [{ date: 'Day 1', activity: 0 }, { date: 'Day 2', activity: 0 }, { date: 'Day 3', activity: 0 }];

  const recentLogins = users.length > 0 
    ? users.slice(-5).map(u => ({
        name: u.full_name || u.email,
        time: u.created_at ? new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        avatar: (u.full_name || u.email).substring(0, 2).toUpperCase()
      }))
    : [{ name: 'No Users', time: 'N/A', avatar: '--' }];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 0, path: '/admin/alerts' },
    { id: 'users', label: 'Users', icon: UsersIcon, path: '/admin/users', active: true },
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
        <div className="text-xl font-semibold animate-pulse">Loading Users...</div>
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
                <h1 className="text-xl font-bold">USERS MANAGEMENT</h1>
                <p className="text-xs text-gray-400">Manage system users and their permissions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Search users..." className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64" />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                <Plus size={18} />
                <span>Add User</span>
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <UsersIcon className="text-blue-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Total Users</p>
              <h3 className="text-2xl font-bold">{totalUsers}</h3>
              <p className="text-xs text-gray-500">All Users</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <UserCheck className="text-green-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Active Users</p>
              <h3 className="text-2xl font-bold text-green-400">{activeUsers}</h3>
              <p className="text-xs text-green-400">{totalUsers > 0 ? ((activeUsers/totalUsers)*100).toFixed(1) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <UserX className="text-red-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Inactive Users</p>
              <h3 className="text-2xl font-bold text-red-400">{inactiveUsers}</h3>
              <p className="text-xs text-red-400">{totalUsers > 0 ? ((inactiveUsers/totalUsers)*100).toFixed(1) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Crown className="text-purple-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Admin Users</p>
              <h3 className="text-2xl font-bold text-purple-400">{adminUsers}</h3>
              <p className="text-xs text-gray-500">{totalUsers > 0 ? ((adminUsers/totalUsers)*100).toFixed(1) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <User className="text-cyan-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Standard Users</p>
              <h3 className="text-2xl font-bold text-cyan-400">{regularUsers}</h3>
              <p className="text-xs text-gray-500">{totalUsers > 0 ? ((regularUsers/totalUsers)*100).toFixed(1) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Calendar className="text-orange-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">New Today</p>
              <h3 className="text-2xl font-bold text-orange-400">{newUsers}</h3>
              <p className="text-xs text-gray-500">Recent Signups</p>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden mb-6">
            {users.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1e293b] border-b border-white/10">
                      <tr>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User ID</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Created At</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-gray-300">USR-{String(user.id).padStart(4, '0')}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                {(user.full_name || user.email).substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-white">{user.full_name || 'Unnamed'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`text-xs px-2 py-1 rounded-full border ${
                              user.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Standard User'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-300">{user.department || 'N/A'}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                              user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"><Edit size={16} /></button>
                              <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-400"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
                  <p className="text-sm text-gray-400">Showing 1 to {users.length} of {users.length} users</p>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"><Menu size={18} className="rotate-90" /></button>
                    <button className="w-8 h-8 rounded-lg text-sm font-medium bg-blue-600 text-white">1</button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"><Menu size={18} className="-rotate-90" /></button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl m-4">
                <UsersIcon className="mx-auto mb-3 text-gray-600" size={48} />
                <p className="text-gray-400 text-lg font-medium mb-2">No users configured</p>
                <p className="text-sm text-gray-500 mb-4">Add your first user to start managing access</p>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                  Add Your First User
                </button>
              </div>
            )}
          </div>

          {/* Bottom Charts Section - ALWAYS RENDERED */}
          <div className="grid grid-cols-3 gap-6">
            {/* Users by Role */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Users by Role</h3>
              <div className="flex items-center space-x-4">
                <div className="w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={usersByRole} cx="50%" cy="50%" innerRadius={30} outerRadius={48} paddingAngle={4} dataKey="value">
                        {usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {usersByRole.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-gray-400">{item.value} ({item.percentage})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* User Activity */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">User Registrations</h3>
              <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userActivityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="activity" stroke="#22c55e" strokeWidth={2} dot={{ r: 2, fill: '#22c55e' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Logins / Added */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Recently Added</h3>
              <div className="space-y-3">
                {recentLogins.map((login, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                        {login.avatar}
                      </div>
                      <span className="text-sm text-gray-300 truncate max-w-[120px]">{login.name}</span>
                    </div>
                    <span className="text-xs text-gray-400">{login.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UsersAdmin;