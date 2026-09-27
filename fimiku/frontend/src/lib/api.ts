import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'bypass-tunnel-reminder': 'true',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fimiku_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    let sessionKey = localStorage.getItem('fimiku_session_key');
    if (!sessionKey) {
      sessionKey = 'guest-' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
      localStorage.setItem('fimiku_session_key', sessionKey);
    }
    config.headers['X-Session-Key'] = sessionKey;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Clear expired token
      localStorage.removeItem('fimiku_token');
    }
    return Promise.reject(error);
  }
);
