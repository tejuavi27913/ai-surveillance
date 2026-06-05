import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, Wifi, WifiOff, HardDrive,
  Plus, UserPlus, Eye, Edit, Trash2, MoreVertical,
  ChevronLeft, ChevronRight, Monitor, HardDrive as HardDriveIcon,
  Save, X, AlertCircle, CheckCircle
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip 
} from 'recharts';

const Cameras = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewLive, setViewLive] = useState(false);
  
  // ✅ NEW: Modal and form states
  const [showModal, setShowModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    camera_name: '',
    location: '',
    ip_address: '',
    stream_url: '',
    camera_type: 'IP',
    status: 'offline'
  });

  // Fetch cameras from backend
  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cameras', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.success) {
        setCameras(result.data);
        if (result.data.length > 0 && !selectedCamera) {
          setSelectedCamera(result.data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Open modal for adding/editing
  const openModal = (camera = null) => {
    if (camera) {
      setEditingCamera(camera);
      setFormData({
        camera_name: camera.camera_name,
        location: camera.location,
        ip_address: camera.ip_address,
        stream_url: camera.stream_url,
        camera_type: camera.camera_type || 'IP',
        status: camera.status || 'offline'
      });
    } else {
      setEditingCamera(null);
      setFormData({
        camera_name: '',
        location: '',
        ip_address: '',
        stream_url: '',
        camera_type: 'IP',
        status: 'offline'
      });
    }
    setShowModal(true);
    setMessage({ type: '', text: '' });
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCamera(null);
    setMessage({ type: '', text: '' });
  };

  // ✅ NEW: Save camera (add or update)
  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const url = editingCamera 
      ? `http://localhost:5000/api/cameras/${editingCamera.id}` 
      : 'http://localhost:5000/api/cameras';
    const method = editingCamera ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        fetchCameras();
        setTimeout(closeModal, 1000);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save camera' });
    }
  };

  // ✅ NEW: Delete camera
  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this camera?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/cameras/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        fetchCameras();
        if (selectedCamera?.id === id) {
          setSelectedCamera(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete camera:", error);
    }
  };

  // Calculate stats dynamically
  const totalCameras = cameras.length;
  const onlineCameras = cameras.filter(c => c.status === 'online').length;
  const offlineCameras = cameras.filter(c => c.status === 'offline').length;
  const recordingCameras = cameras.filter(c => c.status === 'online').length;
  const maintenanceCameras = cameras.filter(c => c.status === 'maintenance').length;
  const totalStorage = cameras.reduce((acc, cam) => acc + parseFloat(cam.storage_used || '0'), 0);

  // Chart data
  const statusData = [
    { name: 'Online', value: onlineCameras, color: '#22c55e' },
    { name: 'Offline', value: offlineCameras, color: '#ef4444' },
    { name: 'Maintenance', value: maintenanceCameras, color: '#f59e0b' },
  ];

  const locationData = cameras.reduce((acc, cam) => {
    const existing = acc.find(a => a.name === cam.location);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: cam.location, value: 1 });
    }
    return acc;
  }, []);

  const storageData = cameras.map(cam => ({
    name: cam.camera_name,
    storage: parseFloat(cam.storage_used) || 0
  }));

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras', active: true },
    { id: 'alerts', label: 'Alerts', icon: Bell, path: '/admin/alerts' },
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
        <div className="text-xl font-semibold animate-pulse">Loading Cameras...</div>
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
                <h1 className="text-xl font-bold">CAMERA MANAGEMENT</h1>
                <p className="text-xs text-gray-400">Dashboard &gt; Cameras</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input type="text" placeholder="Search cameras..." className="bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 w-64" />
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Bell size={20} className="text-gray-400" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center">12</span>
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
          <div className="grid grid-cols-6 gap-4 mb-6">
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Video className="text-blue-400" size={20} />
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
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Monitor className="text-purple-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Recording Cameras</p>
              <h3 className="text-2xl font-bold text-purple-400">{recordingCameras}</h3>
              <p className="text-xs text-purple-400">{totalCameras > 0 ? ((recordingCameras/totalCameras)*100).toFixed(2) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Settings className="text-orange-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Maintenance</p>
              <h3 className="text-2xl font-bold text-orange-400">{maintenanceCameras}</h3>
              <p className="text-xs text-orange-400">{totalCameras > 0 ? ((maintenanceCameras/totalCameras)*100).toFixed(2) : 0}%</p>
            </div>

            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <HardDriveIcon className="text-cyan-400" size={20} />
                </div>
              </div>
              <p className="text-gray-400 text-xs">Total Storage</p>
              <h3 className="text-2xl font-bold text-cyan-400">{totalStorage.toFixed(2)} TB</h3>
              <p className="text-xs text-gray-500">Used Storage</p>
            </div>
          </div>

          {/* Camera List Section */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Camera List</h3>
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => openModal()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  <span>Add Camera</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-[#1e293b] hover:bg-[#334155] border border-white/10 rounded-lg text-sm font-medium transition-colors">
                  <UserPlus size={16} />
                  <span>Assign Camera</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="text" placeholder="Search cameras by name, location..." className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500" />
              </div>
              <select className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
                <option>All Status</option>
                <option>Online</option>
                <option>Offline</option>
                <option>Maintenance</option>
              </select>
              <select className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
                <option>All Locations</option>
              </select>
              <select className="bg-[#1e293b] border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300">
                <option>All Types</option>
                <option>IP Camera</option>
                <option>PTZ Camera</option>
              </select>
            </div>

            {cameras.length > 0 ? (
              <>
                {/* Camera Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1e293b] border-b border-white/10">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Camera ID</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Camera Name</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Location</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Type</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Last Activity</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Storage</th>
                        <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {cameras.map((cam) => (
                        <tr 
                          key={cam.id} 
                          onClick={() => setSelectedCamera(cam)}
                          className={`hover:bg-white/5 transition-colors cursor-pointer ${selectedCamera?.id === cam.id ? 'bg-blue-600/10' : ''}`}
                        >
                          <td className="px-4 py-3 text-sm font-mono text-gray-300">CAM-{String(cam.id).padStart(4, '0')}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-lg bg-[#1e293b] flex items-center justify-center">
                                <Camera size={16} className="text-gray-400" />
                              </div>
                              <span className="text-sm font-medium text-white">{cam.camera_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{cam.location}</td>
                          <td className="px-4 py-3">
                            <span className="text-xs px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                              {cam.camera_type || 'IP Camera'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${
                                cam.status === 'online' ? 'bg-green-500' : 
                                cam.status === 'maintenance' ? 'bg-orange-500' : 'bg-red-500'
                              }`}></span>
                              <span className={`text-xs capitalize ${
                                cam.status === 'online' ? 'text-green-400' : 
                                cam.status === 'maintenance' ? 'text-orange-400' : 'text-red-400'
                              }`}>
                                {cam.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {cam.created_at ? new Date(cam.created_at).toLocaleString() : 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{cam.storage_used || '0 GB'}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-2">
                              <button className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white">
                                <Eye size={14} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openModal(cam); }}
                                className="p-1.5 hover:bg-white/10 rounded transition-colors text-blue-400 hover:text-blue-300"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={(e) => handleDelete(cam.id, e)}
                                className="p-1.5 hover:bg-white/10 rounded transition-colors text-red-400 hover:text-red-300"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400">Showing 1 to {cameras.length} of {cameras.length} cameras</p>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <ChevronLeft size={16} />
                    </button>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-medium">1</button>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 border-2 border-dashed border-white/10 rounded-xl">
                <Camera className="mx-auto mb-3 text-gray-600" size={48} />
                <p className="text-gray-400 text-lg font-medium mb-2">No cameras configured</p>
                <p className="text-sm text-gray-500 mb-4">Add your first camera to start monitoring</p>
                <button 
                  onClick={() => openModal()}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Your First Camera
                </button>
              </div>
            )}
          </div>

          {/* Bottom Section: Charts & Details */}
          <div className="grid grid-cols-3 gap-6">
           {/* Camera Status Overview */}
<div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
  <h3 className="text-lg font-semibold mb-4">Camera Status Overview</h3>
  <div className="h-[200px] mb-4">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={statusData} 
          cx="50%" 
          cy="50%" 
          innerRadius={60} 
          outerRadius={80} 
          paddingAngle={5} 
          dataKey="value"
        >
          {statusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
      </PieChart>
    </ResponsiveContainer>
  </div>
  <div className="text-center mb-4">
    <p className="text-3xl font-bold text-white">{totalCameras}</p>
    <p className="text-sm text-gray-400">Total</p>
  </div>
  <div className="space-y-2">
    {statusData.map((status) => (
      <div key={status.name} className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: status.color }}></span>
          <span className="text-gray-300">{status.name}</span>
        </div>
        <span className="text-gray-400">{status.value} ({totalCameras > 0 ? ((status.value/totalCameras)*100).toFixed(1) : 0}%)</span>
      </div>
    ))}
  </div>
</div>

          {/* Camera Assignment */}
<div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
  <h3 className="text-lg font-semibold mb-4">Camera Assignment</h3>
  <div className="h-[200px] mb-4">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie 
          data={locationData.length > 0 ? locationData : [{ name: 'No Cameras', value: 1 }]} 
          cx="50%" 
          cy="50%" 
          innerRadius={60} 
          outerRadius={80} 
          paddingAngle={5} 
          dataKey="value"
        >
          {(locationData.length > 0 ? locationData : [{ name: 'No Cameras', value: 1 }]).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={locationData.length > 0 ? ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5] : '#334155'} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
      </PieChart>
    </ResponsiveContainer>
  </div>
  <div className="text-center mb-4">
    <p className="text-3xl font-bold text-white">{totalCameras}</p>
    <p className="text-sm text-gray-400">Total</p>
  </div>
  {locationData.length > 0 ? (
    <div className="space-y-2">
      {locationData.map((loc, idx) => (
        <div key={loc.name} className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5] }}></span>
            <span className="text-gray-300 truncate">{loc.name}</span>
          </div>
          <span className="text-gray-400">{loc.value} ({totalCameras > 0 ? ((loc.value/totalCameras)*100).toFixed(2) : 0}%)</span>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-center text-sm text-gray-500">No cameras assigned yet</p>
  )}
</div>

            {/* Camera Details Panel */}
            <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Camera Details</h3>
                {selectedCamera && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400">View Live</span>
                    <button 
                      onClick={() => setViewLive(!viewLive)}
                      className={`w-10 h-5 rounded-full transition-colors ${viewLive ? 'bg-green-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${viewLive ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                )}
              </div>

              {selectedCamera ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black border border-white/10">
                    <img 
                      src={selectedCamera.stream_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600'} 
                      alt={selectedCamera.camera_name}
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs">
                      {selectedCamera.camera_name}
                    </div>
                    {viewLive && (
                      <div className="absolute top-2 right-2 flex items-center space-x-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                        <span className="text-green-400">Live</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Camera Name</span>
                      <span className="text-white font-medium">{selectedCamera.camera_name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Camera ID</span>
                      <span className="text-white font-mono">CAM-{String(selectedCamera.id).padStart(4, '0')}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Type</span>
                      <span className="text-white">{selectedCamera.camera_type || 'IP Camera'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Location</span>
                      <span className="text-white">{selectedCamera.location}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">IP Address</span>
                      <span className="text-white font-mono">{selectedCamera.ip_address || '192.168.1.101'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Stream URL</span>
                      <span className="text-white text-xs truncate max-w-[150px]">{selectedCamera.stream_url || 'rtsp://192.168.1.101/live'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Status</span>
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${
                          selectedCamera.status === 'online' ? 'bg-green-500' : 
                          selectedCamera.status === 'maintenance' ? 'bg-orange-500' : 'bg-red-500'
                        }`}></span>
                        <span className={`capitalize ${
                          selectedCamera.status === 'online' ? 'text-green-400' : 
                          selectedCamera.status === 'maintenance' ? 'text-orange-400' : 'text-red-400'
                        }`}>
                          {selectedCamera.status}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Resolution</span>
                      <span className="text-white">1920 x 1080 (1080p)</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Frame Rate</span>
                      <span className="text-white">25 FPS</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-gray-400">Storage Used</span>
                      <span className="text-white">{selectedCamera.storage_used || '0 GB'}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">Last Activity</span>
                      <span className="text-white">{selectedCamera.created_at ? new Date(selectedCamera.created_at).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => openModal(selectedCamera)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Settings size={16} />
                    <span>Camera Settings</span>
                  </button>
                </div>
              ) : (
                <div className="h-[400px] flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Camera className="mx-auto mb-2 opacity-50" size={48} />
                    <p>No camera selected</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Storage Overview */}
          <div className="mt-6 bg-[#0f172a] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Storage Overview</h3>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-cyan-400">{totalStorage.toFixed(2)} TB</span>
                <span className="text-sm text-gray-400">/ 5 TB</span>
              </div>
              <div className="w-full h-2 bg-[#1e293b] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${Math.min((totalStorage / 5) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">Used Storage - {Math.min((totalStorage / 5) * 100, 100).toFixed(0)}%</p>
            </div>

            {storageData.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-400 mb-4">Storage by Camera</h4>
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={storageData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                      <Bar dataKey="storage" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ✅ NEW: Add/Edit Camera Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0f172a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-lg font-bold text-white">
                {editingCamera ? 'Edit Camera Settings' : 'Add New Camera'}
              </h3>
              <button onClick={closeModal} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            {message.text && (
              <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center space-x-2 text-sm border ${
                message.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                  : 'bg-red-500/10 border-red-500/30 text-red-400'
              }`}>
                {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{message.text}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Camera Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.camera_name}
                    onChange={(e) => setFormData({...formData, camera_name: e.target.value})}
                    placeholder="e.g., CCTV-01 Main Gate"
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Location</label>
                  <input 
                    type="text" 
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    placeholder="e.g., Main Entrance"
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">IP Address</label>
                  <input 
                    type="text" 
                    required
                    value={formData.ip_address}
                    onChange={(e) => setFormData({...formData, ip_address: e.target.value})}
                    placeholder="192.168.1.101"
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Camera Type</label>
                  <select 
                    value={formData.camera_type}
                    onChange={(e) => setFormData({...formData, camera_type: e.target.value})}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="IP">IP Camera</option>
                    <option value="PTZ">PTZ Camera</option>
                    <option value="Dome">Dome Camera</option>
                    <option value="Bullet">Bullet Camera</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">RTSP Stream URL</label>
                  <input 
                    type="text" 
                    value={formData.stream_url}
                    onChange={(e) => setFormData({...formData, stream_url: e.target.value})}
                    placeholder="rtsp://192.168.1.101:554/stream"
                    className="w-full bg-[#1e293b] border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="online" 
                        checked={formData.status === 'online'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-green-400 flex items-center"><Wifi size={14} className="mr-1"/> Online</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="status" 
                        value="offline" 
                        checked={formData.status === 'offline'}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-red-400 flex items-center"><WifiOff size={14} className="mr-1"/> Offline</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10 mt-4">
                <button 
                  type="button" 
                  onClick={closeModal}
                  className="px-5 py-2.5 border border-white/20 hover:bg-white/5 rounded-lg text-sm font-medium transition-colors text-gray-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 shadow-lg shadow-blue-500/20"
                >
                  <Save size={16} />
                  <span>{editingCamera ? 'Update Camera' : 'Save Camera'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cameras;