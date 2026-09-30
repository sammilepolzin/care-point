import { Request, Response } from 'express';
import { DoctorAvailabilityService } from '../services/doctorAvailability.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class DoctorAvailabilityController {
  public static getAvailability = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date || typeof date !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid date in YYYY-MM-DD format.' });
    }

    const result = await DoctorAvailabilityService.getDailyAvailability(doctorId, date);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Doctor availability calculated successfully',
      data: result,
    });
  });
}