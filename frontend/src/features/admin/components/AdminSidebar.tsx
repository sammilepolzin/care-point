import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Stethoscope,
  Calendar,
  TestTube2,
  FileText,
  Settings,
  LogOut,
  Building2,
  Layers,
  HeartPulse,
  Package,
  Tag,
  MessageSquare,
  ImageIcon,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '@/features/auth/context/AuthContext';

export const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  // 🌟 ১৭টি পূর্ণাঙ্গ মাস্টার মেনু আইটেম
  const allMenuItems = [
    { key: 'dashboard', name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { key: 'patients', name: 'Registered Patients', path: '/admin/patients', icon: <Users className="w-4 h-4" /> },
    { key: 'users', name: 'Users & Permissions', path: '/admin/users', icon: <ShieldAlert className="w-4 h-4 text-emerald-400" /> },
    { key: 'doctors', name: 'Doctors Management', path: '/admin/doctors', icon: <Stethoscope className="w-4 h-4" /> },
    { key: 'departments', name: 'Departments', path: '/admin/departments', icon: <Building2 className="w-4 h-4" /> },
    { key: 'schedules', name: 'Doctor Schedules', path: '/admin/schedules', icon: <Calendar className="w-4 h-4" /> },
    { key: 'appointments', name: 'Appointments & Serials', path: '/admin/appointments', icon: <Calendar className="w-4 h-4" /> },
    { key: 'tests', name: 'Diagnostic Tests', path: '/admin/tests', icon: <TestTube2 className="w-4 h-4" /> },
    { key: 'testCategories', name: 'Test Categories', path: '/admin/test-categories', icon: <Layers className="w-4 h-4" /> },
    { key: 'packages', name: 'Health Packages', path: '/admin/packages', icon: <Package className="w-4 h-4" /> },
    { key: 'offers', name: 'Special Offers', path: '/admin/offers', icon: <Tag className="w-4 h-4" /> },
    { key: 'testBookings', name: 'Test Bookings', path: '/admin/test-bookings', icon: <FileText className="w-4 h-4" /> },
    { key: 'reports', name: 'Reports Publishing', path: '/admin/reports', icon: <ShieldCheck className="w-4 h-4" /> },
    { key: 'prescriptions', name: 'Digital Prescription (Rx)', path: '/admin/prescriptions/create', icon: <HeartPulse className="w-4 h-4" /> },
    { key: 'messages', name: 'Patient Inquiries', path: '/admin/messages', icon: <MessageSquare className="w-4 h-4" /> },
    { key: 'gallery', name: 'Photo Gallery', path: '/admin/gallery', icon: <ImageIcon className="w-4 h-4" /> },
    { key: 'settings', name: 'System Settings', path: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  // 🛡️ DYNAMIC PERMISSION CHECKER: যে মডিউলের ভিউ পারমিশন আছে কেবল সেটিই দেখাবে
  const hasModuleAccess = (moduleKey: string): boolean => {
    // সুপার অ্যাডমিন ১৭টি মডিউলের সবকটি দেখতে পারবে
    if (user?.role === 'SUPER_ADMIN') return true;

    // ড্যাশবোর্ড সবার জন্য ওপেন
    if (moduleKey === 'dashboard') return true;

    const userPerms = user?.permissions || [];
    
    // মডিউলে ভিউ অ্যাক্সেস অথবা ফুল এক্সেস থাকলে মেনু শো করবে
    return userPerms.some((p: string) => 
      p === `${moduleKey}:view` || 
      p === `${moduleKey}:edit` || 
      p === `${moduleKey}:delete` ||
      p.startsWith(`${moduleKey}:`)
    );
  };

  const allowedMenuItems = allMenuItems.filter((item) => hasModuleAccess(item.key));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between border-r border-slate-800 shrink-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="bg-brand-gradient p-2 rounded-xl text-white shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-black text-white leading-none">
              Care <span className="text-[#00984a]">Point</span>
            </h1>
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mt-1 block">
              {user?.role?.replace('_', ' ') || 'Admin Portal'}
            </span>
          </div>
        </div>

        {/* Dynamic Filtered Menu Navigation */}
        <nav className="p-3 space-y-1 max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar">
          {allowedMenuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#00984a] text-white shadow-md shadow-emerald-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-900/50 py-2.5 rounded-xl transition border border-red-900/30 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;