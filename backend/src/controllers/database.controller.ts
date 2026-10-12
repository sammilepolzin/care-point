import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';
import { ROLES } from '../constants/roles';

// 🌟 মনগোডিবির যেকোনো কালেকশন স্বয়ংক্রিয়ভাবে খুঁজে কাউন্ট করার ডাইনামিক ফাংশন
const getDynamicCount = async (targetPattern: string, filter: any = {}): Promise<number> => {
  try {
    if (!mongoose.connection.db) return 0;
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // ডাটাবেজের সকল কালেকশনের নামের সাথে কেইস-ইনসেন্সিটিভভাবে ম্যাচ করা
    const matchedCol = collections.find((c) =>
      c.name.toLowerCase() === targetPattern.toLowerCase() ||
      c.name.toLowerCase() === `${targetPattern}s`.toLowerCase() ||
      c.name.toLowerCase().includes(targetPattern.toLowerCase())
    );

    if (matchedCol) {
      return await mongoose.connection.db.collection(matchedCol.name).countDocuments(filter);
    }
  } catch (err) {
    return 0;
  }
  return 0;
};

// 🌟 মনগোডিবির কালেকশন স্বয়ংক্রিয়ভাবে খুঁজে পার্মানেন্ট ক্লিয়ার করার ফাংশন
const dynamicDeleteMany = async (targetPattern: string, filter: any = {}): Promise<number> => {
  try {
    if (!mongoose.connection.db) return 0;
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    const matchedCols = collections.filter((c) =>
      c.name.toLowerCase() === targetPattern.toLowerCase() ||
      c.name.toLowerCase() === `${targetPattern}s`.toLowerCase() ||
      c.name.toLowerCase().includes(targetPattern.toLowerCase())
    );

    let totalDeleted = 0;
    for (const col of matchedCols) {
      const res = await mongoose.connection.db.collection(col.name).deleteMany(filter);
      totalDeleted += res.deletedCount || 0;
    }
    return totalDeleted;
  } catch (err) {
    console.warn(`Error deleting from ${targetPattern}:`, err);
  }
  return 0;
};

// 🌟 ১. ডাটাবেজ কালেকশনগুলোর লাইভ রেকর্ড সংখ্যা দেখা (Live Counts)
export const getDatabaseStats = asyncHandler(async (_req: Request, res: Response) => {
  const [
    appointmentsCount,
    testBookingsCount,
    reportsCount,
    prescriptionsCount,
    patientsCount,
    messagesCount,
    galleryCount,
  ] = await Promise.all([
    getDynamicCount('appointment'),
    getDynamicCount('testbooking'),
    getDynamicCount('report'),
    getDynamicCount('prescription'),
    getDynamicCount('user', { role: 'PATIENT' }), // শুধুমাত্র রোগীদের সংখ্যা
    getDynamicCount('contactmessage'),
    getDynamicCount('gallery'),
  ]);

  sendResponse({
    res,
    statusCode: 200,
    message: 'Database collection counts retrieved successfully',
    data: {
      appointments: appointmentsCount,
      testBookings: testBookingsCount,
      reports: reportsCount,
      prescriptions: prescriptionsCount,
      patients: patientsCount,
      messages: messagesCount,
      gallery: galleryCount,
    },
  });
});

// 🌟 ২. সুপার অ্যাডমিন হার্ড-সিকিউরিটি ডাটাবেজ ক্লিয়ার ইঞ্জিন
export const clearSelectedDatabaseCollections = asyncHandler(async (req: Request, res: Response) => {
  const { selectedTargets, password } = req.body;
  
  const currentUserId = req.user?.userId || req.user?._id || req.user?.id;
  const currentUserEmail = req.user?.email;

  // ১. শুধুমাত্র SUPER_ADMIN চেক
  if (req.user?.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Hard Security Alert: Only Super Administrator can clear database collections.', 403);
  }

  if (!Array.isArray(selectedTargets) || selectedTargets.length === 0) {
    throw new AppError('Please select at least one database collection to clear.', 400);
  }

  if (!password) {
    throw new AppError('Super Admin password is required to authorize database wipe.', 400);
  }

  // সুপার অ্যাডমিন অ্যাকাউন্ট সনাক্তকরণ
  let superAdmin = null;
  if (currentUserId) {
    superAdmin = await User.findById(currentUserId).select('+password');
  }
  if (!superAdmin && currentUserEmail) {
    superAdmin = await User.findOne({ email: currentUserEmail.toLowerCase() }).select('+password');
  }
  if (!superAdmin) {
    superAdmin = await User.findOne({ role: ROLES.SUPER_ADMIN }).select('+password');
  }

  if (!superAdmin) {
    throw new AppError('Super Admin account not found in system.', 404);
  }

  // পাসওয়ার্ড যাচাই
  const isPasswordCorrect = await bcrypt.compare(password.trim(), superAdmin.password!);
  if (!isPasswordCorrect) {
    throw new AppError('Security Violation: Incorrect Super Admin password! Database wipe aborted.', 401);
  }

  const deletionSummary: Record<string, number> = {};

  // 🗑️ নির্বাচিত কালেকশন ডিলিট
  if (selectedTargets.includes('appointments')) {
    const c1 = await dynamicDeleteMany('appointment');
    await dynamicDeleteMany('serialbooking');
    await dynamicDeleteMany('doctoravailability');
    deletionSummary['appointments'] = c1;
  }

  if (selectedTargets.includes('testBookings')) {
    const c2 = await dynamicDeleteMany('testbooking');
    await dynamicDeleteMany('homecollection');
    deletionSummary['testBookings'] = c2;
  }

  if (selectedTargets.includes('reports')) {
    const c3 = await dynamicDeleteMany('report');
    deletionSummary['reports'] = c3;
  }

  if (selectedTargets.includes('prescriptions')) {
    const c4 = await dynamicDeleteMany('prescription');
    deletionSummary['prescriptions'] = c4;
  }

  if (selectedTargets.includes('patients')) {
    // 🛑 শুধুমাত্র PATIENT রোল ক্লিয়ার হবে; অ্যাডমিন বা ডাক্তার অ্যাকাউন্ট নিরাপদ থাকবে
    const c5 = await dynamicDeleteMany('user', { role: 'PATIENT' });
    await dynamicDeleteMany('patient');
    deletionSummary['patients'] = c5;
  }

  if (selectedTargets.includes('messages')) {
    const c6 = await dynamicDeleteMany('contactmessage');
    deletionSummary['messages'] = c6;
  }

  if (selectedTargets.includes('gallery')) {
    const c7 = await dynamicDeleteMany('gallery');
    deletionSummary['gallery'] = c7;
  }

  sendResponse({
    res,
    statusCode: 200,
    message: 'Selected database collections have been permanently cleared.',
    data: deletionSummary,
  });
});

export const DatabaseController = {
  getDatabaseStats,
  clearSelectedDatabaseCollections,
};

export default DatabaseController;