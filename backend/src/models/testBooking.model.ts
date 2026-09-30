import mongoose, { Document, Model, Schema } from 'mongoose';

export type BookingCollectionType = 'CENTER_VISIT' | 'HOME_COLLECTION';
export type TestBookingStatus = 'PENDING' | 'CONFIRMED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface ITestBookingItem {
  testId?: any;
  name: string;
  code?: string;
  regularPrice: number;
  discountPrice: number;
}

export interface ITestBooking extends Document {
  bookingId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  collectionType: BookingCollectionType;
  collectionAddress?: string;
  collectionLandmark?: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  tests: ITestBookingItem[];
  totalRegularAmount: number;
  totalDiscountAmount: number;
  homeCollectionFee: number;
  netPayableAmount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  status: TestBookingStatus;
  assignedCollector?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const testBookingSchema = new Schema<ITestBooking>(
  {
    bookingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientName: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    patientPhone: {
      type: String,
      required: [true, 'Patient phone is required'],
      index: true,
      trim: true,
    },
    patientAge: {
      type: Number,
      default: 28,
    },
    patientGender: {
      type: String,
      default: 'MALE',
    },
    collectionType: {
      type: String,
      enum: ['CENTER_VISIT', 'HOME_COLLECTION'],
      default: 'CENTER_VISIT',
    },
    collectionAddress: {
      type: String,
      trim: true,
    },
    collectionLandmark: {
      type: String,
      trim: true,
    },
    scheduledDate: {
      type: String,
      required: true,
      index: true,
    },
    scheduledTimeSlot: {
      type: String,
      required: true,
    },
    tests: [
      {
        testId: { type: Schema.Types.Mixed }, // ফ্লেক্সিবল যাতে কোনো ফরম্যাট মিসম্যাচ না হয়
        name: { type: String, required: true },
        code: { type: String, default: 'TST' },
        regularPrice: { type: Number, default: 0 },
        discountPrice: { type: Number, required: true },
      },
    ],
    totalRegularAmount: {
      type: Number,
      default: 0,
    },
    totalDiscountAmount: {
      type: Number,
      default: 0,
    },
    homeCollectionFee: {
      type: Number,
      default: 0,
    },
    netPayableAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      default: 'CASH_AT_CENTER',
    },
    paymentStatus: {
      type: String,
      default: 'PENDING',
    },
    status: {
      type: String,
      default: 'PENDING',
      index: true,
    },
    assignedCollector: {
      type: String,
      default: 'Not Assigned',
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const TestBooking: Model<ITestBooking> = mongoose.model<ITestBooking>('TestBooking', testBookingSchema);