import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Calendar, 
  ArrowRight, 
  Tag, 
  ShieldCheck 
} from 'lucide-react';
import api from '@/lib/axios';

interface OfferItem {
  _id: string;
  title: string;
  subtitle: string;
  couponCode: string;
  discountType: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  bannerUrl?: string;
}

export const SpecialOffersPage: React.FC = () => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const { data: offers, isLoading } = useQuery<OfferItem[]>({
    queryKey: ['public-offers'],
    queryFn: async () => {
      const res = await api.get('/offers');
      return res.data.data;
    },
  });

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-10 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-300" /> Exclusive Discounts & Coupons
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-2">Special Promotional Offers</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Take advantage of limited-time discounts on pathology tests, body checkup packages, and doorstep collections.
          </p>
        </div>

        {/* Offers Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-slate-400">Loading active promotional offers...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers && offers.length > 0 ? (
              offers.map((offer) => (
                <div
                  key={offer._id}
                  className="bg-white rounded-3xl border-2 border-emerald-100 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                        {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}% DISCOUNT` : `৳${offer.discountValue} OFF`}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#00984a]" /> Valid till {offer.endDate}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-lg group-hover:text-[#00984a] transition">
                      {offer.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{offer.subtitle}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                    {/* Coupon Box */}
                    <div className="flex items-center gap-2 bg-slate-50 border-2 border-dashed border-slate-300 p-2 px-3 rounded-2xl w-full sm:w-auto justify-between">
                      <span className="font-mono font-black text-sm text-slate-900 tracking-wider">
                        {offer.couponCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(offer.couponCode)}
                        className="p-1.5 text-[#00984a] hover:bg-emerald-100 rounded-lg transition"
                        title="Copy Coupon Code"
                      >
                        {copiedCode === offer.couponCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>

                    <Link
                      to="/tests"
                      className="w-full sm:w-auto bg-brand-gradient hover:opacity-95 text-white font-black text-xs px-5 py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5"
                    >
                      <span>Apply on Tests</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No active promotional campaigns currently.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};