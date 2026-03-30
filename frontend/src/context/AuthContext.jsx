import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from './SocketContext';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();

  // On mount, try to refresh token to auto-login
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/auth/refresh');
        const token = response.data.accessToken;
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Fetch user profile (In a real app, the backend might return user data with the token)
        // For now, assuming user data isn't returned, or we have to fetch it. Let's assume the token has info, 
        // or we have a '/auth/me' route. Let's add a simple payload decode for demo.
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ id: payload.id, role: payload.role });

        // Connect socket
        if (socket) {
          socket.auth = { token };
          socket.connect();
        }
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, [socket]);

  // Listen for unauthorized events to clear local state
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      if (socket) socket.disconnect();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [socket]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, user: userData } = response.data;
    
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(userData);

    if (socket) {
      socket.auth = { token: accessToken };
      socket.connect();
    }
    return userData;
  };

  const register = async (name, email, password, role, otpCode) => {
    const response = await api.post('/auth/register', { name, email, password, role, otpCode });
    const { accessToken, user: userData } = response.data;
    
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setUser(userData);

    if (socket) {
      socket.auth = { token: accessToken };
      socket.connect();
    }
    return userData;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      delete api.defaults.headers.common['Authorization'];
      if (socket) socket.disconnect();
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
