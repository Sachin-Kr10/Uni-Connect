import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Check, X, Loader2, UserPlus, UserCheck, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import { getAvatar } from '../../utils/avatar';
import { useToast } from '../../context/ToastContext';

const Announcements = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  // Fetch notifications
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await api.get('/notifications?limit=50');
      return res.data;
    }
  });

  // Fetch pending connection requests
  const { data: pendingRequests } = useQuery({
    queryKey: ['pending-connections'],
    queryFn: async () => {
      const res = await api.get('/connections/pending');
      return res.data;
    }
  });

  // Accept connection
  const acceptMutation = useMutation({
    mutationFn: (connectionId) => api.put(`/connections/${connectionId}/accept`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      showToast('Connection accepted!', 'success');
    },
    onError: () => showToast('Failed to accept', 'error')
  });

  // Decline connection
  const declineMutation = useMutation({
    mutationFn: (connectionId) => api.put(`/connections/${connectionId}/decline`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-connections'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
      showToast('Connection declined', 'info');
    },
    onError: () => showToast('Failed to decline', 'error')
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => api.put('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-count'] });
    }
  });

  const notifications = data?.notifications || [];

  const getNotifIcon = (type) => {
    switch (type) {
      case 'connection_request': return <UserPlus className="w-5 h-5 text-primary-500" />;
      case 'connection_accepted': return <UserCheck className="w-5 h-5 text-green-500" />;
      default: return <Megaphone className="w-5 h-5 text-tertiary-500" />;
    }
  };

  const formatTime = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="w-full bg-surface min-h-[calc(100vh-80px)] font-[family-name:var(--font-body)] text-on-surface pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-[family-name:var(--font-display)] tracking-tighter text-on-surface">
            Announcements
          </h1>
          <p className="text-on-surface-variant font-medium text-sm mt-1">Connection requests and notifications</p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button
            onClick={() => markAllReadMutation.mutate()}
            className="px-4 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Pending Connection Requests */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="mb-8 px-2">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-[family-name:var(--font-display)]">
            Pending Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-3">
            <AnimatePresence>
              {pendingRequests.map((req) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="flex items-center gap-4 p-5 bg-surface-container-lowest rounded-2xl shadow-sm border border-primary-200/30"
                >
                  <Link to={`/profile/${req.Sender.id}`} className="shrink-0">
                    <img
                      src={req.Sender.profileImage || getAvatar(null)}
                      alt={req.Sender.name}
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-primary-500/20"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${req.Sender.id}`} className="hover:text-primary-600 transition-colors">
                      <h3 className="font-bold text-sm font-[family-name:var(--font-display)] tracking-tight truncate">
                        {req.Sender.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                      wants to connect with you
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => acceptMutation.mutate(req.id)}
                      disabled={acceptMutation.isPending}
                      className="px-5 py-2.5 bg-gradient-to-r from-primary-600 to-tertiary-500 text-white text-xs font-bold rounded-full shadow-md active:scale-95 transition-transform disabled:opacity-50"
                    >
                      {acceptMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Accept'}
                    </button>
                    <button
                      onClick={() => declineMutation.mutate(req.id)}
                      disabled={declineMutation.isPending}
                      className="p-2.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant rounded-full transition-colors active:scale-95"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* All Notifications */}
      <div className="px-2">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant mb-4 font-[family-name:var(--font-display)]">
          All Notifications
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-4 p-4 rounded-2xl transition-colors ${
                  notif.isRead ? 'bg-surface-container-low/50' : 'bg-surface-container-lowest border border-primary-100/40'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0">
                  {getNotifIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-on-surface">{notif.title}</h4>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5">{notif.message}</p>
                  <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-1.5 block opacity-60">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
                {!notif.isRead && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shrink-0 mt-2" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-lowest rounded-3xl">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-6">
              <Bell className="w-8 h-8 text-on-surface-variant" />
            </div>
            <h3 className="text-xl font-black text-on-surface tracking-tighter mb-2 font-[family-name:var(--font-display)]">
              All caught up!
            </h3>
            <p className="text-on-surface-variant font-medium text-sm max-w-sm mx-auto">
              You'll see connection requests and updates here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
