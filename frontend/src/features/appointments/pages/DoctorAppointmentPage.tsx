import React, { useState, useEffect, useMemo } from 'react';
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
  Lock,
  CalendarDays,
  Check,
  Loader2,
  Stethoscope,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/features/auth/context/AuthContext';
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
  siteName?: string;
  tagline?: string;
  logoUrl?: string;
  topbarHotlineText?: string;
  hotline?: string;
  address?: string;
  showDoctorFees: boolean;
}

// 🇧🇩 STRICT BANGLADESHI 11-DIGIT MOBILE NUMBER REGEX
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const DoctorAppointmentPage: React.FC = () => {
  const { id: paramDoctorId } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const queryDeptId = searchParams.get('departmentId') || '';

  const { user: authUser, isAuthenticated } = useAuth();

  const [selectedDeptId, setSelectedDeptId] = useState<string>(queryDeptId);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(paramDoctorId || '');
  const [notes, setNotes] = useState<string>('');

  const [patientType, setPatientType] = useState<'NEW' | 'REGISTERED'>('NEW');
  
  // Patient Form States
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [newPatientPassword, setNewPatientPassword] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number | string>('');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');

  // Registered Patient Sign In States
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isPatientVerified, setIsPatientVerified] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(true);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isRegisteringAndBooking, setIsRegisteringAndBooking] = useState(false);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const todayISO = new Date().toISOString().split('T')[0];

  // Auto-Prefill when logged in
  useEffect(() => {
    if (isAuthenticated && authUser) {
      setPatientName(authUser.name || '');
      // Only keep digits if phone exists
      setPatientPhone(authUser.phone ? authUser.phone.replace(/\D/g, '').slice(0, 11) : '');
      setIsPatientVerified(true);
    }
  }, [isAuthenticated, authUser]);

  // 1. Fetch Dynamic Settings
  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  // 2. Fetch Departments
  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments-appointment-page'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
  });

  // 3. Fetch Doctors
  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['doctors-appointment-page'],
    queryFn: async () => {
      const res = await api.get('/doctors?status=active');
      return res.data.data;
    },
  });

  // 4. Fetch Doctor Schedules
  const { data: doctorSchedules } = useQuery<Schedule[]>({
    queryKey: ['doctor-schedules', selectedDoctorId],
    queryFn: async () => {
      const res = await api.get(`/doctor-schedules/doctor/${selectedDoctorId}`);
      return res.data.data;
    },
    enabled: Boolean(selectedDoctorId),
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

  const filteredDoctors = useMemo(() => {
    if (!doctors) return [];
    if (!selectedDeptId) return doctors;
    return doctors.filter((doc) => doc.department?._id === selectedDeptId);
  }, [doctors, selectedDeptId]);

  const currentDoctor = useMemo(() => {
    if (!doctors || !selectedDoctorId) return null;
    return doctors.find((d) => d._id === selectedDoctorId) || null;
  }, [doctors, selectedDoctorId]);

  // REGISTERED PATIENT LOGIN
  const patientLoginMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/auth/login', payload),
    onSuccess: (res) => {
      const responseData = res.data?.data;
      const u = responseData?.user;
      const accessToken = responseData?.accessToken;
      const refreshToken = responseData?.refreshToken;

      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      if (u) {
        setPatientName(u.name || '');
        setPatientPhone(u.phone ? u.phone.replace(/\D/g, '').slice(0, 11) : '');
        setPatientAge(u.age || 28);
        setPatientGender(u.gender === 'FEMALE' ? 'Female' : u.gender === 'OTHER' ? 'Other' : 'Male');
        setIsPatientVerified(true);
        setLoginError(null);
      }
    },
    onError: (err: any) => {
      setLoginError(err.response?.data?.message || 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড। অনুগ্রহ করে আবার চেষ্টা করুন।');
    },
  });

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanInput) {
      setLoginError('মোবাইল নম্বর বা ইমেইল প্রদান করুন।');
      return;
    }

    // 🔒 পাসওয়ার্ড ন্যূনতম ৬ ক্যারেক্টার চেক
    if (!cleanPass || cleanPass.length < 6) {
      setLoginError('পাসওয়ার্ড ন্যূনতম ৬ ডিজিট বা অক্ষরের হতে হবে।');
      return;
    }

    patientLoginMutation.mutate({
      email: cleanInput,
      identifier: cleanInput,
      phone: cleanInput,
      password: cleanPass,
    });
  };

  // APPOINTMENT BOOKING MUTATION
  const appointmentMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        return await api.post('/appointments', payload);
      } catch (err: any) {
        if (err.response?.status === 404) {
          return await api.post('/appointments/book', payload);
        }
        throw err;
      }
    },
    onSuccess: (res) => {
      setConfirmedAppointment(res.data.data);
      setFormError(null);
      setIsRegisteringAndBooking(false);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.join(', ') ||
        'Validation Error: Please check all required fields.';
      setFormError(msg);
      setIsRegisteringAndBooking(false);
    },
  });

  // 🌟 FORM SUBMISSION WITH STRICT VALIDATIONS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedDoctorId) {
      setFormError('অনুগ্রহ করে একজন বিশেষজ্ঞ ডাক্তার নির্বাচন করুন।');
      return;
    }

    if (!isAuthenticated && patientType === 'REGISTERED' && !isPatientVerified) {
      setFormError('অনুগ্রহ করে প্রথমে সাইন ইন করে আপনার অ্যাকাউন্ট ভেরিফাই করুন।');
      return;
    }

    if (!patientName.trim()) {
      setFormError('রোগীর নাম আবশ্যক।');
      return;
    }

    // 🛑 ১. কঠোর মোবাইল নম্বর ভ্যালিডেশন: শুধুমাত্র সংখ্যা এবং ঠিক ১১ ডিজিট
    const cleanPhone = patientPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 11 || !BD_PHONE_REGEX.test(cleanPhone)) {
      setFormError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX বা 018XXXXXXXX)। কোনো অক্ষর গ্রহণযোগ্য নয়।');
      return;
    }

    // 🛑 ২. কঠোর পাসওয়ার্ড ভ্যালিডেশন: সংখ্যা বা অক্ষর যাই হোক, কমপক্ষে ৬টি হতে হবে
    if (!isAuthenticated && patientType === 'NEW') {
      if (!newPatientPassword || newPatientPassword.length < 6) {
        setFormError('পাসওয়ার্ড ন্যূনতম ৬ ডিজিট বা অক্ষরের হতে হবে (কমপক্ষে ৬টি ক্যারেক্টার)।');
        return;
      }
    }

    setIsRegisteringAndBooking(true);

    // 🚀 নতুন রোগী হলে অটোমেটিক অ্যাকাউন্ট রেজিস্ট্রেশন
    if (!isAuthenticated && patientType === 'NEW') {
      try {
        const regRes = await api.post('/auth/register', {
          name: patientName.trim(),
          phone: cleanPhone,
          password: newPatientPassword.trim(),
          age: Number(patientAge) || 28,
          gender: patientGender === 'Female' ? 'FEMALE' : 'MALE',
        });

        const regData = regRes.data?.data;
        if (regData?.accessToken) {
          localStorage.setItem('accessToken', regData.accessToken);
          if (regData.refreshToken) localStorage.setItem('refreshToken', regData.refreshToken);
          if (regData.user) localStorage.setItem('user', JSON.stringify(regData.user));
        }
      } catch (regErr: any) {
        if (regErr.response?.status === 409) {
          setFormError('এই মোবাইল নম্বরটি ইতোমধ্যে নিবন্ধিত! দয়া করে উপরে "Already Registered ?" নির্বাচন করে পাসওয়ার্ড দিন।');
          setIsRegisteringAndBooking(false);
          return;
        }
      }
    }

    // ডাক্তারের সিরিয়াল বুকিং
    const firstSchedule = doctorSchedules && doctorSchedules.length > 0 ? doctorSchedules[0] : null;
    const scheduleSessionTime = firstSchedule
      ? formatSessionRange(firstSchedule.startTime, firstSchedule.endTime)
      : '05:00 PM - 09:00 PM';

    const bookingPayload = {
      doctor: selectedDoctorId,
      doctorId: selectedDoctorId,
      department: currentDoctor?.department?._id || selectedDeptId,
      departmentId: currentDoctor?.department?._id || selectedDeptId,
      appointmentDate: todayISO,
      date: todayISO,
      sessionTime: scheduleSessionTime,
      startTime: firstSchedule?.startTime || '17:00',
      endTime: firstSchedule?.endTime || '21:00',
      patientName: patientName.trim(),
      name: patientName.trim(),
      patientPhone: cleanPhone,
      phone: cleanPhone,
      patientGender: patientGender === 'Female' ? 'FEMALE' : patientGender === 'Other' ? 'OTHER' : 'MALE',
      gender: patientGender === 'Female' ? 'FEMALE' : patientGender === 'Other' ? 'OTHER' : 'MALE',
      patientAge: Number(patientAge) || 28,
      age: Number(patientAge) || 28,
      consultationFee: currentDoctor?.consultationFee || 500,
      fee: currentDoctor?.consultationFee || 500,
      paymentMethod: 'CASH_AT_CENTER',
      paymentStatus: 'PENDING',
      status: 'CONFIRMED',
      problemDescription: notes.trim(),
      notes: notes.trim(),
    };

    appointmentMutation.mutate(bookingPayload);
  };

  const showFee = settings?.showDoctorFees !== false;

  // 🖨️ CONFIRMED APPOINTMENT SLIP (100% DYNAMIC LOGO & DETAILS)
  if (confirmedAppointment) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] py-8 sm:py-12 px-4">
        <div className="print-container max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-100 shadow-2xl">
          
          <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings?.siteName || 'Logo'}
                    className="h-10 w-auto max-w-[180px] object-contain shrink-0"
                  />
                ) : null}
                {settings?.siteName && (
                  <span className="text-xl font-black text-slate-900 tracking-tight">
                    {settings.siteName}
                  </span>
                )}
              </div>

              {settings?.tagline && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {settings.tagline}
                </p>
              )}

              <p className="text-[10px] text-slate-500 mt-0.5">
                {settings?.topbarHotlineText || settings?.hotline ? `Hotline: ${settings?.topbarHotlineText || settings?.hotline}` : ''}
                {settings?.address ? ` | ${settings.address}` : ''}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Chamber Appointment Slip
              </span>
              <p className="font-mono text-slate-900 font-bold text-xs mt-1">Ref: {confirmedAppointment.appointmentId || confirmedAppointment._id}</p>
              <p className="text-[10px] text-slate-400">{todayFormatted}</p>
            </div>
          </div>

          <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Appointment Status</span>
              <strong className="text-sm font-black text-slate-900">
                {confirmedAppointment.formattedSerial === 'PENDING' ? 'Waiting for Serial Assignment' : `Confirmed Serial: ${confirmedAppointment.formattedSerial || confirmedAppointment.serialNumber || 'A-01'}`}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Chamber Room</span>
              <strong className="text-sm font-black text-emerald-800">{currentDoctor?.chamberRoom || confirmedAppointment.doctor?.chamberRoom || 'Room 302'}</strong>
            </div>
          </div>

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
                <td className="py-2 text-slate-900 font-medium">{confirmedAppointment.patientAge || patientAge} Years • {confirmedAppointment.patientGender || patientGender}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Assigned Specialist:</td>
                <td className="py-2 text-slate-900 font-black text-sm">{currentDoctor?.name || confirmedAppointment.doctor?.name}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Department:</td>
                <td className="py-2 text-slate-800 font-bold">{currentDoctor?.department?.name || confirmedAppointment.department?.name}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500 font-semibold">Schedule Date & Time:</td>
                <td className="py-2 text-slate-900 font-bold">{todayFormatted} ({confirmedAppointment.sessionTime || '05:00 PM - 09:00 PM'})</td>
              </tr>
              {showFee && (
                <tr>
                  <td className="py-2 text-slate-500 font-semibold">Consultation Fee:</td>
                  <td className="py-2 text-slate-900 font-black text-sm">৳{confirmedAppointment.consultationFee || currentDoctor?.consultationFee || 500}</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="pt-10 flex justify-between items-end border-t border-slate-200 text-xs text-slate-400">
            <p className="text-[9px]">Please arrive 15 minutes before chamber time.</p>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span className="text-[9px] font-bold text-slate-600">Reception Counter Seal</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow cursor-pointer"
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
        
        {/* Banner */}
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
            <div className="bg-red-50 text-red-700 p-3.5 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2 animate-in fade-in">
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
                    className="w-full bg-transparent px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
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
                    className="w-full bg-transparent px-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="">Choose a Doctor</option>
                    {filteredDoctors?.map((doc) => (
                      <option key={doc._id} value={doc._id}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* DOCTOR DETAILS PREVIEW */}
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

            {/* 🌟 1. LOGGED IN CONDITION: কোনো পাসওয়ার্ড ছাড়াই সরাসরি বুকিং */}
            {isAuthenticated && authUser ? (
              <div className="bg-emerald-50/70 p-5 rounded-2xl border-2 border-emerald-300 space-y-4 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#00984a]" />
                    <span className="font-black text-slate-900 text-xs">
                      Booking with Verified Account (লগইন করা অ্যাকাউন্ট)
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Active Patient Session
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Patient Name *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Patient full name"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Contact Phone (১১ ডিজিট) *</label>
                    <input
                      type="tel"
                      required
                      maxLength={11}
                      value={patientPhone}
                      onChange={(e) => {
                        // 🛑 শুধুমাত্র সংখ্যা গ্রহণ করবে এবং অক্ষর ফিল্টার করে দেবে
                        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setPatientPhone(digits);
                      }}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Age (বয়স)</label>
                    <input
                      type="number"
                      min={1}
                      max={120}
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      placeholder="e.g. 30"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Gender (লিঙ্গ)</label>
                    <select
                      value={patientGender}
                      onChange={(e: any) => setPatientGender(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] cursor-pointer"
                    >
                      <option value="Male">Male (পুরুষ)</option>
                      <option value="Female">Female (মহিলা)</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* 🌟 2. GUEST VISITOR: STRICT BANGLADESHI MOBILE & 6-CHAR PASSWORD ENFORCEMENT */
              <>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPatientType('NEW');
                      setIsPatientVerified(false);
                      setLoginError(null);
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border cursor-pointer ${
                      patientType === 'NEW'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" /> New Patient (নতুন রোগী)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setPatientType('REGISTERED');
                      setLoginError(null);
                    }}
                    className={`px-4 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 border cursor-pointer ${
                      patientType === 'REGISTERED'
                        ? 'bg-brand-gradient text-white border-transparent shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" /> Already Registered ?
                  </button>
                </div>

                {patientType === 'REGISTERED' ? (
                  !isPatientVerified ? (
                    <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-200 space-y-3.5 animate-in fade-in">
                      <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4 text-[#00984a]" /> Registered Patient Sign In (লগইন করে তথ্য লোড করুন)
                      </h4>

                      {loginError && (
                        <div className="bg-red-50 text-red-700 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{loginError}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Mobile Number or Email (মোবাইল নম্বর বা ইমেইল) *
                          </label>
                          <div className="relative">
                            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              value={loginIdentifier}
                              onChange={(e) => setLoginIdentifier(e.target.value)}
                              placeholder="01XXXXXXXXX or email@domain.com"
                              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            Password (পাসওয়ার্ড - ন্যূনতম ৬ অক্ষর/সংখ্যা) *
                          </label>
                          <div className="relative">
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="password"
                              minLength={6}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              placeholder="কমপক্ষে ৬ ডিজিট বা অক্ষর"
                              className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handlePatientLogin}
                        disabled={patientLoginMutation.isPending}
                        className="bg-[#00984a] hover:bg-[#006642] text-white font-bold px-6 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                      >
                        {patientLoginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>{patientLoginMutation.isPending ? 'Verifying Account...' : 'Sign In & Load Profile'}</span>
                      </button>
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
                          setLoginPassword('');
                        }}
                        className="text-xs font-bold text-slate-500 hover:text-red-600 underline cursor-pointer"
                      >
                        Change Account
                      </button>
                    </div>
                  )
                ) : (
                  /* 🌟 NEW PATIENT: STRICT NUMERIC-ONLY 11 DIGITS & MIN 6-CHAR PASSWORD */
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3.5 animate-in fade-in">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span className="text-[11px] font-black text-slate-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#00984a]" /> Patient Details & Account Setup
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                        ● Instant Patient Account
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          placeholder="e.g. Md. Hasan Ali"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                        />
                      </div>

                      {/* 🔒 100% STRICT NUMERIC-ONLY 11-DIGIT MOBILE NUMBER */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-700">Mobile Number (লগইন নম্বর) *</label>
                          {patientPhone.length === 11 && BD_PHONE_REGEX.test(patientPhone) ? (
                            <span className="text-[10px] font-bold text-[#00984a] flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : patientPhone.length > 0 ? (
                            <span className="text-[10px] text-amber-600 font-semibold">
                              {11 - patientPhone.length} digits left
                            </span>
                          ) : null}
                        </div>

                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            maxLength={11}
                            value={patientPhone}
                            onChange={(e) => {
                              // 🛑 অক্ষরমুক্ত: কোনো অক্ষর টাইপ করা যাবে না, শুধু 0-9 সংখ্যা থাকবে
                              const onlyDigits = e.target.value.replace(/\D/g, '').slice(0, 11);
                              setPatientPhone(onlyDigits);
                            }}
                            placeholder="01XXXXXXXXX"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] font-mono text-xs"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          শুধুমাত্র ১১ ডিজিটের বাংলাদেশি মোবাইল নম্বর লিখুন (যেমন: 01700000000)
                        </p>
                      </div>

                      {/* 🔑 STRICT MINIMUM 6-CHAR PASSWORD (DIGITS OR LETTERS) */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="font-bold text-slate-700">Set Password (পাসওয়ার্ড) *</label>
                          {newPatientPassword.length >= 6 ? (
                            <span className="text-[10px] font-bold text-[#00984a] flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> OK
                            </span>
                          ) : newPatientPassword.length > 0 ? (
                            <span className="text-[10px] text-red-500 font-semibold">
                              কমপক্ষে ৬টি হতে হবে
                            </span>
                          ) : null}
                        </div>

                        <div className="relative">
                          <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={newPatientPassword}
                            onChange={(e) => setNewPatientPassword(e.target.value)}
                            placeholder="কমপক্ষে ৬টি ডিজিট বা অক্ষর"
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] text-xs"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">
                          পাসওয়ার্ড সংখ্যা বা অক্ষর যাই হোক, কমপক্ষে ৬টি হতে হবে
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Age (বয়স)</label>
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={patientAge}
                          onChange={(e) => setPatientAge(Number(e.target.value))}
                          placeholder="e.g. 32"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Gender (লিঙ্গ)</label>
                        <select
                          value={patientGender}
                          onChange={(e: any) => setPatientGender(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] cursor-pointer"
                        >
                          <option value="Male">Male (পুরুষ)</option>
                          <option value="Female">Female (মহিলা)</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </>
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
                disabled={appointmentMutation.isPending || isRegisteringAndBooking}
                className="w-full sm:w-80 mx-auto bg-brand-gradient hover:opacity-95 text-white font-black py-3.5 rounded-2xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.99] cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isRegisteringAndBooking || appointmentMutation.isPending
                    ? 'Processing Serial & Booking...'
                    : 'Confirm Appointment Serial'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointmentPage;