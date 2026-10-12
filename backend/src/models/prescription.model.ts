import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IMedicineItem {
  medicineName: string; // e.g. Tab. Napa Extra 500mg
  dosage: string;       // e.g. 1+0+1
  timing: string;       // Before meal / After meal
  duration: string;     // e.g. 7 Days / Continue
  instructions?: string;// e.g. With warm water
}

export interface IPrescription extends Document {
  prescriptionId: string; // e.g. RX-20260901-0012
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  doctor: mongoose.Types.ObjectId;
  department?: mongoose.Types.ObjectId;
  appointmentId?: string;
  // Patient Vitals
  vitals?: {
    bp?: string;     // 120/80 mmHg
    pulse?: string;  // 76 bpm
    weight?: string; // 68 kg
    temp?: string;   // 98.4 F
  };
  chiefComplaints: string[]; // ['Severe chest pain x 3 days', 'Fever']
  diagnosis: string;         // 'Essential Hypertension & GERD'
  medicines: IMedicineItem[];
  investigations: string[];  // ['CBC with ESR', 'Lipid Profile', 'ECG 12-Lead']
  advice: string[];          // ['Avoid oily foods', '30 mins walking daily']
  followUpDate?: string;     // 'After 14 Days (15 Oct 2026)'
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientPhone: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    patientAge: {
      type: Number,
      required: true,
    },
    patientGender: {
      type: String,
      default: 'MALE',
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    appointmentId: {
      type: String,
      index: true,
    },
    vitals: {
      bp: { type: String, default: '120/80 mmHg' },
      pulse: { type: String, default: '76 bpm' },
      weight: { type: String, default: '65 kg' },
      temp: { type: String, default: '98.4 F' },
    },
    chiefComplaints: {
      type: [String],
      default: [],
    },
    diagnosis: {
      type: String,
      required: true,
    },
    medicines: [
      {
        medicineName: { type: String, required: true },
        dosage: { type: String, required: true },
        timing: { type: String, default: 'After meal' },
        duration: { type: String, default: '7 Days' },
        instructions: { type: String, default: '' },
      },
    ],
    investigations: {
      type: [String],
      default: [],
    },
    advice: {
      type: [String],
      default: [],
    },
    followUpDate: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const Prescription: Model<IPrescription> = mongoose.model<IPrescription>('Prescription', prescriptionSchema);