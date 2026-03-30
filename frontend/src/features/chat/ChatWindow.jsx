import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, Loader2, Phone, Video, Info } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const ChatWindow = () => {
  const { id: conversationId } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Fetch Messages
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const res = await api.get(`/chat/${conversationId}/messages`);
      return res.data;
    },
    enabled: !!conversationId
  });

  // Socket Listener for Real-time
  useEffect(() => {
    if (!socket || !conversationId) return;

    // Join room
    socket.emit('join_conversation', conversationId);

    // Listen
    const handleNewMessage = (message) => {
      if (message.conversationId === conversationId) {
        queryClient.setQueryData(['messages', conversationId], (oldData) => {
          // Prevent duplicates if we sent it ourselves and already optimistically updated
          if (oldData?.find(m => m.id === message.id)) return oldData;
          return [...(oldData || []), message];
        });
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.emit('leave_conversation', conversationId);
    };
  }, [socket, conversationId, queryClient]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send Message Mutation
  const sendMessageMutation = useMutation({
    mutationFn: (content) => api.post(`/chat/${conversationId}/messages`, { content }),
    onSuccess: (data) => {
      setNewMessage('');
      // Optimistic update done via socket or explicitly here
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="h-16 border-b border-slate-200/50 bg-white/60 backdrop-blur-md flex items-center justify-between px-6 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" /> {/* Placeholder for Target User Avatar */}
          <div>
            <h3 className="font-bold text-slate-800 leading-tight">Conversation</h3>
            <span className="text-xs font-semibold text-primary-500">Active now</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-primary-500 transition-colors"><Phone className="w-5 h-5"/></button>
          <button className="hover:text-primary-500 transition-colors"><Video className="w-5 h-5"/></button>
          <button className="hover:text-primary-500 transition-colors"><Info className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((msg) => {
          const isMine = msg.senderId === user.id;

          return (
            <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[75%] px-4 py-3 rounded-2xl",
                isMine 
                  ? "bg-primary-500 text-white rounded-br-sm shadow-md shadow-primary-500/20" 
                  : "bg-white text-slate-800 rounded-bl-sm shadow-sm border border-slate-100"
              )}>
                <p className="leading-relaxed">{msg.content}</p>
                <div className={cn(
                  "text-[10px] sm:text-xs mt-1 font-semibold text-right",
                  isMine ? "text-primary-100" : "text-slate-400"
                )}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/60 backdrop-blur-md border-t border-slate-200/50">
        <form onSubmit={handleSend} className="flex items-center gap-2 max-w-4xl mx-auto">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Write a message..."
            className="flex-1 bg-white border border-slate-200 px-4 py-3 rounded-xl outline-none focus:border-primary-500 transition-colors placeholder:text-slate-400 shadow-sm"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim() || sendMessageMutation.isPending}
            className="w-12 h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 shadow-md shadow-primary-500/20 shrink-0"
          >
            {sendMessageMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
