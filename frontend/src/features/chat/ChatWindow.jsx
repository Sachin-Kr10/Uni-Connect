import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Phone, Video, Info, ChevronLeft, MoreVertical } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

const cn = (...inputs) => twMerge(clsx(inputs));

const ChatWindow = () => {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch Messages and Meta (like other participant details)
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await api.get(`/chat/${conversationId}/messages`);
      return res.data;
    },
    enabled: !!conversationId
  });

  // Extract other user from the first message (Hack since we didn't add a specific /chat/:id endpoint)
  // Ideally, api.get(`/chat/${conversationId}`) would return the conversation meta.
  const otherUser = messages.find(m => m.senderId !== user.id)?.User || { name: 'Chat Member' };
  const isOnline = onlineUsers?.includes(otherUser.id);

  // Socket Listener for Real-time
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit('join_conversation', conversationId);

    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        queryClient.setQueryData(['messages', conversationId], (oldData) => {
          if (oldData?.find(m => m.id === message.id)) return oldData;
          return [...(oldData || []), message];
        });
      }
    };

    const handleTyping = ({ userId, isTyping }) => {
      if (userId === user.id) return;
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        if (isTyping) newSet.add(userId);
        else newSet.delete(userId);
        return newSet;
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, conversationId, queryClient, user.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const sendMessageMutation = useMutation({
    mutationFn: (content) => api.post(`/chat/${conversationId}/messages`, { content }),
    onSuccess: (data) => {
      setNewMessage('');
      socket?.emit('typing', { conversationId, isTyping: false });
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    // Emit typing true
    socket?.emit('typing', { conversationId, isTyping: true });
    
    // Debounce to typing false
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing', { conversationId, isTyping: false });
    }, 2000);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative bg-[#FAF9FD] overflow-hidden">
      {/* Premium Header */}
      <div className="h-[72px] border-b border-slate-200/60 bg-white/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <button 
            onClick={() => navigate('/chat')}
            className="sm:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="relative">
            <div className="w-11 h-11 rounded-[1.1rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0 border-2 border-white">
              {otherUser.name.charAt(0)}
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
            )}
          </div>
          
          <div className="flex flex-col">
            <h3 className="font-bold text-slate-900 leading-tight text-[15px]">{otherUser.name}</h3>
            {typingUsers.size > 0 ? (
              <span className="text-xs font-bold text-primary-500 animate-pulse">typing...</span>
            ) : (
              <span className={cn("text-xs font-semibold", isOnline ? "text-emerald-500" : "text-slate-400")}>
                {isOnline ? 'Active now' : 'Offline'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2 text-slate-400">
          <button className="p-2 hover:bg-slate-100 hover:text-primary-600 rounded-full transition-colors hidden sm:block"><Phone className="w-5 h-5"/></button>
          <button className="p-2 hover:bg-slate-100 hover:text-primary-600 rounded-full transition-colors hidden sm:block"><Video className="w-5 h-5"/></button>
          <button className="p-2 hover:bg-slate-100 rounded-full transition-colors"><MoreVertical className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Messages Area (Telegram Style) */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-10 relative">
        <div className="text-center my-6">
          <div className="inline-block px-3 py-1 bg-black/5 text-slate-500 text-xs font-bold uppercase tracking-widest rounded-full backdrop-blur-sm">
            Start of Conversation
          </div>
        </div>
        
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMine = msg.senderId === user.id;
            
            // Check if next message is from same user to remove tail styling (Telegram style)
            const nextMsg = messages[index + 1];
            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

            return (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id} 
                className={cn("flex w-full", isMine ? "justify-end" : "justify-start")}
              >
                <div className={cn(
                  "relative max-w-[85%] sm:max-w-[70%] px-3.5 py-2.5 shadow-sm group",
                  isMine 
                    ? "bg-primary-500 text-white" 
                    : "bg-white text-slate-800 border border-slate-100",
                  // Dynamic Radii for Bubble groups
                  "rounded-2xl",
                  isMine && isLastInGroup && "rounded-br-sm",
                  !isMine && isLastInGroup && "rounded-bl-sm"
                )}>
                  <p className="leading-snug text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
                  
                  {/* Inline Timestamp (Telegram style) */}
                  <span className={cn(
                    "float-right ml-3 mt-1 text-[10px] font-bold leading-none select-none",
                    isMine ? "text-primary-200" : "text-slate-400"
                  )}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  
                  {/* Small Tail SVG (Optional details) */}
                  {isLastInGroup && (
                    <svg
                      viewBox="0 0 8 13"
                      width="8"
                      height="13"
                      className={cn(
                        "absolute bottom-0 w-2 h-3",
                        isMine ? "-right-[7px] text-primary-500" : "-left-[7px] text-white"
                      )}
                    >
                      <path
                        fill="currentColor"
                        d={isMine 
                          ? "M8 13V0c0 4.418-3.582 8-8 8v5h8z" 
                          : "M0 13V0c0 4.418 3.582 8 8 8v5H0z"}
                      />
                    </svg>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {typingUsers.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex justify-start"
          >
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-3 sm:p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200/60 shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto relative">
          <input 
            type="text" 
            value={newMessage}
            onChange={handleTyping}
            placeholder="Message..."
            className="flex-1 bg-slate-100/80 border border-transparent px-5 py-3.5 rounded-full outline-none focus:border-primary-500 focus:bg-white transition-all text-[15px] placeholder:text-slate-500 shadow-inner"
          />
          {newMessage.trim() && (
            <motion.button 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              type="submit"
              disabled={sendMessageMutation.isPending}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary-500 hover:bg-primary-600 text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 shadow-md shadow-primary-500/20 shrink-0"
            >
              {sendMessageMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
            </motion.button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
