import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  TestTube2, 
  FileText, 
  HeartPulse, 
  Download, 
  Eye, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Droplet, 
  Activity, 
  Edit3, 
  X, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Upload,
  Camera,
  LogOut
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/features/auth/context/AuthContext';
import { PrescriptionPrintView } from '@/features/prescriptions/components/PrescriptionPrintView';

// 🇧🇩 STRICT 11 DIGITS BD PHONE CHECK
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

export const PatientDashboardPage: React.FC = () => {
  const { user, login, logout } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'tests' | 'reports' | 'prescriptions' | 'profile'>('overview');
  const patientPhone = user?.phone || '01711000000';
  const [viewingPrescription, setViewingPrescription] = useState<any | null>(null);

  // 🌟 EDIT PROFILE MODAL STATES (NAME, PHONE, EMAIL INCLUDED)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editBloodGroup, setEditBloodGroup] = useState('B+');
  const [editAge, setEditAge] = useState<number>(28);
  const [editGender, setEditGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [editAddress, setEditAddress] = useState('Dhaka, Bangladesh');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editPhotoUrl, setEditPhotoUrl] = useState('');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  const { data: profileDetails } = useQuery({
    queryKey: ['patient-detailed-profile'],
    queryFn: async () => {
      const res = await api.get('/auth/patient-profile');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (profileDetails?.patient || user) {
      const p = profileDetails?.patient;
      setEditName(p?.name || user?.name || '');
      setEditPhone(user?.phone || p?.phone || '');
      setEditEmail(user?.email || p?.email || '');
      setEditBloodGroup(p?.bloodGroup || 'B+');
      setEditAge(p?.age || 28);
      setEditGender(p?.gender || 'MALE');
      setEditAddress(p?.address || 'Dhaka, Bangladesh');
      setEditEmergencyPhone(p?.emergencyContact || '');
      setEditPhotoUrl(p?.photoUrl || user?.avatarUrl || '');
    }
  }, [profileDetails, user]);

  const { data: appointments } = useQuery<any[]>({
    queryKey: ['patient-my-appointments', patientPhone],
    queryFn: async () => {
      const res = await api.get(`/appointments?phone=${patientPhone}`);
      return res.data.data;
    },
  });

  const { data: testBookings } = useQuery<any[]>({
    queryKey: ['patient-my-tests', patientPhone],
    queryFn: async () => {
      const res = await api.get(`/test-bookings?phone=${patientPhone}`);
      return res.data.data;
    },
  });

  const { data: reports } = useQuery<any[]>({
    queryKey: ['patient-my-reports', patientPhone],
    queryFn: async () => {
      const res = await api.get(`/reports/patient-reports?phone=${patientPhone}`);
      return res.data.data;
    },
  });

  const { data: prescriptions } = useQuery<any[]>({
    queryKey: ['patient-my-prescriptions', patientPhone],
    queryFn: async () => {
      const res = await api.get(`/prescriptions/patient?phone=${patientPhone}`);
      return res.data.data;
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploadingPhoto(true);

    try {
      const res = await api.post('/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setEditPhotoUrl(res.data.data.imageUrl);
      }
    } catch (err: any) {
      setEditError('Failed to upload profile photo');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // 🌟 PROFILE UPDATE MUTATION
  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => api.put('/auth/patient-profile', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['patient-detailed-profile'] });
      setEditSuccess('Profile, mobile number & email updated successfully!');
      setEditError(null);
      
      const updatedUser = res.data.data?.user;
      if (updatedUser) {
        const token = localStorage.getItem('accessToken') || '';
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(updatedUser, token);
      }

      setTimeout(() => {
        setEditSuccess(null);
        setIsEditModalOpen(false);
      }, 1500);
    },
    onError: (err: any) => {
      setEditError(err.response?.data?.message || 'Failed to update profile.');
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    const cleanPhone = editPhone.replace(/\D/g, '').slice(0, 11);
    if (!cleanPhone || cleanPhone.length !== 11 || !BD_PHONE_REGEX.test(cleanPhone)) {
      setEditError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।');
      return;
    }

    updateProfileMutation.mutate({
      name: editName.trim(),
      phone: cleanPhone,
      email: editEmail.trim(),
      photoUrl: editPhotoUrl,
      bloodGroup: editBloodGroup,
      age: Number(editAge),
      gender: editGender,
      address: editAddress.trim(),
      emergencyContact: editEmergencyPhone.trim(),
    });
  };

  const getStreamUrl = (reportId: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    return `${baseUrl}/reports/view/${reportId}`;
  };

  const patient = profileDetails?.patient;
  const currentPhoto = patient?.photoUrl || user?.avatarUrl;
  const patientDisplayId = patient?.patientId || `PAT-${new Date().getFullYear()}-${user?.phone?.slice(-4) || '8942'}`;

  return (
    <div className="space-y-6 sm:space-y-8 w-full pb-10">
      
      {/* 1. MASTER PATIENT IDENTITY CARD */}
      <div className="bg-white rounded-3xl p-5 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 sm:gap-6 w-full md:w-auto">
          {/* Avatar Photo */}
          <div className="relative shrink-0">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt={user?.name || 'Patient'}
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-3xl object-cover border-4 border-white shadow-lg ring-2 ring-emerald-300"
              />
            ) : (
              <div className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-3xl bg-brand-gradient text-white flex items-center justify-center font-black text-3xl sm:text-4xl shadow-lg shadow-emerald-700/20 border-4 border-white ring-2 ring-emerald-200">
                {user?.name ? user.name[0].toUpperCase() : 'P'}
              </div>
            )}
            <button
              onClick={() => {
                setEditError(null);
                setEditSuccess(null);
                setIsEditModalOpen(true);
              }}
              className="absolute -bottom-1 -right-1 bg-white text-[#00984a] p-2 rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
              title="Change profile photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5 w-full">
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2">
              <h1 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">{user?.name || 'Valued Patient'}</h1>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full">
                ✓ Verified Account
              </span>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 text-xs font-mono font-bold">
              <span className="text-slate-500">ID:</span>
              <strong className="text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{patientDisplayId}</strong>
              {patient?.bloodGroup && (
                <span className="text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded font-sans font-bold flex items-center gap-0.5 text-xs">
                  <Droplet className="w-3.5 h-3.5 text-red-500 fill-red-500" /> {patient.bloodGroup}
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
              <span className="flex items-center gap-1 font-bold">
                <Phone className="w-3.5 h-3.5 text-[#00984a]" /> {user?.phone || '01XXXXXXXXX'}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#00984a]" /> {user?.email || 'patient@carepoint.local'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={() => {
              setEditError(null);
              setEditSuccess(null);
              setIsEditModalOpen(true);
            }}
            className="flex-1 md:flex-none bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-4 py-2.5 rounded-2xl transition flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-[#00984a]" />
            <span>Edit Profile</span>
          </button>

          <Link
            to="/appointment"
            className="flex-1 md:flex-none bg-brand-gradient hover:opacity-95 text-white font-black text-xs px-5 py-2.5 rounded-2xl shadow-xs transition flex items-center justify-center gap-1.5 text-center"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Book Serial</span>
          </Link>
        </div>
      </div>

      {/* 2. NAVIGATION TABS BAR */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'overview' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Overview
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'appointments' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" /> Serials ({appointments?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'tests' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <TestTube2 className="w-3.5 h-3.5" /> Tests ({testBookings?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'reports' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Reports ({reports?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'prescriptions' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" /> Rx ({prescriptions?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
            activeTab === 'profile' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <User className="w-3.5 h-3.5" /> Profile Info
        </button>
      </div>

      {/* 3. TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div onClick={() => setActiveTab('appointments')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#00984a] transition cursor-pointer">
              <span className="text-xs font-bold text-slate-500 block mb-1">Doctor Serials</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{appointments?.length || 0}</p>
            </div>
            <div onClick={() => setActiveTab('tests')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-400 transition cursor-pointer">
              <span className="text-xs font-bold text-slate-500 block mb-1">Test Orders</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{testBookings?.length || 0}</p>
            </div>
            <div onClick={() => setActiveTab('reports')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-400 transition cursor-pointer">
              <span className="text-xs font-bold text-slate-500 block mb-1">Reports Ready</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{reports?.length || 0}</p>
            </div>
            <div onClick={() => setActiveTab('prescriptions')} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs hover:border-rose-400 transition cursor-pointer">
              <span className="text-xs font-bold text-slate-500 block mb-1">Prescriptions</span>
              <p className="text-xl sm:text-2xl font-black text-slate-900">{prescriptions?.length || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* APPOINTMENTS TAB */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#00984a]" /> Doctor Chamber Serials
            </h3>
            <Link to="/appointment" className="text-xs font-bold text-[#00984a] hover:underline">
              + New Serial
            </Link>
          </div>

          {appointments && appointments.length > 0 ? (
            <div className="space-y-2.5">
              {appointments.map((a: any) => (
                <div key={a._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black bg-[#00984a] text-white px-2 py-0.5 rounded text-[10px]">
                        {a.formattedSerial}
                      </span>
                      <strong className="text-slate-900 font-bold text-sm">{a.doctor?.name}</strong>
                    </div>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Chamber: {a.doctor?.chamberRoom || 'Room 302'} • {a.appointmentDate} ({a.sessionTime})
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">No doctor appointments found.</div>
          )}
        </div>
      )}

      {/* TEST ORDERS TAB */}
      {activeTab === 'tests' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <TestTube2 className="w-4 h-4 text-[#00984a]" /> Test Orders & Home Collections
            </h3>
            <Link to="/tests" className="text-xs font-bold text-[#00984a] hover:underline">
              + Order Tests
            </Link>
          </div>

          {testBookings && testBookings.length > 0 ? (
            <div className="space-y-2.5">
              {testBookings.map((t: any) => (
                <div key={t._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border text-slate-800 text-[10px]">{t.bookingId}</span>
                      <strong className="text-[#00984a] font-bold">
                        {t.collectionType === 'HOME_COLLECTION' ? '🏠 Home Sample' : '🏥 Center Visit'}
                      </strong>
                    </div>
                    <p className="text-slate-700 font-semibold mt-1">{t.tests?.map((i: any) => i.name).join(', ')}</p>
                    <p className="text-slate-400 text-[10px]">{t.scheduledDate} ({t.scheduledTimeSlot})</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-900">৳{t.netPayableAmount}</span>
                    <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">No test booking orders found.</div>
          )}
        </div>
      )}

      {/* REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4 animate-in fade-in">
          <h3 className="font-black text-slate-900 text-sm border-b pb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#00984a]" /> Published Medical Reports
          </h3>

          {reports && reports.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {reports.map((r: any) => (
                <div key={r._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border text-slate-800">{r.reportId}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{r.testName}</h4>
                    <p className="text-[10px] text-slate-400">{new Date(r.publishedAt).toLocaleDateString()}</p>
                  </div>
                  <a
                    href={getStreamUrl(r._id)}
                    download
                    className="bg-brand-gradient text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs flex items-center gap-1 shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">No medical reports ready yet.</div>
          )}
        </div>
      )}

      {/* PRESCRIPTIONS TAB */}
      {activeTab === 'prescriptions' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4 animate-in fade-in">
          <h3 className="font-black text-slate-900 text-sm border-b pb-3 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-[#00984a]" /> Digital Prescriptions (Rx)
          </h3>

          {prescriptions && prescriptions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prescriptions.map((rx: any) => (
                <div key={rx._id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-mono text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border text-slate-800">{rx.prescriptionId}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{rx.doctor?.name}</h4>
                    <p className="text-[10px] text-[#00984a] font-bold">Dx: {rx.diagnosis}</p>
                  </div>
                  <button
                    onClick={() => setViewingPrescription(rx)}
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 shrink-0"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#00984a]" /> View Rx
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs">No digital prescriptions on record.</div>
          )}
        </div>
      )}

      {/* PROFILE INFO TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-7 space-y-4 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-3">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-[#00984a]" /> Patient Medical Records & Contact Info
            </h3>
            <button
              onClick={() => {
                setEditError(null);
                setEditSuccess(null);
                setIsEditModalOpen(true);
              }}
              className="text-xs font-bold text-[#00984a] hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Information
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Full Name</span>
              <p className="font-black text-slate-900 text-sm">{user?.name || 'Patient'}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Patient ID</span>
              <p className="font-mono font-black text-[#00984a] text-sm">{patientDisplayId}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Blood Group</span>
              <p className="font-black text-red-600 text-sm">{patient?.bloodGroup || 'Not set'}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Registered Mobile</span>
              <p className="font-bold text-slate-800 font-mono">{user?.phone}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Email Address</span>
              <p className="font-bold text-slate-800 truncate">{user?.email || 'None'}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-400">Age & Gender</span>
              <p className="font-bold text-slate-800">{patient?.age || 28}y • {patient?.gender || 'MALE'}</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 sm:col-span-3">
              <span className="text-[10px] font-bold uppercase text-slate-400">Residential Address</span>
              <p className="font-medium text-slate-800 mt-0.5">{patient?.address || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}

      {/* 4. LOGOUT BUTTON */}
      <div className="pt-4 border-t border-slate-200 text-center">
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-6 py-3 rounded-2xl transition border border-red-200 shadow-2xs cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out from Patient Account (লগআউট)</span>
        </button>
      </div>

      {/* 🌟 EDIT PROFILE MODAL (NAME, PHONE, EMAIL EDITING ENABLED) */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95 text-xs font-bold text-slate-700">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-[#00984a]" /> Edit Patient Profile & Contact Details
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccess && (
              <div className="mb-3 bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            )}

            {editError && (
              <div className="mb-3 bg-red-50 text-red-700 p-2.5 rounded-xl border border-red-200 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-3.5">
              {/* Profile Photo */}
              <div className="bg-slate-50 p-3 rounded-2xl border flex items-center gap-3">
                {editPhotoUrl ? (
                  <img src={editPhotoUrl} alt="Avatar" className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-300" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#00984a] flex items-center justify-center font-bold text-lg">
                    <User className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="bg-white hover:bg-slate-100 text-slate-700 border px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 shadow-2xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>{isUploadingPhoto ? 'Uploading...' : 'Change Photo'}</span>
                  </button>
                  <p className="text-[9px] text-slate-400 mt-0.5">JPG, PNG, WEBP</p>
                </div>
              </div>

              {/* 🌟 1. NAME FIELD */}
              <div>
                <label className="block mb-1">Full Name (পূর্ণ নাম) *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Patient Full Name"
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              {/* 🌟 2. PHONE & EMAIL FIELDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label>Mobile Number (লগইন নম্বর) *</label>
                    {editPhone.length === 11 && BD_PHONE_REGEX.test(editPhone) ? (
                      <span className="text-[10px] text-[#00984a]">✓ Valid</span>
                    ) : null}
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={editPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setEditPhone(digits);
                    }}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Email Address (ইমেইল)</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="patient@carepoint.com"
                    className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              {/* Blood Group, Age & Gender */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block mb-1">Blood Group</label>
                  <select
                    value={editBloodGroup}
                    onChange={(e) => setEditBloodGroup(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1">Age (বয়স) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={editAge}
                    onChange={(e) => setEditAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Gender</label>
                  <select
                    value={editGender}
                    onChange={(e: any) => setEditGender(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-2.5 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1">Emergency Contact Phone</label>
                <input
                  type="text"
                  maxLength={11}
                  value={editEmergencyPhone}
                  onChange={(e) => setEditEmergencyPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="01XXXXXXXXX"
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block mb-1">Address (ঠিকানা)</label>
                <textarea
                  rows={2}
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  placeholder="Full residential address..."
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-bold shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRESCRIPTION VIEW MODAL */}
      {viewingPrescription && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <PrescriptionPrintView
            prescription={viewingPrescription}
            onClose={() => setViewingPrescription(null)}
          />
        </div>
      )}
    </div>
  );
};

export default PatientDashboardPage;