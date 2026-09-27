'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Sparkles, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();
  const { showToast, fetchCart } = useCart();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Login form state
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await login(loginData.username, loginData.password);
    setLoading(false);

    if (res.success) {
      showToast(`✨ Welcome back, ${loginData.username}!`);
      await fetchCart();
      onClose();
    } else {
      setErrorMsg(res.error || 'Invalid credentials. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    const res = await register(registerData);
    setLoading(false);

    if (res.success) {
      showToast(`🎉 Account created! Welcome to Fimiku, ${registerData.username}!`);
      await fetchCart();
      onClose();
    } else {
      setErrorMsg(res.error || 'Registration failed. Please try a different username/email.');
    }
  };

  const fillDemoCredentials = () => {
    setLoginData({
      username: 'demo_parent',
      password: 'fimiku123',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md shadow-floating overflow-hidden border border-fimiku-lightBorder flex flex-col max-h-[90vh] overflow-y-auto pb-safe sm:pb-0">
        
        {/* Header */}
        <div className="p-5 bg-fimiku-softLavender flex justify-between items-center border-b border-fimiku-lightBorder">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-fimiku-veryLightLavender rounded-xl text-fimiku-cta border border-fimiku-lightPurple/40">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-fimiku-darkText">
                {mode === 'login' ? 'Sign In to Fimiku' : 'Create Parent Account'}
              </h3>
              <p className="text-[11px] text-fimiku-grayText">Safe & pure silicone essentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-fimiku-grayText hover:text-fimiku-darkText rounded-full hover:bg-fimiku-veryLightLavender transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-fimiku-lightBorder bg-fimiku-softLavender/40 p-1 m-4 rounded-2xl">
          <button
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              mode === 'login'
                ? 'bg-white text-fimiku-cta shadow-sm border border-fimiku-lightBorder'
                : 'text-fimiku-grayText hover:text-fimiku-darkText'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition ${
              mode === 'register'
                ? 'bg-white text-fimiku-cta shadow-sm border border-fimiku-lightBorder'
                : 'text-fimiku-grayText hover:text-fimiku-darkText'
            }`}
          >
            Register Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-1 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLogin} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-fimiku-darkText">Username or Email</label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 text-fimiku-grayText absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    placeholder="Enter your username"
                    className="w-full pl-10 pr-4 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-fimiku-darkText">Password</label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 text-fimiku-grayText absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center text-[11px] pt-1">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-fimiku-cta hover:underline font-medium"
                >
                  Use Demo Account (demo_parent)
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-fimiku-cta hover:bg-fimiku-primary text-white font-semibold rounded-full transition shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Registration Form */
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-fimiku-darkText">First Name</label>
                  <input
                    type="text"
                    value={registerData.first_name}
                    onChange={(e) => setRegisterData({ ...registerData, first_name: e.target.value })}
                    placeholder="Sarah"
                    className="w-full mt-1 px-3.5 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                  />
                </div>
                <div>
                  <label className="font-semibold text-fimiku-darkText">Last Name</label>
                  <input
                    type="text"
                    value={registerData.last_name}
                    onChange={(e) => setRegisterData({ ...registerData, last_name: e.target.value })}
                    placeholder="Sharma"
                    className="w-full mt-1 px-3.5 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-fimiku-darkText">Username *</label>
                <div className="relative mt-1">
                  <User className="w-4 h-4 text-fimiku-grayText absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    placeholder="Choose a username"
                    className="w-full pl-10 pr-4 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-fimiku-darkText">Email Address *</label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 text-fimiku-grayText absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    placeholder="parent@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-fimiku-darkText">Password * (Min 6 chars)</label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 text-fimiku-grayText absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    placeholder="Create a strong password"
                    className="w-full pl-10 pr-4 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-fimiku-cta hover:bg-fimiku-primary text-white font-semibold rounded-full transition shadow-md flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? 'Creating Account & Encrypting...' : 'Register Account'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="pt-2 text-center text-[11px] text-fimiku-grayText">
            🔒 Passwords are encrypted with PBKDF2 / SHA-256 and stored in MongoDB Atlas.
          </div>

        </div>

      </div>
    </div>
  );
}
