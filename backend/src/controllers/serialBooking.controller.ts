import { Request, Response } from 'express';
import { SerialBookingService } from '../services/serialBooking.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class SerialBookingController {
  public static book = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await SerialBookingService.bookSerial(req.body);
    sendResponse({
      res,
      statusCode: 201,
      message: 'Appointment request submitted successfully. Awaiting admin serial confirmation.',
      data: appointment,
    });
  });

  public static confirmByAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { serialNumber, chamberRoom, sessionTime } = req.body;
    const appointment = await SerialBookingService.confirmByAdmin(req.params.id, serialNumber, chamberRoom, sessionTime);
    sendResponse({
      res,
      statusCode: 200,
      message: `Appointment confirmed with Serial ${appointment.formattedSerial}. SMS & WhatsApp sent.`,
      data: appointment,
    });
  });

  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const appointment = await SerialBookingService.getAppointmentById(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Appointment retrieved successfully',
      data: appointment,
    });
  });

  public static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { date, doctorId, phone, status } = req.query;
    const appointments = await SerialBookingService.getAllAppointments({
      date: date as string,
      doctorId: doctorId as string,
      phone: phone as string,
      status: status as string,
    });
    sendResponse({
      res,
      statusCode: 200,
      message: 'Appointments retrieved successfully',
      data: appointments,
    });
  });

  public static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.body;
    const appointment = await SerialBookingService.updateAppointmentStatus(req.params.id, status);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Appointment status updated successfully',
      data: appointment,
    });
  });
}