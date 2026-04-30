import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, UserPlus, Loader2 } from 'lucide-react';
import { getAvatar } from '../../utils/avatar';
import api from '../../services/api';

const SuggestionsSidebar = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const res = await api.get('/users/suggestions');
      return res.data;
    }
  });

  // Fetch real trending clubs from API
  const { data: trendingClubs, isLoading: isClubsLoading } = useQuery({
    queryKey: ['trending-clubs'],
    queryFn: async () => {
      const res = await api.get('/groups');
      return res.data;
    }
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: (receiverId) => api.post('/connections/request', { receiverId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suggestions'] });
    }
  });

  if (!user) return null;

  return (
    <aside className="hidden lg:block w-[320px] space-y-8 sticky top-8 h-fit pb-12">
      {/* User Profile Quick View */}
      <div className="flex items-center justify-between px-2">
        <Link to={`/profile/${user.id}`} className="flex items-center gap-4 group">
          <img
            src={getAvatar(user)}
            alt="Self"
            className="w-12 h-12 rounded-full object-cover shadow-sm bg-surface-container-high p-0.5"
          />
          <div>
            <h4 className="font-bold text-sm font-[family-name:var(--font-display)] tracking-tight group-hover:text-primary-600 transition-colors">
              {user.name?.toLowerCase().replace(/\s/g, '_')}
            </h4>
            <p className="text-xs text-on-surface-variant font-medium font-[family-name:var(--font-body)]">
              {user.name}
            </p>
          </div>
        </Link>
      </div>

      {/* Suggested Accounts (with Connect button instead of Follow) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider font-[family-name:var(--font-body)] text-[11px]">
            People you may know
          </h3>
          <Link to="/search" className="text-[11px] font-bold text-primary-600 hover:text-primary-700 transition-colors">
            See All
          </Link>
        </div>
        
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between px-2 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container" />
                  <div className="space-y-2">
                    <div className="h-2 w-20 bg-surface-container rounded" />
                    <div className="h-2 w-12 bg-surface-container-highest rounded" />
                  </div>
                </div>
              </div>
            ))
          ) : suggestions?.length > 0 ? (
            suggestions?.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between px-2 group">
                <Link to={`/profile/${item.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={item.profileImage || getAvatar(null)}
                    alt="Suggest"
                    className="w-8 h-8 rounded-full object-cover bg-surface-container p-[1px] shrink-0"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold font-[family-name:var(--font-display)] tracking-tight group-hover:text-primary-600 transition-colors truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant font-medium truncate">
                      <span className="bg-surface-container px-1.5 py-0.5 rounded-full uppercase tracking-widest font-bold">{item.role}</span>
                    </p>
                  </div>
                </Link>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    connectMutation.mutate(item.id);
                  }}
                  disabled={connectMutation.isPending}
                  className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors font-[family-name:var(--font-body)] shrink-0 ml-2 flex items-center gap-1"
                >
                  {connectMutation.isPending ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      Connect
                    </>
                  )}
                </button>
              </div>
            ))
          ) : (
             <div className="px-2 text-xs text-on-surface-variant font-medium">No suggestions right now.</div>
          )}
        </div>
      </div>

      {/* Trending Clubs — now fetched from real API data */}
      <div className="bg-surface-container-low rounded-2xl p-6 space-y-4 shadow-sm border border-surface-container/50">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-[family-name:var(--font-body)]">
          Trending Clubs
        </h3>
        <div className="space-y-4">
          {isClubsLoading ? (
            <div className="text-xs text-on-surface-variant">Loading...</div>
          ) : trendingClubs && trendingClubs.length > 0 ? (
            trendingClubs.slice(0, 3).map((club) => (
              <Link to={`/groups`} key={club.id} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center overflow-hidden group-hover:scale-110 shadow-sm transition-transform duration-300 shrink-0">
                  {club.imageUrl ? (
                    <img src={club.imageUrl} alt={club.name} className="w-full h-full object-cover" />
                  ) : (
                    <Users className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold font-[family-name:var(--font-display)] tracking-tight group-hover:text-primary-600 transition-colors truncate">
                    {club.name}
                  </h4>
                  <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    {club.membersCount || 0} members
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-xs text-on-surface-variant">No clubs yet. Be the first!</div>
          )}
        </div>
        <Link to="/groups" className="block text-center w-full py-2.5 mt-2 text-xs font-bold bg-surface-container-high rounded-xl hover:bg-surface-container-highest transition-colors font-[family-name:var(--font-body)] text-on-surface">
          View All Clubs
        </Link>
      </div>

      {/* Footer Links */}
      <footer className="px-2 space-y-4 pt-2">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-on-surface-variant font-medium opacity-70">
          {['About', 'Help', 'Press', 'API', 'Jobs', 'Privacy', 'Terms'].map((link) => (
            <a key={link} href="#" className="hover:text-on-surface hover:underline transition-colors">{link}</a>
          ))}
        </div>
        <p className="text-[10px] font-bold text-on-surface-variant opacity-50 uppercase tracking-widest font-[family-name:var(--font-body)]">
          © 2024 UNI-CONNECT
        </p>
      </footer>
    </aside>
  );
};

export default SuggestionsSidebar;
