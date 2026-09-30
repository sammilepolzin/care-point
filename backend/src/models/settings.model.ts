import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISlideItem {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  linkUrl?: string;
  order?: number;
}

export interface ITechnologyItem {
  id?: string;
  name: string;
  model?: string;
  manufacturer?: string;
  description: string;
  imageUrl?: string;
}

export interface IManagementMember {
  id?: string;
  name: string;
  designation?: string;
  degrees?: string;
  bio?: string;
  photoUrl?: string;
}

export interface ISocialLinkItem {
  id: string;
  platform: string;
  url: string;
  iconUrl?: string;
}

export interface ISettings extends Document {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  footerLogoUrl?: string; // আলাদা ফুটার লোগো
  faviconUrl?: string;

  topbarHotlineText: string;
  topbarStatusText: string;
  topbarCertText: string;

  hotline: string;
  supportPhone: string;
  emergencyPhone: string;
  email: string;
  address: string;
  googleMapUrl: string;

  whatsappNumber: string;
  whatsappDefaultMessage: string;

  customSocialLinks: ISocialLinkItem[];
  heroSlides: ISlideItem[];

  mission: {
    title: string;
    description: string;
    points: string[];
  };
  vision: {
    title: string;
    description: string;
    points: string[];
  };

  chairmanMessage: {
    name: string;
    designation: string;
    degrees: string;
    statement: string;
    photoUrl?: string;
  };
  managingDirectorMessage: {
    name: string;
    designation: string;
    degrees: string;
    statement: string;
    photoUrl?: string;
  };

  technologies: ITechnologyItem[];
  managementTeam: IManagementMember[];

  showDoctorFees: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    siteName: { type: String, default: 'Care Point' },
    tagline: { type: String, default: 'Diagnostic & Consultation Centre' },
    logoUrl: { type: String, default: '' },
    footerLogoUrl: { type: String, default: '' }, // ফুটার লোগো স্কিমা
    faviconUrl: { type: String, default: '' },

    topbarHotlineText: { type: String, default: '09666 787801' },
    topbarStatusText: { type: String, default: 'Online Services: Active 24/7' },
    topbarCertText: { type: String, default: 'ISO 9001:2015 Certified' },

    hotline: { type: String, default: '09666 787801' },
    supportPhone: { type: String, default: '+880 1700-000000' },
    emergencyPhone: { type: String, default: '10678' },
    email: { type: String, default: 'info@carepoint.com' },
    address: { type: String, default: 'House 42, Road 11, Dhanmondi, Dhaka - 1209, Bangladesh' },
    googleMapUrl: {
      type: String,
      default:
        'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9024424301396!2d90.3775498!3d23.7508581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b33cff13fb%3A0x4a65494d9326e646!2sDhanmondi%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd',
    },

    whatsappNumber: { type: String, default: '8801700000000' },
    whatsappDefaultMessage: {
      type: String,
      default: 'Hello Care Point Diagnostic, I would like to inquire about your doctor appointments and diagnostic test services.',
    },

    customSocialLinks: [
      {
        id: { type: String, required: true },
        platform: { type: String, required: true },
        url: { type: String, required: true },
        iconUrl: { type: String, default: '' },
      },
    ],

    heroSlides: [
      {
        id: { type: String, required: true },
        imageUrl: { type: String, required: true },
        title: { type: String },
        subtitle: { type: String },
        linkUrl: { type: String, default: '/appointment' },
        order: { type: Number, default: 0 },
      },
    ],

    mission: {
      title: { type: String, default: 'Precision Diagnostic Healthcare for All' },
      description: {
        type: String,
        default: 'To provide accurate, fast, and affordable diagnostic investigations.',
      },
      points: { type: [String], default: [] },
    },

    vision: {
      title: { type: String, default: 'The Benchmark of Diagnostic Trust' },
      description: {
        type: String,
        default: 'To be recognized as Bangladesh’s benchmark diagnostic hub.',
      },
      points: { type: [String], default: [] },
    },

    chairmanMessage: {
      name: { type: String, default: 'Prof. Dr. M. A. Rahim' },
      designation: { type: String, default: 'Chairman & Chief Clinical Consultant' },
      degrees: { type: String, default: 'MBBS, FCPS, FRCP (Glasgow)' },
      statement: { type: String, default: 'Precision diagnostics is the bedrock of modern medicine.' },
      photoUrl: { type: String, default: '' },
    },

    managingDirectorMessage: {
      name: { type: String, default: 'Engr. Tariqul Islam' },
      designation: { type: String, default: 'Managing Director & CEO' },
      degrees: { type: String, default: 'B.Sc Engr (BUET), MBA' },
      statement: { type: String, default: 'Healthcare delivery must evolve with digital convenience.' },
      photoUrl: { type: String, default: '' },
    },

    technologies: [
      {
        id: { type: String },
        name: { type: String, required: true },
        model: { type: String },
        manufacturer: { type: String },
        description: { type: String, required: true },
        imageUrl: { type: String },
      },
    ],

    managementTeam: [
      {
        id: { type: String },
        name: { type: String, required: true },
        designation: { type: String },
        degrees: { type: String },
        bio: { type: String },
        photoUrl: { type: String },
      },
    ],

    showDoctorFees: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Settings: Model<ISettings> = mongoose.model<ISettings>('Settings', settingsSchema);