import { useState } from 'react';
import { Search, Loader2, X, MessageSquarePlus } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../../services/api';

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
      onChatCreated(data.id);
      setSearchTerm('');
      onClose();
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-200 border border-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0">
          <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
            <MessageSquarePlus className="w-5 h-5 text-primary-500" />
            New Direct Message
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              autoFocus
              type="text" 
              placeholder="Search students or clubs by name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all text-sm font-medium shadow-sm"
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          {isLoading && (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          )}

          {!isLoading && searchResults?.length === 0 && searchTerm && (
            <div className="text-center p-12 text-slate-500 text-sm font-medium">
              No users found matching "{searchTerm}"
            </div>
          )}

          {!isLoading && searchResults?.map((user) => (
            <button
              key={user.id}
              onClick={() => createChatMutation.mutate(user.id)}
              disabled={createChatMutation.isPending}
              className="w-full flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors text-left group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden text-ellipsis group-hover:text-primary-600 transition-colors">{user.name}</h4>
                <p className="text-xs text-slate-500 capitalize font-medium">{user.role}</p>
              </div>
            </button>
          ))}
          
          {!searchTerm && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <Search className="w-8 h-8" />
              </div>
              <p className="text-slate-400 text-sm font-medium">
                Type a name to search for connections
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewChatModal;
