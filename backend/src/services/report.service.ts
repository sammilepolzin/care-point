import { Report, IReport } from '../models/report.model';
import { TestBooking } from '../models/testBooking.model';
import { AppError } from '../errors/AppError';

export interface CreateReportInput {
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  testBookingId?: string;
  testName: string;
  testCode: string;
  departmentName?: string;
  reportFileUrl: string;
  fileName: string;
  fileSize?: number;
  verifiedBy?: string;
  notes?: string;
}

export class ReportService {
  public static async publishReport(input: CreateReportInput): Promise<IReport> {
    const reportId = `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // ক্লিন ফোন নম্বর (স্পেস ও হাইফেন রিমুভ)
    const cleanPhone = input.patientPhone.replace(/\D/g, '');

    const report = await Report.create({
      reportId,
      ...input,
      patientPhone: cleanPhone,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    });

    if (input.testBookingId) {
      await TestBooking.findOneAndUpdate(
        { bookingId: input.testBookingId },
        { status: 'COMPLETED' }
      );
    }

    console.log(`\n📄 [REPORT PUBLISHED] Report ${report.reportId} published for ${report.patientName} (${report.testName}).`);
    return report;
  }

  // রোগীর নম্বরের সকল রিপোর্ট খুঁজে বের করা (১০ বা ১১ ডিজিট উভয় ফরম্যাট সাপোর্ট করে)
  public static async getReportsByVerifiedPhone(phone: string) {
    const rawDigits = phone.replace(/\D/g, '');
    const last10 = rawDigits.slice(-10); // শেষ ১০ ডিজিট দিয়ে ম্যাচ করা

    return Report.find({
      patientPhone: { $regex: last10 },
      status: 'PUBLISHED',
    }).sort({ publishedAt: -1 });
  }

  public static async getAllReports(filter: { search?: string; status?: string }) {
    const query: any = {};
    if (filter.search) {
      query.$or = [
        { patientName: { $regex: filter.search, $options: 'i' } },
        { patientPhone: { $regex: filter.search, $options: 'i' } },
        { reportId: { $regex: filter.search, $options: 'i' } },
        { testName: { $regex: filter.search, $options: 'i' } },
      ];
    }
    if (filter.status) {
      query.status = filter.status;
    }

    return Report.find(query).sort({ publishedAt: -1, createdAt: -1 });
  }

  public static async deleteReport(id: string) {
    const report = await Report.findByIdAndDelete(id);
    if (!report) {
      throw new AppError('Report not found.', 404);
    }
    return report;
  }
}