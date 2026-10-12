import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'RECEPTIONIST' 
  | 'DOCTOR' 
  | 'LAB_TECHNICIAN' 
  | 'COLLECTOR' 
  | 'ACCOUNTANT' 
  | 'PATIENT';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  permissions?: string[];
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: any, accessToken?: string, refreshToken?: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  // 🌟 SMART ROLE-BASED LOGIN REDIRECT
  const login = (userData: any, accessToken?: string, refreshToken?: string) => {
    // ডাটা ডিরেক্ট ইউজার অবজেক্ট হোক কিংবা রেসপন্স অবজেক্ট হোক—উভয়কেই সঠিকভাবে রিড করবে
    const rawUser = userData?.user || userData;
    const rawToken = accessToken || userData?.accessToken || userData?.token;
    const rawRefresh = refreshToken || userData?.refreshToken;

    if (!rawUser) return;

    const normalizedRole = String(rawUser.role || 'PATIENT').toUpperCase() as UserRole;

    const normalizedUser: User = {
      ...rawUser,
      id: rawUser._id || rawUser.id,
      role: normalizedRole,
      permissions: Array.isArray(rawUser.permissions) ? rawUser.permissions : [],
    };

    setUser(normalizedUser);

    if (rawToken) {
      setToken(rawToken);
      localStorage.setItem('accessToken', rawToken);
    }
    if (rawRefresh) {
      localStorage.setItem('refreshToken', rawRefresh);
    }
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    // 🚀 ROLE BASED REDIRECT: যেকোনো প্রশাসনিক ইউজার সরাসরি অ্যাডমিন প্যানেলে যাবে
    const adminRoles: UserRole[] = [
      'SUPER_ADMIN', 
      'ADMIN', 
      'RECEPTIONIST', 
      'LAB_TECHNICIAN', 
      'COLLECTOR', 
      'ACCOUNTANT'
    ];

    if (adminRoles.includes(normalizedRole)) {
      navigate('/admin/dashboard', { replace: true });
    } else if (normalizedRole === 'DOCTOR') {
      navigate('/doctor/dashboard', { replace: true });
    } else {
      // সাধারণ পেশেন্ট যাবে পেশেন্ট পোর্টালে
      navigate('/patient/dashboard', { replace: true });
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      navigate('/login', { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;