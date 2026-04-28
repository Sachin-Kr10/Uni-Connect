import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { getAvatar } from '../../utils/avatar';
import { Camera, Mail, MessageSquare, Save, X, Moon, Sun, Bell, Shield, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || 'Computer Science student deeply interested in AI, web development, and large-scale distributed systems.',
  });
  const [profileImage, setProfileImage] = useState(getAvatar(user));
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Notification toggles
  const [emailDigest, setEmailDigest] = useState(true);
  const [chatNotif, setChatNotif] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      setProfileImage(url);
      // Also save to backend immediately
      await api.put('/users/profile', { profileImage: url });
      updateUser({ profileImage: url });
      showToast('Profile photo updated!', 'success');
    } catch (err) {
      showToast('Failed to upload image', 'error');
    }
    setIsUploading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.put('/users/profile', {
        name: formData.name,
        bio: formData.bio,
      });
      updateUser({ name: res.data.name, bio: res.data.bio });
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
    setIsSaving(false);
  };

  const handleDiscard = () => {
    setFormData({
      name: user?.name || '',
      bio: user?.bio || '',
    });
    setProfileImage(getAvatar(user));
    showToast('Changes discarded', 'info');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 p-6 sm:p-10 lg:p-12 bg-surface min-h-[calc(100vh-80px)] w-full font-[family-name:var(--font-body)] text-on-surface">
      <div className="max-w-3xl mx-auto space-y-12 pb-20">
        
        {/* Header Section */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-[family-name:var(--font-display)] tracking-tighter text-on-surface mb-3">Settings</h1>
          <p className="text-on-surface-variant leading-relaxed max-w-xl font-medium">
            Update your profile information and manage your Uni-Connect experience.
          </p>
        </div>

        {/* Bento-style Form Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Profile Identity Card */}
          <div className="col-span-1 md:col-span-2 bg-surface-container-low p-8 rounded-[2rem] space-y-6 shadow-sm border border-surface-container/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-full bg-surface-container-highest border-4 border-surface shadow-lg flex items-center justify-center overflow-hidden">
                   <img 
                     src={profileImage} 
                     alt="Profile" 
                     className="w-full h-full object-cover" 
                   />
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="absolute bottom-0 right-0 p-2.5 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input 
                  ref={fileInputRef} 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </div>
              <div>
                <h3 className="text-2xl font-black font-[family-name:var(--font-display)] text-on-surface mb-1">Profile Photo</h3>
                <p className="text-on-surface-variant text-sm font-medium">Click the camera icon to upload your profile picture.</p>
              </div>
            </div>
          </div>

          {/* Input Block 1: Username */}
          <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm flex flex-col justify-center border border-surface-container/30">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-[family-name:var(--font-display)]">
              Display Name
            </label>
            <input 
              className="w-full bg-transparent border-0 border-b-2 border-surface-container-low focus:ring-0 focus:border-primary-500 py-2 pl-0 text-xl font-[family-name:var(--font-display)] font-bold transition-all text-on-surface placeholder:text-surface-dim" 
              type="text" 
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your name"
            />
          </div>

          {/* Input Block 2: Email */}
          <div className="bg-surface-container-lowest p-6 rounded-[1.5rem] shadow-sm flex flex-col justify-center border border-surface-container/30">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2 font-[family-name:var(--font-display)]">
              Email Address
            </label>
            <input 
              className="w-full bg-transparent border-0 border-b-2 border-surface-container-low focus:ring-0 focus:border-primary-500 py-2 pl-0 text-xl font-[family-name:var(--font-display)] font-bold transition-all text-on-surface opacity-60 cursor-not-allowed" 
              type="email" 
              defaultValue={user?.email || ""} 
              disabled
            />
            <span className="text-[10px] text-primary-500 font-bold mt-2">Verified via university portal</span>
          </div>

          {/* Full Width Block: Bio */}
          <div className="col-span-1 md:col-span-2 bg-surface-container-lowest p-8 rounded-[2rem] shadow-sm border border-surface-container/30">
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-[family-name:var(--font-display)]">
              Bio
            </label>
            <textarea 
              className="w-full bg-surface-container-low/50 rounded-xl border border-transparent focus:ring-0 focus:border-primary-500/30 p-4 text-on-surface font-medium transition-all resize-none shadow-inner" 
              rows="4" 
              placeholder="Tell the community about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            />
          </div>
        </div>

        {/* Appearance Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-black font-[family-name:var(--font-display)] mb-8 text-on-surface">Appearance</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-surface-container-low rounded-[1.5rem] gap-4 sm:gap-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 flex items-center justify-center bg-tertiary-500/10 rounded-2xl text-tertiary-600 shrink-0">
                  {isDark ? <Moon className="w-6 h-6 stroke-[2.5px]" /> : <Sun className="w-6 h-6 stroke-[2.5px]" />}
                </div>
                <div>
                  <h4 className="font-bold font-[family-name:var(--font-display)] text-lg text-on-surface mb-0.5">Dark Mode</h4>
                  <p className="text-sm text-on-surface-variant font-medium">Switch to {isDark ? 'light' : 'dark'} theme for a different vibe.</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`toggle-switch ${isDark ? 'active' : 'inactive'} self-end sm:self-auto`}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        {/* Notifications Grid Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-black font-[family-name:var(--font-display)] mb-8 text-on-surface">Notification Preferences</h2>
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-surface-container-low rounded-[1.5rem] gap-4 sm:gap-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 flex items-center justify-center bg-primary-500/10 rounded-2xl text-primary-600 shrink-0">
                  <Mail className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div>
                  <h4 className="font-bold font-[family-name:var(--font-display)] text-lg text-on-surface mb-0.5">Email Digest</h4>
                  <p className="text-sm text-on-surface-variant font-medium">Weekly curated community summaries and top stories.</p>
                </div>
              </div>
              <button
                onClick={() => setEmailDigest(!emailDigest)}
                className={`toggle-switch ${emailDigest ? 'active' : 'inactive'} self-end sm:self-auto`}
              >
                <span className="toggle-knob" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-surface-container-low rounded-[1.5rem] gap-4 sm:gap-0">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 flex items-center justify-center bg-secondary-500/10 rounded-2xl text-secondary-600 shrink-0">
                  <MessageSquare className="w-6 h-6 stroke-[2.5px]" />
                </div>
                <div>
                  <h4 className="font-bold font-[family-name:var(--font-display)] text-lg text-on-surface mb-0.5">Chat Messages</h4>
                  <p className="text-sm text-on-surface-variant font-medium">Real-time alerts for new member interactions.</p>
                </div>
              </div>
              <button
                onClick={() => setChatNotif(!chatNotif)}
                className={`toggle-switch ${chatNotif ? 'active' : 'inactive'} self-end sm:self-auto`}
              >
                <span className="toggle-knob" />
              </button>
            </div>

          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-12">
          <h2 className="text-2xl font-black font-[family-name:var(--font-display)] mb-8 text-on-surface">Account</h2>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-4 bg-secondary-50 hover:bg-secondary-100 text-secondary-700 rounded-[1.5rem] font-bold transition-all w-full sm:w-auto"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Action Footer */}
        <div className="flex sm:items-center flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-10 mt-10 border-t border-surface-container">
          <button 
            onClick={handleDiscard}
            className="w-full sm:w-auto px-8 py-3.5 text-on-surface-variant hover:bg-surface-container-low rounded-full font-bold font-[family-name:var(--font-display)] transition-all flex justify-center items-center gap-2"
          >
            <X className="w-4 h-4" /> Discard
          </button>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-10 py-3.5 bg-gradient-to-r from-primary-600 to-tertiary-500 hover:from-primary-700 hover:to-tertiary-600 text-white rounded-full font-bold font-[family-name:var(--font-display)] shadow-lg shadow-primary-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>

      </div>
    </div>
  );
};

export default Settings;
