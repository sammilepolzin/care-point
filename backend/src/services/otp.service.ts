import { Otp } from '../models/otp.model';
import { Patient } from '../models/patient.model';
import { Appointment } from '../models/appointment.model';
import { AppError } from '../errors/AppError';

export class OtpService {
  // ১. ওটিপি তৈরি ও সেন্ড করা
  public static async sendPatientOtp(phone: string) {
    if (!phone || phone.length < 11) {
      throw new AppError('Please provide a valid 11-digit mobile number.', 400);
    }

    // ৪ ডিজিটের র‍্যান্ডম ওটিপি তৈরি (যেমন: 4821)
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    // আগের ওটিপি থাকলে মুছে নতুন ওটিপি সংরক্ষণ
    await Otp.deleteMany({ phone });
    await Otp.create({ phone, otp: otpCode });

    console.log(`\n==============================================`);
    console.log(`📲 [SMS GATEWAY OTP DISPATCH]`);
    console.log(`   To Mobile : ${phone}`);
    console.log(`   OTP Code  : ${otpCode}`);
    console.log(`   Message   : "Your Care Point verification code is ${otpCode}. Valid for 5 minutes."`);
    console.log(`==============================================\n`);

    return {
      phone,
      message: 'Verification code sent to mobile number successfully.',
      debugOtp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
    };
  }

  // ২. ওটিপি যাচাই এবং ডাটাবেজ থেকে পেশেন্ট প্রোফাইল রিটার্ন করা
  public static async verifyPatientOtp(phone: string, otpCode: string) {
    const record = await Otp.findOne({ phone, otp: otpCode });
    if (!record) {
      throw new AppError('Invalid or expired verification code. Please request a new code.', 400);
    }

    // ওটিপি সঠিক হলে এটি ডিলিট করা
    await Otp.deleteMany({ phone });

    // ডাটাবেজে আগে থেকে এই রোগীর রেকর্ড আছে কিনা খোঁজা (Patient অথবা পূর্বের Appointment)
    let patient = await Patient.findOne({ phone });
    let previousAppt = null;

    if (!patient) {
      previousAppt = await Appointment.findOne({ patientPhone: phone }).sort({ createdAt: -1 });
    }

    const patientData = {
      phone,
      isExisting: !!(patient || previousAppt),
      name: patient?.name || previousAppt?.patientName || 'Valued Patient',
      age: patient?.age || previousAppt?.patientAge || 30,
      gender: patient?.gender || previousAppt?.patientGender || 'MALE',
    };

    return patientData;
  }
}