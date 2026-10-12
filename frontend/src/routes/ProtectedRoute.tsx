import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // অথেন্টিকেশন স্টেট লোড হওয়া পর্যন্ত ক্লিন লোডার দেখাবে
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // রোলের কেইস-সেন্সিটিভিটি হ্যান্ডলিং
  const normalizedUserRole = String(user.role || '').toUpperCase();

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());
    const isRoleAllowed = normalizedAllowed.includes(normalizedUserRole);

    if (!isRoleAllowed) {
      // 🚨 CRITICAL FIX: অ্যাডমিন বা স্টাফ ইউজারকে কখনো সাধারণ হোমপেজে বের করে দেবে না
      const adminStaffRoles = [
        'SUPER_ADMIN',
        'ADMIN',
        'RECEPTIONIST',
        'LAB_TECHNICIAN',
        'COLLECTOR',
        'ACCOUNTANT',
      ];

      if (adminStaffRoles.includes(normalizedUserRole)) {
        return <Navigate to="/admin/dashboard" replace />;
      }

      // সাধারণ পেশেন্টকে পেশেন্ট ড্যাশবোর্ডে পাঠাবে
      if (normalizedUserRole === 'PATIENT') {
        return <Navigate to="/patient/dashboard" replace />;
      }

      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;