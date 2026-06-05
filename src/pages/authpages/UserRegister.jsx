import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, User, Mail, Phone, IdCard, Building, 
  MapPin, Lock, Eye, EyeOff, Camera, Upload,
  CheckCircle, AlertCircle, ChevronRight, X
} from 'lucide-react';

const UserRegister = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [photoPreview, setPhotoPreview] = useState(null);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    employeeId: '',
    department: '',
    email: '',
    phoneNumber: '',
    assignedArea: '',
    password: '',
    confirmPassword: '',
    profilePhoto: null
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ FIXED: Convert image to base64 for backend storage
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Photo size must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setFormData({ ...formData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ ADDED: Remove photo function
  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData({ ...formData, profilePhoto: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      setLoading(false);
      return;
    }

    // ✅ FIXED: Include profilePhoto in userData
    const userData = {
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      employeeId: formData.employeeId,
      department: formData.department,
      assignedArea: formData.assignedArea,
      password: formData.password,
      profilePhoto: formData.profilePhoto // ✅ Now included!
    };

    console.log('📤 Sending registration data:', userData);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      console.log('📥 Response status:', response.status);

      const data = await response.json();
      console.log('📥 Response data:', data);

      if (!response.ok) {
        setError(data.message || 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/user/login');
      }, 2000);
      
    } catch (error) {
      console.error("❌ Fetch Error:", error);
      setError('Server error. Please ensure the backend is running on port 5000.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center p-4 md:p-8">
      {/* Custom Animations */}
      <style>{`
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4); }
          50% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
        }
        .animate-fadeInLeft { animation: fadeInLeft 0.6s ease-out forwards; }
        .animate-fadeInRight { animation: fadeInRight 0.6s ease-out forwards; }
        .animate-pulseGlow { animation: pulseGlow 2s infinite; }
      `}</style>

      <div className="max-w-6xl w-full bg-[#0a1120] rounded-2xl border border-white/10 overflow-hidden shadow-2xl grid md:grid-cols-5">
        
        {/* LEFT SIDE - Profile Photo & Visuals (40%) */}
        <div className="md:col-span-2 relative flex flex-col items-center justify-center p-8 border-r border-white/10 overflow-hidden animate-fadeInLeft bg-[#0d1424]">
          
          {/* Background Image with Overlay */}
          <img 
            src="/images/userregister.jpg" 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/40 via-[#0a1120]/90 to-[#0a1120] z-0"></div>
          
          {/* Content Layer */}
          <div className="relative z-10 flex flex-col items-center justify-center w-full h-full space-y-8">
            
            {/* Logo / Header */}
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-white">User Profile</h2>
              <p className="text-purple-400 text-sm">Upload your official ID photo</p>
              <p className="text-gray-500 text-xs mt-1">(Optional - Max 2MB)</p>
            </div>

            {/* Profile Photo Upload - Centered */}
            <div className="relative group">
              <div className={`w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden transition-all shadow-2xl ${
                photoPreview ? 'border-purple-500/50' : 'border-gray-600 group-hover:border-purple-400'
              } bg-[#05080f]/50 backdrop-blur-sm`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="text-gray-500 group-hover:text-purple-400 transition-colors" size={40} />
                )}
              </div>
              
              {/* ✅ ADDED: Remove Photo Button */}
              {photoPreview && (
                <button 
                  type="button"
                  onClick={removePhoto}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-lg border-2 border-[#0a1120]"
                >
                  <X size={16} className="text-white" />
                </button>
              )}
              
              {/* Upload Button */}
              <label htmlFor="user-photo-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-500 transition-colors shadow-lg border-2 border-[#0a1120]">
                <Upload size={18} className="text-white" />
              </label>
              
              <input 
                type="file" 
                name="profilePhoto" 
                onChange={handlePhotoChange} 
                accept="image/*"
                className="hidden" 
                id="user-photo-upload"
              />
            </div>

            {/* Security Info */}
            <div className="mt-6 text-center space-y-3 px-6">
              <p className="text-gray-300 text-sm font-medium">Security Personnel</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Upload a clear photo for your profile. This will be displayed in your dashboard and used for identification.
              </p>
            </div>

            {/* Badge */}
            <div className="mt-4 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full">
              <span className="text-purple-400 text-xs font-bold tracking-wider">LEVEL 1 ACCESS</span>
            </div>

          </div>
        </div>

        {/* RIGHT SIDE - Registration Form (60%) */}
        <div className="md:col-span-3 p-8 md:p-12 overflow-y-auto animate-fadeInRight">
          
          {/* Header */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/30">
              <Shield className="text-purple-400" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI SMART</h1>
              <p className="text-xs text-gray-400">User Registration</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-1">Create User Account</h2>
            <p className="text-gray-400 text-sm">Enter details to register a new operator</p>
          </div>

          {/* Error and Success Messages Display */}
          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-center space-x-2 text-sm border bg-red-500/10 border-red-500/30 text-red-400">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg flex items-center space-x-2 text-sm border bg-green-500/10 border-green-500/30 text-green-400">
              <CheckCircle size={16} />
              <span>{success}</span>
            </div>
          )}

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg flex items-center space-x-2 text-sm border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Row 1: Full Name & Employee ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                  placeholder="Full Name" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div className="relative">
                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" name="employeeId" value={formData.employeeId} onChange={handleChange} required
                  placeholder="Employee ID" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Row 2: Department & Assigned Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" name="department" value={formData.department} onChange={handleChange} required
                  placeholder="Department (e.g., Security)" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" name="assignedArea" value={formData.assignedArea} onChange={handleChange}
                  placeholder="Assigned Area / Zone (Optional)" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Row 3: Contact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="email" name="email" value={formData.email} onChange={handleChange} required
                  placeholder="Email Address" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required
                  placeholder="Phone Number" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            {/* Row 4: Passwords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required
                  placeholder="Password" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required
                  placeholder="Confirm Password" 
                  className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" disabled={loading}
              className={`w-full mt-4 py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center space-x-2 ${
                loading 
                  ? 'bg-purple-500/50 cursor-not-allowed' 
                  : 'bg-purple-600 hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Register User</span>
                  <ChevronRight size={18} />
                </>
              )}
            </button>

            {/* Back to Login */}
            <p className="mt-6 text-center text-sm text-gray-400">
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/user/login')} className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Login Here
              </button>
            </p>

          </form>
        </div>

      </div>
    </div>
  );
};

export default UserRegister;