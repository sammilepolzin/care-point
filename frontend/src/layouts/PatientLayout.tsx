import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';

export const PatientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8fafc] pb-14 lg:pb-0">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-grow py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Sticky Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
};

export default PatientLayout;