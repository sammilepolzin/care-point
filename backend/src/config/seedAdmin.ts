import { User } from '../models/user.model';
import { ROLES } from '../constants/roles';
import { env } from './env';
import bcrypt from 'bcryptjs';

export const seedSuperAdmin = async (): Promise<void> => {
  try {
    const adminEmail = env.ADMIN_EMAIL.toLowerCase().trim();
    const adminPass = env.ADMIN_PASSWORD.trim();
    const adminPhone = env.ADMIN_PHONE.trim();

    // ১. ক্লিন ও সঠিক সিঙ্গল-লেভেল বি-ক্রিপ্ট হ্যাশ তৈরি
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPass, salt);

    // ২. পুরনো ডুপ্লিকেট বা করাপ্টেড অ্যাডমিন রেকর্ড মুছে ফ্রেশ রিসেট করা
    await User.deleteMany({
      $or: [{ email: adminEmail }, { phone: adminPhone }, { role: ROLES.SUPER_ADMIN }],
    });

    // ৩. নতুন ও সম্পূর্ণ সঠিক অ্যাডমিন অ্যাকাউন্ট তৈরি
    await User.collection.insertOne({
      name: env.ADMIN_NAME,
      email: adminEmail,
      phone: adminPhone,
      password: hashedPassword,
      role: ROLES.SUPER_ADMIN,
      isActive: true,
      isPhoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`\n==================================================`);
    console.log(`👑 SUPER ADMIN INITIALIZED & READY TO LOGIN:`);
    console.log(`   📧 Email/Identifier : ${adminEmail}`);
    console.log(`   📱 Phone Number      : ${adminPhone}`);
    console.log(`   🔑 Password          : ${adminPass}`);
    console.log(`==================================================\n`);
  } catch (error) {
    console.error('❌ Failed to seed Super Admin:', error);
  }
};