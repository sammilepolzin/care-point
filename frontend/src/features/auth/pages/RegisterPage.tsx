import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, 
  Lock, 
  Phone, 
  User, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  Mail,
  ShieldCheck
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/register', {
        name,
        phone,
        email: email.trim() || undefined,
        password,
        age: Number(age) || 28,
        gender,
      });

      if (response.data.success) {
        const { user, accessToken } = response.data.data;
        login(user, accessToken); // Automatically redirects to /patient/dashboard
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
            Create Patient Account
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Register to access doctor serials, lab reports, and prescriptions.
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-white border-2 border-emerald-100/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">Full Name (রোগীর নাম) *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Md. Rafiqul Islam"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Mobile Number (মোবাইল নম্বর) *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block mb-1">Age (বয়স) *</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={120}
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block mb-1">Gender (লিঙ্গ) *</label>
                <select
                  value={gender}
                  onChange={(e: any) => setGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                >
                  <option value="MALE">Male (পুরুষ)</option>
                  <option value="FEMALE">Female (মহিলা)</option>
                  <option value="OTHER">Other (অন্যান্য)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1">Email Address (ঐচ্ছিক)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1">Create Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-brand-gradient hover:opacity-95 text-white font-black py-3.5 rounded-xl text-sm transition shadow-md shadow-emerald-700/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Creating Account...' : 'Register & Open Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs">
            <span className="text-slate-500">Already have an account? </span>
            <Link to="/login" className="font-bold text-[#00984a] hover:underline">
              Sign In here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};