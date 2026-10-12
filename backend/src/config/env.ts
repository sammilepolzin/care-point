import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_ACCESS_SECRET: z.string().min(8, 'JWT_ACCESS_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  ADMIN_NAME: z.string().default('Super Administrator'),
  ADMIN_EMAIL: z.string().email().default('admin@medipulse.com'),
  ADMIN_PHONE: z.string().default('01700000000'),
  ADMIN_PASSWORD: z.string().min(6).default('Admin@123456'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', result.error.format());
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();