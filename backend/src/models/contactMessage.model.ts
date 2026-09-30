import mongoose, { Document, Model, Schema } from 'mongoose';

export type MessageType = 'GENERAL_INQUIRY' | 'COMPLAINT' | 'ADVICE' | 'APPOINTMENT_HELP';
export type MessageStatus = 'UNREAD' | 'IN_REVIEW' | 'APPROVED' | 'RESOLVED' | 'REJECTED';

export interface IContactMessage extends Document {
  name: string;
  phone: string;
  email?: string;
  subject: string;
  messageType: MessageType;
  message: string;
  status: MessageStatus;
  adminNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactMessageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    subject: { type: String, required: true, trim: true },
    messageType: {
      type: String,
      enum: ['GENERAL_INQUIRY', 'COMPLAINT', 'ADVICE', 'APPOINTMENT_HELP'],
      default: 'GENERAL_INQUIRY',
    },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['UNREAD', 'IN_REVIEW', 'APPROVED', 'RESOLVED', 'REJECTED'],
      default: 'UNREAD',
      index: true,
    },
    adminNotes: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ContactMessage: Model<IContactMessage> = mongoose.model<IContactMessage>('ContactMessage', contactMessageSchema);