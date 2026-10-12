import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarDays, Search, MapPin, ArrowRight, Eye, X, Building2 } from 'lucide-react';
import api from '@/lib/axios';

interface Department {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  name: string;
  department: Department;
  qualification: string;
  specialization: string;
  workplace?: string;
  consultationFee: number;
  chamberRoom: string;
  availableDays?: string[];
  phone: string;
  photoUrl: string;
  isActive: boolean;
}

interface SystemSettings {
  showDoctorFees: boolean;
}

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TodayDoctorsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDept = searchParams.get('departmentId') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

  const currentDayName = DAYS_MAP[new Date().getDay()];
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
  });

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['today-page-doctors', searchTerm, selectedDept],
    queryFn: async () => {
      let url = `/doctors?status=active&search=${searchTerm}`;
      if (selectedDept) url += `&departmentId=${selectedDept}`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const todayDoctors = React.useMemo(() => {
    if (!doctors) return [];
    return doctors.filter((doc) => {
      if (!doc.availableDays || doc.availableDays.length === 0) return true;
      return doc.availableDays.includes(currentDayName);
    });
  }, [doctors, currentDayName]);

  const showFee = settings?.showDoctorFees !== false;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10 pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-5 sm:p-8 text-white mb-6 sm:mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5" /> {todayFormatted}
            </span>
            <h1 className="text-xl sm:text-3xl font-black mt-2">Today's Available Doctors</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Specialist consultants conducting active chambers at Care Point today.
            </p>
          </div>
          <Link
            to="/doctors"
            className="bg-white hover:bg-slate-100 text-[#00984a] font-black text-xs px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow transition shrink-0"
          >
            Browse All Specialists
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search today's doctor by name..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSearchParams(e.target.value ? { departmentId: e.target.value } : {});
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          >
            <option value="">All Departments (সকল বিভাগ)</option>
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* DOCTORS GRID: 2 PER ROW ON MOBILE */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-slate-400">Loading today's available doctors...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {todayDoctors.length > 0 ? (
              todayDoctors.map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-5 shadow-sm hover:shadow-xl hover:border-[#00984a] transition-all flex flex-col justify-between group"
                >
                  <div 
                    onClick={() => setSelectedDoctorModal(doc)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5 mb-3">
                      <img
                        src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                        alt={doc.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-emerald-300 shadow shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0 w-full">
                        <span className="text-[8px] sm:text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-1.5 py-0.5 rounded block sm:inline-block truncate">
                          {doc.department?.name || 'Department'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 truncate group-hover:text-[#00984a] transition leading-tight">
                          {doc.name}
                        </h3>
                        {doc.workplace && (
                          <p className="text-[8.5px] sm:text-[10px] text-emerald-800 font-bold truncate mt-0.5">
                            {doc.workplace}
                          </p>
                        )}
                        <p className="text-[9px] sm:text-[11px] text-slate-400 truncate mt-0.5">{doc.qualification}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-[9px] sm:text-xs text-slate-600 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 mb-3">
                      <p className="flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#00984a] shrink-0" /> Chamber:{' '}
                        <strong className="text-slate-800 truncate">{doc.chamberRoom}</strong>
                      </p>
                      {showFee ? (
                        <p className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                          <span>Visit Fee:</span>{' '}
                          <strong className="text-slate-900 font-black">৳{doc.consultationFee}</strong>
                        </p>
                      ) : (
                        <p className="text-emerald-700 font-bold">● Active Today</p>
                      )}
                    </div>
                  </div>

                  {/* Actions: View Info Modal + Book Button */}
                  <div className="flex gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedDoctorModal(doc)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs transition"
                      title="View Full Profile"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#00984a]" />
                    </button>
                    <Link to={`/doctors/${doc._id}/book`} className="flex-1">
                      <button className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-2 rounded-xl text-[10px] sm:text-xs transition active:scale-95 flex items-center justify-center gap-1 shadow-xs">
                        <span>Book Serial</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                আজ ({currentDayName}) নির্বাচিত ক্যাটাগরিতে কোনো ডাক্তার উপস্থিত নেই।
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🌟 DOCTOR POPUP DETAILS MODAL */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs font-medium text-slate-700 animate-in zoom-in-95 relative">
            <button
              onClick={() => setSelectedDoctorModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 pb-4 border-b">
              <img
                src={selectedDoctorModal.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                alt={selectedDoctorModal.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md ring-2 ring-emerald-300 shrink-0"
              />
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedDoctorModal.department?.name}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                  {selectedDoctorModal.name}
                </h3>
                {selectedDoctorModal.workplace && (
                  <p className="text-xs font-bold text-emerald-800 flex items-center justify-center sm:justify-start gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{selectedDoctorModal.workplace}</span>
                  </p>
                )}
                <p className="text-xs text-slate-500 font-semibold">{selectedDoctorModal.specialization}</p>
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Degrees & Qualifications</p>
                <p className="text-xs font-bold text-slate-800 whitespace-pre-line leading-relaxed">
                  {selectedDoctorModal.qualification}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Chamber Room</span>
                  <strong className="text-slate-900 font-bold">{selectedDoctorModal.chamberRoom}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span>
                  <strong className="text-[#00984a] font-black">৳{selectedDoctorModal.consultationFee}</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Available Days in Week</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {selectedDoctorModal.availableDays?.length ? selectedDoctorModal.availableDays.join(', ') : 'Saturday to Thursday'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                to={`/doctors/${selectedDoctorModal._id}/book`}
                className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-3 rounded-2xl text-xs sm:text-sm transition shadow flex items-center justify-center gap-1.5"
              >
                <span>Book Serial Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};