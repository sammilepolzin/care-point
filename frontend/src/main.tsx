import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://care-point-y06f.onrender.com/api/v1';

const StartupScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-black">CP</span>
        </div>

        <h1 className="text-2xl font-black text-slate-900">
          Care Point
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Connecting to Care Point server...
        </p>

        <div className="mt-5 w-8 h-8 mx-auto border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    </div>
  );
};

const Startup: React.FC = () => {
  const [AppComponent, setAppComponent] =
    useState<React.ComponentType | null>(null);

  useEffect(() => {
    let mounted = true;

    const startApp = async () => {
      while (mounted) {
        try {
          const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            cache: 'no-store',
          });

          if (!response.ok) {
            throw new Error('Backend not ready');
          }

          const data = await response.json();

          if (data?.success && data?.data?.status === 'UP') {
            const appModule = await import('./App');

            if (mounted) {
              const loader = document.getElementById('startup-loader');
              if (loader) {
                loader.remove();
              }

              setAppComponent(() => appModule.default);
            }

            break;
          }

          throw new Error('Backend not ready');
        } catch {
          if (!mounted) break;

          await new Promise((resolve) => setTimeout(resolve, 1500));
        }
      }
    };

    startApp();

    return () => {
      mounted = false;
    };
  }, []);

  if (!AppComponent) {
    return <StartupScreen />;
  }

  return <AppComponent />;
};

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);

  root.render(
    <React.StrictMode>
      <Startup />
    </React.StrictMode>
  );
}
