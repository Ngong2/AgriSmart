// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import api, { setAuthToken } from '../api/api';

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
    const raw = localStorage.getItem('agri_user');
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agri_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('agri_token');
    const userData = localStorage.getItem('agri_user');
    
    if (token && userData) {
      setAuthToken(token);
      setToken(token);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('agri_token', token);
      localStorage.setItem('agri_user', JSON.stringify(user));
      setAuthToken(token);
      setToken(token);
      setUser(user);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('agri_token', token);
      localStorage.setItem('agri_user', JSON.stringify(user));
      setAuthToken(token);
      setToken(token);
      setUser(user);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
    setAuthToken(null);
    setToken(null);
    setUser(null);
    // Use navigate instead of window.location for SPA behavior
    window.location.href = '/login';
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token && !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;