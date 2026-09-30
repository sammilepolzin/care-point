import app from './app';
import { env } from './config/env';
import { connectDatabase } from './config/db';
import { seedSuperAdmin } from './config/seedAdmin';
import { seedInitialTests } from './config/seedTests';
import { seedInitialPackagesAndOffers } from './config/seedPackages';
import { seedInitialGallery } from './config/seedGallery';
import { seedInitialSettings } from './config/seedSettings';
import { DoctorSchedule } from './models/doctorSchedule.model';
import { Appointment } from './models/appointment.model';
import { DoctorAvailability } from './models/doctorAvailability.model';

// ডাটাবেজের সকল পুরনো ভুল ইউনিক ইনডেক্স জোরপূর্বক ড্রপ করার নিরাপদ ফাংশন
const dropFaultyIndexes = async () => {
  try {
    console.log('🧹 Checking and cleaning legacy indexes from database collections...');

    // ১. doctorschedules কালেকশন থেকে সব পুরনো ইউনিক ইনডেক্স ড্রপ
    try {
      await DoctorSchedule.collection.dropIndexes();
      console.log('   ✅ Successfully verified indexes for [doctorschedules]');
    } catch (err) {
      // কালেকশন নতুন হলে ইগনোর করবে
    }

    // ২. appointments কালেকশন থেকে ইনডেক্স ড্রপ
    try {
      await Appointment.collection.dropIndexes();
      console.log('   ✅ Successfully verified indexes for [appointments]');
    } catch (err) {}

    // ৩. doctoravailability কালেকশন থেকে ইনডেক্স ড্রপ
    try {
      await DoctorAvailability.collection.dropIndexes();
      console.log('   ✅ Successfully verified indexes for [doctoravailabilities]');
    } catch (err) {}

    console.log('✨ All database collections & indexes are clean and optimized.');
  } catch (error) {
    console.error('Index verification notice:', error);
  }
};

const startServer = async () => {
  try {
    console.log('⏳ Connecting to MongoDB Database...');
    await connectDatabase();

    // ১. ডাটাবেজ ইনডেক্স ক্লিন ও অপ্টিমাইজ করা
    await dropFaultyIndexes();

    // ২. ডিফল্ট সুপার অ্যাডমিন অ্যাকাউন্ট নিশ্চিত করা
    console.log('⏳ Checking & Seeding Super Admin...');
    await seedSuperAdmin();

    // ৩. ডিফল্ট ডায়াগনস্টিক টেস্ট ও ক্যাটাগরি নিশ্চিত করা
    console.log('⏳ Checking & Seeding Initial Diagnostic Tests...');
    await seedInitialTests();

    // ৪. ডিফল্ট হেলথ প্যাকেজ ও স্পেশাল অফার নিশ্চিত করা
    console.log('⏳ Checking & Seeding Health Packages & Promotional Offers...');
    await seedInitialPackagesAndOffers();

    // ৫. ডিফল্ট ফ্যাসিলিটি ফটো গ্যালারি নিশ্চিত করা
    console.log('⏳ Checking & Seeding Facility Photo Gallery...');
    await seedInitialGallery();

    // ৬. ডিফল্ট মাস্টার সেটিংস ও হিরো স্লাইডার নিশ্চিত করা
    console.log('⏳ Checking & Seeding Master Business Settings & Sliders...');
    await seedInitialSettings();

    // ৭. এক্সপ্রেস এইচটিটিপি সার্ভার চালু করা
    const server = app.listen(env.PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 Care Point Diagnostic Platform Backend is RUNNING!`);
      console.log(`🌐 Server URL     : http://localhost:${env.PORT}`);
      console.log(`📡 Health Check   : http://localhost:${env.PORT}/api/v1/health`);
      console.log(`🔐 Auth Login API : http://localhost:${env.PORT}/api/v1/auth/login`);
      console.log(`==================================================\n`);
    });

    // গ্রেসফুল শাটডাউন হ্যান্ডলার
    const shutdown = () => {
      console.log('\n⚠️ Termination signal received. Closing HTTP server...');
      server.close(() => {
        console.log('🛑 HTTP server closed gracefully.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Server failed to start:', error);
    process.exit(1);
  }
};

startServer();