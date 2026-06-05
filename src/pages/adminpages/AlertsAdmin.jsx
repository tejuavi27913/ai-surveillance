import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, AlertTriangle, Flame, 
  Users as UsersIcon, Eye, CheckCircle, Trash2, Filter,
  ChevronLeft, ChevronRight, Clock, MapPin, X
} from 'lucide-react';

const AlertsAdmin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);

  // Fetch alerts
  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setAlerts(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update alert status
  const handleStatusChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/alerts/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      fetchAlerts();
    } catch (error) {
      console.error("Failed to update alert:", error);
    }
  };

  // Delete alert
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this alert?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/alerts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchAlerts();
    } catch (error) {
      console.error("Failed to delete alert:", error);
    }
  };

  // Get icon for threat type
  const getAlertIcon = (type) => {
    if (type?.includes('Intrusion')) return Shield;
    if (type?.includes('Face')) return UsersIcon;
    if (type?.includes('Fire')) return Flame;
    if (type?.includes('Crowd')) return UsersIcon;
    return AlertTriangle;
  };

  const getAlertColor = (type) => {
    if (type?.includes('Intrusion')) return 'text-red-400 bg-red-500/20';
    if (type?.includes('Face')) return 'text-yellow-400 bg-yellow-500/20';
    if (type?.includes('Fire')) return 'text-orange-400 bg-orange-500/20';
    if (type?.includes('Crowd')) return 'text-blue-400 bg-blue-500/20';
    return 'text-purple-400 bg-purple-500/20';
  };

  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'new': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'viewed': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  // Filter alerts
  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.threat_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.camera_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = priorityFilter === 'all' || alert.priority === priorityFilter;
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'new' && alert.status === 'new') ||
                         (filter === 'viewed' && alert.status === 'viewed') ||
                         (filter === 'resolved' && alert.status === 'resolved') ||
                         (filter === 'critical' && alert.priority === 'critical') ||
                         (filter === 'high' && alert.priority === 'high');
    
    return matchesSearch && matchesPriority && matchesFilter;
  });

  // Stats
  const stats = {
    total: alerts.length,
    new: alerts.filter(a => a.status === 'new').length,
    viewed: alerts.filter(a => a.status === 'viewed').length,
    resolved: alerts.filter(a => a.status === 'resolved').length,
    critical: alerts.filter(a => a.priority === 'critical').length,
    high: alerts.filter(a => a.priority === 'high').length,
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, path: '/admin/alerts', active: true },
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
        <div className="text-xl font-semibold animate-pulse">Loading Alerts...</div>
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
                  {item.id === 'alerts' && stats.new > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{stats.new}</span>
                  )}
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
        {/* Header */}
        <header className="bg-[#0f172a] border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white cursor-pointer">
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold">ALERTS MANAGEMENT</h1>
                <p className="text-xs text-gray-400">Dashboard &gt; Alerts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Search alerts..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64" 
                />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Bell className="text-blue-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Total Alerts</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
              <p className="text-xs text-gray-500">All Time</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-blue-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">New Alerts</p>
              <h3 className="text-2xl font-bold text-blue-400">{stats.new}</h3>
              <p className="text-xs text-blue-400">Requires Action</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                  <Eye className="text-yellow-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Viewed</p>
              <h3 className="text-2xl font-bold text-yellow-400">{stats.viewed}</h3>
              <p className="text-xs text-yellow-400">Under Review</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <CheckCircle className="text-green-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Resolved</p>
              <h3 className="text-2xl font-bold text-green-400">{stats.resolved}</h3>
              <p className="text-xs text-green-400">Completed</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Critical</p>
              <h3 className="text-2xl font-bold text-red-400">{stats.critical}</h3>
              <p className="text-xs text-red-400">Immediate Action</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="text-red-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">High Priority</p>
              <h3 className="text-2xl font-bold text-red-400">{stats.high}</h3>
              <p className="text-xs text-red-400">Urgent</p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">Filter by:</span>
              </div>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="viewed">Viewed</option>
                <option value="resolved">Resolved</option>
                <option value="critical">Critical</option>
                <option value="high">High Priority</option>
              </select>
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <div className="flex-1"></div>
              <p className="text-sm text-gray-400">
                Showing <strong className="text-white">{filteredAlerts.length}</strong> of <strong className="text-white">{alerts.length}</strong> alerts
              </p>
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
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Alert ID</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Type</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Camera</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Location</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Priority</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Time</th>
                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredAlerts.map((alert) => {
                        const Icon = getAlertIcon(alert.threat_type);
                        const colorClass = getAlertColor(alert.threat_type);
                        return (
                          <tr 
                            key={alert.id} 
                            onClick={() => setSelectedAlert(alert)}
                            className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedAlert?.id === alert.id ? 'bg-blue-600/10' : ''}`}
                          >
                            <td className="px-6 py-4 text-sm font-mono text-gray-300">ALT-{String(alert.id).padStart(4, '0')}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                                  <Icon size={18} />
                                </div>
                                <span className="text-sm font-medium text-white">{alert.threat_type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-300">{alert.camera_name || 'N/A'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <MapPin size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-400">{alert.location}</span>
                              </div>
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
                              <div className="flex items-center space-x-2">
                                <Clock size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-400">
                                  {alert.created_at ? new Date(alert.created_at).toLocaleString() : 'N/A'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                {alert.status === 'new' && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(alert.id, 'viewed'); }}
                                    className="p-1.5 hover:bg-yellow-500/20 rounded transition-colors text-yellow-400"
                                    title="Mark as Viewed"
                                  >
                                    <Eye size={14} />
                                  </button>
                                )}
                                {alert.status !== 'resolved' && (
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); handleStatusChange(alert.id, 'resolved'); }}
                                    className="p-1.5 hover:bg-green-500/20 rounded transition-colors text-green-400"
                                    title="Mark as Resolved"
                                  >
                                    <CheckCircle size={14} />
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => { e.stopPropagation(); handleDelete(alert.id); }}
                                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors text-red-400"
                                  title="Delete Alert"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
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
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">1</button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <Bell className="mx-auto mb-3 text-gray-600" size={48} />
                <p className="text-gray-400 text-lg font-medium mb-2">No alerts found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">Alert Details</h3>
              <button onClick={() => setSelectedAlert(null)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${getAlertColor(selectedAlert.threat_type)}`}>
                  {React.createElement(getAlertIcon(selectedAlert.threat_type), { size: 32 })}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-white">{selectedAlert.threat_type}</h4>
                  <p className="text-sm text-gray-400">Alert ID: ALT-{String(selectedAlert.id).padStart(4, '0')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#1e293b] rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Camera</p>
                  <p className="text-sm font-medium text-white">{selectedAlert.camera_name || 'N/A'}</p>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Location</p>
                  <p className="text-sm font-medium text-white">{selectedAlert.location}</p>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Priority</p>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getPriorityColor(selectedAlert.priority)}`}>
                    {selectedAlert.priority}
                  </span>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-1">Status</p>
                  <span className={`text-xs px-3 py-1 rounded-full border font-medium ${getStatusColor(selectedAlert.status)}`}>
                    {selectedAlert.status}
                  </span>
                </div>
                <div className="bg-[#1e293b] rounded-lg p-4 col-span-2">
                  <p className="text-xs text-gray-400 mb-1">Detected At</p>
                  <p className="text-sm font-medium text-white">
                    {selectedAlert.created_at ? new Date(selectedAlert.created_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedAlert.evidence_image && (
                <div className="bg-[#1e293b] rounded-lg p-4">
                  <p className="text-xs text-gray-400 mb-2">Evidence Image</p>
                  <p className="text-sm text-white font-mono">{selectedAlert.evidence_image}</p>
                </div>
              )}

              <div className="flex items-center space-x-3 pt-4 border-t border-white/10">
                {selectedAlert.status === 'new' && (
                  <button 
                    onClick={() => { handleStatusChange(selectedAlert.id, 'viewed'); setSelectedAlert(null); }}
                    className="flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Eye size={16} />
                    <span>Mark as Viewed</span>
                  </button>
                )}
                {selectedAlert.status !== 'resolved' && (
                  <button 
                    onClick={() => { handleStatusChange(selectedAlert.id, 'resolved'); setSelectedAlert(null); }}
                    className="flex-1 py-2.5 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <CheckCircle size={16} />
                    <span>Mark as Resolved</span>
                  </button>
                )}
                <button 
                  onClick={() => { handleDelete(selectedAlert.id); setSelectedAlert(null); }}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsAdmin;