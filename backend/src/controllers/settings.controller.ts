import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

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

export const SettingsController = {
  getSettings,
  updateSettings,
};

export default SettingsController;