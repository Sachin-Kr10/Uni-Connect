import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { motion } from 'framer-motion';

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

  return (
    <div className="hidden lg:block w-[320px] pt-8 px-4 h-full sticky top-0 overflow-y-auto">
      {/* User Mini Profile */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 text-sm leading-none">
              {user.name?.toLowerCase().replace(/\s/g, '_') || 'user'}
            </span>
            <span className="text-slate-500 text-sm">{user.name}</span>
          </div>
        </div>
        <button className="text-blue-500 hover:text-blue-700 text-xs font-bold transition-colors">
          Switch
        </button>
      </div>

      {/* Suggestions Header */}
      <div className="flex items-center justify-between mb-4 mt-6">
        <span className="text-slate-500 font-bold text-sm">Suggested for you</span>
        <button className="text-slate-900 hover:text-slate-500 text-xs font-bold transition-colors">
          See All
        </button>
      </div>

      {/* Suggestions List */}
      <div className="space-y-4 mb-8">
        {isLoading ? (
          [1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full" />
                <div className="space-y-1">
                  <div className="h-2 w-20 bg-slate-200 rounded" />
                  <div className="h-2 w-12 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-2 w-10 bg-slate-100 rounded" />
            </div>
          ))
        ) : (
          suggestions?.map((item) => (
            <div key={item.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                  {item.name?.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900 text-xs">
                    {item.name?.toLowerCase().replace(/\s/g, '_')}
                  </span>
                  <span className="text-slate-400 text-[10px]">Followed by users you know</span>
                </div>
              </div>
              <button className="text-blue-500 hover:text-slate-900 text-xs font-bold transition-colors">
                Follow
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default SuggestionsSidebar;
