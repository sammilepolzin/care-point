import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { OtpService } from '../services/otp.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';

export class AuthController {
  // রেজিস্ট্রেশন কন্ট্রোলার
  public static register = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.registerPatient(req.body);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
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

  // লগইন কন্ট্রোলার
  public static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Login successful',
      data: result,
    });
  });

  // ওটিপি পাঠানো
  public static sendPatientOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.body;
    const result = await OtpService.sendPatientOtp(phone);
    sendResponse({
      res,
      statusCode: 200,
      message: result.message,
      data: result,
    });
  });

  // ওটিপি যাচাই ও প্রোফাইল লোড
  public static verifyPatientOtp = asyncHandler(async (req: Request, res: Response) => {
    const { phone, otp } = req.body;
    const result = await OtpService.verifyPatientOtp(phone, otp);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Mobile number verified and patient profile loaded successfully',
      data: result,
    });
  });

  // টোকেন রিফ্রেশ
  public static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) {
      throw new AppError('Refresh token missing.', 400);
    }

    const result = await AuthService.refreshAccessToken(token);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    sendResponse({
      res,
      statusCode: 200,
      message: 'Token refreshed successfully',
      data: { accessToken: result.accessToken },
    });
  });

  // লগআউট
  public static logout = asyncHandler(async (req: Request, res: Response) => {
    if (req.user?.userId) {
      await AuthService.logout(req.user.userId);
    }
    res.clearCookie('refreshToken');

    sendResponse({
      res,
      statusCode: 200,
      message: 'Logged out successfully',
    });
  });

  // কারেন্ট ইউজার ইনফো
  public static getMe = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getCurrentUserProfile(req.user!.userId);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Profile retrieved successfully',
      data: user,
    });
  });

  // প্রোফাইল আপডেট
  public static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.updatePatientProfile(req.user!.userId, req.body);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Patient medical profile updated successfully',
      data: result,
    });
  });

  // প্রোফাইল বিস্তারিত তথ্য
  public static getProfileDetails = asyncHandler(async (req: Request, res: Response) => {
    const result = await AuthService.getPatientDetails(req.user!.userId);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Profile details retrieved successfully',
      data: result,
    });
  });
}