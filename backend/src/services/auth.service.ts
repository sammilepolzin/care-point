import { User, IUser } from '../models/user.model';
import { Patient } from '../models/patient.model';
import { AppError } from '../errors/AppError';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';
import { ROLES } from '../constants/roles';

export class AuthService {
  // ১. পেশেন্ট রেজিস্ট্রেশন
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
      isPhoneVerified: true,
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

    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
      refreshToken,
    };
  }

  // ২. লগইন মেথড
  public static async login(identifier: string, password: string) {
    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    // ইমেইল বা ফোন দিয়ে ইউজার খোঁজা
    const user = await User.findOne({
      $or: [{ email: cleanId.toLowerCase() }, { phone: cleanId }],
    }).select('+password +refreshToken');

    if (!user) {
      throw new AppError('Invalid mobile/email or password credentials.', 401);
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact administration.', 403);
    }

    const isMatch = await user.comparePassword(cleanPass);
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

    user.refreshToken = refreshToken;
    user.lastLoginAt = new Date();
    await user.save();

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        lastLoginAt: user.lastLoginAt,
      },
      accessToken,
      refreshToken,
    };
  }

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

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public static async logout(userId: string) {
    await User.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  }

  public static async getCurrentUserProfile(userId: string) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found.', 404);
    }
    return user;
  }

  public static async updatePatientProfile(userId: string, data: any) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    if (data.name) {
      user.name = data.name.trim();
      await user.save();
    }

    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      patient = await Patient.create({
        userId: user._id,
        patientId: `PAT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        name: user.name,
        phone: user.phone,
        email: user.email,
        age: data.age || 28,
        gender: data.gender || 'MALE',
      });
    }

    Object.assign(patient, data);
    await patient.save();

    return { user, patient };
  }

  public static async getPatientDetails(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);
    const patient = await Patient.findOne({ userId: user._id });
    return { user, patient };
  }
}