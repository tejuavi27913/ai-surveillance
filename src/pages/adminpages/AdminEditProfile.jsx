import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, IdCard, Building, MapPin,
  Upload, Save, ArrowLeft, CheckCircle, AlertCircle, X, Camera
} from 'lucide-react';

const AdminEditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    adminId: '',
    organizationName: '',
    profilePhoto: null
  });

  // ✅ Fetch current admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser?.id) {
          navigate('/admin/login');
          return;
        }
        
        const response = await fetch(`http://localhost:5000/api/users/${storedUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        
        if (result.success) {
          const admin = result.data;
          setFormData({
            fullName: admin.full_name || '',
            email: admin.email || '',
            phoneNumber: admin.phone_number || '',
            adminId: admin.admin_id || '',
            organizationName: admin.organization_name || '',
            profilePhoto: admin.profile_photo || null
          });
          if (admin.profile_photo) {
            setPhotoPreview(admin.profile_photo);
          }
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setSuccess('');
  };

  // ✅ Handle photo upload (convert to base64)
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
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

  const removePhoto = () => {
    setPhotoPreview(null);
    setFormData({ ...formData, profilePhoto: null });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      const response = await fetch(`http://localhost:5000/api/admin/${storedUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || 'Failed to update profile');
        setSaving(false);
        return;
      }

      setSuccess('Profile updated successfully!');
      
      // Update localStorage with new data
      if (result.data) {
        localStorage.setItem('user', JSON.stringify(result.data));
      }
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
      
    } catch (error) {
      console.error("❌ Update Error:", error);
      setError('Server error. Please try again.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a1120] flex items-center justify-center text-white">
        <div className="text-xl font-semibold animate-pulse">Loading Profile...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Back Button & Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/admin/dashboard')}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-400 hover:text-white" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">EDIT ADMIN PROFILE</h2>
            <p className="text-gray-400 text-sm">Update your administrator information and photo</p>
          </div>
        </div>
      </div>

      {/* Error / Success Messages */}
      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm border bg-red-500/10 border-red-500/30 text-red-400">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 rounded-xl flex items-center space-x-3 text-sm border bg-green-500/10 border-green-500/30 text-green-400">
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side - Photo Upload */}
        <div className="lg:col-span-1">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-white mb-6">Profile Photo</h3>
            
            <div className="flex flex-col items-center">
              {/* Photo Preview */}
              <div className="relative group mb-6">
                <div className={`w-40 h-40 rounded-full border-4 border-dashed flex items-center justify-center overflow-hidden transition-all shadow-2xl ${
                  photoPreview ? 'border-blue-500/50' : 'border-gray-600 group-hover:border-blue-400'
                } bg-[#05080f]/50 backdrop-blur-sm`}>
                  {photoPreview ? (
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="text-gray-500 group-hover:text-blue-400 transition-colors" size={48} />
                  )}
                </div>
                
                {photoPreview && (
                  <button 
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-0 right-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-400 transition-colors shadow-lg border-2 border-[#0a1120]"
                  >
                    <X size={16} className="text-white" />
                  </button>
                )}
                
                <label 
                  htmlFor="admin-photo-upload" 
                  className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-500 transition-colors shadow-lg border-2 border-[#0a1120]"
                >
                  <Upload size={18} className="text-white" />
                </label>
                
                <input 
                  type="file" 
                  onChange={handlePhotoChange} 
                  accept="image/*"
                  className="hidden" 
                  id="admin-photo-upload"
                />
              </div>

              <p className="text-gray-400 text-sm text-center mb-2">
                {photoPreview ? 'Click upload to change photo' : 'Upload your profile photo'}
              </p>
              <p className="text-gray-500 text-xs text-center">
                JPG, PNG up to 2MB
              </p>

              {/* Info Box */}
              <div className="mt-6 w-full p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <p className="text-blue-400 text-xs font-semibold mb-1">💡 Tip</p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Your photo will be displayed on your profile, dashboard, and used for identification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="lg:col-span-2">
          <div className="bg-[#0f172a] border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Administrator Information</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Row 1: Full Name & Admin ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" name="fullName" value={formData.fullName} onChange={handleChange} required
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Admin ID</label>
                  <div className="relative">
                    <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="text" name="adminId" value={formData.adminId} onChange={handleChange}
                      disabled
                      className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-400 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Cannot be changed</p>
                </div>
              </div>

              {/* Row 2: Email & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleChange} required
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input 
                      type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}
                      className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3: Organization */}
              <div className="relative">
                <label className="block text-sm text-gray-400 mb-2">Organization Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                  <input 
                    type="text" name="organizationName" value={formData.organizationName} onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-white/10">
                <button 
                  type="button"
                  onClick={() => navigate('/admin/dashboard')}
                  className="px-6 py-3 border border-white/20 hover:bg-white/5 rounded-xl text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className={`px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center space-x-2 ${
                    saving 
                      ? 'bg-blue-500/50 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25'
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProfile;