import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import { useSocket } from './SocketContext';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const hasCheckedAuth = useRef(false);

  // On mount, try to refresh token to auto-login — runs ONCE
  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/auth/refresh');
        const token = response.data.accessToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        // Decode JWT payload for user data
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, role: payload.role, name: payload.name, email: payload.email, profileImage: payload.profileImage || null });

        // Connect socket in the background
        if (socket) {
          socket.auth = { token };
          socket.connect();
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Connect socket when user changes (after login/register)
  useEffect(() => {
    if (!user || !socket) return;
    const token = api.defaults.headers.common['Authorization']?.replace('Bearer ', '');
    if (token && !socket.connected) {
      socket.auth = { token };
      socket.connect();
    }
  }, [user, socket]);

  // Listen for unauthorized events to clear local state
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      if (socket) socket.disconnect();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [socket]);

  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(userData);

    return userData;
  }, []);

  const register = useCallback(async (name, email, password, role, otpCode) => {
    const response = await api.post('/auth/register', { name, email, password, role, otpCode });
    const { accessToken, user: userData } = response.data;

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(userData);
    return userData;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Silent fail
    } finally {
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      if (socket) socket.disconnect();
    }
  }, [socket]);

  // Update user data after profile edit
  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
