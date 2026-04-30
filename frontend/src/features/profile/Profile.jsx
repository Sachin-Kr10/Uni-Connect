import { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getAvatar } from '../../utils/avatar';
import { Mail, Calendar, Edit3, Award, Grid, Bookmark, Tag, Loader2, MapPin, LogOut, MessageSquare, Heart, MessageCircle, Camera, UserPlus, UserCheck, Clock, UserX, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useParams, useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const { user: currentUser, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: userId } = useParams();
  const fileInputRef = useRef(null);
  const [activeTab, setActiveTab] = useState('posts');
  
  const isOwnProfile = userId === currentUser?.id;
  const targetId = userId || currentUser?.id;

  // Fetch profile data
  const { data: profileData } = useQuery({
    queryKey: ['user-profile', targetId],
    queryFn: async () => {
      const res = await api.get(`/users/${targetId}`);
      return res.data;
    },
    enabled: !!targetId
  });

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', targetId],
    queryFn: async () => {
      const res = await api.get(`/posts/user/${targetId}`);
      return res.data;
    },
    enabled: !!targetId
  });

  // Connection status
  const { data: connectionStatus } = useQuery({
    queryKey: ['connection-status', targetId],
    queryFn: async () => {
      const res = await api.get(`/connections/status/${targetId}`);
      return res.data;
    },
    enabled: !!targetId && !isOwnProfile
  });

  // Send connection request
  const connectMutation = useMutation({
    mutationFn: () => api.post('/connections/request', { receiverId: targetId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', targetId] });
      showToast('Connection request sent!', 'success');
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to send request', 'error');
    }
  });

  // Remove connection
  const disconnectMutation = useMutation({
    mutationFn: () => api.delete(`/connections/${connectionStatus?.connectionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection-status', targetId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', targetId] });
      showToast('Connection removed', 'info');
    }
  });

  const displayUser = profileData || currentUser;
  const avatar = profileData?.profileImage || (isOwnProfile ? getAvatar(currentUser) : getAvatar(profileData));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data.url;
      await api.put('/users/profile', { profileImage: url });
      updateUser({ profileImage: url });
      queryClient.invalidateQueries({ queryKey: ['user-profile', targetId] });
      showToast('Profile photo updated!', 'success');
    } catch (err) {
      showToast('Failed to upload image', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderConnectionButton = () => {
    if (isOwnProfile) {
      return (
        <>
          <button 
            onClick={() => navigate('/settings')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-on-surface hover:opacity-90 text-surface rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 font-[family-name:var(--font-display)]"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </button>
          <button 
            onClick={handleLogout}
            className="p-3 bg-surface-container-lowest hover:bg-surface-container-high rounded-full text-on-surface-variant transition-all active:scale-90 shadow-sm border-0"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </>
      );
    }

    const status = connectionStatus?.status;

    if (status === 'accepted') {
      return (
        <>
          <button
            onClick={() => disconnectMutation.mutate()}
            disabled={disconnectMutation.isPending}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-green-50 text-green-700 rounded-full font-bold text-sm transition-all shadow-sm active:scale-95 font-[family-name:var(--font-display)] hover:bg-green-100"
          >
            <UserCheck className="w-4 h-4" />
            Connected
          </button>
          <button
            onClick={async () => {
              try {
                const res = await api.post('/chat/direct', { targetUserId: targetId });
                navigate(`/chat/${res.data.id}`);
              } catch (err) {
                showToast('Failed to open chat', 'error');
              }
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white rounded-full font-bold text-sm transition-all shadow-lg shadow-primary-500/20 active:scale-95 font-[family-name:var(--font-display)] hover:shadow-primary-500/40"
          >
            <Send className="w-4 h-4" />
            Message
          </button>
        </>
      );
    }

    if (status === 'pending') {
      if (connectionStatus?.isSender) {
        return (
          <button
            disabled
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-surface-container-low text-on-surface-variant rounded-full font-bold text-sm cursor-default font-[family-name:var(--font-display)]"
          >
            <Clock className="w-4 h-4" />
            Pending
          </button>
        );
      }
      // Receiver can accept from here
      return (
        <button
          onClick={() => {
            api.put(`/connections/${connectionStatus.connectionId}/accept`).then(() => {
              queryClient.invalidateQueries({ queryKey: ['connection-status', targetId] });
              queryClient.invalidateQueries({ queryKey: ['user-profile', targetId] });
              showToast('Connection accepted!', 'success');
            });
          }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 font-[family-name:var(--font-display)]"
        >
          <UserCheck className="w-4 h-4" />
          Accept Request
        </button>
      );
    }

    // None or declined
    return (
      <button
        onClick={() => connectMutation.mutate()}
        disabled={connectMutation.isPending}
        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white rounded-full font-bold text-sm transition-all shadow-lg active:scale-95 font-[family-name:var(--font-display)] disabled:opacity-50"
      >
        {connectMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
        Connect
      </button>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32 bg-surface min-h-[calc(100vh-80px)] font-[family-name:var(--font-body)] text-on-surface">
      {/* Editorial Profile Header */}
      <div className="relative mb-16">
        {/* Abstract Mesh Gradient Cover */}
        <div className="w-full h-48 sm:h-64 rounded-[2rem] bg-gradient-to-br from-primary-400 via-primary-600 to-tertiary-600 shadow-md overflow-hidden relative group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.05]" />
           <motion.div 
             animate={{ 
               scale: [1, 1.2, 1],
               rotate: [0, -10, 0]
             }} 
             transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
             className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-300/30 blur-[100px] rounded-full" 
           />
        </div>

        {/* Avatar & Basic Info Container */}
        <div className="px-6 sm:px-12 -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[2.5rem] bg-surface-container p-2 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-surface-container-high to-surface-container-lowest flex items-center justify-center overflow-hidden">
                  <img 
                    src={avatar} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {isOwnProfile && (
                <>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-4 right-4 w-8 h-8 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 active:scale-90 transition-all z-10"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </>
              )}
              <div className="absolute bottom-4 left-4 w-6 h-6 bg-green-500 border-4 border-surface-container rounded-full shadow-md z-10" />
            </div>

            <div className="flex flex-col items-center sm:items-start pb-2">
              <h1 className="text-3xl sm:text-5xl font-black text-on-surface tracking-tighter mb-2 font-[family-name:var(--font-display)] select-none">
                {displayUser?.name}
              </h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-on-surface-variant font-bold text-sm tracking-tight">
                 <span className="flex items-center gap-1.5 bg-surface-container-highest px-3 py-1.5 rounded-full text-xs uppercase tracking-widest text-on-surface">
                    <Award className="w-4 h-4 text-primary-600" />
                    {displayUser?.role}
                 </span>
                 <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest">
                    <MapPin className="w-4 h-4 text-on-surface-variant" />
                    Global Campus
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-3 pb-2 w-full sm:w-auto mt-4 sm:mt-0">
            {renderConnectionButton()}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-surface-container-lowest rounded-[2rem] p-8 sm:p-10 shadow-sm mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-10 transition-opacity">
           <Bookmark className="w-24 h-24" />
        </div>
        <p className="text-on-surface text-base sm:text-lg leading-relaxed max-w-3xl relative z-10 font-medium">
          {profileData?.bio || 'Passionate about building intuitive digital experiences. Bridging the gap between creative design and robust engineering.'}
        </p>
        <div className="flex items-center gap-10 sm:gap-16 mt-8 pt-8 border-t border-surface-container">
           <div className="flex flex-col">
              <span className="text-3xl font-black text-on-surface font-[family-name:var(--font-display)]">{profileData?.postCount || posts?.length || 0}</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Posts</span>
           </div>
           <div className="flex flex-col">
              <span className="text-3xl font-black text-on-surface font-[family-name:var(--font-display)]">{profileData?.connectionCount || 0}</span>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Connections</span>
           </div>
        </div>
      </div>

      {/* Activity Tabs */}
      <div className="flex justify-center gap-8 sm:gap-16 border-b border-surface-container mb-12">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-2.5 pb-4 border-b-2 font-bold uppercase tracking-widest transition-all text-sm font-[family-name:var(--font-display)] ${activeTab === 'posts' ? 'border-primary-600 text-primary-700' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <Grid className="w-5 h-5 stroke-[2.5px]" /> Posts
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={`flex items-center gap-2.5 pb-4 border-b-2 font-bold uppercase tracking-widest transition-all text-sm font-[family-name:var(--font-display)] ${activeTab === 'saved' ? 'border-primary-600 text-primary-700' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <Bookmark className="w-5 h-5" /> Saved
        </button>
        <button 
          onClick={() => setActiveTab('tagged')}
          className={`flex items-center gap-2.5 pb-4 border-b-2 font-bold uppercase tracking-widest transition-all text-sm font-[family-name:var(--font-display)] ${activeTab === 'tagged' ? 'border-primary-600 text-primary-700' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
          <Tag className="w-5 h-5" /> Tagged
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'posts' && (
        <>
          {isPostsLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <motion.div 
                  key={post.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -6 }}
                  className="relative aspect-[4/5] group cursor-pointer overflow-hidden rounded-[1.5rem] bg-surface-container-lowest shadow-sm hover:shadow-xl hover:shadow-primary-900/10 transition-all duration-300 active:scale-95"
                >
                  {post.mediaUrl ? (
                    <img 
                      src={post.mediaUrl} 
                      alt="Post" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full p-8 flex flex-col items-center justify-center text-center bg-surface-container-low">
                       <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center mb-4 text-primary-500">
                          <MessageSquare className="w-5 h-5" />
                       </div>
                      <p className="text-sm font-medium text-on-surface line-clamp-5 leading-relaxed italic">
                        "{post.content}"
                      </p>
                    </div>
                  )}
                  
                  {/* Premium Overlay on hover */}
                  <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between text-white pb-6 pt-16">
                     <div className="flex items-center gap-6">
                       <div className="flex items-center gap-2">
                         <Heart className="w-5 h-5 fill-white text-white" />
                         <span className="font-bold text-sm">{post.likesCount || 0}</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <MessageCircle className="w-5 h-5 fill-white text-white" />
                         <span className="font-bold text-sm">{post.commentsCount || 0}</span>
                       </div>
                     </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-surface-container-lowest rounded-[2.5rem] shadow-sm">
              <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6 transform hover:rotate-12 transition-transform duration-300">
                 <span className="material-symbols-outlined text-4xl text-on-surface-variant">photo_library</span>
              </div>
              <h3 className="text-3xl font-black text-on-surface tracking-tighter mb-3 font-[family-name:var(--font-display)]">Your Gallery</h3>
              <p className="text-on-surface-variant font-medium text-sm tracking-tight max-w-sm mx-auto leading-relaxed">
                Curate your story. Begin sharing your university experiences, projects, and moments.
              </p>
              <Link 
                to="/feed"
                className="inline-block mt-8 px-6 py-3 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white font-bold rounded-full hover:scale-105 transition-transform font-[family-name:var(--font-display)] text-sm tracking-wide"
              >
                 Create First Post
              </Link>
            </div>
          )}
        </>
      )}

      {activeTab === 'saved' && (
        <div className="text-center py-32 bg-surface-container-lowest rounded-[2.5rem] shadow-sm">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
            <Bookmark className="w-10 h-10 text-on-surface-variant" />
          </div>
          <h3 className="text-2xl font-black text-on-surface tracking-tighter mb-3 font-[family-name:var(--font-display)]">Saved Posts</h3>
          <p className="text-on-surface-variant font-medium text-sm max-w-sm mx-auto">
            Posts you save will appear here. Start bookmarking content you love!
          </p>
        </div>
      )}

      {activeTab === 'tagged' && (
        <div className="text-center py-32 bg-surface-container-lowest rounded-[2.5rem] shadow-sm">
          <div className="w-24 h-24 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
            <Tag className="w-10 h-10 text-on-surface-variant" />
          </div>
          <h3 className="text-2xl font-black text-on-surface tracking-tighter mb-3 font-[family-name:var(--font-display)]">Tagged Posts</h3>
          <p className="text-on-surface-variant font-medium text-sm max-w-sm mx-auto">
            When someone tags you in a post, it will show up here.
          </p>
        </div>
      )}

    </div>
  );
};

export default Profile;
