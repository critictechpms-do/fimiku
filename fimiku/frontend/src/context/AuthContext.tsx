'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/me/');
      setUser(res.data);
    } catch {
      setUser(null);
      localStorage.removeItem('fimiku_token');
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('fimiku_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await api.post('/auth/login/', { username, password });
      const accessToken = res.data.access;
      localStorage.setItem('fimiku_token', accessToken);
      setToken(accessToken);
      await fetchProfile();
      return { success: true };
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid username or password';
      return { success: false, error: msg };
    }
  };

  const register = async (userData: { username: string; email: string; password: string; first_name?: string; last_name?: string }) => {
    try {
      await api.post('/auth/register/', userData);
      return await login(userData.username, userData.password);
    } catch (err: any) {
      const errors = err.response?.data;
      let msg = 'Registration failed. Please try again.';
      if (errors) {
        if (typeof errors === 'object') {
          msg = Object.values(errors).flat().join(' ');
        }
      }
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('fimiku_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
