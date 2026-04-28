import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Camera, Music } from 'lucide-react';
import { getAvatar } from '../../utils/avatar';
import api from '../../services/api';

const SuggestionsSidebar = () => {
  const { user } = useAuth();

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: async () => {
      const res = await api.get('/users/suggestions');
      return res.data;
    }
  });

  if (!user) return null;

  const trendingClubs = [
    { name: 'Analog Aesthetics', members: '2.4k members today', icon: Camera, colorClass: 'bg-primary-100 text-primary-600' },
    { name: 'Berlin Techno Scene', members: 'Active now • 560 online', icon: Music, colorClass: 'bg-secondary-100 text-secondary-600' },
  ];

  return (
    <aside className="hidden lg:block w-[320px] space-y-8 sticky top-8 h-fit pb-12">
      {/* User Profile Quick View */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <img
            src={getAvatar(user)}
            alt="Self"
            className="w-12 h-12 rounded-full object-cover shadow-sm bg-surface-container-high p-0.5"
          />
          <div>
            <h4 className="font-bold text-sm font-[family-name:var(--font-display)] tracking-tight">
              {user.name?.toLowerCase().replace(/\s/g, '_')}
            </h4>
            <p className="text-xs text-on-surface-variant font-medium font-[family-name:var(--font-body)]">
              {user.name}
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Accounts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider font-[family-name:var(--font-body)] text-[11px]">
            Suggested for you
          </h3>
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
            suggestions?.slice(0, 3).map((item, idx) => (
              <Link to={`/profile/${item.id}`} key={item.id} className="flex items-center justify-between px-2 group">
                <div className="flex items-center gap-3">
                  <img
                    src={item.profileImage || getAvatar(null)}
                    alt="Suggest"
                    className="w-8 h-8 rounded-full object-cover bg-surface-container p-[1px]"
                  />
                  <div>
                    <h4 className="text-xs font-bold font-[family-name:var(--font-display)] tracking-tight group-hover:text-primary-600 transition-colors">
                      {item.name?.toLowerCase().replace(/\s/g, '_')}
                    </h4>
                    <p className="text-[10px] text-on-surface-variant font-medium">
                       {idx === 0 ? "Followed by users you know" : idx === 1 ? "New to Uni-Connect" : "Suggested for you"}
                    </p>
                  </div>
                </div>
                <button className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors font-[family-name:var(--font-body)]">
                  Follow
                </button>
              </Link>
            ))
          ) : (
             <div className="px-2 text-xs text-on-surface-variant font-medium">No suggestions right now.</div>
          )}
        </div>
      </div>

      {/* Recent Activity / Trending Clubs */}
      <div className="bg-surface-container-low rounded-2xl p-6 space-y-4 shadow-sm border border-surface-container/50">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider font-[family-name:var(--font-body)]">
          Trending Clubs
        </h3>
        <div className="space-y-4">
          {trendingClubs.map((club) => (
            <Link to="/groups" key={club.name} className="flex items-center gap-4 group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${club.colorClass} group-hover:scale-110 shadow-sm transition-transform duration-300`}>
                <club.icon className="w-6 h-6 stroke-[1.5px]" />
              </div>
              <div>
                <h4 className="text-xs font-bold font-[family-name:var(--font-display)] tracking-tight group-hover:text-primary-600 transition-colors">
                  {club.name}
                </h4>
                <p className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                  {club.members}
                </p>
              </div>
            </Link>
          ))}
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
