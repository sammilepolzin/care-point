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

  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: Home,
      isActive: location.pathname === '/',
    },
    {
      name: 'Doctors',
      path: '/doctors',
      icon: Stethoscope,
      isActive: location.pathname.startsWith('/doctors') || location.pathname === '/today-doctors',
    },
    {
      name: 'Tests',
      path: '/tests',
      icon: TestTube2,
      isActive: location.pathname.startsWith('/tests'),
    },
    {
      name: 'Reports',
      path: '/report-search',
      icon: FileText,
      isActive: location.pathname.startsWith('/report-search'),
    },
    {
      name: isAuthenticated ? 'Profile' : 'Account',
      path: isAuthenticated ? getDashboardPath() : '/login',
      icon: User,
      isActive: location.pathname.includes('dashboard') || location.pathname === '/login' || location.pathname === '/register',
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        maxWidth: '100vw',
        zIndex: 50,
        boxSizing: 'border-box',
      }}
      className="lg:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)] overflow-hidden"
    >
      <div className="flex items-center justify-between w-full h-14 max-w-full px-0">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.path}
              style={{ width: '20%' }}
              className={`flex flex-col items-center justify-center h-full py-1 transition-all select-none text-center shrink-0 ${
                item.isActive ? 'text-[#00984a]' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${item.isActive ? 'bg-emerald-50 scale-105' : ''}`}>
                <Icon className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className={`text-[10px] tracking-tight leading-none mt-0.5 truncate block max-w-full px-0.5 ${
                item.isActive ? 'font-black text-[#00984a]' : 'font-semibold text-slate-500'
              }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};