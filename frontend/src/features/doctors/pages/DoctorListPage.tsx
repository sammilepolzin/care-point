import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, MapPin, Calendar, ArrowRight, Stethoscope, Eye, X, Building2, User } from 'lucide-react';
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
  photoUrl?: string;
  isActive: boolean;
}

interface SystemSettings {
  showDoctorFees: boolean;
}

export const DoctorListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDept = searchParams.get('departmentId') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState(initialDept);
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

  const dayIndex = new Date().getDay();
  const enDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
  const bnDay = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'][dayIndex];
  const bnShort = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'][dayIndex];

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['public-doctors', searchTerm, selectedDept],
    queryFn: async () => {
      let url = `/doctors?status=active&search=${searchTerm}`;
      if (selectedDept) url += `&departmentId=${selectedDept}`;
      const res = await api.get(url);
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const showFee = settings?.showDoctorFees !== false;

  const checkDoctorAvailableToday = (doc: Doctor) => {
    if (!doc.availableDays || doc.availableDays.length === 0) return true;
    return doc.availableDays.some((d) => {
      const lower = d.toLowerCase();
      return lower.includes(enDay.toLowerCase()) || d.includes(bnDay) || d.includes(bnShort);
    });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10 pb-24">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white mb-6 sm:mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              Specialist Directory
            </span>
            <h1 className="text-xl sm:text-3xl font-black mt-2">All Specialist Doctors</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Find specialist professors, consultants, and physicians across all clinical departments.
            </p>
          </div>
          <Link
            to="/today-doctors"
            className="bg-white hover:bg-slate-100 text-[#00984a] font-black text-xs px-4 sm:px-5 py-2.5 rounded-2xl shadow transition shrink-0"
          >
            Today's Available Doctors
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm mb-6 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search doctor by name or specialization..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSearchParams(e.target.value ? { departmentId: e.target.value } : {});
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a] cursor-pointer"
          >
            <option value="">All Departments (সকল বিভাগ)</option>
            {departments?.map((d) => (
              <option key={d._id} value={d._id}>{d.name}</option>
            ))}
          </select>
        </div>

        {/* 📱 2 CARDS PER ROW ON MOBILE (grid-cols-2) EXACTLY LIKE TEST PAGE */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-slate-400">Loading specialist doctors...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5">
            {doctors && doctors.length > 0 ? (
              doctors.map((doc) => {
                const isSittingToday = checkDoctorAvailableToday(doc);

                return (
                  <div
                    key={doc._id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-5 shadow-sm hover:shadow-xl hover:border-[#00984a] transition-all flex flex-col justify-between group"
                  >
                    {/* Clickable Card Body */}
                    <div onClick={() => setSelectedDoctorModal(doc)} className="cursor-pointer">
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5 mb-2.5 sm:mb-3">
                        <div className="relative shrink-0">
                          {doc.photoUrl ? (
                            <img
                              src={doc.photoUrl}
                              alt={doc.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-emerald-300 shadow shrink-0 group-hover:scale-105 transition"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold border-2 border-emerald-200 shrink-0">
                              <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                          )}
                          {isSittingToday && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" title="Available Today" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 w-full">
                          <span className="text-[8px] sm:text-[9.5px] font-black uppercase text-[#00984a] bg-emerald-50 px-1.5 py-0.5 rounded inline-block truncate max-w-full">
                            {doc.department?.name || 'Specialist'}
                          </span>
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 truncate group-hover:text-[#00984a] transition leading-tight">
                            {doc.name}
                          </h3>
                          {doc.workplace && (
                            <p className="text-[8.5px] sm:text-[10px] text-emerald-800 font-bold truncate mt-0.5">
                              {doc.workplace}
                            </p>
                          )}
                          <p className="text-[8.5px] sm:text-[10px] text-slate-400 truncate mt-0.5">{doc.qualification}</p>

                          {isSittingToday ? (
                            <span className="text-[7.5px] sm:text-[8.5px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5 mt-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Today
                            </span>
                          ) : (
                            <span className="text-[8px] text-slate-400 font-semibold block mt-0.5 truncate">
                              Schedule Days
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1 text-[9px] sm:text-xs text-slate-600 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 mb-2.5">
                        <p className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">Chamber:</span>
                          <strong className="text-slate-800 truncate">{doc.chamberRoom}</strong>
                        </p>
                        {showFee && (
                          <p className="flex items-center justify-between pt-0.5 border-t border-slate-200/80">
                            <span className="text-slate-500 font-medium">Fee:</span>
                            <strong className="text-slate-900 font-black">৳{doc.consultationFee}</strong>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions: View + Book */}
                    <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setSelectedDoctorModal(doc)}
                        className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 shadow-2xs hover:border-[#00984a] cursor-pointer"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00984a]" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <Link to={`/doctors/${doc._id}/book`} className="flex-1">
                        <button className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition active:scale-95 flex items-center justify-center gap-1 shadow-xs cursor-pointer">
                          <span>{isSittingToday ? 'Book' : 'Serial'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No doctors found matching your criteria.
              </div>
            )}
          </div>
        )}
      </div>

      {/* DOCTOR POPUP DETAILS MODAL */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs font-medium text-slate-700 animate-in zoom-in-95 relative">
            <button onClick={() => setSelectedDoctorModal(null)} className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"><X className="w-5 h-5" /></button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 pb-4 border-b">
              {selectedDoctorModal.photoUrl ? (
                <img src={selectedDoctorModal.photoUrl} alt={selectedDoctorModal.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md ring-2 ring-emerald-300 shrink-0" />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold border-2 border-emerald-200 shrink-0"><User className="w-10 h-10" /></div>
              )}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">{selectedDoctorModal.department?.name}</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">{selectedDoctorModal.name}</h3>
                {selectedDoctorModal.workplace && <p className="text-xs font-bold text-emerald-800 flex items-center justify-center sm:justify-start gap-1"><Building2 className="w-3.5 h-3.5" /><span>{selectedDoctorModal.workplace}</span></p>}
                <p className="text-xs text-slate-500 font-semibold">{selectedDoctorModal.specialization}</p>
                {checkDoctorAvailableToday(selectedDoctorModal) && (
                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Available in Chamber Today
                  </span>
                )}
              </div>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Degrees & Qualifications</p>
                <p className="text-xs font-bold text-slate-800 whitespace-pre-line leading-relaxed">{selectedDoctorModal.qualification}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border"><span className="text-[10px] text-slate-400 uppercase font-bold block">Chamber Room</span><strong className="text-slate-900 font-bold">{selectedDoctorModal.chamberRoom}</strong></div>
                <div className="p-3 bg-slate-50 rounded-xl border"><span className="text-[10px] text-slate-400 uppercase font-bold block">Consultation Fee</span><strong className="text-[#00984a] font-black">৳{selectedDoctorModal.consultationFee}</strong></div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Chamber Days in Week</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">{selectedDoctorModal.availableDays?.length ? selectedDoctorModal.availableDays.join(', ') : 'Saturday to Thursday'}</p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link to={`/doctors/${selectedDoctorModal._id}/book`} className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-3 rounded-2xl text-xs sm:text-sm transition shadow flex items-center justify-center gap-1.5">
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

export default DoctorListPage;