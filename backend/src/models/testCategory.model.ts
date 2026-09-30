import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ITestCategory extends Document {
  name: string;
  bnName?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const testCategorySchema = new Schema<ITestCategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
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

export const TestCategory: Model<ITestCategory> = mongoose.model<ITestCategory>('TestCategory', testCategorySchema);