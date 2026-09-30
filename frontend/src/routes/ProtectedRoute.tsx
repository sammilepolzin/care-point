import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  // অথেন্টিকেশন স্টেট লোড হওয়া পর্যন্ত একটি ক্লিন লোডার দেখাবে
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-[#00984a] rounded-full animate-spin" />
          <span className="text-xs font-bold text-slate-500">Verifying secure access...</span>
        </div>
      </div>
    );
  }

  // লগইন না থাকলে সরাসরি /login পেজে পাঠাবে
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // নির্দিষ্ট রোলের অনুমতি না থাকলে হোমপেজে পাঠাবে
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;