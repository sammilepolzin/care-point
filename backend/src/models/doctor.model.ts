import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDoctor extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  department: mongoose.Types.ObjectId;
  qualification: string;
  specialization: string;
  experienceYears: number;
  consultationFee: number;
  followUpFee: number;
  chamberRoom: string;
  availableDays: string[]; // যেমন: ['Saturday', 'Monday', 'Wednesday']
  phone: string;
  email?: string;
  bio?: string;
  photoUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
      index: true,
    },
    qualification: {
      type: String,
      required: [true, 'Qualifications are required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    experienceYears: {
      type: Number,
      default: 0,
    },
    consultationFee: {
      type: Number,
      required: [true, 'Consultation fee is required'],
      min: 0,
    },
    followUpFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    chamberRoom: {
      type: String,
      required: [true, 'Chamber room is required'],
      trim: true,
    },
    availableDays: {
      type: [String],
      default: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    bio: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Doctor: Model<IDoctor> = mongoose.model<IDoctor>('Doctor', doctorSchema);