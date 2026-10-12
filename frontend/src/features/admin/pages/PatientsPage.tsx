import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  TestTube2, 
  MessageCircle,
  UserCheck,
  UserX
} from 'lucide-react';
import api from '@/lib/axios';

interface PatientUser {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  gender?: string;
  bloodGroup?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export const PatientsPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Patients from Backend API
  const { data: patients, isLoading } = useQuery<PatientUser[]>({
    queryKey: ['admin-patients', searchTerm, statusFilter],
    queryFn: async () => {
      let url = `/patients?search=${encodeURIComponent(searchTerm)}`;
      if (statusFilter !== 'ALL') url += `&status=${statusFilter}`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  // 2. Fetch Selected Patient's Medical History
  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['patient-history', selectedPatientId],
    queryFn: async () => {
      if (!selectedPatientId) return null;
      const res = await api.get(`/patients/${selectedPatientId}/history`);
      return res.data.data;
    },
    enabled: Boolean(selectedPatientId),
  });

  // 3. Toggle Account Status Mutation (Block/Unblock)
  const toggleMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/patients/${id}/status`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-patients'] });
      setSuccessMsg(res.data.message || 'Account status updated');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to update status');
    },
  });

  const totalPatients = patients?.length || 0;
  const activeCount = patients?.filter((p) => p.isActive).length || 0;
  const blockedCount = patients?.filter((p) => !p.isActive).length || 0;

  return (
    <div className="space-y-6 pb-20">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#006642] bg-[#f0fdf4] border border-emerald-300 px-3 py-1 rounded-full">
            ● Patient Registration & Records
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Registered Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage patient accounts, view doctor consultation histories, diagnostic tests, and control access permissions.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Total Registered</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalPatients}</p>
          <span className="text-[10px] text-[#00984a] font-bold">Verified Portal Users</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Active Accounts</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{activeCount}</p>
          <span className="text-[10px] text-emerald-600 font-bold">Able to book services</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Blocked / Suspended</span>
          <p className="text-2xl font-black text-red-700 mt-1">{blockedCount}</p>
          <span className="text-[10px] text-red-600 font-bold">Access restricted</span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Security Guard</span>
          <p className="text-sm font-black text-slate-900 mt-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#00984a]" /> 100% Protected
          </p>
          <span className="text-[10px] text-slate-400">JWT & RBAC Guarded</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient by name, mobile, email..."
            className="w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#00984a]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl transition ${
              statusFilter === 'ALL' ? 'bg-[#00984a] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Patients
          </button>
          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-xl transition ${
              statusFilter === 'ACTIVE' ? 'bg-[#00984a] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Only
          </button>
          <button
            onClick={() => setStatusFilter('BLOCKED')}
            className={`px-3 py-1.5 rounded-xl transition ${
              statusFilter === 'BLOCKED' ? 'bg-red-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Blocked
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">Loading registered patients...</div>
        ) : patients && patients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">Patient Profile</th>
                  <th className="p-4">Mobile & WhatsApp</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4 text-right">Actions & History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {patients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-black text-sm shrink-0">
                          {p.name ? p.name[0].toUpperCase() : 'P'}
                        </div>
                        <div>
                          <strong className="text-slate-900 font-bold text-sm block leading-tight">{p.name}</strong>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {p._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900">{p.phone}</span>
                        <a
                          href={`https://wa.me/${p.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50"
                          title="Message on WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="p-4 text-slate-500">{p.email || 'N/A'}</td>

                    <td className="p-4 text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="p-4">
                      <span
                        className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                          p.isActive
                            ? 'bg-emerald-50 text-[#00984a] border border-emerald-200'
                            : 'bg-red-50 text-red-600 border border-red-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${p.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {p.isActive ? 'Active (সক্রিয়)' : 'Blocked (স্থগিত)'}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedPatientId(p._id)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1 text-[11px] font-bold"
                          title="View Complete Medical History"
                        >
                          <Eye className="w-3.5 h-3.5 text-[#00984a]" />
                          <span>History</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to ${p.isActive ? 'block' : 'unblock'} patient "${p.name}"?`)) {
                              toggleMutation.mutate(p._id);
                            }
                          }}
                          className={`p-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                            p.isActive
                              ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {p.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          <span>{p.isActive ? 'Block' : 'Unblock'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">
            No registered patients found.
          </div>
        )}
      </div>

      {/* Patient History Modal */}
      {selectedPatientId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs text-slate-700 animate-in zoom-in-95 relative">
            <button
              onClick={() => setSelectedPatientId(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {isHistoryLoading ? (
              <div className="py-20 text-center text-slate-400 text-xs">Loading patient medical history...</div>
            ) : historyData ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4 pb-4 border-b">
                  <div className="w-16 h-16 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                    {historyData.patient?.name ? historyData.patient.name[0].toUpperCase() : 'P'}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{historyData.patient?.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phone: <strong className="text-slate-900 font-mono">{historyData.patient?.phone}</strong> • Email: {historyData.patient?.email || 'N/A'}
                    </p>
                    <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded mt-1 inline-block">
                      Registration: {new Date(historyData.patient?.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </div>
                </div>

                {/* Consultations */}
                <div className="space-y-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-[#00984a]" /> Doctor Consultations ({historyData.appointments?.length || 0})
                  </h4>

                  {historyData.appointments && historyData.appointments.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {historyData.appointments.map((a: any) => (
                        <div key={a._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-900 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                              Serial: {a.formattedSerial || a.serialNumber}
                            </span>
                            <strong className="block text-slate-900 mt-1">{a.doctor?.name || 'Doctor'}</strong>
                            <span className="text-[10px] text-slate-400">Date: {a.appointmentDate} • Room: {a.doctor?.chamberRoom}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-black uppercase bg-white border px-2 py-0.5 rounded text-emerald-700">
                              {a.status}
                            </span>
                            <span className="block text-[10px] text-slate-500 mt-0.5 font-bold">Fee: ৳{a.consultationFee}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-xl">No doctor serials taken yet.</p>
                  )}
                </div>

                {/* Test Orders */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <TestTube2 className="w-4 h-4 text-[#00984a]" /> Diagnostic Tests ({historyData.testBookings?.length || 0})
                  </h4>

                  {historyData.testBookings && historyData.testBookings.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {historyData.testBookings.map((tb: any) => (
                        <div key={tb._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-mono font-bold text-slate-800 bg-white border px-2 py-0.5 rounded text-[10px]">
                              ID: {tb.bookingId}
                            </span>
                            <strong className="block text-slate-900 mt-1">{tb.tests?.length} Test(s)</strong>
                            <span className="text-[10px] text-slate-400">
                              Type: {tb.collectionType === 'HOME_COLLECTION' ? '🏠 Home Collection' : '🏥 Centre Visit'}
                            </span>
                          </div>
                          <div className="text-right">
                            <strong className="text-slate-900 font-bold block">৳{tb.netPayableAmount}</strong>
                            <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mt-0.5 inline-block">
                              {tb.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 py-3 text-center bg-slate-50 rounded-xl">No diagnostic tests booked yet.</p>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;