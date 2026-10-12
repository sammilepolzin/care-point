import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { SettingsService } from '../services/settings.service';
import { User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';
import { ROLES } from '../constants/roles';

export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await SettingsService.getSettings();
  sendResponse({
    res,
    statusCode: 200,
    message: 'Settings retrieved successfully',
    data: settings,
  });
});

export const updateSettings = asyncHandler(async (req: Request, res: Response) => {
  const settings = await SettingsService.updateSettings(req.body);
  sendResponse({
    res,
    statusCode: 200,
    message: 'Master settings & website contents updated successfully',
    data: settings,
  });
});

// 🌟 SUPER ADMIN HARD-SECURITY SELECTIVE DELETE CONTROLLER
export const selectiveDeleteSettingsData = asyncHandler(async (req: Request, res: Response) => {
  const { moduleKey, itemIds, password, targets } = req.body;

const currentUserId = req.user?.userId || req.user?._id || req.user?.id;

  // 🛑 ১. শুধুমাত্র SUPER_ADMIN এর অনুমতি আছে কি না যাচাই
  if (req.user?.role !== ROLES.SUPER_ADMIN) {
    throw new AppError('Hard Security Alert: Only Super Admin can perform selective data deletion.', 403);
  }

  // 🛑 ২. সুপার অ্যাডমিন পাসওয়ার্ড ভেরিফিকেশন গার্ড
  if (!password) {
    throw new AppError('Super Admin password is required to authorize deletion.', 400);
  }

  const superAdmin = await User.findById(currentUserId).select('+password');
  if (!superAdmin) {
    throw new AppError('Super Admin account not found.', 404);
  }

  const isPasswordCorrect = await bcrypt.compare(password, superAdmin.password!);
  if (!isPasswordCorrect) {
    throw new AppError('Security Violation: Incorrect Super Admin password! Deletion aborted.', 401);
  }

  const settings = await SettingsService.getSettings();

  // 🗑️ ক. স্পেসিফিক মডিউলের নির্বাচিত আইটেম ডিলিট (Batch Items Delete)
  if (moduleKey && Array.isArray(itemIds) && itemIds.length > 0) {
    if (moduleKey === 'slides') {
      settings.heroSlides = settings.heroSlides.filter((s) => !itemIds.includes(s.id));
    } else if (moduleKey === 'technologies') {
      settings.technologies = settings.technologies.filter(
        (t: any) => !itemIds.includes(t.id || t._id?.toString())
      );
    } else if (moduleKey === 'management') {
      settings.managementTeam = settings.managementTeam.filter(
        (m: any) => !itemIds.includes(m.id || m._id?.toString())
      );
    } else if (moduleKey === 'socials') {
      settings.customSocialLinks = settings.customSocialLinks.filter((soc) => !itemIds.includes(soc.id));
    }
  }

  // 🗑️ খ. সম্পূর্ণ সেকশন মুছে ফেলা (Target Category Wipe)
  if (Array.isArray(targets) && targets.length > 0) {
    if (targets.includes('slides')) settings.heroSlides = [];
    if (targets.includes('technologies')) settings.technologies = [];
    if (targets.includes('management')) settings.managementTeam = [];
    if (targets.includes('socials')) settings.customSocialLinks = [];
    if (targets.includes('logos')) {
      settings.logoUrl = '';
      settings.footerLogoUrl = '';
      settings.faviconUrl = '';
      settings.loaderLogoUrl = '';
    }
    if (targets.includes('map')) {
      settings.googleMapUrl = '';
    }
  }

  await settings.save();

  sendResponse({
    res,
    statusCode: 200,
    message: 'Selected data has been permanently deleted from database.',
    data: settings,
  });
});

export const SettingsController = {
  getSettings,
  updateSettings,
  selectiveDeleteSettingsData,
};

export default SettingsController;