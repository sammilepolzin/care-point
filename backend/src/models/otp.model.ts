import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOtp extends Document {
  phone: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    phone: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300, // ৫ মিনিট পর স্বয়ংক্রিয়ভাবে ডাটাবেজ থেকে মুছে যাবে (TTL Index)
    },
  },
  {
    versionKey: false,
  }
);

export const Otp: Model<IOtp> = mongoose.model<IOtp>('Otp', otpSchema);