import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Request Interceptor: Automatically handles Tokens & FormData Boundaries
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 🚨 CRITICAL FIX: FormData পাঠালে Content-Type ডিলিট করে দেওয়া যাতে ব্রাউজার সঠিক boundary সেট করতে পারে
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Safe Auto Token Refresh (Zero-Loop Guard)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🛑 ১. লগইন, রেজিস্টার কিংবা রিফ্রেশ-টোকেন ফেইল করলে কখনো রিফ্রেশ টোকেন কল করবে না!
    const isAuthRequest =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh-token');

    // শুধুমাত্র অথেনটিকেটেড পেজের মেয়াদ শেষ হওয়া 401 রিকোয়েস্টেই রিফ্রেশ হবে
    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRequest) {
      originalRequest._retry = true;

      const storedRefreshToken = localStorage.getItem('refreshToken');

      try {
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh-token`,
          { refreshToken: storedRefreshToken }, // বডিতে পাস করা হচ্ছে যাতে কুকি ড্রপ হলেও কাজ করে
          { withCredentials: true }
        );

        if (refreshResponse.data.success) {
          const newToken = refreshResponse.data.data.accessToken;
          const newRefreshToken = refreshResponse.data.data.refreshToken;

          localStorage.setItem('accessToken', newToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;