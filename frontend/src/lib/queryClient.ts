import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // ৫ মিনিট পর্যন্ত ডাটা ফ্রেশ থাকবে, পেজে ঢুকলে বারবার ফ্লিকার করবে না
      gcTime: 1000 * 60 * 30, // ৩০ মিনিট মেমোরিতে ক্যাশ থাকবে
      refetchOnWindowFocus: false, // ব্রাউজার মিনিমাইজ করে আবার ঢুকলে লোডিং দেখাবে না
      retry: 1,
    },
  },
});