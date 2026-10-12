import bcrypt from 'bcryptjs';
import { User, IUser } from '../models/user.model';
import { Patient } from '../models/patient.model';
import { AppError } from '../errors/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { ROLES } from '../constants/roles';

// 🇧🇩 STRICT BD PHONE REGEX
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export class AuthService {
  // ১. পেশেন্ট সেলফ-রেজিস্ট্রেশন
  public static async registerPatient(data: {
    name: string;
    phone: string;
    email?: string;
    password: string;
    age?: number;
    gender?: 'MALE' | 'FEMALE' | 'OTHER';
  }) {
    const cleanPhone = data.phone.replace(/\D/g, '');

    const existingUser = await User.findOne({
      $or: [
        { phone: cleanPhone },
        ...(data.email && data.email.trim() !== '' ? [{ email: data.email.toLowerCase().trim() }] : []),
      ],
    });

    if (existingUser) {
      throw new AppError('An account with this mobile number or email already exists. Please sign in.', 409);
    }

    const defaultEmail =
      data.email && data.email.trim() !== ''
        ? data.email.toLowerCase().trim()
        : `patient_${cleanPhone}@carepoint.local`;

    const user = await User.create({
      name: data.name.trim(),
      phone: cleanPhone,
      email: defaultEmail,
      password: data.password.trim(),
      role: ROLES.PATIENT,
      isActive: true,
    });

    const patientId = `PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    await Patient.create({
      userId: user._id,
      patientId,
      name: data.name.trim(),
      phone: cleanPhone,
      email: defaultEmail,
      age: data.age || 28,
      gender: data.gender || 'MALE',
    });

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      lastLoginAt: new Date(),
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions || [],
        lastLoginAt: new Date(),
      },
      accessToken,
      refreshToken,
    };
  }

  // ২. লগইন মেথড (Email ও Phone উভয়টি সাপোর্ট করে)
  public static async login(identifier: string, password: string) {
    const cleanId = identifier.trim();
    const cleanPass = password.trim();
    const phoneDigitsOnly = cleanId.replace(/\D/g, '');

    const user = await User.findOne({
      $or: [
        { email: cleanId.toLowerCase() },
        { phone: cleanId },
        ...(phoneDigitsOnly ? [{ phone: phoneDigitsOnly }] : []),
        ...(phoneDigitsOnly.length === 11 ? [{ phone: `+88${phoneDigitsOnly}` }, { phone: `88${phoneDigitsOnly}` }] : []),
        ...(phoneDigitsOnly.startsWith('880') ? [{ phone: phoneDigitsOnly.slice(2) }] : []),
      ],
    }).select('+password +refreshToken');

    if (!user) {
      throw new AppError('Invalid mobile/email or password credentials.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact administration.', 403);
    }

    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(cleanPass);
    } else if (user.password) {
      isMatch = await bcrypt.compare(cleanPass, user.password);
    }

    if (!isMatch) {
      throw new AppError('Invalid mobile/email or password credentials.', 401);
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await User.findByIdAndUpdate(user._id, {
      refreshToken,
      lastLoginAt: new Date(),
    });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        permissions: user.permissions || [],
        lastLoginAt: new Date(),
      },
      accessToken,
      refreshToken,
    };
  }

  // ৩. রিফ্রেশ টোকেন
  public static async refreshAccessToken(token: string) {
    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || user.refreshToken !== token || !user.isActive) {
      throw new AppError('Invalid or expired refresh token. Please login again.', 401);
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: newRefreshToken,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  // ৪. লগআউট
  public static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  // ৫. কারেন্ট প্রোফাইল
  public static async getCurrentUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  // 🌟 ৬. পেশেন্ট প্রোফাইল আপডেট (NAME, PHONE, EMAIL, PHOTO & MEDICAL DATA EDIT)
  public static async updatePatientProfile(userId: string, data: any) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User account not found.', 404);

    const updateUserData: any = {};
    const updatePatientData: any = { ...data };

    // ১. নাম আপডেট
    if (data.name && data.name.trim() !== '') {
      updateUserData.name = data.name.trim();
      updatePatientData.name = data.name.trim();
    }

    // ২. ফোন নম্বর ভ্যালিডেশন ও আপডেট (ডুপ্লিকেট চেক সহ)
    if (data.phone && data.phone.trim() !== '') {
      const cleanPhone = data.phone.replace(/\D/g, '').slice(0, 11);

      if (cleanPhone.length !== 11 || !BD_PHONE_REGEX.test(cleanPhone)) {
        throw new AppError('Please provide a valid 11-digit Bangladeshi mobile number.', 400);
      }

      // অন্য কোনো একাউন্টে এই নম্বর আছে কি না চেক
      const duplicatePhone = await User.findOne({
        phone: cleanPhone,
        _id: { $ne: user._id },
      });

      if (duplicatePhone) {
        throw new AppError('This mobile number is already registered to another account.', 409);
      }

      updateUserData.phone = cleanPhone;
      updatePatientData.phone = cleanPhone;
    }

    // ৩. ইমেইল আপডেট (ডুপ্লিকেট চেক সহ)
    if (data.email && data.email.trim() !== '') {
      const cleanEmail = data.email.trim().toLowerCase();

      const duplicateEmail = await User.findOne({
        email: cleanEmail,
        _id: { $ne: user._id },
      });

      if (duplicateEmail) {
        throw new AppError('This email address is already in use by another account.', 409);
      }

      updateUserData.email = cleanEmail;
      updatePatientData.email = cleanEmail;
    }

    // ৪. ছবি আপডেট
    if (data.photoUrl) {
      updateUserData.avatarUrl = data.photoUrl;
      updatePatientData.photoUrl = data.photoUrl;
    }

    // 🔒 নিরাপদ ইউজার আপডেট (পাসওয়ার্ড রি-হ্যাশ হওয়া রোধ করে)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateUserData },
      { new: true, runValidators: true }
    ).select('-password');

    // পেশেন্ট রেকর্ড আপডেট বা ক্রিয়েট
    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      const patientId = `PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
      patient = await Patient.create({
        userId: user._id,
        patientId,
        name: updatedUser?.name || user.name,
        phone: updatedUser?.phone || user.phone,
        email: updatedUser?.email || user.email,
        age: data.age || 28,
        gender: data.gender || 'MALE',
        address: data.address || '',
        bloodGroup: data.bloodGroup || 'B+',
        emergencyContact: data.emergencyContact || '',
        photoUrl: data.photoUrl || '',
      });
    } else {
      Object.assign(patient, updatePatientData);
      await patient.save();
    }

    return { user: updatedUser, patient };
  }

  // ৭. পেশেন্ট ডিটেইলস
  public static async getPatientDetails(userId: string) {
    const user = await User.findById(userId).select('-password');
    if (!user) throw new AppError('User not found', 404);
    const patient = await Patient.findOne({ userId: user._id });
    return { user, patient };
  }
}

export default AuthService;