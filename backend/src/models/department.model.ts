import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  bnName?: string;
  description?: string;
  icon?: string;
  iconUrl?: string; // আপলোড করা আইকন/ইমেজের URL
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      unique: true,
      trim: true,
    },
    bnName: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      default: 'Activity',
    },
    iconUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Department: Model<IDepartment> = mongoose.model<IDepartment>('Department', departmentSchema);