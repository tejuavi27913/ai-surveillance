import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowRight, Camera, Brain, Bell, ShieldCheck, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  
  // ✅ 1. Added state for form data, loading, and errors
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ 2. Updated handleSubmit with proper backend connection
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed. Please check your credentials.');
        setLoading(false);
        return;
      }

      // Save Token and User Info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Check Role (CRITICAL STEP)
      if (data.user.role === 'admin') {
        navigate('/admin/dashboard'); // Success! Go to admin dashboard
      } else {
        // Security check: A normal user tried to use the admin login page
        setError('Access Denied! This portal is for Admins only.');
        localStorage.clear(); // Clear the token so they aren't logged in
        setLoading(false);
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      setError('Server error. Please ensure the backend is running on port 5000.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#040b18] py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid items-stretch min-h-[680px] max-w-7xl gap-0 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-[2rem] border border-white/10 bg-[#07101e]/90 p-8 shadow-[0_40px_80px_rgba(0,0,0,0.35)] sm:p-12"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-blue-300">AI SMART</p>
              <p className="text-xs uppercase tracking-[0.35em] text-gray-500">SURVEILLANCE SYSTEM</p>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-4xl font-bold text-white">Admin Login</h1>
            <p className="mt-3 text-gray-400">Sign in to access the admin dashboard</p>
          </div>

          {/* ✅ Added Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="relative block">
                <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email address"
                  required
                  className="w-full rounded-3xl border border-white/10 bg-[#06111f] px-14 py-4 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                />
              </label>
            </div>

            <div>
              <label className="relative block">
                <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  required
                  className="w-full rounded-3xl border border-white/10 bg-[#06111f] px-14 py-4 pr-16 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </label>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm text-gray-300">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-600 bg-[#06111f] text-blue-400 focus:ring-blue-400/20"
                />
                Remember me
              </label>
              <button type="button" className="text-blue-400 hover:text-blue-300">Forgot password?</button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full rounded-3xl bg-blue-500 px-6 py-4 text-base font-semibold text-white shadow-[0_20px_40px_rgba(59,130,246,0.25)] transition hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center justify-center gap-2">
                {loading ? 'Logging in...' : 'Login to Dashboard'} <ArrowRight size={18} />
              </span>
            </button>

            <div className="relative py-4">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-white/10" />
              <p className="relative mx-auto w-fit rounded-full bg-[#07101e] px-4 text-sm text-gray-500">OR</p>
            </div>

            <button 
              type="button" 
              className="w-full rounded-3xl border border-white/10 bg-[#06111f] px-6 py-4 text-base font-semibold text-white transition hover:bg-white/5"
            >
              <span className="inline-flex items-center justify-center gap-2">
                <ShieldCheck size={18} className="text-blue-400" />
                Login with OTP
              </span>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-400">
            Don't have an account?{' '}
            <a href="/admin/register" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Register Here
            </a>
          </p>

          <p className="mt-6 text-center text-sm text-gray-500">
            <span className="inline-flex items-center gap-2 text-gray-400">
              <Lock size={14} />
              Secure access for authorized administrators only
            </span>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: [0.96, 1, 0.96], y: [0, -8, 0] }}
          transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }}
          className="relative overflow-hidden h-full"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/admin.jpg')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#04080f]/95 via-transparent to-[#04080f]/75" />
          <div className="relative z-10 flex h-full flex-col justify-between p-8 sm:p-12">
            <div className="rounded-[2rem] border border-blue-500/10 bg-[#061426]/55 p-6 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-blue-500/20 text-blue-400">
                  <Camera size={22} />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-blue-300">AI SMART</p>
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-500">SURVEILLANCE SYSTEM</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[2rem] border border-white/10 bg-[#061426]/55 p-5 text-center shadow-[0_20px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <Camera className="mx-auto text-blue-400" size={20} />
                <p className="mt-4 text-sm font-semibold text-white">Real-time Monitoring</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-[#061426]/55 p-5 text-center shadow-[0_20px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <Brain className="mx-auto text-blue-400" size={20} />
                <p className="mt-4 text-sm font-semibold text-white">AI Threat Detection</p>
              </div>
              <div className="rounded-[2rem] border border-white/10 bg-[#061426]/55 p-5 text-center shadow-[0_20px_40px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <Bell className="mx-auto text-blue-400" size={20} />
                <p className="mt-4 text-sm font-semibold text-white">Smart Alerts</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
