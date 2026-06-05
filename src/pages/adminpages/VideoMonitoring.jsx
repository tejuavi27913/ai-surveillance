import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings, FileSearch, Activity, 
  LogOut, Menu, Shield, AlertTriangle, Play, Pause,
  Maximize, Mic, Wifi, WifiOff, Eye, CheckCircle, X
} from 'lucide-react';

const VideoMonitoring = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const videoRefs = useRef({});

  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/video-cameras', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setCameras(result.data);
        if (result.data.length > 0) {
          setSelectedCamera(result.data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch cameras:", error);
    } finally {
      setLoading(false);
    }
  };

  const simulateDetection = async (camera) => {
    setDetecting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/simulate-detection/${camera.id}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        setDetectionResult(result.detection);
        // Show notification
        if (result.detection.alert_created) {
          alert(`🚨 ALERT: ${result.detection.threat_type}\nPriority: ${result.detection.priority}\nCamera: ${result.detection.camera_name}`);
        }
      }
    } catch (error) {
      console.error("Detection failed:", error);
    } finally {
      setDetecting(false);
    }
  };

  const playVideo = (cameraId) => {
    const video = videoRefs.current[cameraId];
    if (video) {
      video.play();
    }
  };

  const pauseVideo = (cameraId) => {
    const video = videoRefs.current[cameraId];
    if (video) {
      video.pause();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring', active: true },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
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
                item.active
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' 
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {sidebarOpen && (
                <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
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
                <h1 className="text-xl font-bold">LIVE MONITORING</h1>
                <p className="text-xs text-gray-400">Dashboard &gt; Live Monitoring</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Camera Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {cameras.map((camera) => (
              <div key={camera.id} className="bg-[#0f172a] border border-white/10 rounded-xl overflow-hidden">
                {/* Video Player */}
                <div className="relative bg-black">
                  <video
                    ref={el => videoRefs.current[camera.id] = el}
                    src={camera.videoUrl}
                    className="w-full h-64 object-cover"
                    loop
                    muted
                    playsInline
                  />
                  
                  {/* Overlay Info */}
                  <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                    <div className="flex items-center space-x-2">
                      <Camera size={14} className="text-blue-400" />
                      <span className="text-sm font-medium">{camera.camera_name}</span>
                    </div>
                  </div>

                  <div className="absolute top-3 right-3 flex items-center space-x-2">
                    <div className={`flex items-center space-x-1.5 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10 ${
                      camera.status === 'online' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {camera.status === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
                      <span className="text-xs font-bold">{camera.status === 'online' ? 'LIVE' : 'OFFLINE'}</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => playVideo(camera.id)}
                        className="p-2 bg-black/70 hover:bg-blue-600 rounded-lg transition-colors"
                      >
                        <Play size={16} />
                      </button>
                      <button 
                        onClick={() => pauseVideo(camera.id)}
                        className="p-2 bg-black/70 hover:bg-yellow-600 rounded-lg transition-colors"
                      >
                        <Pause size={16} />
                      </button>
                      <button className="p-2 bg-black/70 hover:bg-white/20 rounded-lg transition-colors">
                        <Mic size={16} />
                      </button>
                    </div>
                    <button className="p-2 bg-black/70 hover:bg-white/20 rounded-lg transition-colors">
                      <Maximize size={16} />
                    </button>
                  </div>
                </div>

                {/* Camera Info & AI Detection */}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-white">{camera.camera_name}</p>
                      <p className="text-xs text-gray-400">{camera.location}</p>
                    </div>
                    <button
                      onClick={() => simulateDetection(camera)}
                      disabled={detecting}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                        detecting 
                          ? 'bg-gray-600 cursor-not-allowed' 
                          : 'bg-blue-600 hover:bg-blue-500'
                      }`}
                    >
                      <Eye size={16} />
                      <span>{detecting ? 'Analyzing...' : 'AI Detect'}</span>
                    </button>
                  </div>

                  {/* Detection Result */}
                  {detectionResult && detectionResult.camera_id === camera.id && (
                    <div className={`p-3 rounded-lg border ${
                      detectionResult.priority === 'critical' ? 'bg-red-500/20 border-red-500/30' :
                      detectionResult.priority === 'high' ? 'bg-orange-500/20 border-orange-500/30' :
                      detectionResult.priority === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30' :
                      'bg-green-500/20 border-green-500/30'
                    }`}>
                      <div className="flex items-center space-x-2">
                        <AlertTriangle size={16} className={
                          detectionResult.priority === 'critical' ? 'text-red-400' :
                          detectionResult.priority === 'high' ? 'text-orange-400' :
                          detectionResult.priority === 'medium' ? 'text-yellow-400' :
                          'text-green-400'
                        } />
                        <div>
                          <p className="text-sm font-medium text-white">{detectionResult.threat_type}</p>
                          <p className="text-xs text-gray-400">Priority: {detectionResult.priority.toUpperCase()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Detection Summary */}
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">AI Detection Summary</h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <p className="text-2xl font-bold text-green-400">1</p>
                <p className="text-xs text-gray-400 mt-1">Normal Activity</p>
              </div>
              <div className="text-center p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-2xl font-bold text-red-400">1</p>
                <p className="text-xs text-gray-400 mt-1">Burglary</p>
              </div>
              <div className="text-center p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                <p className="text-2xl font-bold text-orange-400">1</p>
                <p className="text-xs text-gray-400 mt-1">Fighting</p>
              </div>
              <div className="text-center p-4 bg-red-600/10 border border-red-600/30 rounded-xl">
                <p className="text-2xl font-bold text-red-400">1</p>
                <p className="text-xs text-gray-400 mt-1">Robbery</p>
              </div>
              <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                <p className="text-2xl font-bold text-yellow-400">1</p>
                <p className="text-xs text-gray-400 mt-1">Vandalism</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoMonitoring;