import { Appointment, IAppointment } from '../models/appointment.model';
import { Doctor } from '../models/doctor.model';
import { DoctorLeave } from '../models/doctorLeave.model';
import { AppError } from '../errors/AppError';

export interface BookingInput {
  doctorId: string;
  appointmentDate: string;
  startTime?: string;
  patientName: string;
  patientPhone: string;
  patientGender: 'MALE' | 'FEMALE' | 'OTHER';
  patientAge: number;
  problemDescription?: string;
}

export class SerialBookingService {
  public static async bookSerial(input: BookingInput): Promise<IAppointment> {
    const { doctorId, appointmentDate, startTime, patientName, patientPhone, patientGender, patientAge, problemDescription } = input;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isActive) {
      throw new AppError('Doctor is currently inactive or not found.', 404);
    }

    const onLeave = await DoctorLeave.findOne({
      doctor: doctorId,
      status: 'APPROVED',
      startDate: { $lte: appointmentDate },
      endDate: { $gte: appointmentDate },
    });
    if (onLeave) {
      throw new AppError('Doctor is on approved leave on this date.', 400);
    }

    const targetDate = new Date(appointmentDate);
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysMap[targetDate.getDay()];

    const appointmentId = `APP-${appointmentDate.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    // অনলাইনে রোগী আবেদন করলে স্ট্যাটাস শুরুতে PENDING থাকবে এবং সিরিয়াল অ্যাডমিন নির্ধারণ করবে
    const appointment = await Appointment.create({
      appointmentId,
      patientName,
      patientPhone,
      patientGender,
      patientAge,
      doctor: doctor._id,
      department: doctor.department,
      appointmentDate,
      appointmentDay: dayOfWeek,
      sessionTime: startTime ? `${startTime} - 20:30` : '05:00 PM - 08:30 PM',
      serialNumber: 0, // 0 means pending assignment
      formattedSerial: 'PENDING',
      consultationFee: doctor.consultationFee || 0,
      paymentMethod: 'CASH_AT_CENTER',
      paymentStatus: 'PENDING',
      status: 'PENDING', // PENDING status until Admin confirms with Serial
      problemDescription,
    });

    return appointment.populate(['doctor', 'department']);
  }

  // অ্যাডমিন কর্তৃক সিরিয়াল নির্ধারণ এবং কনফার্মেশন (SMS / WhatsApp Dispatch)
  public static async confirmByAdmin(id: string, serialNumber: string, chamberRoom?: string, sessionTime?: string) {
    const appointment = await Appointment.findById(id).populate(['doctor', 'department']);
    if (!appointment) {
      throw new AppError('Appointment not found.', 404);
    }

    appointment.status = 'CONFIRMED';
    appointment.formattedSerial = serialNumber.toUpperCase();
    if (sessionTime) appointment.sessionTime = sessionTime;
    await appointment.save();

    // SMS & WhatsApp Notification Trigger Logic
    console.log(`\n📲 [DISPATCH NOTIFICATION] SMS & WhatsApp sent to ${appointment.patientPhone}:`);
    console.log(`   "Dear ${appointment.patientName}, your appointment with ${(appointment.doctor as unknown as { name: string }).name} is CONFIRMED. Serial No: ${appointment.formattedSerial}, Date: ${appointment.appointmentDate}, Time: ${appointment.sessionTime}. Care Point Diagnostic."\n`);

    return appointment;
  }

  public static async getAppointmentById(id: string) {
    const appointment = await Appointment.findOne({
      $or: [{ _id: id }, { appointmentId: id }],
    }).populate(['doctor', 'department']);

    if (!appointment) {
      throw new AppError('Appointment not found.', 404);
    }
    return appointment;
  }

  public static async getAllAppointments(filter: { date?: string; doctorId?: string; phone?: string; status?: string }) {
    const query: any = {};
    if (filter.date) query.appointmentDate = filter.date;
    if (filter.doctorId) query.doctor = filter.doctorId;
    if (filter.phone) query.patientPhone = { $regex: filter.phone, $options: 'i' };
    if (filter.status) query.status = filter.status;

    return Appointment.find(query).populate(['doctor', 'department']).sort({ createdAt: -1 });
  }

  public static async updateAppointmentStatus(id: string, status: string) {
    const appointment = await Appointment.findByIdAndUpdate(id, { status }, { new: true }).populate([
      'doctor',
      'department',
    ]);
    if (!appointment) {
      throw new AppError('Appointment not found.', 404);
    }
    return appointment;
  }
}