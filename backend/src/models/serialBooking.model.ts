import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISerialBooking extends Document {
  doctor: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  startTime: string;
  totalCapacity: number;
  currentSerialCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const serialBookingSchema = new Schema<ISerialBooking>(
  {
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
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
    totalCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    currentSerialCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

serialBookingSchema.index({ doctor: 1, date: 1, startTime: 1 }, { unique: true });

export const SerialBooking: Model<ISerialBooking> = mongoose.model<ISerialBooking>(
  'SerialBooking',
  serialBookingSchema
);