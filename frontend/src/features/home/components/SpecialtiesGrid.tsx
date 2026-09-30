import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Building2, 
  ArrowRight, 
  Sparkles,
  Activity
} from 'lucide-react';
import api from '@/lib/axios';

interface Department {
  _id: string;
  name: string;
  bnName?: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
}

export const SpecialtiesGrid: React.FC = () => {
  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['public-departments'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
  });

  return (
    <section className="py-12 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#006642] bg-[#f0fdf4] px-3.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00984a]" /> Specialized Clinical Consultation
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Our Medical Departments & Clinical Specialties
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="h-1 bg-[#00984a] w-12 rounded-full" />
            <div className="h-1 bg-emerald-200 w-6 rounded-full" />
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading departments...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {departments && departments.length > 0 ? (
              departments.map((item) => (
                <Link
                  key={item._id}
                  to={`/doctors?departmentId=${item._id}`}
                  className="p-3.5 sm:p-6 rounded-3xl border-2 border-slate-100 bg-white hover:border-[#00984a] hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {item.iconUrl ? (
                      <img src={item.iconUrl} alt={item.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover mb-3 shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 text-[#00984a] group-hover:bg-[#00984a] group-hover:text-white transition-all duration-300 flex items-center justify-center mb-3 shadow-xs p-2.5">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    )}

                    <h4 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-[#00984a] transition leading-snug truncate">
                      {item.name}
                    </h4>
                    {item.bnName && (
                      <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-700 mt-0.5 truncate">
                        {item.bnName}
                      </p>
                    )}
                    <p className="text-[9px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Specialist consultation & diagnosis'}
                    </p>
                  </div>

                  {/* FIXED COMPACT RESPONSIVE BOTTOM ROW (PERFECT FIT ON ALL MOBILES) */}
                  <div className="mt-3 sm:mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] sm:text-xs">
                    <span className="font-bold text-[#00984a] truncate pr-1">Specialist Unit</span>
                    <span className="text-slate-400 group-hover:text-[#00984a] flex items-center gap-0.5 font-bold shrink-0">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-xs text-slate-400">
                No active departments found.
              </div>
            )}
          </div>
        )}

        {/* View All Departments Button */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            to="/departments"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdf4] text-[#00984a] border-2 border-[#00984a] font-black text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-xs transition active:scale-95"
          >
            <span>View All Medical Departments</span>
            <ArrowRight className="w-4 h-4 text-[#00984a]" />
          </Link>
        </div>
      </div>
    </section>
  );
};