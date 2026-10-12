import React from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/features/admin/components/AdminSidebar';
import { AdminHeader } from '@/features/admin/components/AdminHeader';

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};