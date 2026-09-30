import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  User, 
  Phone, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  ListFilter,
  UserCheck,
  FileText,
  ShieldCheck,
  CalendarDays,
  KeyRound,
  Check,
  RotateCcw,
  Loader2,
  Building2,
  Clock,
  MapPin
} from 'lucide-react';
import api from '@/lib/axios';
import { formatSessionRange } from '@/lib/utils';

interface Department {
  _id: string;
  name: string;
  bnName?: string;
}

interface Schedule {
  _id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

interface Doctor {
  _id: string;
  name: string;
  department: Department;
  qualification: string;
  specialization: string;
  consultationFee: number;
  chamberRoom: string;
  availableDays?: string[];
  phone: string;
  photoUrl?: string;
  isActive: boolean;
}

interface SystemSettings {
  showDoctorFees: boolean;
}

export const DoctorAppointmentPage: React.FC = () => {
  const { id: paramDoctorId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const queryDeptId = searchParams.get('departmentId') || '';

  const [selectedDeptId, setSelectedDeptId] = useState<string>(queryDeptId);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(paramDoctorId || '');
  const [notes, setNotes] = useState<string>('');

  const [patientType, setPatientType] = useState<'NEW' | 'REGISTERED'>('NEW');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number | string>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  const [loginPhone, setLoginPhone] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('');
  const [receivedDebugOtp, setReceivedDebugOtp] = useState<string | null>(null);
  const [isPatientVerified, setIsPatientVerified] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string | null>(null);

  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const todayISO = new Date().toISOString().split('T')[0];

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments-appointment-page'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
  });

  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['doctors-appointment-page'],
    queryFn: async () => {
      const res = await api.get('/doctors?status=active');
      return res.data.data;
    },
  });

  const { data: doctorSchedules } = useQuery<Schedule[]>({
    queryKey: ['doctor-schedules', selectedDoctorId],
    queryFn: async () => {
      const res = await api.get(`/doctor-schedules/doctor/${selectedDoctorId}`);
      return res.data.data;
    },
    enabled: !!selectedDoctorId,
  });

  useEffect(() => {
    if (paramDoctorId && doctors) {
      const doc = doctors.find((d) => d._id === paramDoctorId);
      if (doc) {
        setSelectedDoctorId(doc._id);
        setSelectedDeptId(doc.department?._id || '');
      }
    }
  }, [paramDoctorId, doctors]);

  const filteredDoctors = React.useMemo(() => {
    if (!doctors) return [];
    if (!selectedDeptId) return doctors;
    return doctors.filter((doc) => doc.department?._id === selectedDeptId);
  }, [doctors, selectedDeptId]);

  const currentDoctor = React.useMemo(() => {
    if (!doctors || !selectedDoctorId) return null;
    return doctors.find((d) => d._id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  const sendOtpMutation = useMutation({
    mutationFn: async (phone: string) => api.post('/auth/patient/send-otp', { phone }),
    onSuccess: (res) => {
      setOtpSent(true);
      setOtpError(null);
      if (res.data.data?.debugOtp) setReceivedDebugOtp(res.data.data.debugOtp);
    },
    onError: (err: any) => setOtpError(err.response?.data?.message || 'Failed to send OTP.'),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phone, otp }: { phone: string; otp: string }) => api.post('/auth/patient/verify-otp', { phone, otp }),
    onSuccess: (res) => {
      const p = res.data.data;
      setPatientName(p.name);
      setPatientPhone(p.phone);
      setPatientAge(p.age);
      setPatientGender(p.gender === 'FEMALE' ? 'Female' : p.gender === 'OTHER' ? 'Other' : 'Male');
      setIsPatientVerified(true);
      setOtpError(null);
    },
    onError: (err: any) => setOtpError(err.response?.data?.message || 'Invalid OTP code.'),
  });

  const appointmentMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/appointments/book', payload),
    onSuccess: (res) => {
      setConfirmedAppointment(res.data.data);
      setFormError(null);
    },
    onError: (err: any) => setFormError(err.response?.data?.message || 'Failed to book appointment.'),
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim() || loginPhone.length < 11) {
      setOtpError('Please enter a valid 11-digit mobile number');
      return;
    }
    sendOtpMutation.mutate(loginPhone);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 4) {
      setOtpError('Please enter the 4-digit code');
      return;
    }
    verifyOtpMutation.mutate({ phone: loginPhone, otp: otpCode });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setFormError('Please select a doctor');
      return;
    }
    if (patientType === 'REGISTERED' && !isPatientVerified) {
      setFormError('Please verify mobile number first.');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim()) {
      setFormError('Please provide patient name and phone number');
      return;
    }

    const firstSchedule = doctorSchedules && doctorSchedules.length > 0 ? doctorSchedules[0] : null;

    appointmentMutation.mutate({
      doctorId: selectedDoctorId,
      appointmentDate: todayISO,
      startTime: firstSchedule ? firstSchedule.startTime : '17:00',
      patientName,
      patientPhone,
      patientGender: patientGender.toUpperCase(),
      patientAge: Number(patientAge) || 28,
      problemDescription: notes,
    });
  };

  const showFee = settings?.showDoctorFees !== false;

  // 🖨️ CONFIRMED APPOINTMENT OFFICIAL SLIP (PERFECT PRINT TEMPLATE)
  if (confirmedAppointment) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] py-8 sm:py-12 px-4">
        {/* Printable Official Slip Wrapper */}
        <div className="print-container max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-100 shadow-2xl">
          
          {/* Header on Paper */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                  C
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Care Point</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Diagnostic & Consultation Centre
              </p>
              <p className="text-[10px] text-slate-500">Hotline: 09666 787801 | House 42, Road 11, Dhanmondi, Dhaka</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Chamber Appointment Slip
              </span>
              <p className="font-mono text-slate-900 font-bold text-xs mt-1">Ref: {confirmedAppointment.appointmentId}</p>
              <p className="text-[10px] text-slate-400">{todayFormatted}</p>
            </div>
          </div>

          {/* Serial Token Box */}
          <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Appointment Status</span>
              <strong className="text-sm font-black text-slate-900">
                {confirmedAppointment.formattedSerial === 'PENDING' ? 'Waiting for Serial Assignment' : `Confirmed Serial: ${confirmedAppointment.formattedSerial}`}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chamber Room</span>
              <strong className="text-sm font-black text-emerald-800">{confirmedAppointment.doctor?.chamberRoom || 'Room 302'}</strong>
            </div>
          </div>

          {/* Details Table */}
          <table className="w-full text-left text-xs mb-5 border-collapse">
            <tbody className="divide-y divide-slate-100">
              <tr className="py-2">
                <td className="py-2 text-slate-500 font-semibold w-1/3">Patient Name:</td>
                <td className="py-2 text-slate-900 font-black">{confirmedAppointment.patientName}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Contact Mobile:</td>
                <td className="py-2 text-slate-900 font-bold">{confirmedAppointment.patientPhone}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Age & Gender:</td>
                <td className="py-2 text-slate-900 font-medium">{confirmedAppointment.patientAge} Years • {confirmedAppointment.patientGender}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Assigned Specialist:</td>
                <td className="py-2 text-slate-900 font-black text-sm">{confirmedAppointment.doctor?.name}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Department:</td>
                <td className="py-2 text-slate-800 font-bold">{confirmedAppointment.department?.name}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Schedule Date & Time:</td>
                <td className="py-2 text-slate-900 font-bold">{confirmedAppointment.appointmentDate} ({confirmedAppointment.sessionTime})</td>
              </tr>
              {showFee && confirmedAppointment.consultationFee > 0 && (
                <tr>
                  <td className="py-2 text-slate-500 font-semibold">Consultation Fee:</td>
                  <td className="py-2 text-slate-900 font-black text-sm">৳{confirmedAppointment.consultationFee}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Official Signatures Line */}
          <div className="pt-10 flex justify-between items-end border-t border-slate-200 text-xs text-slate-400">
            <p className="text-[9px]">Please arrive 15 minutes before chamber time.</p>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span className="text-[9px] font-bold text-slate-600">Reception Counter Seal</span>
            </div>
          </div>

          {/* ACTION BUTTONS (AUTOMATICALLY HIDDEN ON PRINT) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
            >
              <Printer className="w-4 h-4" /> Print Token Slip (টোকেন প্রিন্ট)
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
    <div className="min-h-screen bg-[#f1f5f9] py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto bg-[#fafafa] rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        
        {/* BRAND GRADIENT HEADER BANNER */}
        <div className="bg-brand-gradient py-4 text-center text-white font-black text-xl tracking-wide shadow-md flex items-center justify-center gap-2">
          <CalendarDays className="w-5 h-5 text-amber-300" />
          <span>Doctor Appointment</span>
        </div>

        <div className="p-5 sm:p-10 space-y-6">
          <div className="text-center pb-2">
            <p className="text-sm font-semibold text-slate-700">
              Appointment Date : <strong className="text-slate-900 font-black text-base">{todayFormatted}</strong>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              *** Live Doctor Consultation & Chamber Serial Service.
            </p>
          </div>

          {formError && (
            <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs text-slate-700">
            {/* ROW 1: Speciality & Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Speciality (বিভাগ নির্বাচন)</label>
                <div className="relative flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500">
                    <ListFilter className="w-4 h-4" />
                  </div>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => {
                      setSelectedDeptId(e.target.value);
                      setSelectedDoctorId('');
                    }}
                    className="w-full bg-transparent px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="">Choose Specialist / Department</option>
                    {departments?.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} {dept.bnName ? `(${dept.bnName})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Doctor (ডাক্তার নির্বাচন) *</label>
                <div className="relative flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                  <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <select
                    required
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                    className="w-full bg-transparent px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none"
                  >
                    <option value="">Choose a Doctor</option>
                    {filteredDoctors?.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name} - {doc.specialization}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DOCTOR DETAILS & SCHEDULE PREVIEW BOX */}
            {currentDoctor && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in duration-200">
                <div className="bg-slate-50 p-3 text-center font-bold text-slate-800 border-b border-slate-200 text-xs">
                  Doctor Details
                </div>

                <div className="p-5 text-center space-y-1 text-xs border-b border-slate-100">
                  <p className="font-bold text-slate-900 text-sm">
                    Name : <span className="font-bold text-slate-800">{currentDoctor.name}</span>
                  </p>
                  <p className="text-slate-600">
                    Speciality : <span className="font-semibold text-slate-800">{currentDoctor.specialization} ({currentDoctor.department?.name})</span>
                  </p>
                  <p className="text-slate-500 text-[11px] max-w-2xl mx-auto">
                    Experience / Degrees : <span className="font-medium text-slate-700">{currentDoctor.qualification}</span>
                  </p>

                  {showFee && (
                    <p className="font-bold text-slate-800 pt-1">
                      General Appointment Fee : <span className="text-slate-900 font-black">{currentDoctor.consultationFee} BDT</span>
                    </p>
                  )}
                </div>

                {/* Schedule Table */}
                <div>
                  <div className="bg-slate-50 p-2 text-center font-bold text-slate-700 border-b border-slate-200 text-[11px]">
                    Weekly Chamber Schedule
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-2.5 px-4">Appointment Type</th>
                        <th className="p-2.5 px-4 text-center">Day</th>
                        <th className="p-2.5 px-4 text-right">Schedule time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {doctorSchedules && doctorSchedules.length > 0 ? (
                        doctorSchedules.map((sch) => (
                          <tr key={sch._id} className="hover:bg-slate-50/80">
                            <td className="p-2.5 px-4 font-semibold text-slate-800">Only General</td>
                            <td className="p-2.5 px-4 text-center font-bold text-[#00984a]">{sch.dayOfWeek}</td>
                            <td className="p-2.5 px-4 text-right font-medium">
                              {formatSessionRange(sch.startTime, sch.endTime)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        (currentDoctor.availableDays && currentDoctor.availableDays.length > 0
                          ? currentDoctor.availableDays
                          : ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']
                        ).map((day, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-2.5 px-4 font-semibold text-slate-800">Only General</td>
                            <td className="p-2.5 px-4 text-center font-bold text-[#00984a]">{day}</td>
                            <td className="p-2.5 px-4 text-right font-medium">05:00 PM - 08:30 PM</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Notes (শারীরিক সমস্যা / বিশেষ মন্তব্য)</label>
              <div className="flex items-center bg-white border border-slate-300 rounded-xl overflow-hidden shadow-sm">
                <div className="p-2.5 bg-slate-50 border-r border-slate-200 text-slate-500">
                  <FileText className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes / Symptoms summary..."
                  className="w-full bg-transparent px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Patient Registration Switcher */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPatientType('NEW');
                  setIsPatientVerified(false);
                  setOtpSent(false);
                  setOtpError(null);
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border ${
                  patientType === 'NEW'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <User className="w-3.5 h-3.5" /> New Patient
              </button>

              <button
                type="button"
                onClick={() => {
                  setPatientType('REGISTERED');
                  setOtpError(null);
                }}
                className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border ${
                  patientType === 'REGISTERED'
                    ? 'bg-brand-gradient text-white border-transparent shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" /> Already Registered ?
              </button>
            </div>

            {/* PATIENT INPUTS */}
            {patientType === 'REGISTERED' ? (
              !isPatientVerified ? (
                <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3.5 animate-in fade-in">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <KeyRound className="w-4 h-4 text-[#00984a]" /> Patient Mobile Code Verification
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium">Step {!otpSent ? '1 of 2' : '2 of 2'}</span>
                  </div>

                  {otpError && (
                    <div className="bg-red-50 text-red-700 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>{otpError}</span>
                    </div>
                  )}

                  {!otpSent ? (
                    <div className="space-y-2">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Enter Registered Mobile Number (মোবাইল নম্বর প্রদান করুন) *
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            value={loginPhone}
                            onChange={(e) => setLoginPhone(e.target.value)}
                            placeholder="01XXXXXXXXX"
                            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={sendOtpMutation.isPending}
                          className="bg-[#00984a] hover:bg-[#006642] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {sendOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          <span>{sendOtpMutation.isPending ? 'Sending...' : 'Send OTP'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 animate-in fade-in">
                      <div className="flex justify-between items-center">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Enter 4-Digit Code sent to <strong className="text-slate-900">{loginPhone}</strong> *
                        </label>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="text-[11px] text-[#00984a] font-bold hover:underline flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Change Number
                        </button>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            maxLength={6}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value)}
                            placeholder="e.g. 4821"
                            className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-black text-center tracking-widest text-slate-900 text-base focus:outline-none focus:border-[#00984a]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyOtpMutation.isPending}
                          className="bg-[#00984a] hover:bg-[#006642] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          {verifyOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                          <span>Verify & Load Profile</span>
                        </button>
                      </div>

                      {receivedDebugOtp && (
                        <p className="text-[11px] text-emerald-800 font-bold bg-emerald-100/80 p-2 rounded-lg mt-2 text-center">
                          💡 Test OTP Code: <span className="font-black text-slate-900 text-sm">{receivedDebugOtp}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white p-5 rounded-2xl border-2 border-emerald-300 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#00984a] flex items-center justify-center font-bold shrink-0">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        ✓ Verified Patient Profile
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">{patientName}</h4>
                      <p className="text-xs text-slate-500">
                        Mobile: <strong className="text-slate-800">{patientPhone}</strong> • Age: <strong className="text-slate-800">{patientAge}y</strong> • Gender: <strong className="text-slate-800">{patientGender}</strong>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setIsPatientVerified(false);
                      setOtpSent(false);
                      setOtpCode('');
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
                  >
                    Change Account
                  </button>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1 animate-in fade-in">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Patient name"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone No. *</label>
                  <input
                    type="text"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={patientGender}
                    onChange={(e: any) => setPatientGender(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] shadow-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            <div className="pt-2">
              <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="w-4 h-4 rounded text-[#00984a] focus:ring-[#00984a]"
                />
                <span>
                  I agree to the <a href="#" className="text-[#00984a] underline">Terms and Conditions</a>
                </span>
              </label>
            </div>

            <div className="pt-4 text-center">
              <button
                type="submit"
                disabled={appointmentMutation.isPending}
                className="w-full sm:w-80 mx-auto bg-brand-gradient hover:opacity-95 text-white font-black py-3.5 rounded-2xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99]"
              >
                <Send className="w-4 h-4" />
                <span>{appointmentMutation.isPending ? 'Submitting Request...' : 'Confirm Appointment'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};