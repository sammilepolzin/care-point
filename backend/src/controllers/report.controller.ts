import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { ReportService } from '../services/report.service';
import { Report } from '../models/report.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';

export class ReportController {
  public static uploadAndPublish = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('Please select a PDF report file to upload', 400);
    }

    const reportFileUrl = `${req.protocol}://${req.get('host')}/uploads/reports/${req.file.filename}`;

    const report = await ReportService.publishReport({
      ...req.body,
      reportFileUrl,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    sendResponse({
      res,
      statusCode: 201,
      message: 'Medical report published successfully and patient notified.',
      data: report,
    });
  });

  // লাইভ ইন-ব্রাউজার PDF স্ট্রিমিং মেথড (কানেকশন রিফিউজড এরর সম্পূর্ণ দূর করবে)
  public static streamReportPdf = asyncHandler(async (req: Request, res: Response) => {
    const report = await Report.findById(req.params.id);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    const filename = path.basename(report.reportFileUrl);
    const filePath = path.join(process.cwd(), 'uploads', 'reports', filename);

    if (!fs.existsSync(filePath)) {
      throw new AppError('PDF document file not found on server storage', 404);
    }

    // ব্রাউজারকে সরাসরি প্রিভিউ দেখানোর জন্য হেডারসমূহ
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(report.fileName)}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });

  public static getByVerifiedPhone = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.query;
    if (!phone || typeof phone !== 'string') {
      throw new AppError('Please provide a verified phone number', 400);
    }

    const reports = await ReportService.getReportsByVerifiedPhone(phone);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Patient authorized reports retrieved successfully',
      data: reports,
    });
  });

  public static getAll = asyncHandler(async (req: Request, res: Response) => {
    const { search, status } = req.query;
    const reports = await ReportService.getAllReports({
      search: search as string,
      status: status as string,
    });
    sendResponse({
      res,
      statusCode: 200,
      message: 'Reports retrieved successfully',
      data: reports,
    });
  });

  public static delete = asyncHandler(async (req: Request, res: Response) => {
    await ReportService.deleteReport(req.params.id);
    sendResponse({
      res,
      statusCode: 200,
      message: 'Report deleted successfully',
    });
  });
}