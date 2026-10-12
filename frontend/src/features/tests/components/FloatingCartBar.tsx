import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTestCart } from '../context/TestCartContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const FloatingCartBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    cartItems,
    totalDiscountPrice,
    totalSavings,
    setIsCartDrawerOpen,
  } = useTestCart();

  if (cartItems.length === 0 || location.pathname === '/test-booking') {
    return null;
  }

  const handleCheckout = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/test-booking');
  };

  return (
    <aside 
      aria-label="Diagnostic test cart" 
      className="fixed bottom-16 lg:bottom-6 left-2 right-16 lg:left-auto lg:right-28 z-40 max-w-[calc(100vw-4.5rem)] animate-in slide-in-from-bottom-5 duration-300"
    >
      <div 
        onClick={() => setIsCartDrawerOpen(true)}
        className="bg-slate-950/95 backdrop-blur-lg text-white p-2.5 sm:p-3.5 rounded-2xl sm:rounded-3xl shadow-2xl border border-emerald-500/30 flex items-center justify-between gap-2 sm:gap-6 cursor-pointer hover:border-[#00984a] transition-all ring-2 ring-emerald-950/40 w-full"
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-bold shadow-md">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-slate-950">
              {cartItems.length}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-black text-sm sm:text-lg text-white leading-none">৳{totalDiscountPrice}</span>
              {totalSavings > 0 && (
                <span className="text-[9px] sm:text-[10px] font-black text-emerald-300 bg-emerald-900/90 border border-emerald-500/50 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                  Save ৳{totalSavings}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCheckout}
          className="bg-brand-gradient hover:opacity-95 text-white font-black text-xs sm:text-sm px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl transition shadow-lg flex items-center gap-1 shrink-0 active:scale-95"
        >
          <span>Checkout</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      </div>
    </aside>
  );
};