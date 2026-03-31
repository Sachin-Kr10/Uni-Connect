import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Users, Plus, Loader2, ArrowRight, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const GroupDirectory = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch Groups
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
    }
  });

  const filteredGroups = groups?.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="w-full">
      {/* Premium Hero Section */}
      <div className="relative mb-12 rounded-[40px] overflow-hidden bg-slate-900 px-8 py-16 sm:px-12 sm:py-20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/40 via-purple-600/40 to-blue-600/40 opacity-50" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/20 blur-[120px] rounded-full" 
        />
        
        <div className="relative z-10 max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            Vibrant Communities
          </motion.div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
            University <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-300">Clubs</span>
          </h1>
          <p className="text-lg sm:text-xl text-indigo-100/80 font-bold leading-relaxed mb-10 max-w-md">
            Connect with like-minded students, share your passions, and build something together.
          </p>
          
          <div className="flex flex-wrap gap-4">
             <div className="flex -space-x-3">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                   {String.fromCharCode(64 + i)}
                 </div>
               ))}
               <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-[10px] font-black text-white">
                 +5k
               </div>
             </div>
             <div className="flex flex-col justify-center">
                <span className="text-white font-black text-sm">Joined by thousands</span>
                <span className="text-indigo-300/60 text-[10px] font-black uppercase tracking-widest">Active Campus Hub</span>
             </div>
          </div>
        </div>
      </div>

      {/* Modern Filter & Search Bar */}
      <div className="mb-12 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div className="relative group flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Find a club by name or keyword..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-2 border-transparent focus:border-white focus:ring-8 focus:ring-primary-500/5 rounded-3xl outline-none transition-all text-sm font-bold placeholder:text-slate-400 shadow-xl shadow-slate-200/40"
          />
        </div>
        
        <div className="flex items-center gap-3">
           <button className="px-6 py-4 bg-white border border-slate-200 rounded-3xl font-black text-[11px] uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all hover:shadow-lg active:scale-95">
              Categories
           </button>
           <motion.button 
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2.5 px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-[28px] font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-slate-900/20"
           >
             <Plus className="w-5 h-5 stroke-[2.5px]" />
             Create New Club
           </motion.button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-primary-500 animate-spin" />
            <Globe className="w-8 h-8 text-primary-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Synchronizing Directory</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredGroups.map((group, index) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                key={group.id} 
                className="group relative bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-2 transition-all duration-500 cursor-pointer"
              >
                {/* Visual Header */}
                <div className="h-40 bg-slate-900 relative">
                  <img 
                    src={`https://images.unsplash.com/photo-${1522202176988 + index}-670faddee67d?auto=format&fit=crop&q=80&w=600`}
                    alt={group.name} 
                    className="w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-80" />
                  
                  {/* Status Badges */}
                  <div className="absolute top-6 left-6 flex items-center gap-2">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest text-white border border-white/20">
                      Official
                    </span>
                  </div>
                  <div className="absolute top-6 right-6">
                    <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white hover:text-slate-900 transition-colors">
                      <ShieldCheck className="w-5 h-5 stroke-[2.5px]" />
                    </div>
                  </div>
                </div>
                
                <div className="p-8 pt-0 flex flex-col relative">
                  {/* Dynamic Logo */}
                  <div className="w-20 h-20 rounded-[28px] bg-white border-4 border-white shadow-2xl absolute -top-10 left-8 flex items-center justify-center overflow-hidden group-hover:scale-110 transition-transform duration-500">
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-black text-3xl">
                      {group.name.charAt(0)}
                    </div>
                  </div>

                  <div className="mt-14 mb-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-2">
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center text-slate-500 text-[11px] font-black uppercase tracking-widest gap-2">
                        <Users className="w-4 h-4 text-primary-500" />
                        <span>{group.membersCount || 120} Members</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-500 font-bold text-sm leading-relaxed mb-8 line-clamp-2">
                    {group.description || "A community dedicated to learning, growing, and building an active campus life for all students."}
                  </p>

                  <div className="flex items-center justify-between gap-4 mt-auto">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        joinGroupMutation.mutate(group.id);
                      }}
                      disabled={joinGroupMutation.isPending}
                      className="flex-1 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-lg active:scale-95"
                    >
                      {joinGroupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Join Community"}
                    </motion.button>
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {!isLoading && filteredGroups.length === 0 && (
          <div className="text-center py-32">
            <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 border border-dashed border-slate-200 rotate-12 transition-transform hover:rotate-0">
               <Users className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tighter">No clubs matches your search</h3>
            <p className="text-slate-500 font-bold text-sm tracking-tight max-w-xs mx-auto">
              Our campus is huge, but we couldn't find that one. Try a different keyword!
            </p>
          </div>
      )}
    </div>
  );
};

export default GroupDirectory;
