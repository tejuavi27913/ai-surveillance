import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, User, Mail, Phone, Building, Fingerprint, 
  Lock, Eye, EyeOff, MapPin, Upload, Camera, 
  CheckCircle, AlertCircle, ChevronRight 
} from 'lucide-react';

const AdminRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    adminId: '',
    organizationName: '',
    securityLevel: 'Admin',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profilePhoto: file });
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  // ✅ FIXED: Now sends JSON instead of FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match!' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    // ✅ Prepare JSON data (NOT FormData)
    const adminData = {
      fullName: formData.fullName,
      adminId: formData.adminId,
      organizationName: formData.organizationName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      address: formData.address,
      password: formData.password
    };

    console.log('📤 Sending admin registration data:', adminData);

    try {
      const endpoint = window.location.pathname.includes('admin') 
        ? 'http://localhost:5000/api/admin/register' 
        : 'http://localhost:5000/api/user/register';

      const res = await fetch(endpoint, { 
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(adminData)
      });

      console.log('📥 Response status:', res.status);
      const result = await res.json();
      console.log('📥 Response data:', result);

      if (res.ok) {
        setMessage({ type: 'success', text: result.message || 'Registration successful!' });
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.message || 'Registration failed' });
      }
    } catch (err) {
      console.error("❌ Fetch Error:", err);
      setMessage({ type: 'error', text: 'Connection to server failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-4 md:p-8">
      {/* Custom Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
        }
        .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
        .animate-pulseGlow { animation: pulseGlow 2s infinite; }
      `}</style>

      <div className="max-w-6xl w-full bg-[#0a1120] rounded-2xl border border-white/10 overflow-hidden shadow-2xl grid md:grid-cols-5 animate-fadeInUp">
        
        {/* LEFT SIDE - Registration Form (60%) */}
        <div className="md:col-span-3 p-8 md:p-12">
          
          {/* Header */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/30">
              <Shield className="text-blue-400" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">AI SMART</h1>
              <p className="text-sm text-gray-400">Surveillance System</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Admin Registration</h2>
            <p className="text-gray-400 text-sm">Create a new administrator account with full system access</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Profile Photo Upload */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-6">
              <div className="relative group">
                <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                  photoPreview ? 'border-blue-500/50' : 'border-gray-600 hover:border-blue-400'
                }`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-gray-500 group-hover:text-blue-400 transition-colors" size={28} />
                  )}
                </div>
                <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-400 transition-colors shadow-lg">
                  <Upload size={14} className="text-white" />
                </label>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-white mb-2">Profile Photo</label>
                <input 
                  type="file" 
                  name="profilePhoto" 
                  onChange={handlePhotoChange} 
                  accept="image/*"
                  className="hidden" 
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer text-sm text-gray-400 hover:text-blue-400 transition-colors underline">
                  Click to upload photo (JPG, PNG)
                </label>
                <p className="text-xs text-gray-500 mt-1">Recommended: 500x500px, Max 2MB</p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 my-6"></div>

            {/* Row 1: Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                  placeholder="Full Name" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="relative">
                <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" name="adminId" value={formData.adminId} onChange={handleChange} required
                  placeholder="Admin ID (Unique Identifier)" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Row 2: Organization & Security Level */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} required
                  placeholder="Organization / Company Name" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="relative">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <select 
                  name="securityLevel" value={formData.securityLevel} onChange={handleChange}
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
                <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 rotate-90" size={18} />
              </div>
            </div>

            {/* Row 3: Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="Email Address" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                  placeholder="Phone Number" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div className="relative">
              <MapPin className="absolute left-4 top-4 text-gray-500" size={18} />
              <textarea 
                name="address" value={formData.address} onChange={handleChange} required rows="3"
                placeholder="Company / Office Address" 
                className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
              ></textarea>
            </div>

            {/* Row 4: Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required
                  placeholder="Password" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                  placeholder="Confirm Password" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" disabled={loading}
              className={`w-full mt-6 py-4 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                loading 
                  ? 'bg-blue-500/50 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register Admin</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            {/* Back to Login */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/admin/login')} className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Login Here
              </button>
            </p>

          </form>
        </div>

        {/* RIGHT SIDE - Full Height Image Panel (40%) */}
        <div className="md:col-span-2 relative flex flex-col items-center justify-center p-8 border-l border-white/10 overflow-hidden">
          
          {/* 🖼️ FULL HEIGHT BACKGROUND IMAGE */}
          <img 
            src="/images/adminregister.jpg" 
            alt="Admin Background" 
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          
          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-[#0a1120]/85 z-0"></div>
          
          {/* Tech Grid Overlay (Cyber Effect) */}
          <div className="absolute inset-0 opacity-10 z-0" style={{
            backgroundImage: 'linear-gradient(rgba(59, 130, 246, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.4) 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}></div>

          {/* Content Layer (Sits ON TOP of the image) */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full w-full space-y-8">
            
            {/* Animated Shield */}
            <div className="animate-pulseGlow rounded-2xl">
              <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/30 rounded-2xl flex items-center justify-center backdrop-blur-md shadow-lg">
                <Shield className="text-blue-400" size={40} />
              </div>
            </div>

            {/* Text Content */}
            <div className="text-center space-y-4 px-4">
              <h3 className="text-2xl font-bold text-white tracking-wide">Secure Registration</h3>
              <p className="text-gray-300 text-sm max-w-xs mx-auto leading-relaxed">
                Administrator accounts require verified credentials and organization details for system access.
              </p>
            </div>

            {/* Security Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-medium rounded-full backdrop-blur-md">AES-256 Encrypted</span>
              <span className="px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-medium rounded-full backdrop-blur-md">Verified Admin</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminRegister;