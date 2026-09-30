import { Doctor } from '../models/doctor.model';
import { DoctorSchedule } from '../models/doctorSchedule.model';
import { DoctorLeave } from '../models/doctorLeave.model';
import { SerialBooking } from '../models/serialBooking.model';
import { AppError } from '../errors/AppError';

// 24H -> 12H helper in backend
function to12Hour(timeStr: string): string {
  if (!timeStr || timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
  const [h, m] = timeStr.split(':');
  let hours = parseInt(h, 10);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hh = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hh}:${m || '00'} ${ampm}`;
}

export class DoctorAvailabilityService {
  public static async getDailyAvailability(doctorId: string, dateStr: string) {
    const doctor = await Doctor.findById(doctorId).populate('department');
    if (!doctor || !doctor.isActive) {
      throw new AppError('Doctor not available or currently inactive.', 404);
    }

    const targetDate = new Date(dateStr);
    const daysMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysMap[targetDate.getDay()];

    const onLeave = await DoctorLeave.findOne({
      doctor: doctorId,
      status: 'APPROVED',
      startDate: { $lte: dateStr },
      endDate: { $gte: dateStr },
    });

    if (onLeave) {
      return {
        doctor,
        date: dateStr,
        dayOfWeek,
        isAvailable: false,
        status: 'ON_LEAVE',
        message: 'The specialist doctor is on approved leave on this date.',
        sessions: [],
      };
    }

    // ডাক্তারের আসল শিডিউল খোঁজা
    let schedules = await DoctorSchedule.find({
      doctor: doctorId,
      dayOfWeek,
      isActive: true,
    });

    const isDayAvailable = !doctor.availableDays || doctor.availableDays.length === 0 || doctor.availableDays.includes(dayOfWeek);

    if (schedules.length === 0 && isDayAvailable) {
      schedules = [
        {
          _id: 'default-slot',
          doctor: doctor._id,
          dayOfWeek,
          startTime: '17:00',
          endTime: '20:30',
          maxSerialCapacity: null,
          isActive: true,
        } as any,
      ];
    } else if (schedules.length === 0 && !isDayAvailable) {
      return {
        doctor,
        date: dateStr,
        dayOfWeek,
        isAvailable: false,
        status: 'NOT_AVAILABLE',
        message: `Doctor does not sit on ${dayOfWeek}. Please choose another available day.`,
        sessions: [],
      };
    }

    const sessions = await Promise.all(
      schedules.map(async (sch) => {
        let tracker = await SerialBooking.findOne({
          doctor: doctorId,
          date: dateStr,
          startTime: sch.startTime,
        });

        const bookedCount = tracker ? tracker.currentSerialCount : 0;
        const hasLimit = typeof sch.maxSerialCapacity === 'number' && sch.maxSerialCapacity > 0;
        const capacity = hasLimit ? (sch.maxSerialCapacity as number) : null;
        const isFull = hasLimit && capacity !== null ? bookedCount >= capacity : false;

        const formattedStart = to12Hour(sch.startTime);
        const formattedEnd = to12Hour(sch.endTime);

        return {
          scheduleId: sch._id,
          startTime: sch.startTime,
          endTime: sch.endTime,
          sessionTime: `${formattedStart} - ${formattedEnd}`,
          hasCapacityLimit: hasLimit,
          maxCapacity: capacity,
          bookedCount,
          status: isFull ? 'SERIAL_FULL' : 'AVAILABLE',
        };
      })
    );

    const hasAnyAvailableSession = sessions.some((s) => s.status === 'AVAILABLE');

    return {
      doctor,
      date: dateStr,
      dayOfWeek,
      isAvailable: hasAnyAvailableSession,
      status: hasAnyAvailableSession ? 'AVAILABLE' : 'SERIAL_FULL',
      message: hasAnyAvailableSession ? 'Chamber slots available for booking.' : 'All serials are fully booked for today.',
      sessions,
    };
  }
}