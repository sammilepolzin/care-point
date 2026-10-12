import { Request, Response } from 'express';
import { DoctorScheduleService } from '../services/doctorSchedule.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class DoctorScheduleController {
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const schedule = await DoctorScheduleService.createSchedule(req.body);
    sendResponse({
      res,
      statusCode: 201,
      message: 'Doctor schedule created successfully',
      data: schedule,
    });
  });

  public static getByDoctor = asyncHandler(async (req: Request, res: Response) => {
    const schedules = await DoctorScheduleService.getSchedulesByDoctor(req.params.doctorId);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Schedules retrieved successfully',
      data: schedules,
    });
  });

  public static getAll = asyncHandler(async (_req: Request, res: Response) => {
    const schedules = await DoctorScheduleService.getAllSchedules();
    sendResponse({
      res,
      statusCode: 200,
      message: 'All schedules retrieved successfully',
      data: schedules,
    });
  });

  public static delete = asyncHandler(async (req: Request, res: Response) => {
    await DoctorScheduleService.deleteSchedule(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Schedule deleted successfully',
    });
  });
}