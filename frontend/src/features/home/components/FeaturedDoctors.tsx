import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, 
  CalendarDays, 
  ArrowRight, 
  Stethoscope, 
  Building2, 
  X, 
  Eye, 
  User 
} from 'lucide-react';
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

export const FeaturedDoctors: React.FC = () => {
  const [selectedDoctorModal, setSelectedDoctorModal] = useState<Doctor | null>(null);

  // 📅 Responsive Formatted Dates for Desktop & Mobile
  const dateObj = new Date();
  const dayIndex = dateObj.getDay();
  const enDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex];
  const bnDay = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'][dayIndex];
  const bnShort = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহস্পতি', 'শুক্র', 'শনি'][dayIndex];

  // ডেস্কটপের জন্য সম্পূর্ণ তারিখ
  const desktopDateFormatted = dateObj.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // 📱 মোবাইলের জন্য পারফেক্ট ফিট ছোট তারিখ (e.g. "3 Oct, Sat")
  const mobileDateFormatted = dateObj.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['public-doctors'],
    queryFn: async () => {
      const res = await api.get('/doctors?status=active');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  const showFee = settings?.showDoctorFees !== false;

  // 🌟 ACCURATE TODAY AVAILABILITY FILTER
  const checkDoctorAvailableToday = (doc: Doctor) => {
    if (!doc.availableDays || doc.availableDays.length === 0) return true;
    return doc.availableDays.some((d) => {
      const lower = d.toLowerCase();
      return lower.includes(enDay.toLowerCase()) || d.includes(bnDay) || d.includes(bnShort);
    });
  };

  // 🎯 FILTER TODAY'S LIVE DOCTORS (MAX 8 FOR 2 LINES ON DESKTOP, 6 ON MOBILE)
  const todayLiveDoctors = useMemo(() => {
    if (!doctors) return [];
    
    const liveList = doctors.filter((doc) => checkDoctorAvailableToday(doc));
    
    if (liveList.length === 0) {
      return doctors.slice(0, 8);
    }
    
    return liveList.slice(0, 8);
  }, [doctors, enDay, bnDay, bnShort]);

  return (
    <section className="py-8 sm:py-16 bg-[#f8fafc] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* 🌟 1. RESPONSIVE HEADER WITH ZERO-OVERFLOW MOBILE DATE BADGE */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-xs font-bold text-[#006642] bg-emerald-100/90 px-3 py-1 rounded-full mb-2 shadow-2xs max-w-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00984a]"></span>
            </span>
            <CalendarDays className="w-3.5 h-3.5 text-[#00984a] shrink-0" />
            {/* 📱 মোবাইলে ছোট ও ফিট তারিখ */}
            <span className="sm:hidden font-mono">{mobileDateFormatted} • আজকের চেম্বার</span>
            {/* 💻 ডেস্কটপে পূর্ণাঙ্গ তারিখ */}
            <span className="hidden sm:inline">{desktopDateFormatted} • আজকের উপস্থিত ডাক্তার</span>
          </div>
          
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Today's Available Doctors
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Book serial with specialist consultants available in chamber today.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="h-1 bg-[#00984a] w-12 sm:w-14 rounded-full" />
            <div className="h-1 bg-emerald-300 w-6 sm:w-7 rounded-full" />
          </div>
        </div>

        {/* 📱 2 CARDS PER ROW ON MOBILE (grid-cols-2), 8 CARDS ON DESKTOP (lg:grid-cols-4) */}
        {isLoading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading today's available doctors...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {todayLiveDoctors.length > 0 ? (
              todayLiveDoctors.map((doc, index) => {
                const isSittingToday = checkDoctorAvailableToday(doc);
                const isExtraOnMobile = index >= 6;

                return (
                  <div
                    key={doc._id}
                    className={`bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-5 shadow-sm hover:shadow-xl hover:border-[#00984a] transition-all duration-300 flex-col justify-between group ${
                      isExtraOnMobile ? 'hidden lg:flex' : 'flex'
                    }`}
                  >
                    {/* Top Content Clickable to Open Details Modal */}
                    <div 
                      onClick={() => setSelectedDoctorModal(doc)}
                      className="cursor-pointer"
                    >
                      <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3.5 mb-2 sm:mb-3">
                        <div className="relative shrink-0">
                          {doc.photoUrl ? (
                            <img
                              src={doc.photoUrl}
                              alt={doc.name}
                              className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-[#00984a]/30 shadow shrink-0 group-hover:scale-105 transition"
                            />
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold border-2 border-emerald-200 shrink-0">
                              <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                          )}
                          {isSittingToday && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-xs" title="Chamber Active Today" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 w-full">
                          <span className="text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-1.5 py-0.5 rounded inline-block truncate max-w-full">
                            {doc.department?.name || 'Specialist'}
                          </span>
                          
                          <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 leading-tight truncate group-hover:text-[#00984a] transition">
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
                              Regular Schedule
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-2 space-y-1 text-[9px] sm:text-xs bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 mb-2">
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1 text-slate-500 text-[9.5px] sm:text-[11px] font-medium">
                            <MapPin className="w-3 h-3 text-[#00984a]" /> Chamber:
                          </span>
                          <span className="font-bold text-slate-800 text-[9.5px] sm:text-[11px] truncate">{doc.chamberRoom}</span>
                        </div>
                        
                        {showFee && (
                          <div className="flex items-center justify-between text-slate-700 pt-0.5 border-t border-slate-200/60">
                            <span className="text-slate-500 text-[9.5px] sm:text-[11px] font-medium">Fee:</span>
                            <span className="font-black text-slate-900 text-[10px] sm:text-xs">৳{doc.consultationFee}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 🌟 2. PERFECT-FITTED ACTION BUTTONS (NO CRAMPED TEXT) */}
                    <div className="p-1 pt-1.5 border-t border-slate-100 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDoctorModal(doc)}
                        className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-[10px] sm:text-xs font-bold transition flex items-center justify-center gap-0.5 shadow-2xs hover:border-[#00984a] cursor-pointer shrink-0"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00984a]" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <Link to={`/doctors/${doc._id}/book`} className="flex-1 min-w-0">
                        <button className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-1.5 sm:py-2.5 px-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs transition active:scale-95 flex items-center justify-center gap-1 shadow-xs cursor-pointer truncate">
                          <span>{isSittingToday ? 'Book' : 'Serial'}</span>
                          <ArrowRight className="w-3 h-3 shrink-0" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                আজকের তারিখে চেম্বারে কোনো ডাক্তারের শিডিউল পাওয়া যায়নি।
              </div>
            )}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdf4] text-[#00984a] border-2 border-[#00984a] font-black text-xs sm:text-sm px-7 sm:px-8 py-3 sm:py-3.5 rounded-2xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>View All Specialist Doctors (সকল ডাক্তার দেখুন)</span>
            <ArrowRight className="w-4 h-4 text-[#00984a]" />
          </Link>
        </div>
      </div>

      {/* DOCTOR DETAILS POPUP MODAL */}
      {selectedDoctorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs font-medium text-slate-700 animate-in zoom-in-95 relative">
            <button
              onClick={() => setSelectedDoctorModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 pb-4 border-b">
              {selectedDoctorModal.photoUrl ? (
                <img
                  src={selectedDoctorModal.photoUrl}
                  alt={selectedDoctorModal.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-md ring-2 ring-emerald-300 shrink-0"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold border-2 border-emerald-200 shrink-0">
                  <User className="w-10 h-10" />
                </div>
              )}
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

                {checkDoctorAvailableToday(selectedDoctorModal) && (
                  <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Available in Chamber Today
                  </span>
                )}
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
                <span className="text-[10px] text-emerald-800 uppercase font-bold block">Chamber Days in Week</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5">
                  {selectedDoctorModal.availableDays?.length ? selectedDoctorModal.availableDays.join(', ') : 'Saturday to Thursday'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Link
                to={`/doctors/${selectedDoctorModal._id}/book`}
                className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-3 rounded-2xl text-xs sm:text-sm transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Book Serial Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default FeaturedDoctors;