import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, Role } from '../constants/roles';

export interface IUser extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: Role;
  permissions: string[];
  isActive: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.PATIENT,
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    avatarUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 🛡️ ANTI-DOUBLE-HASHING PRE-SAVE HOOK
// পাসওয়ার্ড ইতোমধ্যে হ্যাশ করা থাকলে এটি দ্বিতীয়বার হ্যাশ করবে না!
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // যদি পাসওয়ার্ডটি ইতোমধ্যে একটি বৈধ bcrypt হ্যাশ হয় ($2a$ বা $2b$), তবে হ্যাশ স্কিপ করবে
  if (/^\$2[abxy]\$\d{2}\$/.test(this.password)) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// পাসওয়ার্ড ম্যাচ করার মেথড
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);