import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Phone, Video, Info, ChevronLeft, MoreVertical, Plus } from 'lucide-react';
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
    <div className="flex flex-col h-full relative bg-[#F4F7FB] overflow-hidden">
      {/* High-End Header */}
      <div className="h-20 border-b border-white/40 bg-white/60 backdrop-blur-2xl flex items-center justify-between px-6 z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="sm:hidden p-2.5 -ml-2 text-slate-500 hover:bg-white/80 rounded-2xl transition-all shadow-sm active:scale-90"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5px]" />
          </motion.button>
          
          <div className="relative group cursor-pointer">
            <div className="w-12 h-12 rounded-[22px] bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white flex items-center justify-center text-slate-800 font-black text-xl shadow-lg shrink-0 overflow-hidden transition-transform group-hover:scale-105">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`} 
                alt={otherUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-md z-10" />
            )}
          </div>
          
          <div className="flex flex-col pt-0.5">
            <h3 className="font-black text-slate-900 leading-none text-base tracking-tight">{otherUser.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              {typingUsers.size > 0 ? (
                <span className="text-[11px] font-black text-primary-500 uppercase tracking-widest animate-pulse">typing...</span>
              ) : (
                <>
                  <span className={cn("w-1.5 h-1.5 rounded-full", isOnline ? "bg-emerald-500" : "bg-slate-300")} />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {isOnline ? 'Active now' : 'Offline'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-400">
          <button className="p-3 hover:bg-white/80 hover:text-primary-600 rounded-2xl transition-all active:scale-90 hidden sm:block">
            <Phone className="w-5 h-5 stroke-[2.5px]"/>
          </button>
          <button className="p-3 hover:bg-white/80 hover:text-primary-600 rounded-2xl transition-all active:scale-90 hidden sm:block">
            <Video className="w-5 h-5 stroke-[2.5px]"/>
          </button>
          <button className="p-3 hover:bg-white/80 rounded-2xl text-slate-600 transition-all active:scale-90">
            <MoreVertical className="w-5 h-5 stroke-[2.5px]"/>
          </button>
        </div>
      </div>

      {/* Telegram-style Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-8 sm:px-10 flex flex-col gap-3 relative scroll-smooth overflow-x-hidden">
        {/* Subtle Textured Background Overlay */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="text-center mb-10 relative z-10">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block px-5 py-1.5 bg-white/50 backdrop-blur-md text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm border border-white/40"
          >
            Secured with Uni-Connect
          </motion.div>
        </div>
        
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMine = msg.senderId === user.id;
            const nextMsg = messages[index + 1];
            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={cn(
                  "flex w-full relative z-10",
                  isMine ? "justify-end" : "justify-start",
                  isLastInGroup ? "mb-4" : "mb-0.5"
                )}
              >
                {!isMine && isLastInGroup && (
                  <div className="absolute -left-8 bottom-0 hidden sm:block">
                     <div className="w-6 h-6 rounded-lg overflow-hidden border border-white bg-slate-100 shadow-sm">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherUser.name}`} alt="avatar" className="w-full h-full object-cover" />
                     </div>
                  </div>
                )}

                <div className={cn(
                  "relative max-w-[85%] sm:max-w-[65%] px-4 py-3 shadow-sm group transition-all duration-300",
                  isMine 
                    ? "bg-slate-900 border border-slate-800 text-white shadow-slate-900/10" 
                    : "bg-white/80 backdrop-blur-md border border-white text-slate-800 shadow-slate-200/50",
                  // Dynamic Radii
                  "rounded-[22px]",
                  isMine && isLastInGroup && "rounded-br-none",
                  !isMine && isLastInGroup && "rounded-bl-none shadow-indigo-100/50"
                )}>
                  <p className="leading-relaxed text-[15px] font-medium whitespace-pre-wrap break-words">{msg.content}</p>
                  
                  <div className={cn(
                    "flex items-center gap-1.5 justify-end mt-1 opacity-60",
                    isMine ? "text-slate-400" : "text-slate-400"
                  )}>
                    <span className="text-[10px] font-black tracking-tighter uppercase leading-none">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {isMine && <div className="w-1 h-1 bg-primary-400 rounded-full" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {typingUsers.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex justify-start relative z-10"
          >
            <div className="bg-white/60 backdrop-blur-md border border-white px-5 py-4 rounded-[22px] rounded-bl-none shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-[bounce_1s_infinite_-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-[bounce_1s_infinite_-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-[bounce_1s_infinite]"></span>
              </div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Someone's typing</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* High-End Floating Input Bar */}
      <div className="p-6 pt-2 bg-gradient-to-t from-[#F4F7FB] via-[#F4F7FB] to-transparent shrink-0">
        <form onSubmit={handleSend} className="flex items-center gap-3 max-w-5xl mx-auto relative group">
          <div className="flex-1 relative flex items-center">
            <button 
              type="button"
              className="absolute left-3 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-2xl transition-all active:scale-90"
            >
              <Plus className="w-5 h-5 stroke-[2.5px]" />
            </button>
            <textarea 
              rows={1}
              value={newMessage}
              onChange={handleTyping}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Write something..."
              className="w-full bg-white border-2 border-white focus:border-slate-200 pl-14 pr-16 py-4 rounded-[28px] outline-none transition-all text-sm font-bold placeholder:text-slate-400 shadow-xl shadow-slate-200/50 resize-none overflow-hidden"
              style={{ minHeight: '56px', maxHeight: '150px' }}
            />
            
            <AnimatePresence>
              {newMessage.trim() && (
                <motion.button 
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 45 }}
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  className="absolute right-2.5 w-11 h-11 bg-slate-900 hover:bg-black text-white rounded-[22px] flex items-center justify-center transition-all disabled:opacity-30 shadow-[0_8px_16px_rgba(0,0,0,0.2)] shrink-0 active:scale-90"
                >
                  {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5 stroke-[2.5px]" />}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </form>
        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest mt-4">
          Press Shift + Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
