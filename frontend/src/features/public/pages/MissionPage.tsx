import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Target, Award, CheckCircle2, HeartPulse, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';

export const MissionPage: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const mission = settings?.mission;
  const vision = settings?.vision;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-12 pb-24 space-y-6 sm:space-y-10">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-2xl sm:rounded-3xl p-5 sm:p-12 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 sm:px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-amber-300" /> Strategic Purpose
          </span>
          <h1 className="text-xl sm:text-4xl font-black mt-2">Our Mission & Vision</h1>
          <p className="text-emerald-100 text-[10px] sm:text-sm mt-1 sm:mt-2 max-w-xl mx-auto leading-snug">
            The guiding principles driving Care Point toward clinical accuracy, patient empathy, and modern diagnostics.
          </p>
        </div>

        {/* 2-COLUMN GRID ON MOBILE */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          
          {/* Mission Card */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm space-y-2.5 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold shrink-0">
                <Target className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded">Our Mission</span>
                <h2 className="text-[11px] sm:text-xl font-black text-slate-900 mt-0.5 sm:mt-1 leading-tight">{mission?.title || 'Precision Healthcare'}</h2>
              </div>
            </div>

            <p className="text-[9px] sm:text-sm text-slate-600 leading-snug sm:leading-relaxed font-medium line-clamp-4 sm:line-clamp-none">
              {mission?.description}
            </p>

            {mission?.points && mission.points.length > 0 && (
              <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2.5">
                <h4 className="font-bold text-slate-900 text-[9px] sm:text-xs uppercase tracking-wider">Commitments:</h4>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-3">
                  {mission.points.map((pt: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5 sm:gap-2.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-[8px] sm:text-xs text-slate-700">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#00984a] shrink-0 mt-0.5" />
                      <span className="font-medium leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Vision Card */}
          <div className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm space-y-2.5 sm:space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold shrink-0">
                <Award className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[8px] sm:text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded">Our Vision</span>
                <h2 className="text-[11px] sm:text-xl font-black text-slate-900 mt-0.5 sm:mt-1 leading-tight">{vision?.title || 'Diagnostic Trust'}</h2>
              </div>
            </div>

            <p className="text-[9px] sm:text-sm text-slate-600 leading-snug sm:leading-relaxed font-medium line-clamp-4 sm:line-clamp-none">
              {vision?.description}
            </p>

            {vision?.points && vision.points.length > 0 && (
              <div className="pt-2 sm:pt-3 border-t border-slate-100 space-y-1.5 sm:space-y-2.5">
                <h4 className="font-bold text-slate-900 text-[9px] sm:text-xs uppercase tracking-wider">Future Goals:</h4>
                <div className="grid grid-cols-1 gap-1.5 sm:gap-3">
                  {vision.points.map((pt: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-1.5 sm:gap-2.5 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 text-[8px] sm:text-xs text-slate-700">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-[#00984a] shrink-0 mt-0.5" />
                      <span className="font-medium leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Core Values Card (Spans 2 columns on mobile to fit nicely) */}
          <div className="col-span-2 md:col-span-1 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm space-y-2.5 sm:space-y-4 flex flex-col justify-center">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold shrink-0">
                <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">Core Values</span>
                <h2 className="text-[13px] sm:text-xl font-black text-slate-900 mt-1 leading-tight">Patient-Centric Empathy</h2>
              </div>
            </div>

            <p className="text-[10px] sm:text-sm text-slate-600 leading-relaxed font-medium text-center sm:text-left">
              Diagnostic Precision, 24/7 Reliability, Uncompromising Hygiene, Continuous Technological Innovation, and treating every patient with utmost respect.
            </p>
          </div>

        </div>

        {/* Action Button */}
        <div className="text-center pt-2">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-1.5 sm:gap-2 bg-brand-gradient text-white font-black text-[10px] sm:text-sm px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl shadow-md transition active:scale-95"
          >
            <span>Consult Our Specialists</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};