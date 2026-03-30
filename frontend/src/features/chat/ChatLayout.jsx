import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, MessageCircle, Edit } from 'lucide-react';
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from './ChatWindow';
import NewChatModal from './NewChatModal';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ChatLayout = () => {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);

  // Check if a specific chat is selected based on URL
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

  return (
    <div className="flex h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] w-full max-w-7xl mx-auto bg-white/40 md:bg-white/60 md:backdrop-blur-xl md:rounded-[2rem] md:shadow-2xl overflow-hidden md:my-8 border border-white/50">
      
      {/* Conversations Sidebar */}
      <div className={cn(
        "w-full sm:w-96 flex-shrink-0 flex flex-col bg-slate-50/50 border-r border-slate-200/50 h-full transition-transform duration-300",
        isChatSelected ? "hidden sm:flex" : "flex"
      )}>
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-200/50 bg-white/40 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Messages</h2>
            <button 
              onClick={() => setIsNewChatOpen(true)}
              className="p-2.5 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-xl transition-colors shadow-sm"
              title="New Message"
            >
              <Edit className="w-5 h-5" />
            </button>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 rounded-xl outline-none transition-all placeholder:text-slate-400 text-sm font-medium shadow-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
          {isLoading && (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          )}

          {conversations?.map((conv) => {
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
                  "flex items-center gap-3 p-3 rounded-2xl transition-all group cursor-pointer relative",
                  isActive ? "bg-primary-50 ring-1 ring-primary-200" : "hover:bg-white/80"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary-500 rounded-r-full" />
                )}
                
                <div className="relative">
                  <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                    {initial}
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm ring-1 ring-emerald-600/20" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={cn("font-bold truncate text-sm", isActive ? "text-primary-900" : "text-slate-800")}>
                      {displayName}
                    </h4>
                    {conv.updatedAt && (
                      <span className={cn("text-[10px] font-bold shrink-0", isActive ? "text-primary-600" : "text-slate-400")}>
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className={cn("text-[13px] truncate", isActive ? "text-primary-700 font-medium" : "text-slate-500")}>
                    {lastMessage}
                  </p>
                </div>
              </Link>
            );
          })}
          
          {!isLoading && conversations?.length === 0 && (
            <div className="text-center p-12 flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                <MessageCircle className="w-8 h-8" />
              </div>
              <p className="text-slate-500 text-sm font-medium mb-4">No conversations yet.</p>
              <button 
                onClick={() => setIsNewChatOpen(true)}
                className="px-4 py-2 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-colors shadow-md"
              >
                Start Chatting
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col h-full bg-white relative",
        !isChatSelected ? "hidden sm:flex" : "flex"
      )}>
        <Routes>
          <Route path="/" element={
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50/30">
              <div className="w-24 h-24 rounded-full bg-primary-50 flex items-center justify-center mb-6 ring-8 ring-primary-50/50">
                <MessageCircle className="w-10 h-10 text-primary-500" />
              </div>
              <div className="inline-block px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 mb-4 shadow-sm uppercase tracking-widest">
                Uni-Connect Chat
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Your Messages</h3>
              <p className="text-slate-500 font-medium max-w-sm mb-6">Choose an existing conversation or start a new one to connect with students.</p>
              <button 
                onClick={() => setIsNewChatOpen(true)}
                className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start New Chat
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
