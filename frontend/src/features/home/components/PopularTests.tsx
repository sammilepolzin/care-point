import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  TestTube2, 
  Clock, 
  ArrowRight, 
  Home, 
  Info, 
  Sparkles,
  Plus,
  Check,
  Trash2
} from 'lucide-react';
import api from '@/lib/axios';
import { useTestCart } from '@/features/tests/context/TestCartContext';

interface TestCategory {
  _id: string;
  name: string;
}

interface DiagnosticTest {
  _id: string;
  name: string;
  code: string;
  category: string;
  preparationInstructions: string;
  sampleType: string;
  reportDeliveryTime: string;
  regularPrice: number;
  discountPrice: number;
  homeCollectionAvailable: boolean;
  iconUrl?: string;
  isActive: boolean;
}

export const PopularTests: React.FC = () => {
  const { addToCart, removeFromCart, isInCart } = useTestCart();
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Fetch Categories
  const { data: categories } = useQuery<TestCategory[]>({
    queryKey: ['public-test-categories'],
    queryFn: async () => {
      const res = await api.get('/test-categories');
      return res.data.data;
    },
  });

  // Fetch Tests
  const { data: tests, isLoading } = useQuery<DiagnosticTest[]>({
    queryKey: ['public-popular-tests'],
    queryFn: async () => {
      const res = await api.get('/tests?active=true');
      return res.data.data;
    },
  });

  const filteredTests = React.useMemo(() => {
    if (!tests) return [];
    if (activeCategory === 'All') return tests;
    return tests.filter((t) => t.category === activeCategory);
  }, [tests, activeCategory]);

  return (
    <section className="py-12 sm:py-16 bg-[#f8fafc] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Title Header */}
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-[#006642] bg-[#f0fdf4] px-3.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#00984a]" /> Fully Automated Clinical Pathology
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2 tracking-tight">
            Popular Diagnostic Pathology & Imaging Tests
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-2">
            <div className="h-1 bg-[#00984a] w-12 rounded-full" />
            <div className="h-1 bg-emerald-200 w-6 rounded-full" />
          </div>
        </div>

        {/* Dynamic Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
          <button
            onClick={() => setActiveCategory('All')}
            className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
              activeCategory === 'All'
                ? 'bg-brand-gradient text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#00984a]'
            }`}
          >
            All Tests
          </button>
          {categories?.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                activeCategory === cat.name
                  ? 'bg-brand-gradient text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-[#00984a]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Responsive Grid: Maximum 6 on Mobile, 8 on Desktop */}
        {isLoading ? (
          <div className="text-center py-16 text-xs text-slate-400">Loading diagnostic tests...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredTests.length > 0 ? (
              filteredTests.slice(0, 8).map((test, index) => {
                const inCart = isInCart(test._id);
                // Hide 7th and 8th items on mobile screens (index >= 6)
                const isHiddenOnMobile = index >= 6 ? 'hidden sm:flex' : 'flex';

                return (
                  <div
                    key={test._id}
                    className={`h-full bg-white rounded-2xl sm:rounded-3xl border-2 p-3.5 sm:p-5 shadow-sm transition-all duration-300 flex-col justify-between group ${isHiddenOnMobile} ${
                      inCart ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100' : 'border-slate-100 hover:border-[#00984a] hover:shadow-xl'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                        {test.iconUrl ? (
                          <img src={test.iconUrl} alt={test.name} className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shadow-sm shrink-0" />
                        ) : (
                          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#00984a] group-hover:bg-[#00984a] group-hover:text-white transition-all duration-300 flex items-center justify-center shadow-sm">
                            <TestTube2 className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                        )}

                        {test.homeCollectionAvailable && (
                          <span className="flex items-center gap-1 text-[8px] sm:text-[10px] font-bold text-[#006642] bg-[#f0fdf4] border border-emerald-200 px-2 py-0.5 rounded-full">
                            <Home className="w-3 h-3 text-[#00984a]" /> Home
                          </span>
                        )}
                      </div>

                      <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-[#006642] bg-emerald-50 px-2 py-0.5 rounded-md inline-block mb-1">
                        {test.category}
                      </span>

                      <h3 className="font-bold text-slate-900 text-xs sm:text-sm mb-1.5 group-hover:text-[#00984a] transition leading-snug truncate">
                        {test.name}
                      </h3>

                      <div className="space-y-1 text-[9px] sm:text-[11px] text-slate-500 mb-3 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        <p className="flex items-center gap-1 truncate">
                          <Info className="w-3 h-3 text-[#00984a] shrink-0" />
                          <span>Prep: <strong className="text-slate-700">{test.preparationInstructions}</strong></span>
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#00984a]" />
                          <span>Del: <strong className="text-slate-700">{test.reportDeliveryTime}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {test.regularPrice > test.discountPrice && (
                          <span className="text-[9px] sm:text-xs text-slate-400 line-through mr-1 font-semibold">৳{test.regularPrice}</span>
                        )}
                        <span className="text-xs sm:text-base font-black text-slate-900">৳{test.discountPrice}</span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-lg flex items-center gap-0.5">
                            <Check className="w-3 h-3 text-[#00984a]" /> In Cart
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(test._id)}
                            className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg transition active:scale-95"
                            title="Remove"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(test as any)}
                          className="bg-brand-gradient hover:opacity-95 text-white font-black text-[10px] sm:text-xs rounded-lg sm:rounded-xl px-2.5 sm:px-3.5 py-1.5 transition active:scale-95 flex items-center gap-1 shadow-xs"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Book</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No diagnostic tests found in this category.
              </div>
            )}
          </div>
        )}

        {/* View All Tests Button */}
        <div className="mt-8 sm:mt-10 text-center">
          <Link
            to="/tests"
            className="inline-flex items-center gap-2 bg-white hover:bg-[#f0fdf4] text-[#00984a] border-2 border-[#00984a] font-black text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-sm transition active:scale-95"
          >
            <span>Browse All Diagnostic Tests</span>
            <ArrowRight className="w-4 h-4 text-[#00984a]" />
          </Link>
        </div>
      </div>
    </section>
  );
};