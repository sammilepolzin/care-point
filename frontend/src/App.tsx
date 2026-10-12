import React, { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { TestCartProvider } from '@/features/tests/context/TestCartContext';
import { AppRoutes } from '@/routes/AppRoutes';
import api from '@/lib/axios';

// 🚀 ZERO FLICKER / ZERO DELAY: PRE-POPULATES CACHE BEFORE REVEALING THE APP
const GlobalBootstrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const [adminUploadedLogo, setAdminUploadedLogo] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const bootstrapApplication = async () => {
      try {
        // ১. ব্যাকএন্ড থেকে সরাসরি সেটিংস ও ডক্টর ডাটা আনা
        const [settingsRes] = await Promise.allSettled([
          api.get('/settings'),
          queryClient.prefetchQuery({
            queryKey: ['public-departments'],
            queryFn: async () => {
              const res = await api.get('/departments?active=true');
              return res.data.data;
            },
          }),
          queryClient.prefetchQuery({
            queryKey: ['public-doctors'],
            queryFn: async () => {
              const res = await api.get('/doctors?status=active');
              return res.data.data;
            },
          }),
        ]);

        if (settingsRes.status === 'fulfilled' && settingsRes.value.data?.data) {
          const settings = settingsRes.value.data.data;

          // 🚨 CRITICAL FIX: সরাসরি মেমরি ক্যাশে ইনজেক্ট করা যাতে Navbar ও Slider প্রথম ফ্রেমেই ডাটা পায়!
          queryClient.setQueryData(['public-settings'], settings);

          const realLogo = settings.loaderLogoUrl || settings.logoUrl || null;
          if (realLogo && isMounted) {
            setAdminUploadedLogo(realLogo);
          }
        }
      } catch (error) {
        console.warn('System initialization underway...');
      } finally {
        if (isMounted) {
          // একবারেই সম্পূর্ণ রেডি পেজ প্রদর্শন
          setTimeout(() => setIsReady(true), 300);
        }
      }
    };

    bootstrapApplication();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isReady) {
    return (
      <div className="fixed inset-0 z-[999999] bg-[#f8fafc] flex items-center justify-center font-sans">
        <div className="relative flex items-center justify-center">
          <div 
            className="w-16 h-16 rounded-full bg-emerald-500/20 animate-ping" 
            style={{ animationDuration: '1.2s' }}
          />

          {adminUploadedLogo && (
            <div className="absolute w-20 h-20 rounded-2xl bg-white p-2.5 shadow-xl border border-slate-200 flex items-center justify-center overflow-hidden animate-in fade-in">
              <img src={adminUploadedLogo} alt="Care Point" className="max-w-full max-h-full object-contain" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div className="animate-in fade-in duration-150">{children}</div>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalBootstrapper>
        <BrowserRouter>
          <AuthProvider>
            <TestCartProvider>
              <AppRoutes />
            </TestCartProvider>
          </AuthProvider>
        </BrowserRouter>
      </GlobalBootstrapper>
    </QueryClientProvider>
  );
};

export default App;