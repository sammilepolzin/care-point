import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Stethoscope, MapPin, Calendar, ArrowRight, Sparkles } from 'lucide-react';
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

export const AllDoctorsSection: React.FC = () => {
  const [selectedDeptId, setSelectedDeptId] = useState<string>('ALL');

  // 1. Fetch Global Settings for Fee Visibility
  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  // 2. Fetch Active Departments
  const { data: departments } = useQuery<Department[]>({
    queryKey: ['public-departments'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
  });

  // 3. Fetch All Active Doctors
  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['public-all-doctors-section'],
    queryFn: async () => {
      const res = await api.get('/doctors?status=active');
      return res.data.data;
    },
  });

  const showFee = settings?.showDoctorFees !== false;

  // Filter by selected department tab
  const filteredDoctors = React.useMemo(() => {
    if (!doctors) return [];
    if (selectedDeptId === 'ALL') return doctors;
    return doctors.filter((doc) => doc.department?._id === selectedDeptId);
  }, [doctors, selectedDeptId]);

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Centered Header */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#006642] bg-[#f0fdf4] px-3.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00984a]" /> Senior Medical Consultants & Professors
          </span>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 mt-2 tracking-tight">
            Our Specialist Doctor Panel
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Consult with renowned specialist physicians across cardiology, neurology, medicine, surgery & gynecology.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="h-1 bg-[#00984a] w-12 rounded-full" />
            <div className="h-1 bg-emerald-200 w-6 rounded-full" />
          </div>
        </div>

        {/* Department Filter Pills */}
        {departments && departments.length > 0 && (
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
            <button
              onClick={() => setSelectedDeptId('ALL')}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                selectedDeptId === 'ALL'
                  ? 'bg-brand-gradient text-white shadow-md'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-[#00984a]'
              }`}
            >
              All Specialists
            </button>
            {departments.map((dept) => (
              <button
                key={dept._id}
                onClick={() => setSelectedDeptId(dept._id)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                  selectedDeptId === dept._id
                    ? 'bg-brand-gradient text-white shadow-md'
                    : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-[#00984a]'
                }`}
              >
                {dept.name}
              </button>
            ))}
          </div>
        )}

        {/* Doctor Grid (2 on mobile, 4 on desktop) */}
        {isLoading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading specialist doctors...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredDoctors.length > 0 ? (
              filteredDoctors.slice(0, 8).map((doc) => (
                <div
                  key={doc._id}
                  className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-100 p-3.5 sm:p-5 shadow-sm hover:shadow-xl hover:border-[#00984a] transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex flex-col sm:flex-row gap-2.5 items-center sm:items-start text-center sm:text-left mb-3">
                      <img
                        src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                        alt={doc.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl object-cover border-2 border-emerald-300 shadow shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-1.5 py-0.5 rounded block sm:inline-block truncate">
                          {doc.department?.name || 'Department'}
                        </span>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-1 leading-snug truncate group-hover:text-[#00984a] transition">
                          {doc.name}
                        </h3>
                        <p className="text-[9px] sm:text-[10px] text-slate-400 truncate mt-0.5">{doc.qualification}</p>
                      </div>
                    </div>

                    <div className="space-y-1 text-[9px] sm:text-[11px] text-slate-600 bg-slate-50 p-2 sm:p-2.5 rounded-xl border border-slate-100 mb-3">
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3 h-3 text-[#00984a] shrink-0" /> Chamber:{' '}
                        <strong className="text-slate-800">{doc.chamberRoom}</strong>
                      </p>
                      <p className="flex items-center gap-1.5 truncate">
                        <Calendar className="w-3 h-3 text-[#00984a] shrink-0" /> Days:{' '}
                        <strong className="text-slate-800 truncate">
                          {doc.availableDays?.join(', ') || 'Sat, Sun, Mon'}
                        </strong>
                      </p>
                      {showFee && (
                        <p className="flex items-center gap-1.5 truncate pt-1 border-t border-slate-200/80">
                          <span className="text-slate-500 font-medium">Consultation Fee:</span>{' '}
                          <strong className="text-slate-900 font-black">৳{doc.consultationFee}</strong>
                        </p>
                      )}
                    </div>
                  </div>

                  <Link to={`/doctors/${doc._id}/book`} className="w-full">
                    <button className="w-full bg-brand-gradient hover:opacity-95 text-white font-black text-[10px] sm:text-xs py-2 rounded-xl transition active:scale-95 flex items-center justify-center gap-1.5 shadow-md">
                      <span>Book Chamber Serial</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No doctors available in this department currently.
              </div>
            )}
          </div>
        )}

        {/* View All Button */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdf4] text-[#00984a] border-2 border-[#00984a] font-black text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-sm transition active:scale-95"
          >
            <span>Browse Complete Doctors Directory</span>
            <ArrowRight className="w-4 h-4 text-[#00984a]" />
          </Link>
        </div>
      </div>
    </section>
  );
};