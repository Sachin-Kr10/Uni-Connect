import { useState } from 'react';
import { Search, Loader2, X, MessageSquarePlus } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';
import { getAvatar } from '../../utils/avatar';
import { motion, AnimatePresence } from 'framer-motion';

const NewChatModal = ({ isOpen, onClose, onChatCreated }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['searchUsers', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];
      const res = await api.get(`/users/search?q=${searchTerm}`);
      return res.data;
    },
    enabled: searchTerm.length > 0,
  });

  const createChatMutation = useMutation({
    mutationFn: (targetUserId) => api.post('/chat/direct', { targetUserId }),
    onSuccess: (data) => {
      onChatCreated(data.data.id);
      setSearchTerm('');
      onClose();
    }
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-on-surface/40 backdrop-blur-md"
          />

          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-surface-lowest/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full max-w-lg flex flex-col max-h-[85vh] border border-surface-container/30 relative z-10 overflow-hidden"
          >
            <div className="p-8 pb-4 flex items-center justify-between">
              <div className="flex flex-col">
                <h3 className="text-2xl font-black text-on-surface tracking-tighter flex items-center gap-3">
                  <MessageSquarePlus className="w-6 h-6 text-primary-500 stroke-[2.5px]" />
                  New Message
                </h3>
                <p className="text-on-surface-variant font-bold text-xs uppercase tracking-widest mt-1">Select a student or club</p>
              </div>
              <motion.button 
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose} 
                className="w-10 h-10 bg-surface-container hover:bg-surface-container-high rounded-2xl flex items-center justify-center text-on-surface-variant transition-colors"
              >
                <X className="w-5 h-5 stroke-[2.5px]" />
              </motion.button>
            </div>

            <div className="px-8 py-5">
              <div className="relative group">
                <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-500 transition-colors" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Search campus connections..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-[3.75rem] pr-6 py-4 bg-surface-container/50 border-2 border-transparent focus:border-primary-500/30 focus:bg-surface-container-lowest focus:ring-4 focus:ring-primary-500/5 rounded-3xl outline-none transition-all text-[15px] font-bold placeholder:text-on-surface-variant text-on-surface"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-8 space-y-1.5 scrollbar-hide">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center p-16 gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-primary-300" />
                  <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Searching</span>
                </div>
              ) : searchResults?.length > 0 ? (
                searchResults?.map((user) => (
                  <motion.button
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={user.id}
                    onClick={() => createChatMutation.mutate(user.id)}
                    disabled={createChatMutation.isPending}
                    className="w-full flex items-center gap-4 p-4 hover:bg-surface-container-high rounded-3xl transition-all text-left group border border-transparent hover:border-surface-container/50"
                  >
                    <div className="w-14 h-14 rounded-[20px] bg-surface-container border border-surface-container-high flex items-center justify-center shadow-inner relative overflow-hidden flex-shrink-0">
                      <img src={user.profileImage || getAvatar(null)} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-extrabold text-on-surface text-base tracking-tight group-hover:text-primary-600 transition-colors truncate">
                        {user.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.5 bg-surface-container rounded-full text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                          {user.role}
                        </span>
                      </div>
                    </div>
                    <motion.div 
                      whileHover={{ scale: 1.1 }}
                      className="w-8 h-8 rounded-full bg-surface-container border border-surface-container-high flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors"
                    >
                      <MessageSquarePlus className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                ))
              ) : searchTerm ? (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-20 h-20 bg-surface-container rounded-[2rem] flex items-center justify-center mb-6 text-on-surface-variant rotate-6 border-dashed border-2 border-surface-container-high">
                    <Search className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-black text-on-surface mb-1">No results for "{searchTerm}"</h4>
                  <p className="text-on-surface-variant font-bold text-sm">Try searching by full name.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="w-24 h-24 bg-primary-50/50 rounded-[2.5rem] flex items-center justify-center mb-8 ring-8 ring-primary-50/20">
                    <MessageSquarePlus className="w-10 h-10 text-primary-400" />
                  </div>
                  <h4 className="text-xl font-black text-on-surface mb-2 tracking-tighter">Start a Connection</h4>
                  <p className="text-on-surface-variant font-semibold text-[15px] max-w-xs leading-relaxed">
                    Search for students, teachers or official clubs to begin a secure direct message.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-surface-container/50 border-t border-surface-container/30 flex justify-center">
               <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Global Campus Directory</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default NewChatModal;
