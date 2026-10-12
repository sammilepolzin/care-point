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
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section className="py-8 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Centered Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-xs font-bold text-[#006642] bg-emerald-100/90 px-3.5 py-1 rounded-full mb-2 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#00984a] shrink-0" />
            <span>Specialized Clinical Consultation • বিশেষজ্ঞ বিভাগ</span>
          </div>
          
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Our Medical Departments & Clinical Specialties
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Find specialist doctors and consultants categorized by medical departments.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="h-1 bg-[#00984a] w-12 sm:w-14 rounded-full" />
            <div className="h-1 bg-emerald-300 w-6 sm:w-7 rounded-full" />
          </div>
        </div>

        {/* 📱 2 CARDS PER ROW ON MOBILE (grid-cols-2) PERFECTLY FITTED */}
        {isLoading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading departments...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {departments && departments.length > 0 ? (
              departments.map((item) => (
                <Link
                  key={item._id}
                  to={`/doctors?departmentId=${item._id}`}
                  className="p-3 sm:p-5 rounded-2xl sm:rounded-3xl border-2 border-slate-100 bg-[#f8fafc] hover:border-[#00984a] hover:bg-white hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {item.iconUrl ? (
                      <img 
                        src={item.iconUrl} 
                        alt={item.name} 
                        className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl object-cover mb-2.5 shadow-xs" 
                      />
                    ) : (
                      <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] group-hover:bg-[#00984a] group-hover:text-white transition-all duration-300 flex items-center justify-center mb-2.5 shadow-xs p-2">
                        <Activity className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                    )}

                    <h4 className="text-xs sm:text-base font-bold text-slate-900 group-hover:text-[#00984a] transition leading-tight truncate">
                      {item.name}
                    </h4>
                    
                    {item.bnName && (
                      <p className="text-[9.5px] sm:text-[11px] font-semibold text-emerald-700 mt-0.5 truncate">
                        {item.bnName}
                      </p>
                    )}

                    <p className="text-[8.5px] sm:text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Specialist consultation & diagnosis'}
                    </p>
                  </div>

                  {/* Bottom Compact Action Row */}
                  <div className="mt-2.5 sm:mt-4 pt-1.5 sm:pt-2 border-t border-slate-200/70 flex items-center justify-between text-[8.5px] sm:text-xs">
                    <span className="font-bold text-[#00984a] truncate pr-1">Specialist Unit</span>
                    <span className="text-slate-400 group-hover:text-[#00984a] flex items-center gap-0.5 font-bold shrink-0">
                      <span>View</span>
                      <ArrowRight className="w-3 h-3 shrink-0" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-xs text-slate-400">
                No active departments found.
              </div>
            )}
          </div>
        )}

        {/* View All Departments Button */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            to="/departments"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdf4] text-[#00984a] border-2 border-[#00984a] font-black text-xs sm:text-sm px-7 sm:px-8 py-3 sm:py-3.5 rounded-2xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>View All Medical Departments (সকল বিভাগ দেখুন)</span>
            <ArrowRight className="w-4 h-4 text-[#00984a]" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SpecialtiesGrid;