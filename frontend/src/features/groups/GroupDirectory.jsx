import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Users, Plus, Loader2, ArrowRight } from 'lucide-react';
import api from '../../services/api';

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
      // In a real app, maybe invalidate user profile too if it lists their groups
    }
  });

  const filteredGroups = groups?.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">University Clubs</h2>
          <p className="text-slate-500 font-medium">Discover communities and connect with like-minded students.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clubs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/70 backdrop-blur-md border border-slate-200 focus:border-primary-500 rounded-xl outline-none transition-all shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold transition-all shadow-md shrink-0">
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary-500" />
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map(group => (
          <div key={group.id} className="glass-card bg-white/60 rounded-3xl overflow-hidden flex flex-col group hover:-translate-y-1 hover:shadow-lg transition-all border border-white/50">
            {/* Banner Placeholder */}
            <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500 relative">
              {group.bannerUrl && (
                <img src={group.bannerUrl} alt={group.name} className="w-full h-full object-cover mix-blend-overlay opacity-50" />
              )}
              {/* Badge */}
              <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                Official
              </div>
            </div>
            
            <div className="p-6 flex-1 flex flex-col relative">
              {/* Avatar overlay */}
              <div className="w-16 h-16 rounded-2xl bg-white shadow-md absolute -top-8 left-6 flex items-center justify-center p-1">
                <div className="w-full h-full bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black text-xl">
                  {group.name.charAt(0)}
                </div>
              </div>

              <div className="mt-8 mb-4">
                <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1 group-hover:text-primary-600 transition-colors">
                  {group.name}
                </h3>
                <div className="flex items-center text-slate-500 text-sm font-medium gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{group.membersCount || Math.floor(Math.random() * 500) + 10} members</span>
                </div>
              </div>

              <p className="text-slate-600 line-clamp-2 leading-relaxed flex-1">
                {group.description || "A community for university students."}
              </p>

              <div className="mt-6 pt-4 border-t border-slate-200/50 flex items-center justify-between">
                <button 
                  onClick={() => joinGroupMutation.mutate(group.id)}
                  disabled={joinGroupMutation.isPending}
                  className="text-primary-600 font-bold hover:text-primary-800 transition-colors"
                >
                  Join Club
                </button>
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors cursor-pointer">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!isLoading && filteredGroups.length === 0 && (
         <div className="text-center py-20 bg-white/40 glass-card rounded-3xl mt-8">
           <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-slate-700 mb-2">No clubs found</h3>
           <p className="text-slate-500 font-medium">Try adjusting your search terms.</p>
         </div>
      )}
    </div>
  );
};

export default GroupDirectory;
