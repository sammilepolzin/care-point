import React from 'react';
import { Cpu, Award, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const points = [
    {
      icon: <Cpu className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Fully Automated Analyzers',
      desc: 'Roche, Beckman Coulter & Sysmex tech for zero human error.',
    },
    {
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Senior Pathologists',
      desc: 'Every report is verified and signed by certified professors.',
    },
    {
      icon: <Clock className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'On-Time Report Delivery',
      desc: 'Instant SMS alert and encrypted online PDF download.',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />,
      title: 'Secure Patient Records',
      desc: 'Medical records, reports & prescriptions are strictly protected.',
    },
  ];

  return (
    <section className="py-8 sm:py-16 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Centered Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-xs font-bold text-[#006642] bg-[#f0fdf4] px-3.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#00984a]" /> Quality & Clinical Precision
          </div>
          
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight leading-snug">
            Why Choose Care Point Diagnostic?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Our commitment to international standards and reliable pathology reporting.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            <div className="h-1 bg-[#00984a] w-12 sm:w-14 rounded-full" />
            <div className="h-1 bg-emerald-200 w-6 sm:w-7 rounded-full" />
          </div>
        </div>

        {/* 📱 2 CARDS PER ROW ON MOBILE (grid-cols-2) PERFECTLY FITTED */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6">
          {points.map((item, index) => (
            <div 
              key={index} 
              className="bg-[#f8fafc] border-2 border-slate-100 rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 hover:border-[#00984a] hover:bg-white hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
            >
              <div>
                {/* Icon Box: Hover makes bg #00984a and icon White */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] group-hover:bg-[#00984a] group-hover:text-white transition-all duration-300 flex items-center justify-center mb-2.5 sm:mb-4 shadow-xs p-2">
                  {item.icon}
                </div>
                
                <h3 className="font-bold text-slate-900 text-xs sm:text-base mb-1.5 group-hover:text-[#00984a] transition leading-tight truncate">
                  {item.title}
                </h3>
                
                <p className="text-[9.5px] sm:text-xs text-slate-500 line-clamp-3 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;