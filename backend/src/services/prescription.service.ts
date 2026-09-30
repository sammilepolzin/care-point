import { Prescription, IPrescription } from '../models/prescription.model';
import { Doctor } from '../models/doctor.model';
import { AppError } from '../errors/AppError';

export class PrescriptionService {
  public static async createPrescription(data: Partial<IPrescription>) {
    const doctor = await Doctor.findById(data.doctor);
    if (!doctor) {
      throw new AppError('Doctor reference is invalid.', 404);
    }

    const prescriptionId = `RX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const prescription = await Prescription.create({
      ...data,
      prescriptionId,
      department: doctor.department,
    });

    return prescription.populate(['doctor', 'department']);
  }

  public static async getPrescriptionsByPhone(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    return Prescription.find({ patientPhone: { $regex: cleanPhone } })
      .populate(['doctor', 'department'])
      .sort({ createdAt: -1 });
  }

  public static async getById(id: string) {
    const prescription = await Prescription.findOne({
      $or: [{ _id: id }, { prescriptionId: id }],
    }).populate(['doctor', 'department']);

    if (!prescription) {
      throw new AppError('Prescription not found.', 404);
    }
    return prescription;
  }

  public static async getAll(filter: { doctorId?: string; search?: string }) {
    const query: any = {};
    if (filter.doctorId) query.doctor = filter.doctorId;
    if (filter.search) {
      query.$or = [
        { patientName: { $regex: filter.search, $options: 'i' } },
        { patientPhone: { $regex: filter.search, $options: 'i' } },
        { prescriptionId: { $regex: filter.search, $options: 'i' } },
      ];
    }
    return Prescription.find(query).populate(['doctor', 'department']).sort({ createdAt: -1 });
  }
}