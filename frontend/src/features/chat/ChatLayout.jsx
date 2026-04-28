import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, MessageCircle, Edit } from 'lucide-react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getAvatar } from '../../utils/avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ChatLayout = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const isChatSelected = location.pathname.split('/').length > 2;

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/chat');
      return res.data;
    }
  });

  const handleChatCreated = (conversationId) => {
    navigate(`/chat/${conversationId}`);
  };

  const filteredConversations = conversations?.filter(conv => {
    if (!searchQuery) return true;
    const otherParticipant = conv.ConversationParticipants?.find(p => p.userId !== user.id)?.User;
    return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex flex-1 h-[calc(100vh-80px)] overflow-hidden w-full">
      {/* Left Pane: Conversations */}
      <div className={cn(
        "w-full md:w-80 lg:w-96 bg-surface-container-low flex-col border-r-0",
        isChatSelected ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-[family-name:var(--font-display)] font-extrabold tracking-tight text-on-surface">Inbox</h1>
            <button 
              onClick={() => setIsNewChatOpen(true)}
              className="p-2 text-on-surface-variant hover:text-primary-600 transition-colors"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm w-4 h-4" />
            <input 
              className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border-0 rounded-xl focus:ring-2 focus:ring-primary-200 transition-all placeholder:text-on-surface-variant/60 font-[family-name:var(--font-body)] text-sm" 
              placeholder="Search conversations..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-2 space-y-1">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
            </div>
          )}

          {filteredConversations?.map((conv) => {
            const otherParticipant = conv.ConversationParticipants?.find(p => p.userId !== user.id)?.User;
            const displayName = otherParticipant?.name || 'Unknown User';
            const initial = displayName.charAt(0);
            const lastMessage = conv.Messages?.[0]?.content || 'Started a conversation';
            const isActive = location.pathname.includes(conv.id);
            const isOnline = onlineUsers?.includes(otherParticipant?.id);

            return (
              <Link 
                key={conv.id} 
                to={`/chat/${conv.id}`}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all group",
                  isActive ? "bg-surface-container-highest" : "hover:bg-surface-container-high"
                )}
              >
                <div className="relative shrink-0">
                  <img 
                    alt={displayName} 
                    className="w-12 h-12 rounded-full object-cover bg-surface-container" 
                    src={otherParticipant?.profileImage || getAvatar(null)}
                  />
                  {isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-container-highest rounded-full"></span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-[family-name:var(--font-display)] font-bold text-sm truncate text-on-surface">
                      {displayName}
                    </h3>
                    {conv.updatedAt && (
                      <span className="text-[10px] font-[family-name:var(--font-body)] text-on-surface-variant font-bold uppercase tracking-widest">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-xs font-[family-name:var(--font-body)] truncate leading-relaxed",
                    isActive ? "text-on-surface font-bold" : "text-on-surface-variant"
                  )}>
                    {lastMessage}
                  </p>
                </div>
              </Link>
            );
          })}
          
          {!isLoading && filteredConversations?.length === 0 && (
            <div className="text-center p-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4 text-on-surface-variant">
                <MessageCircle className="w-8 h-8" />
              </div>
              <p className="text-on-surface-variant text-sm font-medium mb-4 font-[family-name:var(--font-body)]">No conversations yet.</p>
              <button 
                onClick={() => setIsNewChatOpen(true)}
                className="px-6 py-2 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white text-sm font-bold rounded-full transition-all shadow-md active:scale-95 font-[family-name:var(--font-body)]"
              >
                Start Chatting
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right Pane: Active Chat */}
      <div className={cn(
        "flex-1 flex-col bg-surface-container-lowest h-full relative",
        !isChatSelected ? "hidden md:flex" : "flex w-full"
      )}>
        <Routes>
          <Route path="/" element={
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-surface">
              <div className="w-24 h-24 rounded-[30px] bg-gradient-to-br from-primary-600 to-tertiary-500 flex items-center justify-center mb-8 shadow-glow text-white">
                <MessageCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-[family-name:var(--font-display)] font-extrabold text-on-surface mb-3 tracking-tight">Your Messages</h3>
              <p className="text-on-surface-variant font-medium text-sm max-w-sm mb-8 leading-relaxed font-[family-name:var(--font-body)]">Select an ongoing conversation or start a new one.</p>
              
              <button 
                onClick={() => setIsNewChatOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-primary-600 to-tertiary-500 hover:from-primary-700 hover:to-tertiary-600 text-white font-bold rounded-full transition-all shadow-lg shadow-primary-500/20 active:scale-95 flex items-center gap-2 text-sm"
              >
                <Edit className="w-4 h-4" />
                New Message
              </button>
            </div>
          } />
          <Route path="/:id" element={<ChatWindow />} />
        </Routes>
      </div>

      <NewChatModal 
        isOpen={isNewChatOpen} 
        onClose={() => setIsNewChatOpen(false)} 
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default ChatLayout;
