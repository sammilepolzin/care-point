import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles,
  Printer,
  ShieldCheck,
  User,
  Phone,
  FileText
} from 'lucide-react';
import api from '@/lib/axios';

interface Doctor {
  _id: string;
  name: string;
  department: { _id: string; name: string };
  qualification: string;
  specialization: string;
  consultationFee: number;
  chamberRoom: string;
  photoUrl: string;
}

interface SessionSlot {
  scheduleId: string;
  startTime: string;
  endTime: string;
  sessionTime: string;
  hasCapacityLimit: boolean;
  maxCapacity: number | null;
  bookedCount: number;
  status: 'AVAILABLE' | 'SERIAL_FULL';
}

interface AvailabilityData {
  doctor: Doctor;
  date: string;
  dayOfWeek: string;
  isAvailable: boolean;
  status: string;
  message: string;
  sessions: SessionSlot[];
}

export const DoctorBookingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedSessionTime, setSelectedSessionTime] = useState<string>('');
  
  // Patient Form
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientGender, setPatientGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [patientAge, setPatientAge] = useState<number>(28);
  const [problemDescription, setProblemDescription] = useState('');

  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // 1. Fetch Doctor
  const { data: doctorData } = useQuery<{ doctor: Doctor }>({
    queryKey: ['doctor-details', id],
    queryFn: async () => {
      const res = await api.get(`/doctors/${id}`);
      return res.data.data;
    },
    enabled: !!id,
  });

  // 2. Fetch Availability
  const { data: availability, isLoading: isCheckingSlots } = useQuery<AvailabilityData>({
    queryKey: ['doctor-availability', id, selectedDate],
    queryFn: async () => {
      const res = await api.get(`/doctor-availability/${id}?date=${selectedDate}`);
      return res.data.data;
    },
    enabled: !!id && !!selectedDate,
  });

  // 3. Mutation
  const bookMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/appointments/book', payload);
    },
    onSuccess: (res) => {
      setConfirmedBooking(res.data.data);
      setBookingError(null);
    },
    onError: (err: any) => {
      setBookingError(err.response?.data?.message || 'Failed to submit appointment request.');
    },
  });

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSessionTime) {
      setBookingError('Please select a chamber time session');
      return;
    }

    bookMutation.mutate({
      doctorId: id,
      appointmentDate: selectedDate,
      startTime: selectedSessionTime,
      patientName,
      patientPhone,
      patientGender,
      patientAge,
      problemDescription,
    });
  };

  const doctor = doctorData?.doctor;

  // CONFIRMATION RECEIPT SCREEN
  if (confirmedBooking) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-100 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-[#00984a] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00984a] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Appointment Request Registered
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Appointment Confirmed!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your appointment request has been successfully registered.
            </p>
          </div>

          <div className="my-6 bg-slate-50 rounded-2xl p-6 border border-slate-200/80 space-y-3.5 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Tracking Appointment ID:</span>
              <strong className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {confirmedBooking.appointmentId}
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Specialist Doctor:</span>
              <strong className="text-slate-900 font-bold text-right">{confirmedBooking.doctor?.name}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Department:</span>
              <span className="text-slate-800 font-semibold">{confirmedBooking.department?.name}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Appointment Date:</span>
              <strong className="text-slate-900">{confirmedBooking.appointmentDate} ({confirmedBooking.appointmentDay})</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Visiting Session:</span>
              <strong className="text-slate-900">{confirmedBooking.sessionTime}</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Chamber Room:</span>
              <strong className="text-slate-900">{confirmedBooking.doctor?.chamberRoom || 'Chamber Counter'}</strong>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Patient Details:</span>
              <strong className="text-slate-900">{confirmedBooking.patientName} ({confirmedBooking.patientAge}y, {confirmedBooking.patientGender})</strong>
            </div>
          </div>

          {/* Offline/SMS Notice Box */}
          <div className="bg-[#f0fdf4] border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 mb-6 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#00984a] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>জরুরি নোটিশ:</strong> অফলাইন ও অনলাইন সমন্বয়ের পর আপনার চূড়ান্ত সিরিয়াল নম্বর মোবাইল নম্বরে এসএমএসের মাধ্যমে কনফার্ম করা হবে। চেম্বার শুরুর অন্তত ১৫ মিনিট পূর্বে উপস্থিত থাকার অনুরোধ করা হলো।
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
            >
              <Printer className="w-4 h-4" /> Print Token
            </button>
            <Link
              to="/doctors"
              className="flex-1 bg-brand-gradient hover:opacity-95 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center text-center shadow"
            >
              Done / Return
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back link */}
        <Link to="/doctors" className="inline-flex items-center gap-1 text-xs font-bold text-[#00984a] hover:underline mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Specialist Doctors
        </Link>

        {doctor && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-8 flex flex-col sm:flex-row gap-6 items-start">
            <img
              src={doctor.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
              alt={doctor.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-emerald-300 shadow-md shrink-0"
            />
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-2.5 py-1 rounded-md">
                {doctor.department?.name}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">{doctor.name}</h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">{doctor.qualification}</p>
              <p className="text-xs text-slate-600 mt-1">{doctor.specialization}</p>

              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-700">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#00984a]" /> Chamber: <strong>{doctor.chamberRoom}</strong>
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                  ● Chamber Active
                </span>
              </div>
            </div>
          </div>
        )}

        {/* BOOKING FORM CONTAINER */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-black text-slate-900 mb-6 pb-3 border-b border-slate-100 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-[#00984a]" /> Select Date & Chamber Session
          </h2>

          {bookingError && (
            <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <form onSubmit={handleBookingSubmit} className="space-y-6">
            {/* Step 1: Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                1. Choose Appointment Date (তারিখ নির্বাচন করুন) *
              </label>
              <input
                type="date"
                min={todayStr}
                required
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setSelectedSessionTime('');
                }}
                className="bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] shadow-sm"
              />
            </div>

            {/* Step 2: Session Slot Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                2. Available Chamber Sessions (উপলব্ধ চেম্বার সেশন) *
              </label>

              {isCheckingSlots ? (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl">
                  Checking real-time doctor availability...
                </div>
              ) : availability?.sessions && availability.sessions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availability.sessions.map((slot) => {
                    const isSelected = selectedSessionTime === slot.startTime;
                    const isFull = slot.status === 'SERIAL_FULL';

                    return (
                      <button
                        type="button"
                        key={slot.scheduleId}
                        disabled={isFull}
                        onClick={() => setSelectedSessionTime(slot.startTime)}
                        className={`p-4 rounded-2xl border-2 text-left transition-all ${
                          isFull
                            ? 'bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#f0fdf4] border-[#00984a] shadow-md ring-2 ring-[#00984a]/20'
                            : 'bg-white border-slate-200 hover:border-[#00984a]'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-[#00984a]" /> {slot.sessionTime}
                          </span>
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-md ${
                              isFull ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {isFull ? 'FULL' : 'SLOT OPEN'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  {availability?.message || 'No scheduled chamber sessions available on this date.'}
                </div>
              )}
            </div>

            {/* Step 3: Patient Information */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-[#00984a]" /> 3. Patient Information (রোগীর বিবরণ)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Patient Full Name (রোগীর পুরো নাম) *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Md. Rafiqul Islam"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Mobile Number (মোবাইল নম্বর - এসএমএসের জন্য) *</label>
                  <input
                    type="text"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="e.g. 01700000000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Age (বয়স) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Gender (লিঙ্গ) *</label>
                  <select
                    value={patientGender}
                    onChange={(e: any) => setPatientGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  >
                    <option value="MALE">Male (পুরুষ)</option>
                    <option value="FEMALE">Female (মহিলা)</option>
                    <option value="OTHER">Other (অন্যান্য)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block mb-1">Health Symptoms or Problem (শারীরিক সমস্যা সংক্ষেপে)</label>
                  <textarea
                    rows={2}
                    value={problemDescription}
                    onChange={(e) => setProblemDescription(e.target.value)}
                    placeholder="e.g. Chest discomfort, high pressure, severe headache..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={bookMutation.isPending || !selectedSessionTime}
              className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-3.5 rounded-2xl text-sm transition shadow-lg shadow-emerald-700/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{bookMutation.isPending ? 'Confirming Appointment...' : 'Confirm Doctor Chamber Appointment'}</span>
              <Sparkles className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};