import { useAuth } from '../../context/AuthContext';
import { Mail, Calendar, Edit3, Award, Grid, Bookmark, Tag, Loader2, MapPin, LogOut, MessageSquare, Heart, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useParams } from 'react-router-dom';

const Profile = () => {
  const { user: currentUser } = useAuth();
  const { id: userId } = useParams();
  
  // Decide which user to fetch (current or from URL)
  const targetId = userId || currentUser?.id;

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['user-posts', targetId],
    queryFn: async () => {
      const res = await api.get(`/posts/user/${targetId}`);
      return res.data;
    },
    enabled: !!targetId
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-32">
      {/* Premium Profile Header */}
      <div className="relative mb-12">
        {/* Animated Mesh Gradient Cover */}
        <div className="w-full h-48 sm:h-64 rounded-[32px] bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-600 shadow-xl overflow-hidden relative group">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
           <motion.div 
             animate={{ 
               scale: [1, 1.1, 1],
               rotate: [0, 5, 0]
             }} 
             transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
             className="absolute -top-24 -right-24 w-96 h-96 bg-white/20 blur-3xl rounded-full" 
           />
        </div>

        {/* Avatar & Basic Info Container */}
        <div className="px-8 -mt-16 sm:-mt-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[40px] bg-white p-1.5 shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer">
                <div className="w-full h-full rounded-[34px] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center overflow-hidden border border-slate-100">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.name}`} 
                    alt="avatar" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 border-4 border-white rounded-full shadow-lg" />
            </div>

            <div className="flex flex-col items-center sm:items-start pb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tighter mb-1 select-none">
                {currentUser?.name}
              </h1>
              <div className="flex items-center gap-3 text-slate-500 font-bold text-sm tracking-tight">
                 <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1 rounded-full text-[11px] uppercase tracking-widest text-slate-600">
                    <Award className="w-3.5 h-3.5 text-primary-500" />
                    {currentUser?.role}
                 </span>
                 <span className="flex items-center gap-1 text-[13px] font-medium">
                    <MapPin className="w-3.5 h-3.5" />
                    Mumbai, India
                 </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pb-2">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-sm transition-all shadow-lg active:scale-95">
              <Edit3 className="w-4 h-4" />
              Edit Profile
            </button>
            <button className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all active:scale-90 shadow-sm">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="bg-white rounded-[32px] p-8 border border-slate-200/60 shadow-sm mb-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
           <Bookmark className="w-12 h-12" />
        </div>
        <p className="text-slate-600 font-medium text-lg leading-relaxed max-w-3xl relative z-10">
          Computer Science student deeply interested in AI, web development, and large-scale distributed systems. Always building something new and exploring the intersection of design and code.
        </p>
        <div className="flex items-center gap-8 mt-8 border-t border-slate-100 pt-6">
           <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">{posts?.length || 0}</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Posts</span>
           </div>
           <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">1.2k</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Followers</span>
           </div>
           <div className="flex flex-col">
              <span className="text-2xl font-black text-slate-900">450</span>
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Following</span>
           </div>
        </div>
      </div>

      {/* Activity Tabs (Clean & Professional) */}
      <div className="flex justify-center gap-10 sm:gap-16 border-t border-slate-200/60 mb-8 pt-1">
        <button className="flex items-center gap-2.5 py-4 border-t-2 border-slate-900 -mt-[2px] text-[11px] font-black tracking-[0.2em] uppercase text-slate-900 transition-all">
          <Grid className="w-4 h-4 stroke-[3px]" /> Posts
        </button>
        <button className="flex items-center gap-2.5 py-4 border-t-2 border-transparent -mt-[2px] text-slate-400 text-[11px] font-black tracking-[0.2em] uppercase hover:text-slate-600 transition-all">
          <Bookmark className="w-4 h-4" /> Saved
        </button>
        <button className="flex items-center gap-2.5 py-4 border-t-2 border-transparent -mt-[2px] text-slate-400 text-[11px] font-black tracking-[0.2em] uppercase hover:text-slate-600 transition-all">
          <Tag className="w-4 h-4" /> Tagged
        </button>
      </div>

      {/* Posts Grid */}
      {isPostsLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-slate-200" />
        </div>
      ) : posts && posts.length > 0 ? (
        <div className="grid grid-cols-3 gap-1.5 sm:gap-6 lg:gap-8">
          {posts.map((post) => (
            <motion.div 
              key={post.id} 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className="relative aspect-square group cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl bg-white shadow-sm border border-slate-100 transition-all active:scale-95"
            >
              {post.mediaUrl ? (
                <img 
                  src={post.mediaUrl} 
                  alt="Post" 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
              ) : (
                <div className="w-full h-full p-6 flex flex-col items-center justify-center text-center bg-slate-50/50">
                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                   </div>
                  <p className="text-[10px] sm:text-[13px] font-bold text-slate-800 line-clamp-4 leading-relaxed">{post.content}</p>
                </div>
              )}
              
              {/* Premium Overlay on hover */}
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-8 text-white font-black">
                 <div className="flex items-center gap-2.5">
                   <Heart className="w-6 h-6 fill-white" />
                   <span className="text-lg">{post.likesCount || 0}</span>
                 </div>
                 <div className="flex items-center gap-2.5">
                   <MessageCircle className="w-6 h-6 fill-white" />
                   <span className="text-lg">{post.commentsCount || 0}</span>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200/80">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mx-auto mb-6 transform rotate-3">
             <Grid className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">No active posts yet</h3>
          <p className="text-slate-500 font-bold text-sm tracking-tight max-w-sm mx-auto">
            Your university journey is just beginning. Share your first moment with the campus!
          </p>
        </div>
      )}

    </div>
  );
};

export default Profile;
