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
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: string[];
}