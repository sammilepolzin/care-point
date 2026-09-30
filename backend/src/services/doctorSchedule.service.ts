import { DoctorSchedule, IDoctorSchedule } from '../models/doctorSchedule.model';
import { Doctor } from '../models/doctor.model';
import { AppError } from '../errors/AppError';

export class DoctorScheduleService {
  public static async createSchedule(data: Partial<IDoctorSchedule>) {
    const doctor = await Doctor.findById(data.doctor);
    if (!doctor) {
      throw new AppError('Doctor not found.', 404);
    }

    const existing = await DoctorSchedule.findOne({
      doctor: data.doctor,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
    });

    if (existing) {
      throw new AppError('A schedule already exists for this doctor on this day and time.', 409);
    }

    return DoctorSchedule.create(data);
  }

  public static async getSchedulesByDoctor(doctorId: string) {
    return DoctorSchedule.find({ doctor: doctorId, isActive: true }).sort({ dayOfWeek: 1, startTime: 1 });
  }

  public static async getAllSchedules() {
    return DoctorSchedule.find({ isActive: true }).populate('doctor', 'name department photoUrl chamberRoom');
  }

  public static async deleteSchedule(id: string) {
    const schedule = await DoctorSchedule.findByIdAndDelete(id);
    if (!schedule) {
      throw new AppError('Schedule not found.', 404);
    }
    return schedule;
  }
}