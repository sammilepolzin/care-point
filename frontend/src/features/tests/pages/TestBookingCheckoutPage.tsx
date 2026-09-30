import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  Trash2, 
  MapPin, 
  Home, 
  Building2, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Printer, 
  ShieldCheck,
  Send,
  Loader2
} from 'lucide-react';
import api from '@/lib/axios';
import { useTestCart } from '../context/TestCartContext';
import { useAuth } from '@/features/auth/context/AuthContext';

export const TestBookingCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    cartItems,
    removeFromCart,
    clearCart,
    totalRegularPrice,
    totalDiscountPrice,
    totalSavings,
  } = useTestCart();

  const todayStr = new Date().toISOString().split('T')[0];

  const [collectionType, setCollectionType] = useState<'CENTER_VISIT' | 'HOME_COLLECTION'>('CENTER_VISIT');
  const [scheduledDate, setScheduledDate] = useState<string>(todayStr);
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState<string>('08:00 AM - 10:00 AM');
  const [collectionAddress, setCollectionAddress] = useState<string>('');
  const [collectionLandmark, setCollectionLandmark] = useState<string>('');

  const [patientName, setPatientName] = useState<string>(user?.name || '');
  const [patientPhone, setPatientPhone] = useState<string>(user?.phone || '');
  const [patientAge, setPatientAge] = useState<number | string>(28);
  const [patientGender, setPatientGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [notes, setNotes] = useState<string>('');

  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const homeCollectionFee = collectionType === 'HOME_COLLECTION' ? 200 : 0;
  const netPayable = totalDiscountPrice + homeCollectionFee;

  const timeSlots = [
    '07:30 AM - 09:30 AM',
    '09:30 AM - 11:30 AM',
    '11:30 AM - 01:30 PM',
    '02:30 PM - 04:30 PM',
    '05:00 PM - 07:00 PM',
  ];

  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/test-bookings/book', payload),
    onSuccess: (res) => {
      setConfirmedOrder(res.data.data);
      clearCart();
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to place test booking.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setErrorMsg('Your test cart is empty. Please add diagnostic tests first.');
      return;
    }
    if (!patientName.trim()) {
      setErrorMsg('Please enter patient full name.');
      return;
    }
    if (!patientPhone.trim() || patientPhone.length < 11) {
      setErrorMsg('Please enter a valid 11-digit mobile phone number.');
      return;
    }
    if (collectionType === 'HOME_COLLECTION' && !collectionAddress.trim()) {
      setErrorMsg('Please provide your complete home address.');
      return;
    }

    bookingMutation.mutate({
      patientName: patientName.trim(),
      patientPhone: patientPhone.trim(),
      patientAge: Number(patientAge) || 28,
      patientGender,
      collectionType,
      collectionAddress: collectionType === 'HOME_COLLECTION' ? collectionAddress.trim() : undefined,
      collectionLandmark: collectionType === 'HOME_COLLECTION' ? collectionLandmark.trim() : undefined,
      scheduledDate,
      scheduledTimeSlot,
      testIds: cartItems.map((i) => i._id),
      items: cartItems.map((i) => ({
        _id: i._id,
        name: i.name,
        code: i.code,
        regularPrice: i.regularPrice,
        discountPrice: i.discountPrice,
      })),
      notes: notes.trim(),
    });
  };

  // 🖨️ CONFIRMED TEST BOOKING MONEY RECEIPT (PERFECT PRINT TEMPLATE)
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 px-4">
        <div className="print-container max-w-2xl mx-auto bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-100 shadow-2xl">
          
          {/* Header on Paper */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                  C
                </div>
                <span className="text-xl font-black text-slate-900 tracking-tight">Care Point</span>
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Diagnostic & Clinical Laboratory
              </p>
              <p className="text-[10px] text-slate-500">Hotline: 09666 787801 | Dhanmondi, Dhaka</p>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                Laboratory Test Voucher
              </span>
              <p className="font-mono text-slate-900 font-bold text-xs mt-1">Order ID: {confirmedOrder.bookingId}</p>
              <p className="text-[10px] text-slate-400">{confirmedOrder.scheduledDate}</p>
            </div>
          </div>

          {/* Collection Status */}
          <div className="my-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Collection Mode</span>
              <strong className="text-sm font-black text-[#00984a]">
                {confirmedOrder.collectionType === 'HOME_COLLECTION' ? '🏠 Doorstep Home Sample' : '🏥 Diagnostic Center Visit'}
              </strong>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Schedule Slot</span>
              <strong className="text-slate-900 font-bold">{confirmedOrder.scheduledDate} ({confirmedOrder.scheduledTimeSlot})</strong>
            </div>
          </div>

          {/* Patient Details */}
          <div className="bg-white p-3 rounded-xl border border-slate-100 mb-4 text-xs space-y-1">
            <p className="text-slate-700">Patient: <strong className="text-slate-900">{confirmedOrder.patientName}</strong> ({confirmedOrder.patientAge}y, {confirmedOrder.patientGender})</p>
            <p className="text-slate-600">Mobile: <strong className="text-slate-900">{confirmedOrder.patientPhone}</strong></p>
            {confirmedOrder.collectionAddress && (
              <p className="text-slate-600">Address: <strong className="text-slate-900">{confirmedOrder.collectionAddress}</strong></p>
            )}
          </div>

          {/* Tests Table */}
          <table className="w-full text-left text-xs mb-4 border-collapse">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2">Test Name</th>
                <th className="py-2 text-right">Fee (BDT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {confirmedOrder.tests?.map((t: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-2 text-slate-900 font-medium">• {t.name}</td>
                  <td className="py-2 text-right text-slate-900 font-black">৳{t.discountPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>৳{confirmedOrder.totalRegularAmount}</span>
            </div>
            {confirmedOrder.totalDiscountAmount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Savings:</span>
                <span>-৳{confirmedOrder.totalDiscountAmount}</span>
              </div>
            )}
            {confirmedOrder.homeCollectionFee > 0 && (
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Home Collection Fee:</span>
                <span>+৳{confirmedOrder.homeCollectionFee}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
              <span>Net Payable (Pay at Collection / Center):</span>
              <span>৳{confirmedOrder.netPayableAmount}</span>
            </div>
          </div>

          {/* Signature Line */}
          <div className="pt-10 flex justify-between items-end border-t border-slate-200 text-xs text-slate-400">
            <p className="text-[9px]">Receipt issued by Care Point Automated Billing.</p>
            <div className="text-center">
              <div className="w-36 border-b border-slate-400 mb-1" />
              <span className="text-[9px] font-bold text-slate-600">Authorized Cashier Seal</span>
            </div>
          </div>

          {/* ACTION BUTTONS (HIDDEN ON PRINT) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3 no-print">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow"
            >
              <Printer className="w-4 h-4" /> Print Money Receipt (মানি রিসিট প্রিন্ট)
            </button>
            <Link
              to="/tests"
              className="flex-1 bg-brand-gradient hover:opacity-95 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center text-center shadow"
            >
              Done / Return
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-10 pb-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-lg">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
            Checkout & Confirmation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Diagnostic Test Booking Checkout</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Review ordered tests, select collection mode, and confirm your laboratory appointment.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Collection Mode */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#00984a]" /> 1. Sample Collection Mode *
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <label
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                      collectionType === 'CENTER_VISIT'
                        ? 'bg-emerald-50 border-[#00984a] shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="collType"
                      checked={collectionType === 'CENTER_VISIT'}
                      onChange={() => setCollectionType('CENTER_VISIT')}
                      className="mt-0.5 text-[#00984a] focus:ring-[#00984a]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <Building2 className="w-4 h-4 text-[#00984a]" /> Center Visit (সেন্টারে আগমন)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">Visit diagnostic center for sample handover.</p>
                      <span className="text-[10px] font-black text-[#00984a] mt-1 block">Collection Fee: ৳0</span>
                    </div>
                  </label>

                  <label
                    className={`p-4 rounded-2xl border-2 flex items-start gap-3 cursor-pointer transition ${
                      collectionType === 'HOME_COLLECTION'
                        ? 'bg-emerald-50 border-[#00984a] shadow-sm'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="collType"
                      checked={collectionType === 'HOME_COLLECTION'}
                      onChange={() => setCollectionType('HOME_COLLECTION')}
                      className="mt-0.5 text-[#00984a] focus:ring-[#00984a]"
                    />
                    <div>
                      <span className="font-bold text-slate-900 block flex items-center gap-1">
                        <Home className="w-4 h-4 text-[#00984a]" /> Home Collection (হোম স্যাম্পল)
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">Certified phlebotomist collects sample from your home.</p>
                      <span className="text-[10px] font-black text-emerald-800 mt-1 block">Doorstep Fee: ৳200</span>
                    </div>
                  </label>
                </div>

                {collectionType === 'HOME_COLLECTION' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 text-xs font-bold text-slate-700 animate-in fade-in">
                    <div>
                      <label className="block mb-1">Full Home Address (বাসার পূর্ণাঙ্গ ঠিকানা) *</label>
                      <textarea
                        rows={2}
                        required
                        value={collectionAddress}
                        onChange={(e) => setCollectionAddress(e.target.value)}
                        placeholder="House No, Road No, Area, City..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1">Nearby Landmark (কাছের পরিচিত স্থান)</label>
                      <input
                        type="text"
                        value={collectionLandmark}
                        onChange={(e) => setCollectionLandmark(e.target.value)}
                        placeholder="e.g. Near Dhanmondi Lake, Opposite Mosque"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Date & Time */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00984a]" /> 2. Schedule Date & Time Slot *
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1">Date *</label>
                    <input
                      type="date"
                      min={todayStr}
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Time Slot *</label>
                    <select
                      value={scheduledTimeSlot}
                      onChange={(e) => setScheduledTimeSlot(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    >
                      {timeSlots.map((ts) => (
                        <option key={ts} value={ts}>{ts}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00984a]" /> 3. Patient Information *
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-bold text-slate-700">
                  <div>
                    <label className="block mb-1">Patient Full Name *</label>
                    <input
                      type="text"
                      required
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Mohammad Ali"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Mobile Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={patientPhone}
                      onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Age *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={120}
                      value={patientAge}
                      onChange={(e) => setPatientAge(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Gender *</label>
                    <select
                      value={patientGender}
                      onChange={(e: any) => setPatientGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    >
                      <option value="MALE">Male (পুরুষ)</option>
                      <option value="FEMALE">Female (মহিলা)</option>
                      <option value="OTHER">Other (অন্যান্য)</option>
                    </select>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingMutation.isPending || cartItems.length === 0}
                className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-4 rounded-2xl text-sm transition shadow-lg shadow-emerald-700/20 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
              >
                {bookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Diagnostic Order...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm Diagnostic Test Booking</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* CART SUMMARY */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit space-y-4">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs font-bold text-[#00984a]">{cartItems.length} Tests</span>
            </h3>

            {cartItems.length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-2 max-h-60 overflow-y-auto no-scrollbar">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-start text-xs pb-2 border-b border-slate-100">
                      <div className="pr-2">
                        <p className="font-bold text-slate-900 truncate max-w-[170px]">{item.name}</p>
                        <span className="text-[10px] text-slate-400">{item.code}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-slate-900 block">৳{item.discountPrice}</span>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item._id)}
                          className="text-[10px] text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-1.5 text-xs text-slate-600 border-t border-slate-200">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>৳{totalRegularPrice}</span>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-[#00984a] font-bold">
                      <span>Discount Savings:</span>
                      <span>-৳{totalSavings}</span>
                    </div>
                  )}
                  {collectionType === 'HOME_COLLECTION' && (
                    <div className="flex justify-between text-slate-800 font-bold">
                      <span>Home Collection Fee:</span>
                      <span>+৳200</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Net Amount:</span>
                    <span>৳{netPayable}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Your cart is empty. <Link to="/tests" className="text-[#00984a] underline block mt-1">Browse Tests</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};