import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Phone, Video, MoreVertical, Plus, ChevronLeft, Image as ImageIcon, Smile } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useToast } from '../../context/ToastContext';
import { getAvatar } from '../../utils/avatar';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, AnimatePresence } from 'framer-motion';

const cn = (...inputs) => twMerge(clsx(inputs));

const ChatWindow = () => {
  const { id: conversationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const imageInputRef = useRef(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await api.get(`/chat/${conversationId}/messages`);
      return res.data;
    },
    enabled: !!conversationId
  });

  const otherUser = messages.find(m => m.senderId !== user.id)?.User || { name: 'Chat Member' };
  const isOnline = onlineUsers?.includes(otherUser.id);

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
    onSuccess: () => {
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
    socket?.emit('typing', { conversationId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit('typing', { conversationId, isTyping: false });
    }, 2000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      sendMessageMutation.mutate(`📷 ${res.data.url}`);
      showToast('Image sent!', 'success');
    } catch {
      showToast('Failed to send image', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-surface-container-lowest h-full relative">
      {/* Header */}
      <header className="h-20 flex items-center justify-between px-4 sm:px-8 bg-surface-container-lowest border-b-0 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <motion.button 
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/chat')}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all md:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </motion.button>
          
          <div className="relative group cursor-pointer">
            <img 
              src={otherUser.profileImage || getAvatar(null)} 
              alt={otherUser.name}
              className="w-10 h-10 rounded-full object-cover bg-surface-container"
            />
            {isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-surface-container-lowest rounded-full z-10" />
            )}
          </div>
          
          <div className="flex flex-col">
            <h2 className="font-[family-name:var(--font-display)] font-bold text-sm text-on-surface">{otherUser.name}</h2>
            {typingUsers.size > 0 ? (
              <p className="text-[11px] text-primary-600 font-medium tracking-wide uppercase animate-pulse">Typing...</p>
            ) : (
              <p className="text-[11px] text-primary-600 font-medium tracking-wide uppercase">
                {isOnline ? 'Active Now' : 'Offline'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => showToast('Voice calls coming soon!', 'info')} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all">
            <Phone className="w-5 h-5" />
          </button>
          <button onClick={() => showToast('Video calls coming soon!', 'info')} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all">
            <Video className="w-5 h-5" />
          </button>
          <button onClick={() => showToast('Chat settings coming soon!', 'info')} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-all">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-6 bg-surface custom-scrollbar">
        <div className="flex justify-center mb-6">
          <span className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-[family-name:var(--font-body)]">
            Secured with Uni-Connect
          </span>
        </div>
        
        <AnimatePresence initial={false}>
          {messages.map((msg, index) => {
            const isMine = msg.senderId === user.id;
            const nextMsg = messages[index + 1];
            const isLastInGroup = !nextMsg || nextMsg.senderId !== msg.senderId;

            return (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className={cn(
                  "flex items-end gap-3 max-w-[80%]",
                  isMine ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {!isMine && isLastInGroup && (
                  <img 
                    src={otherUser.profileImage || getAvatar(null)} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full object-cover shrink-0" 
                  />
                )}
                {!isMine && !isLastInGroup && (
                  <div className="w-8 h-8 shrink-0 relative" />
                )}

                <div className={cn(
                  "p-4 rounded-2xl shadow-sm",
                  isMine 
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" 
                    : "bg-surface-container-highest text-on-surface",
                  isLastInGroup && isMine ? "rounded-br-none" : "",
                  isLastInGroup && !isMine ? "rounded-bl-none" : ""
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap word-break-words font-[family-name:var(--font-body)]">{msg.content}</p>
                  
                  <span className={cn(
                    "block text-[10px] mt-2 font-[family-name:var(--font-body)] font-bold tracking-wider",
                    isMine ? "text-white/70 text-right" : "text-on-surface-variant"
                  )}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {typingUsers.size > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex items-end justify-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-surface-container shrink-0" />
            <div className="bg-surface-container-highest px-4 py-3.5 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-[bounce_1s_infinite_-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-[bounce_1s_infinite_-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-[bounce_1s_infinite]"></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Chat Input */}
      <footer className="p-6 bg-surface-container-lowest shrink-0 z-10">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-end gap-3 bg-surface-container-low p-2 rounded-[1.5rem] border-0 shadow-sm relative focus-within:ring-2 focus-within:ring-primary-200 transition-all">
          <div className="flex items-center gap-1 pb-1 px-1">
            <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-on-surface-variant hover:text-primary-600 hover:bg-surface-container-high rounded-xl transition-all">
              <Plus className="w-5 h-5 stroke-[2.5px]" />
            </button>
            <button type="button" onClick={() => imageInputRef.current?.click()} className="p-2 text-on-surface-variant hover:text-primary-600 hover:bg-surface-container-high rounded-xl transition-all hidden sm:block">
              <ImageIcon className="w-5 h-5" />
            </button>
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </div>
          
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
            placeholder="Type a message..."
            className="flex-1 bg-transparent border-0 focus:ring-0 text-sm font-[family-name:var(--font-body)] py-3 px-1 placeholder:text-on-surface-variant/50 outline-none resize-none"
            style={{ maxHeight: '120px' }}
          />

          <div className="flex items-center gap-1 pb-1">
            <button type="button" onClick={() => showToast('Emoji picker coming soon!', 'info')} className="p-2 text-on-surface-variant hover:text-primary-600 hover:bg-surface-container-high rounded-xl transition-all mr-1 hidden sm:block">
              <Smile className="w-5 h-5" />
            </button>
            <button 
              type="submit"
              disabled={sendMessageMutation.isPending || !newMessage.trim()}
              className="w-10 h-10 bg-primary-600 hover:bg-primary-700 text-white rounded-[14px] flex items-center justify-center transition-all disabled:opacity-50 shadow-md shadow-primary-600/30 shrink-0 active:scale-90"
            >
              {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5 stroke-[2px]" />}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default ChatWindow;
