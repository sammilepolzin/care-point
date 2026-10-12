import React from 'react';
import { Bell, Search, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';

export const AdminHeader: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search patient, serial, or test ID..."
          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#00984a]"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 relative">
          <Bell className="w-5 h-5" />
          <span className="w-2 h-2 bg-emerald-500 rounded-full absolute top-2 right-2 ring-2 ring-white" />
        </button>

        <div className="h-8 w-px bg-slate-200" />

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#00984a] border border-emerald-200 flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0] : 'A'}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
            <span className="text-[10px] font-bold text-[#00984a] uppercase tracking-wider">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};