import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGalleryItem extends Document {
  title: string;
  category: 'FACILITIES' | 'LABORATORY' | 'DOCTOR_CHAMBERS' | 'EQUIPMENT' | 'EVENTS';
  imageUrl: string;
  description?: string;
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const gallerySchema = new Schema<IGalleryItem>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['FACILITIES', 'LABORATORY', 'DOCTOR_CHAMBERS', 'EQUIPMENT', 'EVENTS'],
      default: 'FACILITIES',
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    description: {
      type: String,
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const GalleryItem: Model<IGalleryItem> = mongoose.model<IGalleryItem>('GalleryItem', gallerySchema);