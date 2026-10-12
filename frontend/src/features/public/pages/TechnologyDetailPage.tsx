import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Cpu, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Activity, 
  Building2, 
  Award,
  TestTube2,
  PhoneCall
} from 'lucide-react';
import api from '@/lib/axios';

export const TechnologyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const technologies = settings?.technologies || [];
  
  // Find matching technology by id or index
  const tech = technologies.find((t: any, idx: number) => (t.id || `tech-${idx}`) === id) || technologies[Number(id)] || technologies[0];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center py-20 text-slate-400 text-xs">
        Loading technology specifications...
      </div>
    );
  }

  if (!tech) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4 text-center">
        <h2 className="text-xl font-black text-slate-900 mb-2">Technology details not found</h2>
        <Link to="/technologies" className="text-xs font-bold text-[#00984a] underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Technologies
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 pb-24 space-y-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumb / Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/technologies"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#00984a] bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-[#00984a]" />
            <span>Back to All Technologies</span>
          </Link>

          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            ● Gold Standard Laboratory Equipment
          </span>
        </div>

        {/* Master Technology Profile Card (Full Page) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-8">
          
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* High-Res Image */}
            <div className="w-full lg:w-1/2 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
              {tech.imageUrl ? (
                <img
                  src={tech.imageUrl}
                  alt={tech.name}
                  className="w-full h-72 sm:h-96 object-cover hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-72 sm:h-96 flex items-center justify-center bg-emerald-50 text-[#00984a]">
                  <Activity className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Core Specifications */}
            <div className="w-full lg:w-1/2 space-y-4">
              <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2.5 py-1 rounded-lg inline-block border border-emerald-200">
                {tech.model || 'Clinical Automation'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {tech.name}
              </h1>

              {tech.manufacturer && (
                <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#00984a]" />
                  <span>Manufacturer: <strong className="text-slate-800">{tech.manufacturer}</strong></span>
                </p>
              )}

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <p className="text-slate-500 font-bold uppercase text-[10px]">Certification & Quality Control</p>
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-[#00984a]" />
                  <span>ISO 9001:2015 & CE Certified Laboratory Device</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Operated under multi-tier internal calibration protocols by certified pathologists.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  to="/tests"
                  className="bg-brand-gradient hover:opacity-95 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-sm transition flex items-center gap-1.5"
                >
                  <TestTube2 className="w-4 h-4" />
                  <span>Explore Associated Tests</span>
                </Link>

                <Link
                  to="/contact"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-5 py-3 rounded-2xl transition flex items-center gap-1.5 border border-slate-200"
                >
                  <PhoneCall className="w-4 h-4 text-[#00984a]" />
                  <span>Contact Lab Helpline</span>
                </Link>
              </div>
            </div>
          </div>

          {/* FULL COMPREHENSIVE CLINICAL DESCRIPTION (NO HEIGHT CUTOFF) */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-[#00984a]" /> Full Clinical Overview & Diagnostic Capability
            </h3>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal whitespace-pre-line bg-slate-50/60 p-6 rounded-2xl border border-slate-200/80">
              {tech.description}
            </div>
          </div>

          {/* Clinical Advantages Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <span className="font-bold text-[#00984a] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Zero Contamination
              </span>
              <p className="text-[11px] text-slate-500">Automated closed-vessel aspiration and disposable probe systems.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <span className="font-bold text-[#00984a] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Rapid Report Delivery
              </span>
              <p className="text-[11px] text-slate-500">High-throughput sampling enabling emergency results within 3-4 hours.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-1">
              <span className="font-bold text-[#00984a] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Global Accuracy Standards
              </span>
              <p className="text-[11px] text-slate-500">Continuous daily controls ensuring reliable reports for physicians.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};