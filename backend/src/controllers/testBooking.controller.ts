import { Request, Response } from 'express';
import { TestBookingService } from '../services/testBooking.service';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';

export class TestBookingController {
  // ১. টেস্ট বুকিং তৈরি
  public static create = asyncHandler(async (req: Request, res: Response) => {
    const booking = await TestBookingService.createBooking(req.body);
    sendResponse({
      res,
      statusCode: 201,
      message: 'Diagnostic test booking created successfully',
      data: booking,
    });
  });

  // ২. সকল টেস্ট বুকিং তালিকা
  public static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { date, phone, status, collectionType } = req.query;
    const bookings = await TestBookingService.getAllBookings({
      date: date as string,
      phone: phone as string,
      status: status as string,
      collectionType: collectionType as string,
    });
    sendResponse({
      res,
      statusCode: 200,
      message: 'Test bookings retrieved successfully',
      data: bookings,
    });
  });

  // ৩. নির্দিষ্ট বুকিং বিস্তারিত
  public static getById = asyncHandler(async (req: Request, res: Response) => {
    const booking = await TestBookingService.getBookingById(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Booking details retrieved successfully',
      data: booking,
    });
  });

  // ৪. স্ট্যাটাস আপডেট
  public static updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const booking = await TestBookingService.updateBookingStatus(req.params.id, req.body);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Test order updated successfully',
      data: booking,
    });
  });
}

export default TestBookingController;