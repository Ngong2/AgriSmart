import axios from 'axios';

// Use environment variable with fallback
const API_URL = import.meta.env.VITE_API_BASE_URL || 'https://agrismart-g0g9.onrender.com/api';

console.log('API Base URL:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout (Render free tier can be slow to wake up)
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('agri_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`, config.params || '');
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // Handle timeout errors specifically
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('⏱️ Request timeout - server may be sleeping. Please try again.');
      error.timeoutError = true;
      error.userMessage = 'Server is taking too long to respond. This may happen if the server is sleeping. Please try again in a moment.';
    }

    console.error('❌ Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      timeout: error.timeoutError
    });

    if (error.response?.status === 401) {
      // Auto logout if 401 response
      localStorage.removeItem('agri_token');
      localStorage.removeItem('agri_user');
      window.location.href = '/login';
    }
    
    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      console.error('🌐 Network error - check server connection');
    }
    
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('agri_token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('agri_token');
  }
};

export const logoutRequest = () => api.post('/auth/logout');

// Test connection function
export const testConnection = async () => {
  try {
    const response = await api.get('/health');
    return { success: true, data: response.data };
  } catch (error) {
    let errorMessage = error.response?.data?.message || error.message;
    
    // Provide helpful message for timeouts
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      errorMessage = 'Server timeout - the server may be sleeping. Please wait a moment and try again.';
    }
    
    return { 
      success: false, 
      error: errorMessage,
      timeout: error.code === 'ECONNABORTED' || error.message.includes('timeout')
    };
  }
};

export default api;