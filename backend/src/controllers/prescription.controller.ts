import { Request, Response } from 'express';
import { PrescriptionService } from '../services/prescription.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class PrescriptionController {
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const prescription = await PrescriptionService.createPrescription(req.body);
    sendResponse({
      res,
      statusCode: 201,
      message: 'Digital prescription created successfully',
      data: prescription,
    });
  });

  public static getByPhone = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.query;
    const prescriptions = await PrescriptionService.getPrescriptionsByPhone(phone as string);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Patient prescriptions retrieved successfully',
      data: prescriptions,
    });
  });

  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const prescription = await PrescriptionService.getById(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Prescription details retrieved successfully',
      data: prescription,
    });
  });

  public static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { doctorId, search } = req.query;
    const prescriptions = await PrescriptionService.getAll({
      doctorId: doctorId as string,
      search: search as string,
    });
    sendResponse({
      res,
      statusCode: 200,
      message: 'Prescriptions retrieved successfully',
      data: prescriptions,
    });
  });
}