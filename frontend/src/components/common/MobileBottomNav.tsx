import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Stethoscope, TestTube2, FileText, User } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';

export const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return '/admin/dashboard';
    return '/patient/dashboard';
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-2 px-3 flex justify-around items-center shadow-lg">
      <Link
        to="/"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
          location.pathname === '/' ? 'text-[#00984a]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Link>

      <Link
        to="/doctors"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
          location.pathname.startsWith('/doctors') || location.pathname === '/today-doctors' ? 'text-[#00984a]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <Stethoscope className="w-4 h-4" />
        <span>Doctors</span>
      </Link>

      <Link
        to="/tests"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
          location.pathname.startsWith('/tests') ? 'text-[#00984a]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <TestTube2 className="w-4 h-4" />
        <span>Tests</span>
      </Link>

      <Link
        to="/report-search"
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
          location.pathname.startsWith('/report-search') ? 'text-[#00984a]' : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <FileText className="w-4 h-4" />
        <span>Reports</span>
      </Link>

      <Link
        to={isAuthenticated ? getDashboardPath() : '/login'}
        className={`flex flex-col items-center gap-1 text-[10px] font-bold transition ${
          location.pathname.includes('dashboard') || location.pathname === '/login' || location.pathname === '/register'
            ? 'text-[#00984a]'
            : 'text-slate-500 hover:text-slate-900'
        }`}
      >
        <User className="w-4 h-4" />
        <span>{isAuthenticated ? 'Profile' : 'Account'}</span>
      </Link>
    </div>
  );
};