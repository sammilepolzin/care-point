import mongoose, { Document, Model, Schema } from 'mongoose';

export type ReportStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'PUBLISHED' | 'CANCELLED';

export interface IReport extends Document {
  reportId: string; // e.g. RPT-20260901-0084
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  testBooking?: mongoose.Types.ObjectId;
  testBookingId?: string; // TST-2026...
  testName: string;
  testCode: string;
  departmentName?: string;
  reportFileUrl: string; // PDF file URL
  fileName: string;
  fileSize?: number;
  status: ReportStatus;
  publishedAt?: Date;
  verifiedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    patientAge: {
      type: Number,
    },
    patientGender: {
      type: String,
    },
    testBooking: {
      type: Schema.Types.ObjectId,
      ref: 'TestBooking',
    },
    testBookingId: {
      type: String,
      index: true,
    },
    testName: {
      type: String,
      required: true,
    },
    testCode: {
      type: String,
      required: true,
    },
    departmentName: {
      type: String,
    },
    reportFileUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'READY', 'PUBLISHED', 'CANCELLED'],
      default: 'PUBLISHED',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedBy: {
      type: String,
      default: 'Senior Clinical Pathologist',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Report: Model<IReport> = mongoose.model<IReport>('Report', reportSchema);