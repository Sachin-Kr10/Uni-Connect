import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, UserPlus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getAvatar } from '../../utils/avatar';

const SearchUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  let debounceTimeout;
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => setDebouncedQuery(val), 300);
  };

  // Search results
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['search-users', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return [];
      const res = await api.get(`/users/search?q=${debouncedQuery}`);
      return res.data;
    },
    enabled: debouncedQuery.trim().length > 0
  });

  // All users (when no search query)
  const { data: allUsersData, isLoading: isLoadingAll } = useQuery({
    queryKey: ['all-users'],
    queryFn: async () => {
      const res = await api.get('/users/all?limit=30');
      return res.data;
    },
    enabled: debouncedQuery.trim().length === 0
  });

  const displayUsers = debouncedQuery.trim() ? searchResults : allUsersData?.users;
  const isLoading = debouncedQuery.trim() ? isSearching : isLoadingAll;

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-80px)] font-[family-name:var(--font-body)] text-on-surface pb-20">
      
      {/* Hero Header */}
      <div className="relative mb-8">
        <div className="bg-gradient-to-br from-primary-500/10 via-tertiary-500/5 to-secondary-500/10 rounded-3xl p-8 lg:p-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-tertiary-500 flex items-center justify-center text-white">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-[0.2em]">Discover</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-display)] tracking-tighter text-on-surface mb-4">
            Find People
          </h1>
          <p className="text-on-surface-variant font-medium text-sm max-w-lg mb-6">
            Discover and connect with students, clubs, and communities across campus.
          </p>

          {/* Search Input */}
          <div className="relative group max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5 transition-colors group-focus-within:text-primary-600" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={searchQuery}
              onChange={handleSearchChange}
              autoFocus
              className="w-full pl-12 pr-6 py-4 bg-surface-container-lowest border-0 focus:ring-2 focus:ring-primary-500/20 rounded-2xl outline-none transition-all text-sm font-bold placeholder:text-on-surface-variant/60 shadow-sm text-on-surface"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="px-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : displayUsers && displayUsers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {displayUsers.map((person, index) => (
                <motion.div
                  key={person.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    to={`/profile/${person.id}`}
                    className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl hover:shadow-lg hover:shadow-primary-900/5 transition-all duration-300 group border border-surface-container/30"
                  >
                    <img
                      src={person.profileImage || getAvatar(null)}
                      alt={person.name}
                      className="w-14 h-14 rounded-full object-cover bg-surface-container shrink-0 group-hover:scale-105 transition-transform ring-2 ring-surface-container"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm font-[family-name:var(--font-display)] tracking-tight text-on-surface truncate group-hover:text-primary-600 transition-colors">
                        {person.name}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                        <span className="inline-flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">
                          {person.role}
                        </span>
                      </p>
                      {person.bio && (
                        <p className="text-xs text-on-surface-variant font-medium mt-1.5 line-clamp-1">
                          {person.bio}
                        </p>
                      )}
                    </div>
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <UserPlus className="w-5 h-5 text-primary-500" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-lowest rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-on-surface-variant" />
            </div>
            <h3 className="text-xl font-black text-on-surface tracking-tighter mb-2 font-[family-name:var(--font-display)]">
              {debouncedQuery ? 'No users found' : 'Start searching'}
            </h3>
            <p className="text-on-surface-variant font-medium text-sm max-w-sm mx-auto">
              {debouncedQuery ? 'Try a different name.' : 'Type a name above to discover people on campus.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
