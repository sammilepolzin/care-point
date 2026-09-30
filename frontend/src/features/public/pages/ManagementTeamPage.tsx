import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, ShieldCheck } from 'lucide-react';
import api from '@/lib/axios';

export const ManagementTeamPage: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const team = settings?.managementTeam || [];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-12 pb-24 space-y-6 sm:space-y-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-2xl sm:rounded-3xl p-5 sm:p-12 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 sm:px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-amber-300" /> Governance & Leadership
          </span>
          <h1 className="text-xl sm:text-4xl font-black mt-2">Executive Management & Clinical Directors</h1>
          <p className="text-emerald-100 text-[10px] sm:text-sm mt-1 sm:mt-2 max-w-xl mx-auto leading-snug">
            Meet the experienced medical professors, clinical directors, and engineers steering Care Point's healthcare mission.
          </p>
        </div>

        {/* Team Grid: Exactly 2 Columns on Mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {team.map((member: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border border-slate-200 shadow-sm text-center flex flex-col justify-between hover:shadow-xl hover:border-[#00984a] transition-all group">
              <div>
                <img
                  src={member.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                  alt={member.name}
                  className="w-16 h-16 sm:w-28 sm:h-28 rounded-2xl sm:rounded-3xl object-cover mx-auto mb-2 sm:mb-4 border-2 sm:border-4 border-white shadow-md ring-1 sm:ring-2 ring-emerald-200"
                />
                <span className="text-[8px] sm:text-[9px] font-black uppercase text-[#00984a] bg-emerald-50 px-1.5 sm:px-2.5 py-0.5 rounded-full inline-block truncate max-w-full">
                  {member.designation}
                </span>
                <h3 className="font-black text-slate-900 text-[11px] sm:text-base mt-1.5 sm:mt-2 group-hover:text-[#00984a] transition truncate">
                  {member.name}
                </h3>
                <p className="text-[9px] sm:text-xs text-slate-400 font-bold mt-0.5 truncate">{member.degrees}</p>
                
                {/* Fit Bio properly */}
                <p className="text-[8.5px] sm:text-xs text-slate-600 mt-1.5 sm:mt-3 leading-snug line-clamp-3">
                  {member.bio}
                </p>
              </div>

              <div className="pt-2 sm:pt-4 border-t border-slate-100 mt-2 sm:mt-4">
                <span className="text-[8px] sm:text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 sm:px-3 py-1 rounded-lg sm:rounded-xl truncate block">
                  ● Board Member
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};