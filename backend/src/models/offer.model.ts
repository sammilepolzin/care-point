import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOffer extends Document {
  title: string;
  subtitle?: string;
  couponCode: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  bannerUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    title: {
      type: String,
      required: [true, 'Offer title is required'],
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    couponCode: {
      type: String,
      required: [true, 'Coupon code is required'],
      uppercase: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ['PERCENTAGE', 'FIXED'],
      default: 'PERCENTAGE',
    },
    discountValue: {
      type: Number,
      required: true,
      min: 1,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=800&auto=format&fit=crop',
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

export const Offer: Model<IOffer> = mongoose.model<IOffer>('Offer', offerSchema);