import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Send, Loader2, Settings, Users, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { getAvatar } from '../../utils/avatar';

const GroupChat = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Get group chat info
  const { data: chatInfo, isLoading: isLoadingChat } = useQuery({
    queryKey: ['group-chat', groupId],
    queryFn: async () => {
      const res = await api.get(`/groups/${groupId}/chat`);
      return res.data;
    }
  });

  // Get group details for members
  const { data: groupDetails } = useQuery({
    queryKey: ['group-details', groupId],
    queryFn: async () => {
      const res = await api.get(`/groups/${groupId}`);
      return res.data;
    }
  });

  // Get messages
  const { data: messages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['group-messages', chatInfo?.conversationId],
    queryFn: async () => {
      const res = await api.get(`/chat/${chatInfo.conversationId}/messages`);
      return res.data;
    },
    enabled: !!chatInfo?.conversationId
  });

  // Socket: join conversation room
  useEffect(() => {
    if (!socket || !chatInfo?.conversationId) return;
    socket.emit('join_conversation', chatInfo.conversationId);
    return () => {
      socket.emit('leave_conversation', chatInfo.conversationId);
    };
  }, [socket, chatInfo?.conversationId]);

  // Socket: listen for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      queryClient.setQueryData(['group-messages', chatInfo?.conversationId], (old) => {
        if (!old) return [msg];
        if (old.some(m => m.id === msg.id)) return old;
        return [...old, msg];
      });
    };

    const handleMessageDeleted = ({ messageId }) => {
      queryClient.setQueryData(['group-messages', chatInfo?.conversationId], (old) => {
        if (!old) return old;
        return old.filter(m => m.id !== messageId);
      });
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_deleted', handleMessageDeleted);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, chatInfo?.conversationId, queryClient]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const sendMutation = useMutation({
    mutationFn: async (content) => {
      const res = await api.post(`/chat/${chatInfo.conversationId}/messages`, { content });
      return res.data;
    },
    onSuccess: (newMsg) => {
      queryClient.setQueryData(['group-messages', chatInfo?.conversationId], (old) => {
        if (!old) return [newMsg];
        if (old.some(m => m.id === newMsg.id)) return old;
        return [...old, newMsg];
      });
    }
  });

  // Delete message (admin only)
  const deleteMutation = useMutation({
    mutationFn: (messageId) => api.delete(`/groups/${groupId}/messages/${messageId}`),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData(['group-messages', chatInfo?.conversationId], (old) =>
        old ? old.filter(m => m.id !== messageId) : old
      );
    }
  });

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMutation.mutate(message);
    setMessage('');
  };

  if (isLoadingChat) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-surface font-[family-name:var(--font-body)]">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 bg-surface-container-lowest border-b border-surface-container/30 shrink-0">
        <button onClick={() => navigate('/groups')} className="p-2 hover:bg-surface-container rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5 text-on-surface" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="font-[family-name:var(--font-display)] font-bold text-on-surface truncate">
            {chatInfo?.groupName || 'Group Chat'}
          </h2>
          <p className="text-[11px] text-on-surface-variant font-medium">
            {groupDetails?.members?.length || 0} members
          </p>
        </div>
        <div className="flex items-center gap-2">
          {chatInfo?.isAdmin && (
            <Link
              to={`/groups/${groupId}/settings`}
              className="p-2 hover:bg-surface-container rounded-xl transition-colors text-on-surface-variant"
            >
              <Settings className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
          </div>
        ) : messages && messages.length > 0 ? (
          <>
            {messages.map((msg) => {
              const isMe = msg.senderId === user.id;
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 group ${isMe ? 'flex-row-reverse' : ''}`}
                >
                  {!isMe && (
                    <Link to={`/profile/${msg.User?.id}`} className="shrink-0">
                      <img
                        src={msg.User?.profileImage || getAvatar(null)}
                        alt={msg.User?.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </Link>
                  )}
                  <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                    {!isMe && (
                      <span className="text-[10px] font-bold text-on-surface-variant mb-1 px-1">
                        {msg.User?.name}
                      </span>
                    )}
                    <div className={`relative px-4 py-2.5 rounded-2xl text-sm font-medium ${
                      isMe
                        ? 'bg-gradient-to-r from-primary-600 to-tertiary-500 text-white rounded-br-md'
                        : 'bg-surface-container-low text-on-surface rounded-bl-md'
                    }`}>
                      {msg.content}
                      
                      {/* Admin delete button */}
                      {chatInfo?.isAdmin && !isMe && (
                        <button
                          onClick={() => deleteMutation.mutate(msg.id)}
                          className="absolute -top-2 -right-2 p-1 bg-surface-container-highest rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-secondary-100"
                        >
                          <Trash2 className="w-3 h-3 text-secondary-600" />
                        </button>
                      )}
                    </div>
                    <span className="text-[9px] text-on-surface-variant font-bold mt-1 px-1 uppercase tracking-widest">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
              <Users className="w-7 h-7 text-on-surface-variant" />
            </div>
            <h3 className="text-lg font-bold text-on-surface font-[family-name:var(--font-display)]">Welcome to the group!</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1">Start the conversation with your community.</p>
          </div>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="p-4 bg-surface-container-lowest border-t border-surface-container/30 shrink-0">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-surface-container-low border-0 rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 text-on-surface placeholder:text-on-surface-variant/60"
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMutation.isPending}
            className="p-3 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white rounded-full shadow-md active:scale-95 transition-transform disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;
