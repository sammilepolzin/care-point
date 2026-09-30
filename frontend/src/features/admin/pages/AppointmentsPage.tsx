import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Search, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  Send, 
  MessageSquare, 
  X, 
  Check, 
  Filter, 
  UserCheck, 
  Stethoscope, 
  MapPin, 
  Smartphone, 
  Sparkles,
  Users
} from 'lucide-react';
import api from '@/lib/axios';

interface Appointment {
  _id: string;
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  doctor: { _id: string; name: string; chamberRoom?: string; photoUrl?: string };
  department: { _id: string; name: string };
  appointmentDate: string;
  appointmentDay: string;
  sessionTime: string;
  serialNumber: number;
  formattedSerial: string;
  status: 'PENDING' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED';
  problemDescription?: string;
  createdAt: string;
}

export const AppointmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const todayISO = new Date().toISOString().split('T')[0];

  const [dateTab, setDateTab] = useState<'TODAY' | 'ALL' | 'CUSTOM'>('TODAY');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [phoneSearch, setPhoneSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Confirm Modal State
  const [selectedAppForConfirm, setSelectedAppForConfirm] = useState<Appointment | null>(null);
  const [serialInput, setSerialInput] = useState<string>('A-12');
  const [sessionTimeInput, setSessionTimeInput] = useState<string>('05:30 PM - 08:30 PM');
  const [confirmSuccess, setConfirmSuccess] = useState<string | null>(null);

  // Patient Profile Drawer
  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<Appointment | null>(null);
  const [copiedAppId, setCopiedAppId] = useState<string | null>(null);

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ['admin-appointments', dateTab, selectedDate, phoneSearch, statusFilter],
    queryFn: async () => {
      let url = '/appointments?';
      if (dateTab === 'TODAY') {
        url += `date=${todayISO}&`;
      } else if (dateTab === 'CUSTOM' && selectedDate) {
        url += `date=${selectedDate}&`;
      }
      if (phoneSearch) url += `phone=${phoneSearch}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const confirmMutation = useMutation({
    mutationFn: async ({ id, serialNumber, sessionTime }: { id: string; serialNumber: string; sessionTime: string }) => {
      return api.patch(`/appointments/${id}/confirm`, { serialNumber, sessionTime });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
      setConfirmSuccess(res.data.message);
      setTimeout(() => {
        setConfirmSuccess(null);
        setSelectedAppForConfirm(null);
      }, 1500);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/appointments/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-appointments'] });
    },
  });

  // GROUP APPOINTMENTS BY DOCTOR
  const doctorGroups = React.useMemo(() => {
    if (!appointments) return [];
    const map = new Map<string, { doctor: any; department: any; appointments: Appointment[] }>();

    appointments.forEach((app) => {
      const docId = app.doctor?._id || 'unknown';
      if (!map.has(docId)) {
        map.set(docId, {
          doctor: app.doctor,
          department: app.department,
          appointments: [],
        });
      }
      map.get(docId)!.appointments.push(app);
    });

    return Array.from(map.values());
  }, [appointments]);

  const openConfirmModal = (app: Appointment) => {
    setSelectedAppForConfirm(app);
    setSerialInput(`A-${Math.floor(1 + Math.random() * 25)}`);
    setSessionTimeInput(app.sessionTime || '05:30 PM - 08:30 PM');
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppForConfirm || !serialInput.trim()) return;
    confirmMutation.mutate({
      id: selectedAppForConfirm._id,
      serialNumber: serialInput,
      sessionTime: sessionTimeInput,
    });
  };

  // 1-CLICK WHATSAPP
  const sendWhatsApp = (app: Appointment) => {
    let cleanPhone = app.patientPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '88' + cleanPhone;
    else if (!cleanPhone.startsWith('88')) cleanPhone = '880' + cleanPhone;

    const message = `Care Point Diagnostic:\nDear ${app.patientName}, your appointment with ${app.doctor?.name} is CONFIRMED.\n` +
      `Serial No: ${app.formattedSerial}\n` +
      `Date: ${app.appointmentDate} (${app.appointmentDay})\n` +
      `Time: ${app.sessionTime}\n` +
      `Chamber: ${app.doctor?.chamberRoom || 'Counter'}\n` +
      `Ref ID: ${app.appointmentId}\nHotline: 09666 787801`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // 1-CLICK DIRECT MOBILE SIM SMS TRIGGER
  const sendSimSMS = (app: Appointment) => {
    const text = `Care Point: Appt Confirmed for ${app.patientName}. Doctor: ${app.doctor?.name}. Serial: ${app.formattedSerial}. Date: ${app.appointmentDate}, Time: ${app.sessionTime}. Ref: ${app.appointmentId}. Hotline: 09666787801`;
    window.location.href = `sms:${app.patientPhone}?body=${encodeURIComponent(text)}`;
  };

  const copySMS = (app: Appointment) => {
    const text = `Care Point: Appt Confirmed for ${app.patientName}. Doctor: ${app.doctor?.name}. Serial: ${app.formattedSerial}. Date: ${app.appointmentDate}, Time: ${app.sessionTime}. Ref: ${app.appointmentId}`;
    navigator.clipboard.writeText(text);
    setCopiedAppId(app._id);
    setTimeout(() => setCopiedAppId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Doctor Chamber Queue & Appointments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Doctor-wise dedicated chambers. Allocate serials, manage queues, and send direct SMS/WhatsApp notifications.
          </p>
        </div>

        {/* Date Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setDateTab('TODAY')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
              dateTab === 'TODAY' ? 'bg-[#00984a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Queue ({todayISO})
          </button>
          <button
            onClick={() => setDateTab('ALL')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
              dateTab === 'ALL' ? 'bg-[#00984a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Dates
          </button>
          <button
            onClick={() => setDateTab('CUSTOM')}
            className={`px-4 py-1.5 rounded-xl font-bold text-xs transition ${
              dateTab === 'CUSTOM' ? 'bg-[#00984a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pick Date
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {dateTab === 'CUSTOM' ? (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Specific Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
            />
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 px-3 bg-slate-50 rounded-xl border border-slate-200">
            <Calendar className="w-4 h-4 text-[#00984a]" />
            <span>Active View: {dateTab === 'TODAY' ? `Today's Live Queue (${todayISO})` : 'All Dates Queue'}</span>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Patient Phone</label>
          <input
            type="text"
            value={phoneSearch}
            onChange={(e) => setPhoneSearch(e.target.value)}
            placeholder="e.g. 01700..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending (সিরিয়াল অপেক্ষমাণ)</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CHECKED_IN">Checked In (উপস্থিত)</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* DOCTOR-WISE DEDICATED QUEUE TABLES (WITH SIGNATURE BRAND GRADIENT HEADERS) */}
      {isLoading ? (
        <div className="p-16 text-center text-slate-400 text-xs">Loading live chamber queues...</div>
      ) : doctorGroups.length > 0 ? (
        <div className="space-y-6">
          {doctorGroups.map(({ doctor, department, appointments: docApps }) => (
            <div
              key={doctor?._id || 'unknown'}
              className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden"
            >
              {/* BRAND GRADIENT DOCTOR CHAMBER HEADER */}
              <div className="bg-brand-gradient p-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-white shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md text-white flex items-center justify-center font-bold text-lg shrink-0 border border-white/25 shadow-inner">
                    <Stethoscope className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-white text-base tracking-wide">{doctor?.name || 'Specialist Doctor'}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-950 bg-amber-300 px-2.5 py-0.5 rounded-full shadow-2xs">
                        {department?.name || 'Speciality'}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-100 mt-0.5 flex items-center gap-2">
                      <span>Chamber: <strong className="text-white">{doctor?.chamberRoom || 'Room 302'}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-amber-300" /> Active Queue: <strong className="text-white">{docApps.length} Patients</strong>
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-xl font-bold text-white shadow-2xs">
                    Pending: {docApps.filter((a) => a.status === 'PENDING').length}
                  </span>
                  <span className="bg-white text-[#00984a] px-3 py-1.5 rounded-xl font-black shadow-2xs">
                    Confirmed: {docApps.filter((a) => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN').length}
                  </span>
                </div>
              </div>

              {/* Patient Queue Table for This Doctor */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Serial No</th>
                      <th className="p-3.5">Patient Details</th>
                      <th className="p-3.5">Appt Date & Time</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-center">1-Click Notifications</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {docApps.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <span
                            className={`px-3 py-1.5 rounded-xl text-xs font-black shadow-sm ${
                              app.status === 'CONFIRMED' || app.status === 'CHECKED_IN'
                                ? 'bg-[#00984a] text-white'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {app.formattedSerial}
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono mt-1">{app.appointmentId}</p>
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => setSelectedPatientForDrawer(app)}
                            className="font-bold text-slate-900 hover:text-[#00984a] text-left underline block"
                            title="View patient details"
                          >
                            {app.patientName}
                          </button>
                          <p className="text-[11px] text-slate-500">{app.patientPhone} • {app.patientAge}y, {app.patientGender}</p>
                          {app.problemDescription && (
                            <p className="text-[10px] text-slate-400 italic truncate max-w-xs mt-0.5">"{app.problemDescription}"</p>
                          )}
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{app.appointmentDate}</p>
                          <p className="text-[10px] text-slate-500">{app.appointmentDay} • {app.sessionTime}</p>
                        </td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              app.status === 'CONFIRMED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'PENDING'
                              ? 'bg-amber-100 text-amber-800'
                              : app.status === 'CHECKED_IN'
                              ? 'bg-sky-100 text-sky-800'
                              : app.status === 'COMPLETED'
                              ? 'bg-slate-200 text-slate-800'
                              : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>

                        {/* 1-CLICK SIM SMS & WHATSAPP BUTTONS */}
                        <td className="p-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => sendSimSMS(app)}
                              className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 transition shadow-2xs flex items-center gap-1"
                              title="Send Direct SMS via Mobile SIM"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">SMS</span>
                            </button>

                            <button
                              onClick={() => sendWhatsApp(app)}
                              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition shadow-2xs flex items-center gap-1"
                              title="Send WhatsApp Alert"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span className="text-[10px] font-bold">WhatsApp</span>
                            </button>
                          </div>
                        </td>

                        <td className="p-3.5 text-right">
                          {app.status === 'PENDING' ? (
                            <button
                              onClick={() => openConfirmModal(app)}
                              className="bg-brand-gradient hover:opacity-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition shadow flex items-center gap-1.5 ml-auto"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Set Serial</span>
                            </button>
                          ) : (
                            <select
                              value={app.status}
                              onChange={(e) => updateStatusMutation.mutate({ id: app._id, status: e.target.value })}
                              className="bg-slate-50 border border-slate-300 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 focus:outline-none focus:border-[#00984a]"
                            >
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="CHECKED_IN">Checked In</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400 text-xs">
          No appointments recorded for the selected date or filter.
        </div>
      )}

      {/* CONFIRM SERIAL MODAL */}
      {selectedAppForConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#00984a]" /> Assign Serial & Confirm
              </h3>
              <button onClick={() => setSelectedAppForConfirm(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {confirmSuccess ? (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl text-xs font-bold border border-emerald-200 text-center space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p>{confirmSuccess}</p>
              </div>
            ) : (
              <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs font-bold text-slate-700">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <p className="text-slate-800">Patient: <strong className="text-slate-900">{selectedAppForConfirm.patientName}</strong></p>
                  <p className="text-slate-600">Mobile: <strong className="text-slate-900">{selectedAppForConfirm.patientPhone}</strong></p>
                  <p className="text-slate-600">Doctor: <strong className="text-slate-900">{selectedAppForConfirm.doctor?.name}</strong></p>
                  <p className="text-slate-600">Date: <strong className="text-slate-900">{selectedAppForConfirm.appointmentDate}</strong></p>
                </div>

                <div>
                  <label className="block mb-1">Assign Serial Number (সিরিয়াল নম্বর প্রদান) *</label>
                  <input
                    type="text"
                    required
                    value={serialInput}
                    onChange={(e) => setSerialInput(e.target.value)}
                    placeholder="e.g. A-12, A-15, 14"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-black text-[#00984a] focus:outline-none focus:border-[#00984a] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block mb-1">Chamber Session Time (চেম্বারের সময়)</label>
                  <input
                    type="text"
                    value={sessionTimeInput}
                    onChange={(e) => setSessionTimeInput(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAppForConfirm(null)}
                    className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={confirmMutation.isPending}
                    className="w-1/2 bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{confirmMutation.isPending ? 'Confirming...' : 'Confirm Serial'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PATIENT PROFILE DRAWER */}
      {selectedPatientForDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#00984a]" /> Patient Profile
                </h3>
                <button
                  onClick={() => setSelectedPatientForDrawer(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-6 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs space-y-2">
                <p className="text-sm font-black text-slate-900">{selectedPatientForDrawer.patientName}</p>
                <p className="text-slate-600 font-semibold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#00984a]" /> {selectedPatientForDrawer.patientPhone}
                </p>
                <p className="text-slate-500">
                  Age: <strong>{selectedPatientForDrawer.patientAge} Years</strong> • Gender: <strong>{selectedPatientForDrawer.patientGender}</strong>
                </p>
              </div>

              <div className="mt-4 bg-white p-5 rounded-2xl border border-emerald-200 text-xs space-y-2">
                <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                  Appointment Details
                </span>
                <p className="text-slate-800 font-bold">Serial No: {selectedPatientForDrawer.formattedSerial}</p>
                <p className="text-slate-600">Specialist: {selectedPatientForDrawer.doctor?.name}</p>
                <p className="text-slate-600">Date: {selectedPatientForDrawer.appointmentDate} ({selectedPatientForDrawer.sessionTime})</p>
                <p className="text-slate-600">Ref ID: {selectedPatientForDrawer.appointmentId}</p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-2">
              <button
                onClick={() => sendSimSMS(selectedPatientForDrawer)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1"
              >
                <Smartphone className="w-3.5 h-3.5" /> Send SMS
              </button>
              <button
                onClick={() => sendWhatsApp(selectedPatientForDrawer)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1"
              >
                <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};