import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTestCart } from '../context/TestCartContext';
import { 
  ShoppingBag, 
  Trash2, 
  X, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';

export const TestCartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    removeFromCart,
    clearCart,
    totalRegularPrice,
    totalDiscountPrice,
    totalSavings,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
  } = useTestCart();

  if (!isCartDrawerOpen || cartItems.length === 0) return null;

  const handleProceedToCheckout = () => {
    setIsCartDrawerOpen(false);
    navigate('/test-booking');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md h-full shadow-2xl p-5 sm:p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">Diagnostic Tests Cart</h3>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  {cartItems.length} Selected Test{cartItems.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCartDrawerOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Test Items List */}
          <div className="mt-4 space-y-2.5 max-h-[calc(100vh-300px)] overflow-y-auto no-scrollbar">
            {cartItems.map((item) => (
              <div
                key={item._id}
                className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-3 group hover:border-emerald-300 transition"
              >
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-100/70 px-1.5 py-0.5 rounded">
                    {item.category}
                  </span>
                  <h4 className="font-bold text-slate-900 text-xs mt-1 truncate">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-black text-slate-900">৳{item.discountPrice}</span>
                    {item.regularPrice > item.discountPrice && (
                      <span className="text-[10px] text-slate-400 line-through">৳{item.regularPrice}</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition shrink-0"
                  title="Remove test from cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer & Checkout Action (Clean Fit) */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          {totalSavings > 0 && (
            <div className="bg-emerald-50 text-emerald-800 p-2.5 rounded-2xl text-xs font-bold flex items-center justify-between border border-emerald-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" /> Total Savings:
              </span>
              <span className="font-black text-sm text-[#00984a]">৳{totalSavings}</span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-bold">Total Net Payable:</span>
            <span className="text-xl font-black text-slate-900">৳{totalDiscountPrice}</span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={clearCart}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl text-xs transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="flex-1 bg-brand-gradient hover:opacity-95 text-white font-black py-3 rounded-2xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};