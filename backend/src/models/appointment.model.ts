import mongoose, { Document, Model, Schema } from 'mongoose';

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED' | 'NO_SHOW';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface IAppointment extends Document {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  patientAge: number;
  doctor: mongoose.Types.ObjectId;
  department: mongoose.Types.ObjectId;
  appointmentDate: string;
  appointmentDay: string;
  sessionTime: string;
  serialNumber: number;
  formattedSerial: string;
  consultationFee: number;
  paymentStatus: PaymentStatus;
  paymentMethod: 'CASH_AT_CENTER' | 'BKASH' | 'NAGAD' | 'SSLCOMMERZ';
  status: AppointmentStatus;
  problemDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    appointmentId: {
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
    patientGender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      default: 'MALE',
    },
    patientAge: {
      type: Number,
      required: [true, 'Patient age is required'],
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    appointmentDate: {
      type: String,
      required: true,
      index: true,
    },
    appointmentDay: {
      type: String,
      required: true,
    },
    sessionTime: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: Number,
      default: 0,
    },
    formattedSerial: {
      type: String,
      default: 'PENDING',
    },
    consultationFee: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentMethod: {
      type: String,
      enum: ['CASH_AT_CENTER', 'BKASH', 'NAGAD', 'SSLCOMMERZ'],
      default: 'CASH_AT_CENTER',
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'],
      default: 'PENDING',
      index: true,
    },
    problemDescription: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Appointment: Model<IAppointment> = mongoose.model<IAppointment>('Appointment', appointmentSchema);