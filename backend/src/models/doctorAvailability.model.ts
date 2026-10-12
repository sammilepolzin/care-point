import mongoose, { Document, Model, Schema } from 'mongoose';

export type AvailabilityStatus = 'AVAILABLE' | 'NOT_AVAILABLE' | 'ON_LEAVE' | 'SERIAL_FULL';

export interface IDoctorAvailability extends Document {
  doctor: mongoose.Types.ObjectId;
  schedule?: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  totalCapacity: number;
  bookedCount: number;
  status: AvailabilityStatus;
  isOverride: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const doctorAvailabilitySchema = new Schema<IDoctorAvailability>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    schedule: {
      type: Schema.Types.ObjectId,
      ref: 'DoctorSchedule',
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    totalCapacity: {
      type: Number,
      required: true,
      min: 0,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'NOT_AVAILABLE', 'ON_LEAVE', 'SERIAL_FULL'],
      default: 'AVAILABLE',
      index: true,
    },
    isOverride: {
      type: Boolean,
      default: false,
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

doctorAvailabilitySchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

export const DoctorAvailability: Model<IDoctorAvailability> = mongoose.model<IDoctorAvailability>(
  'DoctorAvailability',
  doctorAvailabilitySchema
);