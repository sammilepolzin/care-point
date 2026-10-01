import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://care-point-y06f.onrender.com/api/v1';

const StartupScreen: React.FC<{
  onRetry: () => void;
  error: boolean;
}> = ({ onRetry, error }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-6">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-black">CP</span>
        </div>

        <h1 className="text-2xl font-black text-slate-900">
          Care Point
        </h1>

        {!error ? (
          <>
            <p className="mt-2 text-sm text-slate-500">
              Connecting to Care Point server...
            </p>
            <div className="mt-5 w-8 h-8 mx-auto border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-500">
              Server is taking longer than usual.
            </p>

            <button
              onClick={onRetry}
              className="mt-5 px-5 py-2.5 rounded-xl bg-brand-gradient text-white text-sm font-bold shadow"
            >
              Retry Connection
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Startup: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  const checkBackend = async () => {
    setError(false);
    setReady(false);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Backend health check failed');
      }

      const data = await response.json();

      if (data?.success && data?.data?.status === 'UP') {
        setReady(true);
      } else {
        throw new Error('Backend is not ready');
      }
    } catch {
      setError(true);
    } finally {
      clearTimeout(timeout);
    }
  };

  useEffect(() => {
    checkBackend();
  }, []);

  if (!ready) {
    return (
      <StartupScreen
        error={error}
        onRetry={checkBackend}
      />
    );
  }

  return <App />;
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
