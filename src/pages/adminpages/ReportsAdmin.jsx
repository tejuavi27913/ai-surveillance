import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, Download, Calendar, ChevronDown,
  AlertTriangle, Flame, Users as UsersIcon, FileDown, Printer, TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, AreaChart, Area, BarChart, Bar } from 'recharts';

const ReportsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily Report');
  
  // ✅ Dynamic state
 const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ✅ Fetch reports from backend
useEffect(() => {
  const fetchReports = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/reports', { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
      const result = await res.json();
      if (!res.ok || !result.success) throw new Error(result.message || 'Failed to load reports');
      setReports(result.data || []);
    } catch (err) {
      setError(err.message || 'Unable to load reports');
    } finally {
      setLoading(false);
    }
  };
  fetchReports();
}, []);

  // ✅ Calculate dynamic stats
  const totalReports = reports.length;
  const incidentReports = reports.filter(r => r.report_type?.toLowerCase().includes('incident')).length;
  const monthlyReports = reports.filter(r => r.report_type?.toLowerCase().includes('monthly')).length;
  
  const today = new Date().toDateString();
  const generatedToday = reports.filter(r => new Date(r.created_at).toDateString() === today).length;

  // ✅ Dynamic Charts Data (Always renders with safe fallbacks)
  const threatTrendData = totalReports > 0 
    ? [{ date: 'Recent', threats: totalReports }] 
    : [{ date: 'Day 1', threats: 0 }, { date: 'Day 2', threats: 0 }, { date: 'Day 3', threats: 0 }];

  const threatDistributionData = totalReports > 0
    ? [
        { name: 'Incidents', value: incidentReports || 1, color: '#6366f1' },
        { name: 'Monthly', value: monthlyReports || 1, color: '#ef4444' },
        { name: 'Others', value: (totalReports - incidentReports - monthlyReports) || 1, color: '#3b82f6' }
      ]
    : [{ name: 'No Data', value: 100, color: '#334155' }];

  const cameraActivityData = [
    { time: 'Day 1', online: 0, offline: 0 }, 
    { time: 'Day 2', online: 0, offline: 0 }, 
    { time: 'Day 3', online: 0, offline: 0 }
  ];

  const monthlyData = [
    { month: 'M1', count: 0 }, { month: 'M2', count: 0 }, { month: 'M3', count: 0 }
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 0, path: '/admin/alerts' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'face-recognition', label: 'Face Recognition', icon: ScanFace, path: '/admin/face-recognition' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports', active: true },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch, path: '/admin/audit-logs' },
    { id: 'system-health', label: 'System Health', icon: Activity, path: '/admin/system-health' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Reports...</div>
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
                <h1 className="text-xl font-bold">REPORTS</h1>
                <p className="text-xs text-gray-400">Generate and download security reports</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Search reports..." className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64" />
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
                  <FileText className="text-blue-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Total Reports</p>
              <h3 className="text-2xl font-bold">{totalReports}</h3>
              <p className="text-xs text-gray-500">All Time</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-green-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Incident Reports</p>
              <h3 className="text-2xl font-bold text-green-400">{incidentReports}</h3>
              <p className="text-xs text-green-400">{totalReports > 0 ? ((incidentReports/totalReports)*100).toFixed(1) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Calendar className="text-orange-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Monthly Reports</p>
              <h3 className="text-2xl font-bold text-orange-400">{monthlyReports}</h3>
              <p className="text-xs text-orange-400">{totalReports > 0 ? ((monthlyReports/totalReports)*100).toFixed(1) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <TrendingUp className="text-purple-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Generated Today</p>
              <h3 className="text-2xl font-bold text-purple-400">{generatedToday}</h3>
              <p className="text-xs text-purple-400">Today</p>
            </div>
          </div>

          {/* Report Type Tabs & Generate Button */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="col-span-2 bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Generate Report</h3>
                <div className="flex items-center space-x-2 px-4 py-2 bg-[#1e293b] border border-white/10 rounded-lg text-sm text-gray-300">
                  <Calendar size={16} />
                  <span>All Time</span>
                  <ChevronDown size={16} />
                </div>
              </div>
              
              <div className="flex space-x-2 mb-6">
                {['Daily Report', 'Weekly Report', 'Monthly Report', 'Custom Range'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'bg-[#1e293b] text-gray-400 hover:text-white border border-white/10'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>Select Date Range</span>
                </div>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                  Generate Report
                </button>
              </div>
            </div>

            {/* Export Reports */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-sm font-semibold mb-4">Export Reports</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <FileDown size={16} /><span>Export as PDF</span>
                </button>
                <button className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <FileDown size={16} /><span>Export as Excel</span>
                </button>
                <button className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <FileDown size={16} /><span>Export as CSV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Threat Trend */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Reports Trend</h3>
                <select className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-300">
                  <option>All Reports</option>
                  <option>Incidents Only</option>
                </select>
              </div>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={threatTrendData}>
                    <defs>
                      <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="threats" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorThreats)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Report Distribution */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Report Distribution</h3>
              <div className="flex items-center space-x-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={threatDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {threatDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {threatDistributionData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-gray-400">{item.value} ({totalReports > 0 ? ((item.value/totalReports)*100).toFixed(1) : 0}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-3 gap-6">
            {/* Camera Activity */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">System Activity</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cameraActivityData}>
                    <defs>
                      <linearGradient id="colorOnline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOffline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    <Area type="monotone" dataKey="online" stroke="#22c55e" strokeWidth={2} fill="url(#colorOnline)" />
                    <Area type="monotone" dataKey="offline" stroke="#ef4444" strokeWidth={2} fill="url(#colorOffline)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Security Analysis */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Monthly Analysis</h3>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Download Reports */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-6">Download Reports</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <Download size={16} /><span>Download PDF</span>
                </button>
                <button className="w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <FileDown size={16} /><span>Download Excel</span>
                </button>
                <button className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <FileDown size={16} /><span>Download CSV</span>
                </button>
                <button className="w-full py-3 bg-[#1e293b] hover:bg-[#334155] rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2">
                  <Printer size={16} /><span>Print Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Reports List Table */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden mt-6">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold">Recent Reports</h3>
            </div>
            
            {reports.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1e293b]">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Report ID</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Report Name</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Generated By</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {reports.slice(0, 5).map((report) => (
                      <tr key={report.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-300">RPT-{String(report.id).padStart(4, '0')}</td>
                        <td className="px-6 py-4 text-sm text-white font-medium">{report.report_name}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            {report.report_type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-300">{report.generated_by_name || 'System'}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {report.created_at ? new Date(report.created_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button className="flex items-center space-x-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                            <Download size={16} />
                            <span>Download</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl m-4">
                <FileText className="mx-auto mb-3 text-gray-600" size={48} />
                <p className="text-gray-400 text-lg font-medium mb-2">No reports generated yet</p>
                <p className="text-sm text-gray-500 mb-4">Generate your first report to view it here</p>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">
                  Generate First Report
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportsAdmin;
