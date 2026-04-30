import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Camera, Trash2, Loader2, UserMinus, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAvatar } from '../../utils/avatar';

const GroupSettings = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // Fetch group details
  const { data, isLoading } = useQuery({
    queryKey: ['group-details', groupId],
    queryFn: async () => {
      const res = await api.get(`/groups/${groupId}`);
      return res.data;
    }
  });

  const group = data?.group;
  const members = data?.members || [];
  const isAdmin = data?.isAdmin;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form when data loads
  useState(() => {
    if (group) {
      setFormData({ name: group.name || '', description: group.description || '' });
      setImageUrl(group.imageUrl || '');
    }
  }, [group]);

  // Update form when group data arrives
  if (group && !formData.name && group.name) {
    setFormData({ name: group.name, description: group.description || '' });
    setImageUrl(group.imageUrl || '');
  }

  // Upload image
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
      setImageUrl(url);
      await api.put(`/groups/${groupId}`, { imageUrl: url });
      queryClient.invalidateQueries({ queryKey: ['group-details', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      showToast('Club image updated!', 'success');
    } catch (err) {
      showToast('Failed to upload image', 'error');
    }
    setIsUploading(false);
  };

  // Save group info
  const saveMutation = useMutation({
    mutationFn: () => api.put(`/groups/${groupId}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details', groupId] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      showToast('Club updated!', 'success');
    },
    onError: () => showToast('Failed to update', 'error')
  });

  // Remove member
  const removeMemberMutation = useMutation({
    mutationFn: (userId) => api.delete(`/groups/${groupId}/members/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-details', groupId] });
      showToast('Member removed', 'success');
    },
    onError: () => showToast('Failed to remove member', 'error')
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] text-center p-8">
        <h2 className="text-2xl font-bold text-on-surface font-[family-name:var(--font-display)]">Access Denied</h2>
        <p className="text-on-surface-variant text-sm mt-2">Only the club admin can access settings.</p>
        <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-full font-bold text-sm">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-80px)] font-[family-name:var(--font-body)] text-on-surface pb-20">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-extrabold font-[family-name:var(--font-display)] tracking-tighter">
            Club Settings
          </h1>
        </div>

        {/* Club Image */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-container/30">
          <h3 className="text-lg font-bold font-[family-name:var(--font-display)] mb-4">Club Image</h3>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl overflow-hidden bg-surface-container shadow-md">
                {imageUrl ? (
                  <img src={imageUrl} alt="Club" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-on-surface-variant">
                    <Camera className="w-8 h-8" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </div>
            <div>
              <p className="text-sm font-bold text-on-surface">Upload a display image</p>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">Recommended: 200×200px, PNG or JPG</p>
            </div>
          </div>
        </div>

        {/* Club Info */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-container/30 space-y-5">
          <h3 className="text-lg font-bold font-[family-name:var(--font-display)]">Club Info</h3>
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Club Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
              className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 text-on-surface font-bold"
            />
          </div>
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
              rows={3}
              className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 text-on-surface font-medium resize-none"
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>

        {/* Members */}
        <div className="bg-surface-container-lowest p-8 rounded-3xl shadow-sm border border-surface-container/30">
          <h3 className="text-lg font-bold font-[family-name:var(--font-display)] mb-4">
            Members ({members.length})
          </h3>
          <div className="space-y-3">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors">
                <img
                  src={m.User?.profileImage || getAvatar(null)}
                  alt={m.User?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold truncate">{m.User?.name}</h4>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {m.role}
                  </span>
                </div>
                {m.userId !== user.id && (
                  <button
                    onClick={() => removeMemberMutation.mutate(m.userId)}
                    disabled={removeMemberMutation.isPending}
                    className="p-2 text-secondary-500 hover:bg-secondary-50 rounded-xl transition-colors"
                    title="Remove member"
                  >
                    <UserMinus className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
