import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Cpu, ShieldCheck, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';

export const TechnologiesPage: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const technologies = settings?.technologies || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-12 pb-24 space-y-6 sm:space-y-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-2xl sm:rounded-3xl p-5 sm:p-12 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 sm:px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-amber-300" /> Cutting-Edge Instrumentation
          </span>
          <h1 className="text-xl sm:text-4xl font-black mt-2">Our Modern Diagnostic Technologies</h1>
          <p className="text-emerald-100 text-[10px] sm:text-sm mt-1 sm:mt-2 max-w-xl mx-auto leading-snug">
            Discover the international gold-standard automated clinical analyzers and digital imaging suites powering Care Point.
          </p>
        </div>

        {/* Technologies Grid: Exactly 2 Columns on Mobile */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {technologies.length > 0 ? (
            technologies.map((tech: any, idx: number) => {
              const techId = tech.id || `tech-${idx}`;

              return (
                <div 
                  key={techId} 
                  className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-xl hover:border-[#00984a] transition-all group"
                >
                  <div>
                    {tech.imageUrl ? (
                      <img
                        src={tech.imageUrl}
                        alt={tech.name}
                        className="w-full h-24 sm:h-48 object-cover rounded-xl sm:rounded-2xl mb-2 sm:mb-4 border border-slate-100 shadow-2xs"
                      />
                    ) : (
                      <div className="w-full h-24 sm:h-44 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold mb-2 sm:mb-4">
                        <Activity className="w-8 h-8 sm:w-12 sm:h-12" />
                      </div>
                    )}

                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded inline-block truncate max-w-full">
                      {tech.model || 'Gold Standard'}
                    </span>
                    
                    <h3 className="font-black text-slate-900 text-[11px] sm:text-lg mt-1 group-hover:text-[#00984a] transition leading-tight truncate">
                      {tech.name}
                    </h3>
                    
                    {tech.manufacturer && (
                      <p className="text-[9px] sm:text-xs text-slate-400 font-bold mt-0.5 truncate">{tech.manufacturer}</p>
                    )}

                    {/* Compact Details for Mobile */}
                    <div className="mt-1.5 sm:mt-2.5">
                      <p className="text-[9px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed font-medium line-clamp-2 sm:line-clamp-3">
                        {tech.description}
                      </p>
                    </div>
                  </div>

                  {/* Responsive Bottom Action Bar */}
                  <div className="mt-3 sm:mt-5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-xs truncate pr-1">
                      <ShieldCheck className="w-3 h-3 sm:w-4 h-4 text-emerald-600 shrink-0" /> 
                      <span className="hidden sm:inline">Certified</span>
                    </span>

                    <Link 
                      to={`/technologies/${techId}`} 
                      className="bg-[#f0fdf4] hover:bg-[#00984a] text-[#006642] hover:text-white border border-emerald-300 font-black text-[9px] sm:text-xs px-2 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl transition flex items-center gap-1 shadow-2xs shrink-0 active:scale-95"
                    >
                      <span className="hidden sm:inline">See More</span>
                      <span className="sm:hidden">View</span>
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-16 text-slate-400 text-xs">
              No diagnostic technologies added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};