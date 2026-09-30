import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, CalendarDays, ArrowRight } from 'lucide-react';
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

export const FeaturedDoctors: React.FC = () => {
  const dateObj = new Date();
  const currentDayName = DAYS_MAP[dateObj.getDay()];

  // Desktop full formatted date (No duplicate weekday!)
  const desktopDateFormatted = dateObj.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Mobile compact formatted date (Fits 100% on any small screen)
  const mobileDateFormatted = dateObj.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['public-featured-doctors'],
    queryFn: async () => {
      const res = await api.get('/doctors?status=active');
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
    <section className="py-12 sm:py-16 bg-[#f8fafc] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* CENTERED HEADER (100% RESPONSIVE DATE BADGE) */}
        <div className="text-center max-w-3xl mx-auto mb-8 pb-4 border-b border-slate-200">
          
          {/* RESPONSIVE BADGE: Compact on Mobile, Full on Desktop */}
          <div className="inline-flex items-center gap-1.5 text-[9.5px] sm:text-xs font-bold text-[#006642] bg-emerald-100/90 px-3 py-1 rounded-full mb-2 max-w-full shadow-2xs">
            <CalendarDays className="w-3.5 h-3.5 text-[#00984a] shrink-0" />
            
            {/* Mobile View Date */}
            <span className="sm:hidden whitespace-nowrap">
              {mobileDateFormatted} • আজকের শিডিউল
            </span>

            {/* Desktop View Date */}
            <span className="hidden sm:inline whitespace-nowrap">
              {desktopDateFormatted} • আজকের চেম্বার শিডিউল
            </span>
          </div>
          
          <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Today's Available Doctors Schedule
          </h2>

          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="h-1 bg-[#00984a] w-14 rounded-full" />
            <div className="h-1 bg-emerald-300 w-7 rounded-full" />
          </div>
        </div>

        {/* Doctor Cards Grid */}
        {isLoading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading today's available specialists...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {todayDoctors.length > 0 ? (
              todayDoctors.slice(0, 8).map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-[#00984a] transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-center sm:items-start text-center sm:text-left">
                      <img
                        src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                        alt={doc.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border-2 border-[#00984a]/30 shadow shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-1.5 py-0.5 rounded block sm:inline-block truncate">
                          {doc.department?.name || 'Specialist'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 leading-tight truncate group-hover:text-[#00984a] transition">
                          {doc.name}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate mt-0.5">{doc.qualification}</p>
                      </div>
                    </div>

                    <div className="mt-3 space-y-1 text-[9px] sm:text-xs bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="flex items-center gap-1 text-slate-500 font-medium">
                          <MapPin className="w-3 h-3 text-[#00984a] shrink-0" /> Chamber:
                        </span>
                        <span className="font-bold text-slate-800 truncate">{doc.chamberRoom}</span>
                      </div>
                      
                      {showFee ? (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1 text-slate-500 font-medium">
                            Fee:
                          </span>
                          <span className="font-black text-slate-900">৳{doc.consultationFee}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-slate-700">
                          <span className="flex items-center gap-1 text-slate-500 font-medium">
                            Status:
                          </span>
                          <span className="font-bold text-emerald-600">Available Today</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Book Button */}
                  <div className="p-2 sm:px-4 sm:py-3 bg-slate-50/80 border-t border-slate-100">
                    <Link to={`/doctors/${doc._id}/book`} className="w-full">
                      <button className="w-full bg-brand-gradient hover:opacity-95 text-white font-black text-[10px] sm:text-xs py-2 rounded-xl transition active:scale-95 flex items-center justify-center gap-1">
                        <span>Book Serial</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                আজ ({currentDayName}) কোনো ডাক্তারের শিডিউল নেই।
              </div>
            )}
          </div>
        )}

        {/* CLEAN BLANK / OUTLINE BUTTON */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            to="/today-doctors"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdf4] text-[#00984a] border-2 border-[#00984a] font-black text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-xs transition active:scale-95"
          >
            <span>View All Available Doctors for Today</span>
            <ArrowRight className="w-4 h-4 text-[#00984a]" />
          </Link>
        </div>
      </div>
    </section>
  );
};