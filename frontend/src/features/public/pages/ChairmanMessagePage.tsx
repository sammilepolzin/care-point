import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Award, ShieldCheck, Quote, Stethoscope, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '@/lib/axios';

export const ChairmanMessagePage: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const chairman = settings?.chairmanMessage;

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 pb-24 space-y-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-12 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-300" /> Executive Leadership Message
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-2">Chairman's Official Statement</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
            Guidance and clinical perspective from the founder and chairman of Care Point Diagnostic Centre.
          </p>
        </div>

        {/* Message Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="shrink-0 text-center space-y-3">
            <img
              src={chairman?.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=600&auto=format&fit=crop'}
              alt={chairman?.name}
              className="w-48 h-56 sm:w-56 sm:h-64 rounded-3xl object-cover border-4 border-white shadow-xl ring-2 ring-emerald-300 mx-auto"
            />
            <div>
              <h3 className="font-black text-slate-900 text-base">{chairman?.name}</h3>
              <p className="text-xs text-[#00984a] font-bold mt-0.5">{chairman?.designation}</p>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto">{chairman?.degrees}</p>
            </div>
          </div>

          <div className="space-y-5 flex-1 text-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
              <Quote className="w-6 h-6" />
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              "Behind every test specimen lies a family’s hope and a doctor’s decisive action."
            </h2>

            <div className="text-sm text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>{chairman?.statement}</p>
              <p>
                Our vision has always been grounded in the belief that diagnostic results should never be a subject of uncertainty. By investing in international gold-standard automated analyzers from Germany, Japan, and the USA, we have eliminated human errors and contamination risks.
              </p>
              <p>
                I welcome you to experience diagnostic healthcare delivered with precision, dignity, and compassion.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="font-black text-slate-900 text-sm">{chairman?.name}</p>
                <p className="text-xs text-slate-400">Chairman, Care Point Diagnostic Centre</p>
              </div>
              <Link
                to="/doctors"
                className="bg-[#00984a] hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1 shadow-xs"
              >
                <span>Find Doctors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};