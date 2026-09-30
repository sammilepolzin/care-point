import { Doctor, IDoctor } from '../models/doctor.model';
import { DoctorSchedule } from '../models/doctorSchedule.model';
import { AppError } from '../errors/AppError';

export class DoctorService {
  public static async createDoctor(data: Partial<IDoctor>, schedules?: any[]) {
    const doctor = await Doctor.create(data);

    if (schedules && schedules.length > 0) {
      const scheduleEntries = schedules.map((s) => ({
        ...s,
        doctor: doctor._id,
      }));
      await DoctorSchedule.insertMany(scheduleEntries);
    }

    return Doctor.findById(doctor._id).populate('department');
  }

  public static async getAllDoctors(filterOptions: { departmentId?: string; search?: string; status?: string }) {
    const query: any = {};

    if (filterOptions.status === 'active') {
      query.isActive = true;
    } else if (filterOptions.status === 'inactive') {
      query.isActive = false;
    }

    if (filterOptions.departmentId) {
      query.department = filterOptions.departmentId;
    }

    if (filterOptions.search) {
      query.$or = [
        { name: { $regex: filterOptions.search, $options: 'i' } },
        { specialization: { $regex: filterOptions.search, $options: 'i' } },
        { phone: { $regex: filterOptions.search, $options: 'i' } },
      ];
    }

    return Doctor.find(query).populate('department').sort({ createdAt: -1 });
  }

  public static async getDoctorById(id: string) {
    const doctor = await Doctor.findById(id).populate('department');
    if (!doctor) {
      throw new AppError('Doctor not found.', 404);
    }
    const schedules = await DoctorSchedule.find({ doctor: doctor._id, isActive: true });
    return { doctor, schedules };
  }

  public static async updateDoctor(id: string, data: Partial<IDoctor>) {
    const doctor = await Doctor.findByIdAndUpdate(id, data, { new: true, runValidators: true }).populate(
      'department'
    );
    if (!doctor) {
      throw new AppError('Doctor not found.', 404);
    }
    return doctor;
  }

  public static async toggleDoctorStatus(id: string) {
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      throw new AppError('Doctor not found.', 404);
    }
    doctor.isActive = !doctor.isActive;
    await doctor.save();
    return doctor;
  }

  public static async deleteDoctor(id: string) {
    const doctor = await Doctor.findByIdAndDelete(id);
    if (!doctor) {
      throw new AppError('Doctor not found.', 404);
    }
    await DoctorSchedule.deleteMany({ doctor: id });
    return doctor;
  }
}