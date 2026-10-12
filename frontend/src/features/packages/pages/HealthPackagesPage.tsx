import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag,
  Info,
  X
} from 'lucide-react';
import api from '@/lib/axios';
import { useTestCart } from '@/features/tests/context/TestCartContext';
import { TestCartDrawer } from '@/features/tests/components/TestCartDrawer';

interface PackageItem {
  _id: string;
  name: string;
  code: string;
  tagline: string;
  description: string;
  genderTarget: string;
  ageGroup: string;
  includedFeatures: string[];
  includedTests: { _id: string; name: string; discountPrice: number; regularPrice: number }[];
  regularPrice: number;
  packagePrice: number;
  discountPercentage: number;
  isPopular: boolean;
}

export const HealthPackagesPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToCart, setIsCartDrawerOpen } = useTestCart();
  const [selectedPkgForModal, setSelectedPkgForModal] = useState<PackageItem | null>(null);

  const { data: packages, isLoading } = useQuery<PackageItem[]>({
    queryKey: ['public-health-packages'],
    queryFn: async () => {
      const res = await api.get('/packages');
      return res.data.data;
    },
  });

  const handleBookPackage = (pkg: PackageItem) => {
    // Add all included tests to cart
    if (pkg.includedTests && pkg.includedTests.length > 0) {
      pkg.includedTests.forEach((t) => {
        addToCart({
          _id: t._id,
          name: t.name,
          code: pkg.code,
          category: 'Health Package',
          regularPrice: t.regularPrice || pkg.regularPrice,
          discountPrice: t.discountPrice || pkg.packagePrice,
        });
      });
      setIsCartDrawerOpen(true);
    } else {
      navigate('/test-booking');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 pb-28">
      <TestCartDrawer />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-10 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Preventative Healthcare & Wellness
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-2">Executive Health Checkup Packages</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Comprehensive full-body screening panels designed by specialist physicians with up to 35% package discounts.
          </p>
        </div>

        {/* Packages Grid */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-slate-400">Loading health packages...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages && packages.length > 0 ? (
              packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className={`bg-white rounded-3xl border-2 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group ${
                    pkg.isPopular ? 'border-[#00984a] ring-2 ring-emerald-100' : 'border-slate-100 hover:border-[#00984a]'
                  }`}
                >
                  {pkg.isPopular && (
                    <span className="absolute -top-3 right-6 bg-[#00984a] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      ★ Most Popular
                    </span>
                  )}

                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold text-slate-400 font-mono bg-slate-100 px-2 py-0.5 rounded">
                        {pkg.code}
                      </span>
                      <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {pkg.genderTarget} • {pkg.ageGroup}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-lg leading-snug group-hover:text-[#00984a] transition">
                      {pkg.name}
                    </h3>
                    <p className="text-xs text-[#00984a] font-bold mt-0.5">{pkg.tagline}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{pkg.description}</p>

                    {/* Features checklist */}
                    <div className="my-5 pt-4 border-t border-slate-100 space-y-2">
                      {pkg.includedFeatures?.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                          <div className="w-4 h-4 rounded-full bg-emerald-100 text-[#00984a] flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                          </div>
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-1.5 font-semibold">৳{pkg.regularPrice}</span>
                        <span className="text-2xl font-black text-slate-900">৳{pkg.packagePrice}</span>
                      </div>
                      <span className="text-xs font-black text-[#00984a] bg-emerald-50 px-2.5 py-1 rounded-lg">
                        {pkg.discountPercentage}% OFF
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPkgForModal(pkg)}
                        className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                      >
                        View Tests ({pkg.includedTests?.length || 0})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookPackage(pkg)}
                        className="flex-1 bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1 active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Book Package
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No health packages available currently.
              </div>
            )}
          </div>
        )}

        {/* PACKAGE DETAILS MODAL */}
        {selectedPkgForModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="flex justify-between items-start mb-4 pb-3 border-b">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                    {selectedPkgForModal.code}
                  </span>
                  <h3 className="font-black text-slate-900 text-base mt-1">{selectedPkgForModal.name}</h3>
                </div>
                <button onClick={() => setSelectedPkgForModal(null)} className="p-1.5 text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-600 mb-4">{selectedPkgForModal.description}</p>

              <div className="space-y-2 mb-6">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Included Diagnostic Tests:</h4>
                {selectedPkgForModal.includedTests && selectedPkgForModal.includedTests.length > 0 ? (
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100 max-h-52 overflow-y-auto">
                    {selectedPkgForModal.includedTests.map((t, i) => (
                      <div key={i} className="flex justify-between text-xs py-1 border-b border-slate-200/60 last:border-0">
                        <span className="font-medium text-slate-800">• {t.name}</span>
                        <strong className="text-slate-900">৳{t.discountPrice}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">Includes all standard organ screening parameters.</p>
                )}
              </div>

              <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-200 mb-4">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block">Special Package Price</span>
                  <span className="text-xl font-black text-slate-900">৳{selectedPkgForModal.packagePrice}</span>
                </div>
                <span className="text-xs font-black text-[#00984a] bg-white px-3 py-1 rounded-xl shadow-2xs">
                  Save ৳{selectedPkgForModal.regularPrice - selectedPkgForModal.packagePrice}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  handleBookPackage(selectedPkgForModal);
                  setSelectedPkgForModal(null);
                }}
                className="w-full bg-brand-gradient text-white font-black py-3 rounded-2xl text-xs transition shadow flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Confirm & Add to Cart</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};