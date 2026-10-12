import React from 'react';
import { Link } from 'react-router-dom';
import { Gift, ArrowRight, CheckCircle2 } from 'lucide-react';

export const SpecialCampaignBanner: React.FC = () => {
  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-brand-gradient text-white p-6 sm:p-10 shadow-2xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute left-1/3 top-0 w-48 h-48 bg-emerald-300/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 text-white px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider">
                <Gift className="w-3.5 h-3.5 text-amber-300" />
                <span>Special Health Camp 2026</span>
              </div>

              <h3 className="text-xl sm:text-3xl font-black text-white leading-tight tracking-tight">
                বিনামূল্যে ডায়াবেটিস ও ব্লাড প্রেশার স্ক্রিনিং ক্যাম্পেইন!
              </h3>

              <p className="text-emerald-50 text-xs sm:text-sm max-w-2xl leading-relaxed">
                এই মাসে কেয়ার পয়েন্ট সেন্টারে সকল প্যাথলজি ও হরমোন টেস্টে ফ্ল্যাট <strong>২০% ডিসকাউন্ট</strong> এবং সিনিয়র সিটিজেনদের জন্য ফ্রি কনসালটেশন স্লট।
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] sm:text-xs font-bold text-emerald-100 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> ফ্রি ব্লাড সুগার
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> ফ্রি বিএমআই ও প্রেসার চেক
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" /> ২০% ল্যাব ডিসকাউন্ট
                </span>
              </div>
            </div>

            {/* Right Action Button with Generous Padding */}
            <div className="lg:col-span-4 flex flex-col items-center lg:items-end justify-center gap-2">
              <Link to="/packages" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto bg-white hover:bg-emerald-50 text-[#006642] font-black text-xs sm:text-sm px-9 py-3.5 rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2">
                  <span>প্যাকেজ দেখুন</span>
                  <ArrowRight className="w-4 h-4 text-[#00984a]" />
                </button>
              </Link>
              <span className="text-[10px] sm:text-[11px] text-emerald-200 font-semibold">
                * অফারটি সীমিত সময়ের জন্য প্রযোজ্য
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};