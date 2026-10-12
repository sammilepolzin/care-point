import mongoose, { Document, Model, Schema } from 'mongoose';

export type WeekDay = 'Saturday' | 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';

export interface IDoctorSchedule extends Document {
  doctor: mongoose.Types.ObjectId;
  dayOfWeek: WeekDay;
  startTime: string;
  endTime: string;
  maxSerialCapacity?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const doctorScheduleSchema = new Schema<IDoctorSchedule>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: [true, 'Doctor reference is required'],
    },
    dayOfWeek: {
      type: String,
      enum: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      required: [true, 'Day of week is required'],
    },
    startTime: {
      type: String,
      required: [true, 'Start time is required (e.g. 17:00)'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required (e.g. 20:30)'],
    },
    maxSerialCapacity: {
      type: Number,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    autoIndex: false, // ভুল ইনডেক্স তৈরি হওয়া বন্ধ করবে
  }
);

export const DoctorSchedule: Model<IDoctorSchedule> = mongoose.model<IDoctorSchedule>(
  'DoctorSchedule',
  doctorScheduleSchema
);