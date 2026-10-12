import { Patient, IPatient } from '../models/patient.model';
import { Appointment } from '../models/appointment.model';
import { TestBooking } from '../models/testBooking.model';
import { Report } from '../models/report.model';
import { Prescription } from '../models/prescription.model';
import { AppError } from '../errors/AppError';

export class PatientService {
  public static async getAllPatients(search?: string) {
    const query: any = {};
    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } },
        { patientId: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const patients = await Patient.find(query).sort({ createdAt: -1 });

    // প্রতিটি পেশেন্টের মোট অ্যাপয়েন্টমেন্ট ও টেস্ট সংখ্যা গণনা
    const enrichedPatients = await Promise.all(
      patients.map(async (p) => {
        const appointmentCount = await Appointment.countDocuments({ patientPhone: p.phone });
        const testBookingCount = await TestBooking.countDocuments({ patientPhone: p.phone });
        const reportCount = await Report.countDocuments({ patientPhone: p.phone });

        return {
          ...p.toObject(),
          appointmentCount,
          testBookingCount,
          reportCount,
        };
      })
    );

    return enrichedPatients;
  }

  public static async getPatientDossier(id: string) {
    const patient = await Patient.findById(id);
    if (!patient) throw new AppError('Patient not found', 404);

    const appointments = await Appointment.find({ patientPhone: patient.phone }).sort({ createdAt: -1 });
    const testBookings = await TestBooking.find({ patientPhone: patient.phone }).sort({ createdAt: -1 });
    const reports = await Report.find({ patientPhone: patient.phone }).sort({ createdAt: -1 });
    const prescriptions = await Prescription.find({ patientPhone: patient.phone }).sort({ createdAt: -1 });

    return {
      patient,
      appointments,
      testBookings,
      reports,
      prescriptions,
    };
  }

  public static async deletePatient(id: string) {
    const patient = await Patient.findByIdAndDelete(id);
    if (!patient) throw new AppError('Patient not found', 404);
    return patient;
  }
}