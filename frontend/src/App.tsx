import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { TestCartProvider } from '@/features/tests/context/TestCartContext';
import { FloatingCartBar } from '@/features/tests/components/FloatingCartBar';
import { AppRoutes } from '@/routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TestCartProvider>
            <AppRoutes />
            {/* Global Floating Cart Bar: Displays seamlessly whenever tests are added to cart */}
            <FloatingCartBar />
          </TestCartProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;