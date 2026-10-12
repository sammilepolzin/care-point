import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';
import { ROLES } from '../constants/roles';

// ১. সকল স্টাফ ও প্রশাসনিক ইউজারদের তালিকা
export const getAllStaffUsers = asyncHandler(async (req: Request, res: Response) => {
  const { role, search } = req.query;

  const query: any = { role: { $ne: 'PATIENT' } }; // সাধারণ রোগী ব্যতিরেকে সকল স্টাফ ও অ্যাডমিন

  if (role && role !== 'ALL') {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search as string, $options: 'i' } },
      { email: { $regex: search as string, $options: 'i' } },
      { phone: { $regex: search as string, $options: 'i' } },
    ];
  }

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  sendResponse({
    res,
    statusCode: 200,
    message: 'Staff and admin users retrieved successfully',
    data: users,
  });
});

// ২. নতুন অ্যাডমিন / স্টাফ তৈরি (প্রশাসনিক স্তর সুরক্ষা ও ডাবল-হ্যাশ মুক্ত)
export const createStaffUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, phone, password, role, permissions } = req.body;

  if (!name || !email || !phone || !password || !role) {
    throw new AppError('Please provide all required fields.', 400);
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanPhone = phone.trim();

  // 🛡️ ROLE HIERARCHY GUARD: শুধুমাত্র SUPER_ADMIN অন্য SUPER_ADMIN বা ADMIN তৈরি করতে পারবে
  if ((role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) && req.user?.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Security Restricted: Only Super Admin can create another Super Admin or Admin account.', 403);
  }

  const existingUser = await User.findOne({
    $or: [{ email: cleanEmail }, { phone: cleanPhone }],
  });

  if (existingUser) {
    throw new AppError('User with this email or phone number already exists.', 409);
  }

  // সরাসরি পাসওয়ার্ড দেওয়া হচ্ছে, মডেলের হুক এটিকে একবারই নিখুঁতভাবে হ্যাশ করবে
  const newUser = await User.create({
    name: name.trim(),
    email: cleanEmail,
    phone: cleanPhone,
    password: password.trim(),
    role,
    permissions: Array.isArray(permissions) ? permissions : [],
    isActive: true,
  });

  const sanitized = newUser.toObject();
  delete (sanitized as any).password;

  sendResponse({
    res,
    statusCode: 201,
    message: `${role} account created successfully. User can now log in immediately.`,
    data: sanitized,
  });
});

// ৩. নিজের পাসওয়ার্ড নিজে পরিবর্তন করা (Current Password -> New Password -> Confirm)
export const changeOwnPassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?._id;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Please fill in current password, new password, and confirm password.', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('New password and confirm password do not match.', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('New password must be at least 6 characters long.', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new AppError('User account not found.', 404);
  }

  // বর্তমান পাসওয়ার্ড যাচাই
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new AppError('Your current password is incorrect.', 400);
  }

  user.password = newPassword.trim();
  await user.save();

  sendResponse({
    res,
    statusCode: 200,
    message: 'Your password has been changed successfully.',
  });
});

// ৪. অ্যাডমিন কর্তৃক অন্য ইউজারের পাসওয়ার্ড পরিবর্তন (New Password -> Confirm)
export const changeUserPasswordByAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!newPassword) {
    throw new AppError('Please provide a new password.', 400);
  }

  if (confirmPassword && newPassword !== confirmPassword) {
    throw new AppError('New password and confirm password do not match.', 400);
  }

  if (newPassword.length < 6) {
    throw new AppError('Password must be at least 6 characters long.', 400);
  }

  const targetUser = await User.findById(id).select('+password');
  if (!targetUser) {
    throw new AppError('User account not found.', 404);
  }

  // সাধারণ অ্যাডমিন কখনোই সুপার অ্যাডমিনের পাসওয়ার্ড রিসেট করতে পারবে না
  if (targetUser.role === ROLES.SUPER_ADMIN && req.user?.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Only Super Admin can change another Super Admin password.', 403);
  }

  targetUser.password = newPassword.trim();
  await targetUser.save();

  sendResponse({
    res,
    statusCode: 200,
    message: `Password for ${targetUser.name} has been reset successfully.`,
  });
});

// ৫. সুপার অ্যাডমিন কর্তৃক ইউজার ডিলিট (🚨 সেলফ-ডিলিট কঠোরভাবে নিষিদ্ধ)
export const deleteUserBySuperAdmin = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user?._id?.toString();

  // 🛑 সিকিউরিটি ১: লগইন করা ইউজার বা সুপার অ্যাডমিন কখনোই নিজের অ্যাকাউন্ট ডিলিট করতে পারবে না
  if (currentUserId === id.toString()) {
    throw new AppError('Security Violation: You cannot delete your own account!', 400);
  }

  // 🛑 সিকিউরিটি ২: শুধুমাত্র SUPER_ADMIN ইউজার ডিলিট করতে পারবে
  if (req.user?.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Security Restricted: Only Super Admin can permanently delete user accounts.', 403);
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new AppError('User account not found.', 404);
  }

  // 🛑 সিকিউরিটি ৩: অন্য কোনো সুপার অ্যাডমিন অ্যাকাউন্ট সরাসরি ডিলিট করা যাবে না
  if (targetUser.role === ROLES.SUPER_ADMIN) {
    throw new AppError('Super Admin accounts cannot be deleted.', 403);
  }

  await User.findByIdAndDelete(id);

  sendResponse({
    res,
    statusCode: 200,
    message: `User account "${targetUser.name}" has been permanently deleted.`,
  });
});

// ৬. ইউজার ব্লক / আনব্লক করা (সেলফ-ব্লক প্রতিরোধ)
export const toggleUserStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  // লগইন করা ব্যক্তি নিজেকে ব্লক করতে পারবে না
  if (req.user?._id?.toString() === id) {
    throw new AppError('Security Alert: You cannot block or deactivate your own account!', 400);
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  // সুপার অ্যাডমিন অ্যাকাউন্ট কখনো ব্লক করা যাবে না
  if (targetUser.role === ROLES.SUPER_ADMIN) {
    throw new AppError('Security Alert: Super Administrator account cannot be blocked!', 403);
  }

  targetUser.isActive = !targetUser.isActive;
  await targetUser.save();

  sendResponse({
    res,
    statusCode: 200,
    message: `Account for ${targetUser.name} has been ${targetUser.isActive ? 'activated' : 'blocked'} successfully.`,
    data: { id: targetUser._id, isActive: targetUser.isActive },
  });
});

// ৭. ইউজারের ১৭-মডিউল পারমিশন ও রোল আপডেট
export const updateUserPermissions = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, permissions } = req.body;

  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new AppError('User not found.', 404);
  }

  // সাধারণ অ্যাডমিন কোনো সুপার অ্যাডমিনের পারমিশন বা রোলে হাত দিতে পারবে না
  if (targetUser.role === ROLES.SUPER_ADMIN && req.user?.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Only Super Admin can modify another Super Admin role or permissions.', 403);
  }

  // সাধারণ অ্যাডমিন কাউকে SUPER_ADMIN বা ADMIN পদে প্রমোট করতে পারবে না
  if ((role === ROLES.SUPER_ADMIN || role === ROLES.ADMIN) && req.user?.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Only Super Admin can assign Super Admin or Admin role.', 403);
  }

  if (role) targetUser.role = role;
  if (Array.isArray(permissions)) targetUser.permissions = permissions;

  await targetUser.save();

  sendResponse({
    res,
    statusCode: 200,
    message: 'User permissions and role updated successfully.',
    data: { id: targetUser._id, role: targetUser.role, permissions: targetUser.permissions },
  });
});

export const UserController = {
  getAllStaffUsers,
  createStaffUser,
  changeOwnPassword,
  changeUserPasswordByAdmin,
  deleteUserBySuperAdmin,
  toggleUserStatus,
  updateUserPermissions,
};

export default UserController;