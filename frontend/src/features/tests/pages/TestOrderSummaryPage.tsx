import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  Sparkles, 
  ShieldCheck, 
  Send, 
  ArrowLeft, 
  Building2, 
  Home, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CreditCard,
  Check
} from 'lucide-react';
import api from '@/lib/axios';
import { useTestCart } from '../context/TestCartContext';

export const TestOrderSummaryPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart, totalRegularPrice, totalDiscountPrice, totalSavings } = useTestCart();

  // Retrieve checkout form state from previous step or session
  const orderDraft = location.state?.orderDraft || {
    collectionType: 'CENTER_VISIT',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTimeSlot: '08:00 AM - 10:00 AM',
    patientName: 'Mohammad Ali',
    patientPhone: '01700000000',
    patientAge: 28,
    patientGender: 'MALE',
    collectionAddress: '',
    collectionLandmark: '',
    notes: '',
  };

  const [paymentMethod, setPaymentMethod] = useState<'CASH_AT_CENTER' | 'CASH_ON_COLLECTION' | 'BKASH'>('CASH_AT_CENTER');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const homeCollectionFee = orderDraft.collectionType === 'HOME_COLLECTION' ? 200 : 0;
  const netPayable = totalDiscountPrice + homeCollectionFee;

  const confirmMutation = useMutation({
    mutationFn: async (payload: any) => {
      return api.post('/test-bookings/book', payload);
    },
    onSuccess: (res) => {
      setConfirmedOrder(res.data.data);
      clearCart();
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to place test order.');
    },
  });

  const handleFinalOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setErrorMsg('Your test cart is empty. Please select tests.');
      return;
    }
    if (!agreedToTerms) {
      setErrorMsg('You must agree to the clinical testing terms.');
      return;
    }

    confirmMutation.mutate({
      ...orderDraft,
      testIds: cartItems.map((i) => i._id),
      paymentMethod,
    });
  };

  // FINAL ORDER RECEIPT SCREEN
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-10 px-4 pb-28">
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-100 shadow-2xl animate-in fade-in zoom-in-95">
          <div className="text-center pb-6 border-b border-slate-100">
            <div className="w-16 h-16 bg-emerald-100 text-[#00984a] rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="text-xs font-black uppercase tracking-widest text-[#00984a] bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200">
              Test Booking Order Placed
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Order Confirmed!
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your test order has been recorded in the central laboratory queue.
            </p>
          </div>

          <div className="my-6 bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 text-xs text-slate-700">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200">
              <span className="text-slate-500 font-medium">Tracking Order ID:</span>
              <strong className="text-sm font-black text-slate-900 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {confirmedOrder.bookingId}
              </strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Patient Details:</span>
              <strong className="text-slate-900">{confirmedOrder.patientName} ({confirmedOrder.patientAge}y, {confirmedOrder.patientGender})</strong>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Sample Collection:</span>
              <span className="font-bold text-[#00984a]">
                {confirmedOrder.collectionType === 'HOME_COLLECTION' ? '🏠 Doorstep Home Collection' : '🏥 Diagnostic Center Visit'}
              </span>
            </div>

            {confirmedOrder.collectionAddress && (
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Sample Address:</span>
                <strong className="text-slate-900 text-right max-w-xs truncate">{confirmedOrder.collectionAddress}</strong>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-medium">Scheduled Time:</span>
              <strong className="text-slate-900">{confirmedOrder.scheduledDate} ({confirmedOrder.scheduledTimeSlot})</strong>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <p className="font-bold text-slate-800 mb-2">Booked Tests ({confirmedOrder.tests?.length}):</p>
              <ul className="space-y-1">
                {confirmedOrder.tests?.map((t: any, idx: number) => (
                  <li key={idx} className="flex justify-between text-[11px] text-slate-600">
                    <span>• {t.name}</span>
                    <strong className="text-slate-900">৳{t.discountPrice}</strong>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200 font-bold">
              <span>Total Net Payable:</span>
              <span className="text-base font-black text-slate-900">৳{confirmedOrder.netPayableAmount}</span>
            </div>
          </div>

          <div className="bg-[#f0fdf4] border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 mb-6 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#00984a] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>জরুরি নির্দেশিকা:</strong> টেস্ট বুকিং নিশ্চিত করা হয়েছে। নির্ধারিত সময়ে আমাদের ল্যাব/স্যাম্পল টিম আপনার সাথে যোগাযোগ করবে।
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
            >
              <Printer className="w-4 h-4" /> Print Order Invoice
            </button>
            <Link
              to="/tests"
              className="flex-1 bg-brand-gradient hover:opacity-95 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center text-center shadow"
            >
              Done / Return to Tests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 pb-32">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link to="/test-booking" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00984a] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Edit Information
        </Link>

        {/* Top Header */}
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-8 text-white shadow-lg flex justify-between items-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              Final Order Review
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-2">Review Test Order Summary</h1>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1">
              Please review your diagnostic tests, sample schedule, and confirm order.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFinalOrderSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLS: ORDER DETAILS BREAKDOWN */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Patient & Schedule Summary Box */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00984a]" /> Patient & Specimen Schedule
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Patient</span>
                    <p className="font-bold text-slate-900 text-sm">{orderDraft.patientName}</p>
                    <p className="text-slate-600">{orderDraft.patientPhone} • {orderDraft.patientAge}y, {orderDraft.patientGender}</p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Collection Method</span>
                    <p className="font-bold text-[#00984a] text-sm">
                      {orderDraft.collectionType === 'HOME_COLLECTION' ? '🏠 Home Sample Collection' : '🏥 Diagnostic Center Visit'}
                    </p>
                    <p className="text-slate-600">{orderDraft.scheduledDate} ({orderDraft.scheduledTimeSlot})</p>
                  </div>
                </div>

                {orderDraft.collectionAddress && (
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-slate-400 font-bold uppercase text-[10px]">Sample Pickup Address</span>
                    <p className="font-medium text-slate-900">{orderDraft.collectionAddress}</p>
                    {orderDraft.collectionLandmark && <p className="text-slate-500">Landmark: {orderDraft.collectionLandmark}</p>}
                  </div>
                )}
              </div>

              {/* Itemized Tests List */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#00984a]" /> Diagnostic Tests Breakdown</span>
                  <span className="text-[#00984a] font-bold">{cartItems.length} Tests</span>
                </h3>

                <div className="divide-y divide-slate-100">
                  {cartItems.map((item, idx) => (
                    <div key={item._id} className="py-3 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{item.code}</span>
                        <h4 className="font-bold text-slate-900 text-xs mt-1">{item.name}</h4>
                        <p className="text-[10px] text-slate-400">{item.category} • Prep: {item.preparationInstructions || 'Standard'}</p>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-slate-900 text-sm">৳{item.discountPrice}</span>
                        {item.regularPrice > item.discountPrice && (
                          <span className="text-[10px] text-slate-400 line-through block">৳{item.regularPrice}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3 text-xs">
                <h3 className="font-black text-slate-900 text-sm border-b pb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#00984a]" /> Select Payment Method
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                      paymentMethod === 'CASH_AT_CENTER'
                        ? 'bg-emerald-50 border-[#00984a] font-bold text-slate-900'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'CASH_AT_CENTER'}
                      onChange={() => setPaymentMethod('CASH_AT_CENTER')}
                    />
                    <span>Pay Cash on Visit / Sample Collection</span>
                  </label>

                  <label
                    className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                      paymentMethod === 'BKASH'
                        ? 'bg-emerald-50 border-[#00984a] font-bold text-slate-900'
                        : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === 'BKASH'}
                      onChange={() => setPaymentMethod('BKASH')}
                    />
                    <span>bKash / Nagad Online Gateway</span>
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT 1 COL: INVOICE TOTAL & CONFIRM */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-4 text-xs">
              <h3 className="font-black text-slate-900 text-base border-b pb-2">Billing Summary</h3>

              <div className="space-y-2 text-slate-600">
                <div className="flex justify-between">
                  <span>Regular Subtotal:</span>
                  <span>৳{totalRegularPrice}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-[#00984a] font-bold">
                    <span>Discount Savings:</span>
                    <span>-৳{totalSavings}</span>
                  </div>
                )}
                {orderDraft.collectionType === 'HOME_COLLECTION' && (
                  <div className="flex justify-between text-slate-800 font-bold">
                    <span>Doorstep Home Fee:</span>
                    <span>+৳200</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                  <span>Net Payable Amount:</span>
                  <span>৳{netPayable}</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 text-[11px]">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00984a]"
                  />
                  <span>I agree to the Diagnostic Testing Policy</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={confirmMutation.isPending || cartItems.length === 0}
                className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-4 rounded-2xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{confirmMutation.isPending ? 'Processing Order...' : 'Confirm & Place Test Order'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};