import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPackage extends Document {
  name: string;
  code: string;
  tagline?: string;
  description?: string;
  genderTarget: 'ALL' | 'MALE' | 'FEMALE';
  ageGroup?: string;
  includedFeatures: string[]; // e.g. ['28 Clinical Parameters', 'Doctor Consultation Free', 'ECG Included']
  includedTests: mongoose.Types.ObjectId[]; // References to Test collection
  regularPrice: number;
  packagePrice: number;
  discountPercentage: number;
  bannerUrl?: string;
  isPopular: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const packageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Package code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Comprehensive Health Screening',
    },
    description: {
      type: String,
      trim: true,
    },
    genderTarget: {
      type: String,
      enum: ['ALL', 'MALE', 'FEMALE'],
      default: 'ALL',
    },
    ageGroup: {
      type: String,
      default: 'All Ages',
    },
    includedFeatures: {
      type: [String],
      default: [],
    },
    includedTests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Test',
      },
    ],
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    packagePrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?q=80&w=800&auto=format&fit=crop',
    },
    isPopular: {
      type: Boolean,
      default: false,
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

export const Package: Model<IPackage> = mongoose.model<IPackage>('Package', packageSchema);