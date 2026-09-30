import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Lock, ArrowRight, AlertCircle, Phone, UserPlus } from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/login', {
        email: emailOrPhone.trim(),
        password: password.trim(),
      });

      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        login(user, accessToken);
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || 'Invalid credentials. Please check mobile/email and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmailOrPhone('admin@medipulse.com');
    setPassword('Admin@123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-[#f0fdf4] to-slate-100 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="bg-brand-gradient p-2.5 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
              <Activity className="w-7 h-7" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900">
                Care <span className="text-[#00984a]">Point</span>
              </span>
              <span className="block text-[9px] tracking-widest text-slate-500 font-bold uppercase">
                Diagnostic & Consultation
              </span>
            </div>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 mt-5 tracking-tight">
            Sign in to Your Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your appointments, medical reports, and dashboard.
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white border-2 border-emerald-100/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">Mobile Number or Email *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={(e) => setEmailOrPhone(e.target.value)}
                  placeholder="01XXXXXXXXX or email@domain.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label>Password *</label>
                <a href="#" className="text-[11px] text-[#00984a] hover:underline font-bold">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-brand-gradient hover:opacity-95 text-white font-black py-3.5 rounded-xl text-sm transition shadow-md shadow-emerald-700/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* New Patient Register Button & Auto Fill */}
          <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3">
            <Link
              to="/register"
              className="w-full bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 text-center"
            >
              <UserPlus className="w-4 h-4 text-[#00984a]" />
              <span>Create New Patient Account</span>
            </Link>

            <button
              type="button"
              onClick={fillAdminCredentials}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline"
            >
              Admin Demo Auto-Fill (admin@medipulse.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};