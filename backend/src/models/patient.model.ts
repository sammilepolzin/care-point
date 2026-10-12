import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPatient extends Document {
  userId?: mongoose.Types.ObjectId;
  patientId: string;
  name: string;
  phone: string;
  email?: string;
  photoUrl?: string; // রোগীর প্রোফাইল ছবি
  dateOfBirth?: Date;
  age?: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  bloodGroup?: string;
  address?: string;
  emergencyContact?: string;
  medicalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Patient name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      index: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER'],
      default: 'MALE',
    },
    bloodGroup: {
      type: String,
    },
    address: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      type: String,
      trim: true,
    },
    medicalNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Patient: Model<IPatient> = mongoose.model<IPatient>('Patient', patientSchema);