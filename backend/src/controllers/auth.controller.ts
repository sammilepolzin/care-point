import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';

export class AuthController {
  // ১. পেশেন্ট রেজিস্ট্রেশন
  public static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.registerPatient(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false, // লোকালহোস্ট HTTP তে কুকি যাতে ড্রপ না হয়
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Account registered successfully. Welcome to Care Point!',
      data: result,
    });
  });

  // ২. লগইন মেথড (Email ও Phone উভয়টি সাপোর্ট করে)
  public static login = asyncHandler(async (req: Request, res: Response) => {
    const identifier = req.body.email || req.body.identifier || req.body.phone;
    const { password } = req.body;

    if (!identifier || !password) {
      throw new AppError('Please provide email/phone and password.', 400);
    }

    const cleanIdentifier = String(identifier).trim();
    const cleanPassword = String(password).trim();

    const result = await AuthService.login(cleanIdentifier, cleanPassword);

    // রিফ্রেশ টোকেন কুকিতে সেট করা
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false, // লোকালহোস্টে নিরাপদ রাখার জন্য false
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Login successful',
      data: result, // এতে user, accessToken এবং refreshToken থাকবে
    });
  });

  // ৩. ওটিপি পাঠানো
  public static sendPatientOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone) throw new AppError('Phone number is required.', 400);

    const result = await OtpService.sendPatientOtp(phone.trim());
    sendResponse({
      res,
      statusCode: 200,
      message: result.message,
      data: result,
    });
  });

  // ৪. ওটিপি যাচাই
  public static verifyPatientOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) throw new AppError('Phone and OTP are required.', 400);

    const result = await OtpService.verifyPatientOtp(phone.trim(), otp.trim());
    sendResponse({
      res,
      statusCode: 200,
      message: 'Mobile number verified successfully',
      data: result,
    });
  });

  // ৫. টোকেন রিফ্রেশ (কুকি না পেলেও বডি থেকে রিফ্রেশ টোকেন গ্রহণ করবে)
  public static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      throw new AppError('Refresh token missing. Please sign in again.', 401);
    }

    const result = await AuthService.refreshAccessToken(token);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: { 
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
    });
  });

  // ৬. লগআউট
  public static logout = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user?.userId || req.user?._id;
    if (uid) {
      await AuthService.logout(uid);
    }
    res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'lax' });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Logged out successfully',
    });
  });

  // ৭. কারেন্ট প্রোফাইল
  public static getMe = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user?.userId || req.user?._id;
    if (!uid) throw new AppError('Unauthorized access.', 401);

    const user = await AuthService.getCurrentUserProfile(uid);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: user,
    });
  });

  // ৮. প্রোফাইল আপডেট
  public static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user?.userId || req.user?._id;
    const result = await AuthService.updatePatientProfile(uid, req.body);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Profile updated successfully',
      data: result,
    });
  });

  // ৯. প্রোফাইল বিস্তারিত
  public static getProfileDetails = asyncHandler(async (req: Request, res: Response) => {
    const uid = req.user?.userId || req.user?._id;
    const result = await AuthService.getPatientDetails(uid);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Profile details retrieved successfully',
      data: result,
    });
  });
}

export default AuthController;