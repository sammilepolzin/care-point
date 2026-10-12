import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDoctor extends Document {
  name: string;
  department: mongoose.Types.ObjectId;
  qualification: string;
  specialization: string;
  workplace?: string; // বর্তমান কর্মস্থল / হাসপাতাল
  consultationFee: number;
  chamberRoom: string;
  availableDays: string[];
  phone: string;
  photoUrl?: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: [true, 'Doctor name is required'],
      trim: true,
      index: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    qualification: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: '',
    },
    workplace: {
      type: String,
      default: '', // e.g. ঢাকা মেডিকেল কলেজ ও হাসপাতাল
    },
    consultationFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    chamberRoom: {
      type: String,
      default: 'Room 302',
    },
    availableDays: {
      type: [String],
      default: [],
    },
    phone: {
      type: String,
      default: '',
    },
    photoUrl: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
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