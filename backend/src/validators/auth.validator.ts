import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(11, 'Please enter a valid 11-digit mobile number'),
  email: z.string().email('Please enter a valid email address').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  age: z.number().min(1).max(120).optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('MALE'),
});

export const loginSchema = z.object({
  email: z.string().min(1, 'Please provide your email or phone number'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().optional(),
});