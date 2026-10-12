import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  TestTube2, 
  ArrowRight, 
  Clock, 
  Home, 
  Eye, 
  X, 
  Check, 
  Plus,
  ShoppingBag, 
  Trash2,
  Sparkles,
  Info
} from 'lucide-react';
import { useTestCart } from '@/features/tests/context/TestCartContext';
import { TestCartDrawer } from '@/features/tests/components/TestCartDrawer';
import api from '@/lib/axios';

interface DiagnosticTest {
  _id: string;
  name: string;
  code: string;
  category: string;
  preparationInstructions: string;
  reportDeliveryTime: string;
  regularPrice: number;
  discountPrice: number;
  homeCollectionAvailable: boolean;
  sampleType?: string;
  iconUrl?: string;
}

export const PopularTests: React.FC = () => {
  const { addToCart, removeFromCart, isInCart, cartItems, setIsCartDrawerOpen } = useTestCart();
  const [selectedTestModal, setSelectedTestModal] = useState<DiagnosticTest | null>(null);

  const { data: tests, isLoading } = useQuery<DiagnosticTest[]>({
    queryKey: ['public-tests'],
    queryFn: async () => {
      const res = await api.get('/tests?active=true');
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  return (
    <section className="py-8 sm:py-16 bg-white border-b border-slate-200 relative">
      {/* 🛒 Connected Test Cart Drawer Component */}
      <TestCartDrawer />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 text-[10.5px] sm:text-xs font-bold text-[#006642] bg-emerald-100/90 px-3.5 py-1 rounded-full mb-2 shadow-2xs">
            <TestTube2 className="w-3.5 h-3.5 text-[#00984a] shrink-0" />
            <span>Pathology & Automated Analyzers • ডায়াগনস্টিক টেস্ট</span>
          </div>
          
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
            Popular Diagnostic Tests
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl mx-auto">
            Book international gold-standard clinical pathology investigations with home sample collection.
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="h-1 bg-[#00984a] w-12 sm:w-14 rounded-full" />
            <div className="h-1 bg-emerald-300 w-6 sm:w-7 rounded-full" />
          </div>
        </div>

        {/* 📱 2 CARDS PER ROW ON MOBILE (grid-cols-2) EXACTLY LIKE DOCTOR & TEST LIST */}
        {isLoading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading diagnostic test packages...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {tests && tests.length > 0 ? (
              tests.slice(0, 6).map((test) => {
                const inCart = isInCart(test._id);

                return (
                  <div
                    key={test._id}
                    className={`bg-[#f8fafc] rounded-2xl sm:rounded-3xl border-2 p-3 sm:p-5 shadow-sm transition-all duration-300 flex flex-col justify-between group ${
                      inCart ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100' : 'border-slate-200/90 hover:border-[#00984a] hover:shadow-xl'
                    }`}
                  >
                    {/* Clickable Card Body to View Details */}
                    <div 
                      onClick={() => setSelectedTestModal(test)} 
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 border border-emerald-200 px-1.5 sm:px-2.5 py-0.5 rounded-md truncate max-w-[100px] sm:max-w-none">
                          {test.category}
                        </span>
                        <span className="font-mono text-[8px] sm:text-[9.5px] font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border shrink-0">
                          {test.code}
                        </span>
                      </div>

                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5 group-hover:text-[#00984a] transition leading-tight truncate">
                        {test.name}
                      </h3>

                      <div className="space-y-0.5 text-[8.5px] sm:text-[10px] text-slate-500 my-2 bg-white p-2 rounded-xl border border-slate-100">
                        <p className="flex items-center gap-1 truncate">
                          <Info className="w-2.5 h-2.5 text-[#00984a] shrink-0" />
                          <span className="truncate">Prep: <strong className="text-slate-700">{test.preparationInstructions || 'No prep'}</strong></span>
                        </p>
                        <p className="flex items-center gap-1 truncate">
                          <Clock className="w-2.5 h-2.5 text-[#00984a] shrink-0" />
                          <span className="truncate">Del: <strong className="text-slate-700">{test.reportDeliveryTime}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Pricing & Actions */}
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        {test.regularPrice > test.discountPrice && (
                          <span className="text-[8.5px] sm:text-[10px] text-slate-400 line-through mr-1 font-semibold block sm:inline">৳{test.regularPrice}</span>
                        )}
                        <span className="text-xs sm:text-base font-black text-slate-900">৳{test.discountPrice}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* View Eye Button */}
                        <button
                          type="button"
                          onClick={() => setSelectedTestModal(test)}
                          className="p-1.5 sm:p-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center gap-0.5 shadow-2xs hover:border-[#00984a] cursor-pointer"
                          title="View Test Details"
                        >
                          <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#00984a]" />
                          <span className="hidden sm:inline">View</span>
                        </button>

                        {/* In Cart or Book Button */}
                        {inCart ? (
                          <div className="flex items-center gap-0.5 sm:gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsCartDrawerOpen(true);
                              }}
                              className="text-[8px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 sm:px-2 py-1 rounded-lg flex items-center gap-0.5 cursor-pointer"
                            >
                              <Check className="w-2.5 h-2.5 text-[#00984a]" />
                              <span className="hidden sm:inline">In Cart</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromCart(test._id);
                              }}
                              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs transition active:scale-95 cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(test as any);
                            }}
                            className="bg-brand-gradient hover:opacity-95 text-white font-black text-[9px] sm:text-xs px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl transition shadow-xs flex items-center gap-0.5 active:scale-95 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Book</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                No diagnostic tests available at the moment.
              </div>
            )}
          </div>
        )}

        {/* View All Tests Button */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            to="/tests"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdf4] text-[#00984a] border-2 border-[#00984a] font-black text-xs sm:text-sm px-7 sm:px-8 py-3 sm:py-3.5 rounded-2xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <span>View All Diagnostic Tests & Pricing (সকল টেস্ট দেখুন)</span>
            <ArrowRight className="w-4 h-4 text-[#00984a]" />
          </Link>
        </div>
      </div>

      {/* 🛒 FLOATING DRAWER TRIGGER BUTTON */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-8 z-40 animate-in slide-in-from-bottom-5">
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="bg-brand-gradient text-white px-5 py-3 rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2.5 hover:opacity-95 transition active:scale-95 font-bold text-xs sm:text-sm group cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-300" />
            <span>View Cart ({cartItems.length})</span>
          </button>
        </div>
      )}

      {/* TEST DETAILS POPUP MODAL */}
      {selectedTestModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-xs font-medium text-slate-700 animate-in zoom-in-95 relative">
            <button
              onClick={() => setSelectedTestModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl bg-slate-100 text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pb-4 border-b space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                  {selectedTestModal.category}
                </span>
                <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {selectedTestModal.code}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {selectedTestModal.name}
              </h3>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Preparation Instructions (পূর্বপ্রস্তুতি)</p>
                <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                  {selectedTestModal.preparationInstructions || 'No special fasting or prep needed.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery Turnaround</span>
                  <strong className="text-slate-900 font-bold">{selectedTestModal.reportDeliveryTime}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Sample Type</span>
                  <strong className="text-slate-900 font-bold">{selectedTestModal.sampleType || 'Blood / Serum'}</strong>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200 flex justify-between items-center">
                <div>
                  {selectedTestModal.regularPrice > selectedTestModal.discountPrice && (
                    <span className="text-[10px] text-slate-400 line-through">Regular: ৳{selectedTestModal.regularPrice}</span>
                  )}
                  <p className="text-base font-black text-slate-900">Price: ৳{selectedTestModal.discountPrice}</p>
                </div>
                {selectedTestModal.homeCollectionAvailable && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300">
                    🏠 Home Sample Available
                  </span>
                )}
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              {isInCart(selectedTestModal._id) ? (
                <div className="flex gap-2 w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTestModal(null);
                      setIsCartDrawerOpen(true);
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs sm:text-sm transition shadow flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>View Cart ({cartItems.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(selectedTestModal._id)}
                    className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                    title="Remove from Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    addToCart(selectedTestModal as any);
                  }}
                  className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-3 rounded-2xl text-xs sm:text-sm transition shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Test to Cart (৳{selectedTestModal.discountPrice})</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PopularTests;