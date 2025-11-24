import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken, testConnection } from '../api/api';

// Create and export AuthContext
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('agri_user');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.error('Error parsing stored user:', error);
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('agri_token') || null);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('checking');

  // Test server connection on startup
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Test server connection first
        const connection = await testConnection();
        if (connection.success) {
          setConnectionStatus('connected');
          console.log('✅ Server connection successful');
        } else {
          setConnectionStatus('disconnected');
          console.error('❌ Server connection failed:', connection.error);
        }

        const token = localStorage.getItem('agri_token');
        const userData = localStorage.getItem('agri_user');
        
        if (token && userData) {
          setAuthToken(token);
          setToken(token);
          setUser(JSON.parse(userData));
          console.log('🔑 User session restored');
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setConnectionStatus('error');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 Attempting login for:', email);
      
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('agri_token', token);
      localStorage.setItem('agri_user', JSON.stringify(user));
      setAuthToken(token);
      setToken(token);
      setUser(user);
      
      console.log('✅ Login successful for user:', user.email);
      return response.data;
    } catch (error) {
      console.error('❌ Login error:', error.response?.data || error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      console.log('🔄 Attempting registration for:', userData.email);
      
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('agri_token', token);
      localStorage.setItem('agri_user', JSON.stringify(user));
      setAuthToken(token);
      setToken(token);
      setUser(user);
      
      console.log('✅ Registration successful for user:', user.email);
      return response.data;
    } catch (error) {
      console.error('❌ Registration error:', error.response?.data || error.message);
      throw error;
    }
  };

  const logout = () => {
    console.log('👋 User logging out');
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    setAuthToken(null);
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    loading,
    connectionStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;