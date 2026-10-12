import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';

// ISP এর DNS ব্লকিং বা SRV ফেইলিউর বাইপাস করার জন্য Google Public DNS সেট করা
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};