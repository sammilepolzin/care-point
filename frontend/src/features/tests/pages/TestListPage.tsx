import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TestTube2, 
  Search, 
  Clock, 
  Home, 
  Plus, 
  Check, 
  Sparkles, 
  Info, 
  ShoppingBag, 
  Trash2,
  Eye,
  X
} from 'lucide-react';
import api from '@/lib/axios';
import { useTestCart } from '../context/TestCartContext';
import { TestCartDrawer } from '../components/TestCartDrawer';

interface TestCategory {
  _id: string;
  name: string;
  bnName?: string;
}

interface DiagnosticTest {
  _id: string;
  name: string;
  code: string;
  category: string;
  description?: string;
  preparationInstructions: string;
  sampleType: string;
  reportDeliveryTime: string;
  regularPrice: number;
  discountPrice: number;
  homeCollectionAvailable: boolean;
  iconUrl?: string;
  isActive: boolean;
}

export const TestListPage: React.FC = () => {
  const { addToCart, removeFromCart, isInCart, cartItems, setIsCartDrawerOpen } = useTestCart();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // 🌟 TEST DETAILS POPUP MODAL STATE
  const [selectedTestModal, setSelectedTestModal] = useState<DiagnosticTest | null>(null);

  const { data: categories } = useQuery<TestCategory[]>({
    queryKey: ['public-test-categories'],
    queryFn: async () => {
      const res = await api.get('/test-categories');
      return res.data.data;
    },
  });

  const { data: tests, isLoading } = useQuery<DiagnosticTest[]>({
    queryKey: ['public-tests-catalog', searchTerm, selectedCategory],
    queryFn: async () => {
      let url = `/tests?active=true&search=${searchTerm}`;
      if (selectedCategory !== 'All') url += `&category=${selectedCategory}`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-10 pb-28">
      <TestCartDrawer />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-5 sm:p-8 text-white mb-6 sm:mb-8 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Fully Automated Clinical Pathology
            </span>
            <h1 className="text-xl sm:text-3xl font-black mt-2">Diagnostic Tests & Medical Services</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Browse approved pathology, biochemistry, imaging and radiology tests with instant booking.
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={() => setIsCartDrawerOpen(true)}
              className="bg-white hover:bg-slate-100 text-[#00984a] font-black text-xs px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow transition shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart ({cartItems.length})</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-3xl border border-slate-200 shadow-sm mb-6 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tests by name or code (e.g. CBC, Lipid, HbA1c)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
            />
          </div>

          {/* DYNAMIC CATEGORY PILLS */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-brand-gradient text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              All Tests
            </button>
            {categories?.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === cat.name
                    ? 'bg-brand-gradient text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* TESTS GRID: EXACT 2 CARDS PER ROW ON MOBILE (grid-cols-2) */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-slate-400">Loading diagnostic tests...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
            {tests && tests.length > 0 ? (
              tests.map((test) => {
                const inCart = isInCart(test._id);
                return (
                  <div
                    key={test._id}
                    className={`bg-white rounded-2xl sm:rounded-3xl border-2 p-3 sm:p-5 shadow-sm transition-all duration-300 flex flex-col justify-between group ${
                      inCart ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100' : 'border-slate-100 hover:border-[#00984a] hover:shadow-xl'
                    }`}
                  >
                    {/* 🌟 Top Body: Clickable to Open Details Modal */}
                    <div 
                      onClick={() => setSelectedTestModal(test)} 
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2.5">
                        {test.iconUrl ? (
                          <img src={test.iconUrl} alt={test.name} className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover border border-emerald-300 shadow-xs shrink-0" />
                        ) : (
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold shrink-0">
                            <TestTube2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                        )}

                        {test.homeCollectionAvailable && (
                          <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-bold text-[#006642] bg-[#f0fdf4] border border-emerald-200 px-1.5 py-0.5 rounded-full">
                            <Home className="w-2.5 h-2.5 text-[#00984a]" /> Home
                          </span>
                        )}
                      </div>

                      <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#006642] bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block mb-1">
                        {test.category}
                      </span>

                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1.5 group-hover:text-[#00984a] transition leading-snug truncate">
                        {test.name}
                      </h3>

                      <div className="space-y-0.5 text-[8.5px] sm:text-[10px] text-slate-500 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <p className="flex items-center gap-1 truncate">
                          <Info className="w-2.5 h-2.5 text-[#00984a] shrink-0" />
                          <span className="truncate">Prep: <strong className="text-slate-700">{test.preparationInstructions}</strong></span>
                        </p>
                        <p className="flex items-center gap-1 truncate">
                          <Clock className="w-2.5 h-2.5 text-[#00984a]" />
                          <span className="truncate">Del: <strong className="text-slate-700">{test.reportDeliveryTime}</strong></span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Row: Price + View (Eye) + Book/In Cart */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                      <div className="min-w-0">
                        {test.regularPrice > test.discountPrice && (
                          <span className="text-[8.5px] sm:text-[10px] text-slate-400 line-through mr-1 font-semibold block sm:inline">৳{test.regularPrice}</span>
                        )}
                        <span className="text-xs sm:text-sm font-black text-slate-900">৳{test.discountPrice}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* 🌟 Dedicated View Button with Eye Icon */}
                        <button
                          type="button"
                          onClick={() => setSelectedTestModal(test)}
                          className="p-1.5 sm:p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition flex items-center gap-0.5 shadow-2xs hover:border-[#00984a] cursor-pointer"
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
                              onClick={() => setIsCartDrawerOpen(true)}
                              className="text-[8px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-1.5 sm:px-2 py-1 rounded-lg flex items-center gap-0.5 cursor-pointer"
                            >
                              <Check className="w-2.5 h-2.5 text-[#00984a]" />
                              <span className="hidden sm:inline">In Cart</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => removeFromCart(test._id)}
                              className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs transition active:scale-95 cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => addToCart(test as any)}
                            className="bg-brand-gradient hover:opacity-95 text-white font-black text-[9px] sm:text-xs px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl transition shadow-xs flex items-center gap-0.5 active:scale-95 cursor-pointer"
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
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No diagnostic tests found matching your search.
              </div>
            )}
          </div>
        )}
      </div>

      {/* 🌟 TEST DETAILS POPUP MODAL */}
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
                    🏠 Home Collection
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
                    className="px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-2xl text-xs font-bold cursor-pointer"
                    title="Remove"
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
    </div>
  );
};

export default TestListPage;