import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Users, Loader2, ArrowRight, Globe, CheckCircle, X, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const GroupDirectory = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });

  const isClubRole = user?.role === 'club' || user?.role === 'admin';

  // Fetch Groups (backend now returns isMember and membersCount)
  const { data: groups, isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data;
    }
  });

  // Join Group Mutation
  const joinGroupMutation = useMutation({
    mutationFn: (groupId) => api.post(`/groups/${groupId}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      showToast('Joined community!', 'success');
    },
    onError: (err) => {
      const msg = err.response?.data?.message || 'Failed to join';
      showToast(msg, 'error');
    }
  });

  // Create Group Mutation
  const createGroupMutation = useMutation({
    mutationFn: (data) => api.post('/groups', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '' });
      showToast('Community created!', 'success');
    },
    onError: (err) => {
      showToast(err.response?.data?.message || 'Failed to create', 'error');
    }
  });

  // Navigate to group chat
  const handleJoinedClick = (groupId) => {
    navigate(`/groups/${groupId}/chat`);
  };

  const filteredGroups = groups?.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-80px)] font-[family-name:var(--font-body)] text-on-surface">
      
      {/* Editorial Hero Section */}
      <section className="relative h-80 w-full overflow-hidden mb-8 rounded-b-[2rem] sm:rounded-3xl shrink-0">
        <img 
          className="w-full h-full object-cover" 
          src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=2698&auto=format&fit=crop" 
          alt="University Clubs" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8 lg:p-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 max-w-7xl mx-auto w-full">
            <div>
              <span className="inline-block px-3 py-1 bg-primary-500/30 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">
                Official Directory
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold text-white font-[family-name:var(--font-display)] tracking-tighter">
                Discover Communities
              </h1>
            </div>
            {/* Only show Create button for club/admin role */}
            {isClubRole && (
              <button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-primary-600 to-tertiary-500 text-white px-8 py-4 rounded-full font-[family-name:var(--font-display)] font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
              >
                Create a Club
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pb-20">
        
        {/* Search Bar */}
        <div className="mb-10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
          <div className="relative group w-full max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 transition-colors group-focus-within:text-primary-600" />
            <input 
              type="text" 
              placeholder="Find a community by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-0 focus:ring-2 focus:ring-primary-500/20 rounded-[1.5rem] outline-none transition-all text-sm font-bold placeholder:text-on-surface-variant/60 shadow-sm text-on-surface"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6 bg-surface-container-low rounded-3xl">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-surface border-t-primary-500 animate-spin" />
              <Globe className="w-8 h-8 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em] font-[family-name:var(--font-display)]">Synchronizing Directory</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredGroups.map((group, index) => {
                const isJoined = group.isMember;
                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    key={group.id} 
                    className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-900/5 transition-all duration-500 flex flex-col"
                  >
                    <div className="h-48 relative overflow-hidden bg-surface-container">
                      <img 
                        src={group.imageUrl || `https://images.unsplash.com/photo-${1522202176988 + index}-670faddee67d?auto=format&fit=crop&q=80&w=600`}
                        alt={group.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10">
                        <span className="material-symbols-outlined text-white text-sm" style={{fontVariationSettings: "'FILL' 1"}}>groups</span>
                      </div>
                      <div className="absolute bottom-4 left-6 right-6">
                         <h3 className="text-2xl font-black text-white font-[family-name:var(--font-display)] tracking-tight leading-none mb-1 drop-shadow-md line-clamp-1">
                          {group.name}
                         </h3>
                         <p className="text-white/80 text-xs font-bold uppercase tracking-widest drop-shadow-md">
                           Official Club
                         </p>
                      </div>
                    </div>
                    
                    <div className="p-6 md:p-8 flex flex-col flex-1 relative bg-surface-container-lowest z-10">
                      <div className="flex items-center gap-4 mb-5 border-b border-surface-container pb-4">
                          <div className="flex items-center text-on-surface-variant text-xs font-bold uppercase tracking-widest gap-1.5 flex-1">
                            <Users className="w-4 h-4 text-secondary-500" />
                            <span>{group.membersCount || 'New'}</span>
                          </div>
                          <div className="flex items-center text-on-surface-variant text-xs font-bold uppercase tracking-widest gap-1.5">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>Verified</span>
                          </div>
                      </div>

                      <p className="text-on-surface font-medium text-sm leading-relaxed mb-8 line-clamp-3 flex-1">
                        {group.description || "A dynamic community dedicated to collective learning, sharing passions, and building an energetic environment for all university students."}
                      </p>

                      <div className="mt-auto">
                        {isJoined ? (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleJoinedClick(group.id)}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-[family-name:var(--font-display)] font-bold text-sm tracking-wide bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Joined — Open Chat
                          </motion.button>
                        ) : (
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              joinGroupMutation.mutate(group.id);
                            }}
                            disabled={joinGroupMutation.isPending}
                            className="w-full flex items-center justify-center gap-2 py-4 rounded-[1.5rem] font-[family-name:var(--font-display)] font-bold text-sm tracking-wide bg-surface-container-low hover:bg-primary-50 text-primary-700 transition-colors"
                          >
                            {joinGroupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (
                              <>Join Community <ArrowRight className="w-4 h-4 ml-1" /></>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
        
        {!isLoading && filteredGroups.length === 0 && (
            <div className="text-center py-32 bg-surface-container-low rounded-[2rem] mt-8">
              <div className="w-24 h-24 bg-surface-container-lowest rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                 <span className="material-symbols-outlined text-4xl text-on-surface-variant">search_off</span>
              </div>
              <h3 className="text-2xl font-black text-on-surface mb-2 tracking-tighter font-[family-name:var(--font-display)]">No clubs match your search</h3>
              <p className="text-on-surface-variant font-medium text-sm tracking-tight max-w-sm mx-auto">
                Try adjusting your search or create a new community!
              </p>
            </div>
        )}
      </div>

      {/* Create Club Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="absolute inset-0 bg-on-surface/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-lowest rounded-[2rem] p-8 w-full max-w-md relative z-10 shadow-2xl border border-surface-container/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-on-surface font-[family-name:var(--font-display)] tracking-tighter">Create a Club</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-2 text-on-surface-variant hover:bg-surface-container rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Club Name</label>
                  <input
                    type="text"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. AI Research Lab"
                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 text-on-surface font-bold placeholder:text-on-surface-variant/50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant mb-2">Description</label>
                  <textarea
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="What's this community about?"
                    rows={3}
                    className="w-full bg-surface-container-low border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary-500/20 text-on-surface font-medium resize-none placeholder:text-on-surface-variant/50"
                  />
                </div>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => createGroupMutation.mutate(newGroup)}
                  disabled={!newGroup.name.trim() || createGroupMutation.isPending}
                  className="w-full py-4 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white rounded-xl font-bold font-[family-name:var(--font-display)] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {createGroupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Community'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GroupDirectory;
