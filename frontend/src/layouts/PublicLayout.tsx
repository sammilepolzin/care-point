import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { FloatingCartBar } from '@/features/tests/components/FloatingCartBar';
import { FloatingActionBar } from '@/components/common/FloatingActionBar';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white pb-14 lg:pb-0">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      {/* Floating Action Buttons: WhatsApp and Cart */}
      <FloatingCartBar />
      <FloatingActionBar />
      <MobileBottomNav />
    </div>
  );
};