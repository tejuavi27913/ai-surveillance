import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Video, Camera, Bell, Users, ScanFace, 
  FileText, BarChart3, Settings as SettingsIcon, FileSearch, Activity, 
  LogOut, Menu, Search, Shield, Save, Mail, MessageSquare, 
  Send, Moon, Database, ShieldCheck
} from 'lucide-react';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('General Settings');
  const [toggles, setToggles] = useState({
    email: true, sms: false, push: true, darkMode: true, autoBackup: true, twoFactor: false
  });

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'live-monitoring', label: 'Live Monitoring', icon: Video, path: '/admin/live-monitoring' },
    { id: 'cameras', label: 'Cameras', icon: Camera, path: '/admin/cameras' },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: 12, path: '/admin/alerts' },
    { id: 'users', label: 'Users', icon: Users, path: '/admin/users' },
    { id: 'face-recognition', label: 'Face Recognition', icon: ScanFace, path: '/admin/face-recognition' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/admin/reports' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/admin/settings', active: true }, // Updated icon ref
    { id: 'audit-logs', label: 'Audit Logs', icon: FileSearch, path: '/admin/audit-logs' },
    { id: 'system-health', label: 'System Health', icon: Activity, path: '/admin/system-health' },
  ];

  const ToggleSwitch = ({ enabled, onChange }) => (
    <button onClick={onChange} className={`relative w-12 h-6 rounded-full transition-colors ${enabled ? 'bg-blue-500' : 'bg-gray-600'}`}>
      <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      {/* ✅ FIXED SIDEBAR - Replace this exact block in ALL admin pages */}
<aside className={`fixed left-0 top-0 h-full bg-[#0f172a] border-r border-white/10 transition-all duration-300 z-50 flex flex-col ${sidebarOpen ? 'w-64' : 'w-20'}`}>
  
  {/* 1. Header (never shrinks) */}
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

  {/* 2. Navigation (takes all remaining space & scrolls properly) */}
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
            {item.badge && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{item.badge}</span>}
          </>
        )}
      </button>
    ))}
  </nav>

  {/* 3. Logout (stays at bottom naturally, no absolute positioning) */}
  <div className="p-4 border-t border-white/10 shrink-0">
    <button 
      onClick={() => navigate('/admin/login')}
      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
    >
      <LogOut size={20} />
      {sidebarOpen && <span className="font-medium">Logout</span>}
    </button>
  </div>
</aside>
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className="sticky top-0 z-40 bg-[#0b1120]/90 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white"><Menu size={24} /></button>
            <div><h2 className="text-xl font-bold">SETTINGS</h2><p className="text-sm text-gray-400">System settings and preferences</p></div>
          </div>
        </header>

        <div className="p-8">
          <div className="flex space-x-2 mb-8">
            {['General Settings', 'Notification Settings', 'AI Detection Settings', 'Camera Settings', 'System Preferences'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' : 'bg-[#1e293b] text-gray-400 hover:text-white border border-white/10'}`}>
                {tab}
              </button>
            ))}
          </div>

          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-8 max-w-3xl">
            <div className="space-y-6">
              {[
                { key: 'email', label: 'Enable Email Notifications', desc: 'Receive email alerts for important events', icon: Mail },
                { key: 'sms', label: 'Enable SMS Notifications', desc: 'Receive SMS alerts for critical events', icon: MessageSquare },
                { key: 'push', label: 'Enable Push Notifications', desc: 'Receive push notifications on mobile devices', icon: Send },
                { key: 'darkMode', label: 'Dark Mode', desc: 'Enable dark mode for the system', icon: Moon },
                { key: 'autoBackup', label: 'Auto Backup', desc: 'Automatically backup system data', icon: Database },
                { key: 'twoFactor', label: 'Two Factor Authentication', desc: 'Add extra security to your account', icon: ShieldCheck },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-[#1e293b] rounded-xl border border-white/5">
                  <div className="flex items-center space-x-4">
                    <item.icon className="text-blue-400" size={24} />
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  <ToggleSwitch enabled={toggles[item.key]} onChange={() => setToggles(prev => ({ ...prev, [item.key]: !prev[item.key] }))} />
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/25">
                <Save size={18} /><span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;