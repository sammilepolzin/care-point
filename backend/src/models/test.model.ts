import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITest extends Document {
  name: string;
  code: string;
  category: string;
  description?: string;
  preparationInstructions: string;
  sampleType: string;
  reportDeliveryTime: string;
  regularPrice: number;
  discountPrice: number;
  homeCollectionAvailable: boolean;
  iconUrl?: string; // টেস্টের আইকন বা ইমেজ URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testSchema = new Schema<ITest>(
  {
    name: {
      type: String,
      required: [true, 'Test name is required'],
      trim: true,
      index: true,
    },
    code: {
      type: String,
      required: [true, 'Test code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    preparationInstructions: {
      type: String,
      default: 'No special preparation needed',
    },
    sampleType: {
      type: String,
      default: 'Blood (Serum)',
    },
    reportDeliveryTime: {
      type: String,
      default: 'Same Day (6 Hours)',
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    homeCollectionAvailable: {
      type: Boolean,
      default: true,
    },
    iconUrl: {
      type: String,
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

export const Test: Model<ITest> = mongoose.model<ITest>('Test', testSchema);