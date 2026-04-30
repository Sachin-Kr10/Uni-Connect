import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';

const SocketContext = createContext(null);

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    const newSocket = io(SOCKET_URL, {
      autoConnect: false,
      withCredentials: true,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socket.on('user_online', (userId) => {
      setOnlineUsers(prev => {
        if (!prev.includes(userId)) return [...prev, userId];
        return prev;
      });
    });

    socket.on('user_offline', (userId) => {
      setOnlineUsers(prev => prev.filter(id => id !== userId));
    });

    // Listen for real-time notifications
    socket.on('new_notification', () => {
      setNotificationCount(prev => prev + 1);
    });

    return () => {
      socket.off('online_users');
      socket.off('user_online');
      socket.off('user_offline');
      socket.off('new_notification');
    };
  }, [socket]);

  // Function to fetch and set unread count from API
  const refreshNotificationCount = useCallback(async () => {
    try {
      const api = (await import('../services/api')).default;
      const res = await api.get('/notifications/unread-count');
      setNotificationCount(res.data.count);
    } catch {
      // Silently fail if not authenticated
    }
  }, []);

  // Fetch on mount once socket connects
  useEffect(() => {
    if (!socket) return;
    
    const handleConnect = () => {
      refreshNotificationCount();
    };

    socket.on('connect', handleConnect);
    // Also try immediately in case already connected
    if (socket.connected) refreshNotificationCount();

    return () => {
      socket.off('connect', handleConnect);
    };
  }, [socket, refreshNotificationCount]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, notificationCount, setNotificationCount, refreshNotificationCount }}>
      {children}
    </SocketContext.Provider>
  );
};
