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
  Trash2 
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
              className="bg-white hover:bg-slate-100 text-[#00984a] font-black text-xs px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl shadow transition shrink-0 flex items-center gap-2"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
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
                    <div>
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
                          <Clock className="w-2.5 h-2.5 text-[#00984a] shrink-0" />
                          <span className="truncate">Del: <strong className="text-slate-700">{test.reportDeliveryTime}</strong></span>
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        {test.regularPrice > test.discountPrice && (
                          <span className="text-[8.5px] sm:text-[10px] text-slate-400 line-through mr-1 font-semibold">৳{test.regularPrice}</span>
                        )}
                        <span className="text-xs sm:text-base font-black text-slate-900">৳{test.discountPrice}</span>
                      </div>

                      {inCart ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[8px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 sm:px-2 py-1 rounded-lg flex items-center gap-0.5">
                            <Check className="w-2.5 h-2.5 text-[#00984a]" /> In Cart
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(test._id)}
                            className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg text-xs transition active:scale-95"
                            title="Remove from Cart"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addToCart(test as any)}
                          className="bg-brand-gradient hover:opacity-95 text-white font-black text-[9px] sm:text-xs px-2.5 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl transition shadow-xs flex items-center gap-1 active:scale-95"
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
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No diagnostic tests found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};