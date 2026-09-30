import { Request, Response } from 'express';
import { DoctorService } from '../services/doctor.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class DoctorController {
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const { schedules, ...doctorData } = req.body;
    const doctor = await DoctorService.createDoctor(doctorData, schedules);
    sendResponse({
      res,
      statusCode: 201,
      message: 'Doctor registered successfully',
      data: doctor,
    });
  });

  public static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { departmentId, search, status } = req.query;
    const doctors = await DoctorService.getAllDoctors({
      departmentId: departmentId as string,
      search: search as string,
      status: status as string,
    });
    sendResponse({
      res,
      statusCode: 200,
      message: 'Doctors retrieved successfully',
      data: doctors,
    });
  });

  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const result = await DoctorService.getDoctorById(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Doctor details retrieved successfully',
      data: result,
    });
  });

  public static update = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await DoctorService.updateDoctor(req.params.id, req.body);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Doctor profile updated successfully',
      data: doctor,
    });
  });

  public static toggleStatus = asyncHandler(async (req: Request, res: Response) => {
    const doctor = await DoctorService.toggleDoctorStatus(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: `Doctor is now ${doctor.isActive ? 'Active' : 'Inactive'}`,
      data: doctor,
    });
  });

  public static delete = asyncHandler(async (req: Request, res: Response) => {
    await DoctorService.deleteDoctor(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Doctor removed permanently',
    });
  });
}