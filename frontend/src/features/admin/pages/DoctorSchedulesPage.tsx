import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  Clock, 
  Stethoscope, 
  AlertCircle, 
  Search, 
  MapPin,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import api from '@/lib/axios';

interface Doctor {
  _id: string;
  name: string;
  department?: { name: string };
  chamberRoom?: string;
  photoUrl?: string;
}

interface Schedule {
  _id: string;
  doctor: Doctor;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxSerialCapacity?: number | null;
}

const DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const DoctorSchedulesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Add Schedule Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState('Saturday');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('20:00');
  const [maxSerialCapacity, setMaxSerialCapacity] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Fetch Doctors
  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['doctors-list-for-schedules'],
    queryFn: async () => {
      const res = await api.get('/doctors');
      return res.data.data;
    },
  });

  // Fetch All Schedules
  const { data: schedules, isLoading } = useQuery<Schedule[]>({
    queryKey: ['admin-schedules'],
    queryFn: async () => {
      const res = await api.get('/doctor-schedules');
      return res.data.data;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => api.post('/doctor-schedules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-schedules'] });
      setIsModalOpen(false);
      setError(null);
      setMaxSerialCapacity('');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create schedule'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/doctor-schedules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-schedules'] }),
  });

  // GROUP SCHEDULES BY DOCTOR (1 Doctor = 1 Master Box)
  const doctorScheduleGroups = React.useMemo(() => {
    if (!doctors) return [];
    
    // Map each doctor with their list of schedules
    const groups = doctors.map((doc) => {
      const docSchedules = schedules?.filter((s) => s.doctor?._id === doc._id) || [];
      return {
        doctor: doc,
        schedules: docSchedules,
      };
    });

    // Apply search filter
    if (!searchTerm.trim()) return groups;
    return groups.filter(
      (g) =>
        g.doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.doctor.department?.name && g.doctor.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [doctors, schedules, searchTerm]);

  const openAddForDoctor = (docId: string) => {
    setSelectedDoctorId(docId);
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId) {
      setError('Please select a doctor');
      return;
    }
    createMutation.mutate({
      doctor: selectedDoctorId,
      dayOfWeek,
      startTime,
      endTime,
      maxSerialCapacity: maxSerialCapacity ? Number(maxSerialCapacity) : null,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Doctor Weekly Chamber Schedules</h1>
          <p className="text-xs text-slate-500 mt-1">
            Grouped by doctor. Add visiting days, set morning/evening hours, and manage serial limits easily.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDoctorId(doctors?.[0]?._id || '');
            setIsModalOpen(true);
          }}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Chamber Slot
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name or specialty..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          />
        </div>
      </div>

      {/* GROUPED DOCTOR CARDS (1 DOCTOR = 1 BOX) */}
      {isLoading ? (
        <div className="text-center py-20 text-xs text-slate-400">Loading doctor schedules...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctorScheduleGroups.map(({ doctor, schedules }) => (
            <div
              key={doctor._id}
              className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Doctor Head Info */}
                <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <img
                      src={doctor.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                      alt={doctor.name}
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-200 shadow shrink-0"
                    />
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                        {doctor.department?.name || 'Specialist'}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{doctor.name}</h3>
                      <p className="text-[10px] text-slate-400">Chamber: {doctor.chamberRoom || 'Room N/A'}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => openAddForDoctor(doctor._id)}
                    className="p-2 text-[#00984a] bg-emerald-50 hover:bg-emerald-100 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    title="Add another day/time slot for this doctor"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Slot</span>
                  </button>
                </div>

                {/* Day Slots List */}
                <div className="space-y-2">
                  {schedules.length > 0 ? (
                    schedules.map((sch) => (
                      <div
                        key={sch._id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 text-xs transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                            {sch.dayOfWeek}
                          </span>
                          <span className="text-slate-600 font-semibold flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-[#00984a]" /> {sch.startTime} - {sch.endTime}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500">
                            {sch.maxSerialCapacity ? `Max: ${sch.maxSerialCapacity}` : 'No Limit'}
                          </span>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${sch.dayOfWeek} schedule for ${doctor.name}?`)) {
                                deleteMutation.mutate(sch._id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition"
                            title="Delete this day schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-2xl text-xs border border-dashed border-slate-200">
                      No weekly schedules configured yet. Click "Add Slot" to add.
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Summary */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                <span>Active Slots: {schedules.length} Sessions</span>
                <span className="text-emerald-700 font-bold">● Active Routine</span>
              </div>
            </div>
          ))}

          {doctorScheduleGroups.length === 0 && (
            <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
              No doctors found matching your query.
            </div>
          )}
        </div>
      )}

      {/* ADD SCHEDULE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#00984a]" /> Add Chamber Day & Time
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Doctor *</label>
                <select
                  required
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                >
                  <option value="">Select a Doctor</option>
                  {doctors?.map((d) => (
                    <option key={d._id} value={d._id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1">Day of Week (বার) *</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                >
                  {DAYS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Start Time *</label>
                  <input
                    type="text"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="17:00"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">End Time *</label>
                  <input
                    type="text"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="20:30"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Max Serial Capacity (ঐচ্ছিক - খালি রাখলে আনলিমিটেড)</label>
                <input
                  type="number"
                  min={1}
                  value={maxSerialCapacity}
                  onChange={(e) => setMaxSerialCapacity(e.target.value)}
                  placeholder="যেমন: 20 (খালি রাখুন)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-1/2 bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Saving...' : 'Add Slot'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};