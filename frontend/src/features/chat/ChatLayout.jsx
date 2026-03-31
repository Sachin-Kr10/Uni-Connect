import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2, MessageCircle, Edit, Plus } from 'lucide-react';
import { Routes, Route, useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
    <div className="flex h-[calc(100vh-120px)] w-full bg-white/40 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/60 relative group/layout">
      
      {/* Search/Conversations Sidebar */}
      <div className={cn(
        "w-full sm:w-[380px] flex-shrink-0 flex flex-col bg-white/30 border-r border-white/40 h-full transition-all duration-500 ease-in-out",
        isChatSelected ? "hidden sm:flex" : "flex"
      )}>
        {/* Sidebar Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Messages</h2>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsNewChatOpen(true)}
              className="p-3 bg-slate-900 hover:bg-black text-white rounded-2xl transition-all shadow-lg active:scale-95"
              title="New Message"
            >
              <Edit className="w-5 h-5 stroke-[2.5px]" />
            </motion.button>
          </div>
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-11 pr-4 py-3 bg-white/50 border border-white/20 focus:border-primary-500/50 focus:bg-white focus:ring-4 focus:ring-primary-500/10 rounded-2xl outline-none transition-all placeholder:text-slate-400 text-sm font-bold shadow-sm"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-2 scrollbar-hide">
          {isLoading && (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Chats</span>
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
                  "flex items-center gap-4 p-3.5 rounded-3xl transition-all duration-300 group cursor-pointer relative",
                  isActive 
                    ? "bg-white shadow-xl shadow-slate-200/50 scale-[1.02] border border-slate-100" 
                    : "hover:bg-white/60"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-slate-900 rounded-r-full" 
                  />
                )}
                
                <div className="relative shrink-0">
                  <div className="w-14 h-14 rounded-[20px] bg-gradient-to-br from-slate-100 to-slate-200 border border-white flex items-center justify-center text-slate-800 font-black text-xl shadow-inner overflow-hidden">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName}`} 
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className="font-extrabold truncate text-[15px] text-slate-900 tracking-tight">
                      {displayName}
                    </h4>
                    {conv.updatedAt && (
                      <span className="text-[10px] font-black shrink-0 text-slate-400 tracking-tighter uppercase">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className={cn(
                    "text-[13px] truncate tracking-tight",
                    isActive ? "text-slate-600 font-bold" : "text-slate-400 font-medium"
                  )}>
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
        "flex-1 flex flex-col h-full bg-slate-50/20 backdrop-blur-sm relative",
        !isChatSelected ? "hidden sm:flex" : "flex"
      )}>
        <Routes>
          <Route path="/" element={
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12 overflow-hidden relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none" />
              
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-32 h-32 rounded-[40px] bg-white flex items-center justify-center mb-8 shadow-2xl relative z-10"
              >
                <div className="w-24 h-24 rounded-[30px] bg-primary-50 flex items-center justify-center ring-8 ring-primary-50/30">
                  <MessageCircle className="w-12 h-12 text-primary-500" />
                </div>
              </motion.div>

              <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tighter relative z-10">Encrypted Messaging</h3>
              <p className="text-slate-500 font-bold text-[15px] max-w-sm mb-8 leading-relaxed relative z-10">Select a secure conversation to start connecting with your campus community.</p>
              
              <motion.button 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsNewChatOpen(true)}
                className="px-8 py-3.5 bg-slate-900 hover:bg-black text-white font-black rounded-2xl transition-all shadow-xl hover:shadow-2xl relative z-10 flex items-center gap-3"
              >
                <Edit className="w-5 h-5" />
                Start Chatting
              </motion.button>
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
