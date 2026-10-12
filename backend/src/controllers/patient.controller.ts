import { Request, Response } from 'express';
import { User } from '../models/user.model';
import { Appointment } from '../models/appointment.model';
import { TestBooking } from '../models/testBooking.model';
import { asyncHandler } from '../utils/asyncHandler';
import { sendResponse } from '../utils/apiResponse';
import { AppError } from '../errors/AppError';

// ১. সকল নিবন্ধিত রোগীর তালিকা আনা (সার্চ ও ফিল্টার সহ)
export const getAllPatients = asyncHandler(async (req: Request, res: Response) => {
  const { search, status } = req.query;

  const query: any = { role: 'PATIENT' };

  if (status === 'ACTIVE') query.isActive = true;
  if (status === 'BLOCKED') query.isActive = false;

  if (search) {
    query.$or = [
      { name: { $regex: search as string, $options: 'i' } },
      { phone: { $regex: search as string, $options: 'i' } },
      { email: { $regex: search as string, $options: 'i' } },
    ];
  }

  const patients = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .lean();

  sendResponse({
    res,
    statusCode: 200,
    message: 'Patients retrieved successfully',
    data: patients,
  });
});

// ২. রোগীর অ্যাকাউন্ট স্ট্যাটাস পরিবর্তন (Block / Unblock Toggle)
export const togglePatientStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user || user.role !== 'PATIENT') {
    throw new AppError('Patient account not found', 404);
  }

  user.isActive = !user.isActive;
  await user.save();

  sendResponse({
    res,
    statusCode: 200,
    message: `Patient account has been ${user.isActive ? 'activated' : 'blocked'} successfully`,
    data: { id: user._id, isActive: user.isActive },
  });
});

// ৩. নির্দিষ্ট রোগীর সম্পূর্ণ অ্যাপয়েন্টমেন্ট ও টেস্ট হিস্ট্রি দেখা
export const getPatientMedicalHistory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const patient = await User.findById(id).select('-password').lean();
  if (!patient || patient.role !== 'PATIENT') {
    throw new AppError('Patient not found', 404);
  }

  // রোগীর সমস্ত ডক্টর সিরিয়াল অ্যাপয়েন্টমেন্ট
  const appointments = await Appointment.find({
    $or: [{ patient: id }, { patientPhone: patient.phone }],
  })
    .populate('doctor', 'name specialization chamberRoom')
    .sort({ appointmentDate: -1 })
    .lean();

  // রোগীর সমস্ত ডায়াগনস্টিক টেস্ট বুকিং
  const testBookings = await TestBooking.find({
    $or: [{ patient: id }, { phone: patient.phone }],
  })
    .sort({ createdAt: -1 })
    .lean();

  sendResponse({
    res,
    statusCode: 200,
    message: 'Patient history retrieved successfully',
    data: {
      patient,
      appointments,
      testBookings,
    },
  });
});

export const PatientController = {
  getAllPatients,
  togglePatientStatus,
  getPatientMedicalHistory,
};

export default PatientController;