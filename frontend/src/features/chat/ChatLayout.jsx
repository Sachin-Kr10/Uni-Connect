import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Loader2 } from 'lucide-react';
import { Routes, Route, useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import ChatWindow from './ChatWindow';
import { useAuth } from '../../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ChatLayout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Using generic * route in App.jsx means this component will handle /chat and /chat/:id

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/chat');
      return res.data;
    }
  });

  return (
    <div className="flex h-full bg-slate-50 relative overflow-hidden">
      
      {/* Conversations Sidebar */}
      <div className={cn(
        "w-full sm:w-96 flex-shrink-0 flex flex-col glass-card border-r border-slate-200/50 h-full",
        // Hide on mobile if a chat is selected (handled via responsive classes ideally, but for simplicity, we'll keep it simple)
        "sm:flex"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200/50 bg-white/40">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-4">Messages</h2>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-10 pr-4 py-2.5 bg-white/50 border border-slate-200 focus:border-primary-500 rounded-xl outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading && (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          )}

          {conversations?.map((conv) => {
            // Find the *other* participant
            const otherParticipant = conv.ConversationParticipants?.find(p => p.userId !== user.id)?.User;
            const displayName = otherParticipant?.name || 'Unknown User';
            const initial = displayName.charAt(0);
            const lastMessage = conv.Messages?.[0]?.content || 'Started a conversation';

            return (
              <Link 
                key={conv.id} 
                to={`/chat/${conv.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/60 transition-colors group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shrink-0">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h4 className="font-bold text-slate-800 truncate">{displayName}</h4>
                    {conv.updatedAt && (
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 truncate">{lastMessage}</p>
                </div>
              </Link>
            );
          })}
          
          {conversations?.length === 0 && (
            <div className="text-center p-8 text-slate-500 font-medium">
              No conversations yet.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white/40">
        <Routes>
          <Route path="/" element={
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center mb-6">
                <MessageCircle className="w-12 h-12 text-primary-500" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Select a conversation</h3>
              <p className="text-slate-500 font-medium max-w-sm">Choose an existing conversation from the sidebar or start a new one to begin messaging.</p>
            </div>
          } />
          <Route path="/:id" element={<ChatWindow />} />
        </Routes>
      </div>

    </div>
  );
};

// Temp import for the empty state icon
import { MessageCircle } from 'lucide-react';

export default ChatLayout;
