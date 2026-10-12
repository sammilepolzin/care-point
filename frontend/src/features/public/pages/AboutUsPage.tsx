import React from 'react';
import { 
  ShieldCheck, 
  Target, 
  Award, 
  Cpu, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  HeartPulse
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutUsPage: React.FC = () => {
  const technologies = [
    { title: 'Cobas e411 & c311 (Roche, Germany)', desc: 'Fully automated biochemistry & immunoassay analyzers providing zero-error molecular pathology.' },
    { title: 'Sysmex XN-550 (Japan)', desc: '5-part differential automated hematology analyzer for comprehensive blood cell profiling.' },
    { title: 'Siemens Magnetom 3.0T MRI', desc: 'Silent scan technology with ultra-high resolution imaging for neuro, spine and vascular diagnosis.' },
    { title: 'GE Voluson E10 4D HD-Live USG', desc: 'Premium diagnostic ultrasonography with real-time fetal echocardiography and Doppler.' },
  ];

  const management = [
    { name: 'Prof. Dr. M. A. Rahim', title: 'Chairman & Chief Clinical Consultant', degrees: 'MBBS, FCPS, FRCP (Glasgow)' },
    { name: 'Engr. Tariqul Islam', title: 'Managing Director & CEO', degrees: 'B.Sc Engr (BUET), MBA' },
    { name: 'Dr. Shamima Nasrin', title: 'Director of Laboratory Services', degrees: 'MBBS, M.Phil (Pathology)' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 pb-24 space-y-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-12 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> ISO 9001:2015 Accredited Centre
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-2">About Care Point Diagnostic & Consultation</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-2 max-w-2xl mx-auto leading-relaxed">
            Delivering trusted clinical pathology, digital imaging, and specialist doctor consultations with unwavering commitment to diagnostic precision.
          </p>
        </div>

        {/* 1. MISSION, VISION & CORE VALUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To provide accurate, fast, and affordable diagnostic investigations using global gold-standard automated technology, while upholding highest ethical standards.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To be the most trustworthy healthcare and diagnostic hub in the nation, empowering doctors with definitive reports and patients with compassionate care.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Core Values</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Diagnostic Precision, 24/7 Reliability, Uncompromising Hygiene, Continuous Technological Innovation, and Patient-Centric Empathy.
            </p>
          </div>
        </div>

        {/* 2. CHAIRMAN & MD LEADERSHIP MESSAGES */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-2.5 py-1 rounded-md">
              Chairman's Statement
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              "Precision Diagnostics is the Foundation of Successful Treatment"
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              At Care Point, we recognize that every specimen represents a human life. That is why our laboratories are operated under strict internal and external quality assurance protocols overseen by senior clinical pathologists.
            </p>
            <div className="pt-2">
              <h4 className="font-black text-slate-900 text-sm">Prof. Dr. M. A. Rahim</h4>
              <p className="text-xs text-[#00984a] font-bold">Chairman & Chief Clinical Consultant</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-white px-2.5 py-1 rounded-md border">
              Managing Director's Note
            </span>
            <h3 className="text-lg font-black text-slate-900">
              Transforming Patient Experience through Digital Healthcare
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              From instant OTP-secured report downloads to certified doorstep sample collection, Care Point is pioneering smart healthcare accessibility in Bangladesh.
            </p>
            <div className="pt-2">
              <h4 className="font-black text-slate-900 text-sm">Engr. Tariqul Islam</h4>
              <p className="text-xs text-[#00984a] font-bold">Managing Director & CEO</p>
            </div>
          </div>
        </div>

        {/* 3. LABORATORY TECHNOLOGIES */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-3 py-1 rounded-full">
              Gold Standard Equipment
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Our Advanced Medical Analyzers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {technologies.map((tech, idx) => (
              <div key={idx} className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00984a]" />
                  <h4 className="font-black text-slate-900 text-sm">{tech.title}</h4>
                </div>
                <p className="text-xs text-slate-500 pl-4">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. MANAGEMENT TEAM */}
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">Clinical Leadership Team</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {management.map((m, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm text-center space-y-1.5">
                <div className="w-16 h-16 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-black text-xl mx-auto mb-3 shadow">
                  {m.name.split(' ')[1]?.[0] || 'D'}
                </div>
                <h4 className="font-black text-slate-900 text-sm">{m.name}</h4>
                <p className="text-xs text-[#00984a] font-bold">{m.title}</p>
                <p className="text-[10px] text-slate-400">{m.degrees}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <Link
            to="/doctors"
            className="inline-flex items-center gap-2 bg-brand-gradient text-white font-black text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-md transition active:scale-95"
          >
            <span>Consult Our Specialists</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};