import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  ShoppingBag, 
  Trash2, 
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
  Loader2, 
  Lock, 
  UserCheck, 
  Check, 
  Sparkles 
} from 'lucide-react';
import api from '@/lib/axios';
import { useTestCart } from '../context/TestCartContext';
import { useAuth } from '@/features/auth/context/AuthContext';

// 🇧🇩 STRICT 11-DIGIT BD PHONE REGEX
const BD_PHONE_REGEX = /^01[3-9]\d{8}$/;

interface SystemSettings {
  siteName?: string;
  tagline?: string;
  logoUrl?: string;
  topbarHotlineText?: string;
  hotline?: string;
  address?: string;
}

// 🌟 DYNAMIC TIME FORMATTER (12H AM/PM)
const formatTimeTo12Hour = (timeStr: string): string => {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours, 10);
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const formattedHours = h % 12 || 12;
  return `${String(formattedHours).padStart(2, '0')}:${minutes} ${ampm}`;
};

export const TestBookingCheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, isAuthenticated } = useAuth();
  const {
    cartItems,
    items,
    removeFromCart,
    clearCart,
  } = useTestCart();

  // 🌟 ROBUST CART ITEMS FALLBACK
  const currentCartItems = useMemo(() => {
    if (cartItems && cartItems.length > 0) return cartItems;
    if (items && items.length > 0) return items;
    return [];
  }, [cartItems, items]);

  const todayStr = new Date().toISOString().split('T')[0];

  // 🌟 100% RELIABLE LIVE SUB-TOTAL & DISCOUNT CALCULATIONS
  const calculatedDiscountTotal = useMemo(() => {
    return currentCartItems.reduce((sum, item: any) => {
      const price = Number(item.discountPrice) || Number(item.regularPrice) || Number(item.price) || 0;
      return sum + price;
    }, 0);
  }, [currentCartItems]);

  const calculatedRegularTotal = useMemo(() => {
    return currentCartItems.reduce((sum, item: any) => {
      const regular = Number(item.regularPrice) || Number(item.discountPrice) || Number(item.price) || 0;
      return sum + regular;
    }, 0);
  }, [currentCartItems]);

  const calculatedSavings = Math.max(0, calculatedRegularTotal - calculatedDiscountTotal);

  // Dynamic Settings for Receipt
  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => (await api.get('/settings')).data.data,
    staleTime: 1000 * 60 * 10,
  });

  const [collectionType, setCollectionType] = useState<'CENTER_VISIT' | 'HOME_COLLECTION'>('CENTER_VISIT');
  const [scheduledDate, setScheduledDate] = useState<string>(todayStr);

  // 🌟 2. NOT PRE-SELECTED: INITIAL EMPTY STATE (ইউজারকে অবশ্যই সিলেক্ট করতে হবে)
  const [exactTime, setExactTime] = useState<string>(''); // শুরুতে কোনো সময় সিলেক্ট থাকবে না
  const [timeShiftPreference, setTimeShiftPreference] = useState<string>(''); // শুরুতে কোনো শিফট সিলেক্ট থাকবে না

  const [collectionAddress, setCollectionAddress] = useState<string>('');
  const [collectionLandmark, setCollectionLandmark] = useState<string>('');

  // Patient Info States
  const [patientType, setPatientType] = useState<'NEW' | 'REGISTERED'>('NEW');
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [newPatientPassword, setNewPatientPassword] = useState<string>('');
  const [patientAge, setPatientAge] = useState<number | string>(28);
  const [patientGender, setPatientGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [notes, setNotes] = useState<string>('');

  // Registered Patient States
  const [loginIdentifier, setLoginIdentifier] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isPatientVerified, setIsPatientVerified] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isRegisteringAndBooking, setIsRegisteringAndBooking] = useState<boolean>(false);

  // Auto-Prefill for Logged In Patient
  useEffect(() => {
    if (isAuthenticated && authUser) {
      setPatientName(authUser.name || '');
      setPatientPhone(authUser.phone ? authUser.phone.replace(/\D/g, '').slice(0, 11) : '');
      setIsPatientVerified(true);
    }
  }, [isAuthenticated, authUser]);

  const homeCollectionFee = collectionType === 'HOME_COLLECTION' ? 200 : 0;
  const netPayable = calculatedDiscountTotal + homeCollectionFee;

  // REGISTERED PATIENT LOGIN
  const patientLoginMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/auth/login', payload),
    onSuccess: (res) => {
      const responseData = res.data?.data;
      const u = responseData?.user;
      const accessToken = responseData?.accessToken;
      const refreshToken = responseData?.refreshToken;

      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      if (u) {
        setPatientName(u.name || '');
        setPatientPhone(u.phone ? u.phone.replace(/\D/g, '').slice(0, 11) : '');
        setPatientAge(u.age || 28);
        setPatientGender(u.gender === 'FEMALE' ? 'FEMALE' : u.gender === 'OTHER' ? 'OTHER' : 'MALE');
        setIsPatientVerified(true);
        setLoginError(null);
      }
    },
    onError: (err: any) => {
      setLoginError(err.response?.data?.message || 'ভুল মোবাইল নম্বর বা পাসওয়ার্ড।');
    },
  });

  const handlePatientLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanInput = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanInput) {
      setLoginError('মোবাইল নম্বর বা ইমেইল প্রদান করুন।');
      return;
    }
    if (!cleanPass || cleanPass.length < 6) {
      setLoginError('পাসওয়ার্ড ন্যূনতম ৬ ডিজিট বা অক্ষরের হতে হবে।');
      return;
    }

    patientLoginMutation.mutate({
      email: cleanInput,
      identifier: cleanInput,
      phone: cleanInput,
      password: cleanPass,
    });
  };

  // TEST BOOKING MUTATION
  const bookingMutation = useMutation({
    mutationFn: async (payload: any) => {
      try {
        return await api.post('/test-bookings/book', payload);
      } catch (err: any) {
        if (err.response?.status === 404) {
          return await api.post('/test-bookings', payload);
        }
        throw err;
      }
    },
    onSuccess: (res) => {
      setConfirmedOrder(res.data.data);
      clearCart();
      setErrorMsg(null);
      setIsRegisteringAndBooking(false);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to place diagnostic test booking.');
      setIsRegisteringAndBooking(false);
    },
  });

  // 🌟 FORM SUBMISSION WITH STRICT VALIDATIONS
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (currentCartItems.length === 0) {
      setErrorMsg('আপনার টেস্ট কার্ট খালি। অনুগ্রহ করে প্রথমে টেস্ট যুক্ত করুন।');
      return;
    }

    // 🛑 সময় সিলেকশন বাধ্যমূলক চেক (Must select exact time or shift)
    if (!exactTime && !timeShiftPreference) {
      setErrorMsg('অনুগ্রহ করে স্যাম্পল দেওয়ার নির্দিষ্ট সময় (Time) অথবা শিফট (Shift) নির্বাচন করুন।');
      return;
    }

    if (!isAuthenticated && patientType === 'REGISTERED' && !isPatientVerified) {
      setErrorMsg('অনুগ্রহ করে প্রথমে সাইন ইন করে আপনার অ্যাকাউন্ট ভেরিফাই করুন।');
      return;
    }

    if (!patientName.trim()) {
      setErrorMsg('রোগীর পূর্ণ নাম আবশ্যক।');
      return;
    }

    // মোবাইল নম্বর চেক
    const cleanPhone = patientPhone.replace(/\D/g, '').slice(0, 11);
    if (!cleanPhone || cleanPhone.length !== 11 || !BD_PHONE_REGEX.test(cleanPhone)) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)। কোনো অক্ষর গ্রহণযোগ্য নয়।');
      return;
    }

    // নতুন রোগীর পাসওয়ার্ড চেক
    if (!isAuthenticated && patientType === 'NEW') {
      if (!newPatientPassword || newPatientPassword.length < 6) {
        setErrorMsg('পাসওয়ার্ড ন্যূনতম ৬ ডিজিট বা অক্ষরের হতে হবে (কমপক্ষে ৬টি ক্যারেক্টার)।');
        return;
      }
    }

    if (collectionType === 'HOME_COLLECTION' && !collectionAddress.trim()) {
      setErrorMsg('হোম স্যাম্পল কালেকশনের জন্য আপনার বাসার পূর্ণাঙ্গ ঠিকানা দিন।');
      return;
    }

    // ফাইনাল ফরম্যাটেড টাইম
    const formattedDynamicTimeSlot = exactTime && timeShiftPreference
      ? `${formatTimeTo12Hour(exactTime)} [${timeShiftPreference}]`
      : exactTime
      ? formatTimeTo12Hour(exactTime)
      : timeShiftPreference;

    setIsRegisteringAndBooking(true);

    // নতুন রোগীর অটোমেটিক একাউন্ট তৈরি
    if (!isAuthenticated && patientType === 'NEW') {
      try {
        const regRes = await api.post('/auth/register', {
          name: patientName.trim(),
          phone: cleanPhone,
          password: newPatientPassword.trim(),
          age: Number(patientAge) || 28,
          gender: patientGender,
        });

        const regData = regRes.data?.data;
        if (regData?.accessToken) {
          localStorage.setItem('accessToken', regData.accessToken);
          if (regData.refreshToken) localStorage.setItem('refreshToken', regData.refreshToken);
          if (regData.user) localStorage.setItem('user', JSON.stringify(regData.user));
        }
      } catch (regErr: any) {
        if (regErr.response?.status === 409) {
          setErrorMsg('এই মোবাইল নম্বরটি ইতোমধ্যে নিবন্ধিত! দয়া করে উপরে "Already Registered ?" নির্বাচন করে পাসওয়ার্ড দিন।');
          setIsRegisteringAndBooking(false);
          return;
        }
      }
    }

    // টেস্ট বুকিং সাবমিট
    bookingMutation.mutate({
      patientName: patientName.trim(),
      patientPhone: cleanPhone,
      patientAge: Number(patientAge) || 28,
      patientGender,
      collectionType,
      collectionAddress: collectionType === 'HOME_COLLECTION' ? collectionAddress.trim() : undefined,
      collectionLandmark: collectionType === 'HOME_COLLECTION' ? collectionLandmark.trim() : undefined,
      scheduledDate,
      scheduledTimeSlot: formattedDynamicTimeSlot,
      testIds: currentCartItems.map((i: any) => i._id || i.id),
      items: currentCartItems.map((i: any) => ({
        _id: i._id || i.id,
        name: i.name,
        code: i.code,
        regularPrice: Number(i.regularPrice) || Number(i.discountPrice) || Number(i.price) || 0,
        discountPrice: Number(i.discountPrice) || Number(i.regularPrice) || Number(i.price) || 0,
      })),
      notes: notes.trim(),
    });
  };

  // 🖨️ CONFIRMED TEST BOOKING MONEY RECEIPT
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-4 sm:py-12 px-2.5 sm:px-6">
        <div className="print-container max-w-2xl mx-auto bg-white rounded-3xl p-4 sm:p-10 border-2 border-emerald-100 shadow-2xl">
          
          <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900 gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {settings?.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings?.siteName || 'Logo'}
                    className="h-9 sm:h-10 w-auto max-w-[140px] sm:max-w-[180px] object-contain shrink-0"
                  />
                ) : null}
                {settings?.siteName && (
                  <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate">
                    {settings.siteName}
                  </span>
                )}
              </div>

              {settings?.tagline && (
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
                  {settings.tagline}
                </p>
              )}

              <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">
                {settings?.topbarHotlineText || settings?.hotline ? `Hotline: ${settings?.topbarHotlineText || settings?.hotline}` : ''}
                {settings?.address ? ` | ${settings.address}` : ''}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 sm:px-3 py-1 rounded-full">
                Test Voucher
              </span>
              <p className="font-mono text-slate-900 font-bold text-[11px] sm:text-xs mt-1">ID: {confirmedOrder.bookingId}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400">{confirmedOrder.scheduledDate}</p>
            </div>
          </div>

          <div className="my-4 p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
            <div>
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Collection Mode</span>
              <strong className="text-xs sm:text-sm font-black text-[#00984a]">
                {confirmedOrder.collectionType === 'HOME_COLLECTION' ? '🏠 Doorstep Home Sample' : '🏥 Center Visit'}
              </strong>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Schedule Slot</span>
              <strong className="text-slate-900 font-bold text-xs">{confirmedOrder.scheduledDate} ({confirmedOrder.scheduledTimeSlot})</strong>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl border border-slate-100 mb-4 text-xs space-y-1">
            <p className="text-slate-700">Patient: <strong className="text-slate-900">{confirmedOrder.patientName}</strong> ({confirmedOrder.patientAge}y, {confirmedOrder.patientGender})</p>
            <p className="text-slate-600">Mobile: <strong className="text-slate-900">{confirmedOrder.patientPhone}</strong></p>
            {confirmedOrder.collectionAddress && (
              <p className="text-slate-600">Address: <strong className="text-slate-900">{confirmedOrder.collectionAddress}</strong></p>
            )}
          </div>

          <div className="overflow-x-auto">
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
                    <td className="py-2 text-right text-slate-900 font-black">৳{t.discountPrice || t.price || t.regularPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-1 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span>৳{confirmedOrder.totalRegularAmount || calculatedRegularTotal}</span>
            </div>
            {calculatedSavings > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Savings:</span>
                <span>-৳{calculatedSavings}</span>
              </div>
            )}
            {confirmedOrder.homeCollectionFee > 0 && (
              <div className="flex justify-between text-slate-700 font-semibold">
                <span>Home Collection Fee:</span>
                <span>+৳{confirmedOrder.homeCollectionFee}</span>
              </div>
            )}
            <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
              <span>Net Payable Amount:</span>
              <span>৳{confirmedOrder.netPayableAmount || netPayable}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2.5 no-print">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print Voucher
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
    <div className="min-h-screen bg-[#f8fafc] py-4 sm:py-8 pb-28">
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 space-y-4 sm:space-y-6">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-lg">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
            Diagnostic Booking Checkout
          </span>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-black mt-2">Laboratory Test Booking & Checkout</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1">
            Configure sample pickup or center visit time, and confirm your booking.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 p-3.5 sm:p-4 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
          
          {/* LEFT 2 COLUMNS: FORM */}
          <div className="lg:col-span-2 w-full min-w-0">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              
              {/* 1. Sample Collection Mode */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <Home className="w-4 h-4 text-[#00984a]" /> 1. Sample Collection Mode *
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                  <label
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 flex items-start gap-2.5 cursor-pointer transition ${
                      collectionType === 'CENTER_VISIT'
                        ? 'bg-emerald-50 border-[#00984a] shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="collType"
                      checked={collectionType === 'CENTER_VISIT'}
                      onChange={() => setCollectionType('CENTER_VISIT')}
                      className="mt-0.5 text-[#00984a] focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block flex items-center gap-1 text-xs sm:text-sm">
                        <Building2 className="w-3.5 h-3.5 text-[#00984a] shrink-0" /> Center Visit (সেন্টারে আগমন)
                      </span>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Visit center for sample handover.</p>
                      <span className="text-[10px] font-black text-[#00984a] mt-0.5 block">Fee: ৳0</span>
                    </div>
                  </label>

                  <label
                    className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 flex items-start gap-2.5 cursor-pointer transition ${
                      collectionType === 'HOME_COLLECTION'
                        ? 'bg-emerald-50 border-[#00984a] shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="collType"
                      checked={collectionType === 'HOME_COLLECTION'}
                      onChange={() => setCollectionType('HOME_COLLECTION')}
                      className="mt-0.5 text-[#00984a] focus:ring-0 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block flex items-center gap-1 text-xs sm:text-sm">
                        <Home className="w-3.5 h-3.5 text-[#00984a] shrink-0" /> Home Collection (হোম স্যাম্পল)
                      </span>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">Sample collected from home.</p>
                      <span className="text-[10px] font-black text-emerald-800 mt-0.5 block">Doorstep Fee: ৳200</span>
                    </div>
                  </label>
                </div>

                {collectionType === 'HOME_COLLECTION' && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 text-xs font-bold text-slate-700 animate-in fade-in">
                    <div>
                      <label className="block mb-1 text-slate-800">Full Home Address (বাসার পূর্ণাঙ্গ ঠিকানা) *</label>
                      <textarea
                        rows={2}
                        required
                        value={collectionAddress}
                        onChange={(e) => setCollectionAddress(e.target.value)}
                        placeholder="House No, Road No, Area, City..."
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-slate-800">Nearby Landmark (পরিচিত স্থান)</label>
                      <input
                        type="text"
                        value={collectionLandmark}
                        onChange={(e) => setCollectionLandmark(e.target.value)}
                        placeholder="e.g. Near Dhanmondi Lake, Opposite Mosque"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* 🌟 2. UNSELECTED DYNAMIC TIME SELECTION (MUST SELECT) */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#00984a]" /> 2. Schedule Date & Time Selection (সময় নির্বাচন) *
                  </h3>
                  {exactTime || timeShiftPreference ? (
                    <span className="text-[10px] text-[#00984a] font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Selected: {exactTime ? formatTimeTo12Hour(exactTime) : timeShiftPreference}
                    </span>
                  ) : (
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                      * Not Selected
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs font-bold text-slate-700">
                  {/* Date Picker */}
                  <div>
                    <label className="block mb-1.5 text-slate-800">Appointment Date (তারিখ) *</label>
                    <input
                      type="date"
                      min={todayStr}
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    />
                  </div>

                  {/* Exact Time Picker (Empty by default) */}
                  <div>
                    <label className="block mb-1.5 text-slate-800 flex items-center justify-between">
                      <span>Specific Time (নির্দিষ্ট সময়)</span>
                      {exactTime && <span className="text-[#00984a] font-black">{formatTimeTo12Hour(exactTime)}</span>}
                    </label>
                    <input
                      type="time"
                      value={exactTime}
                      onChange={(e) => setExactTime(e.target.value)}
                      placeholder="--:--"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] cursor-pointer text-sm"
                    />
                  </div>
                </div>

                {/* Shift Preference Chips (None selected initially) */}
                <div className="pt-1">
                  <label className="block mb-1.5 text-[10px] font-bold text-slate-500 uppercase">
                    Or Choose Shift Preference (অথবা শিফট বেছে নিন) *:
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2 text-xs">
                    {['Morning (সকাল)', 'Afternoon (দুপুর)', 'Evening (সন্ধ্যা)', '24/7 (জরুরি সময়)'].map((shift) => (
                      <button
                        key={shift}
                        type="button"
                        onClick={() => setTimeShiftPreference(timeShiftPreference === shift ? '' : shift)}
                        className={`py-2 px-1 rounded-xl font-bold transition text-center border text-[10.5px] sm:text-xs truncate cursor-pointer ${
                          timeShiftPreference === shift
                            ? 'bg-[#00984a] text-white border-[#00984a] shadow-sm'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {shift}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. PATIENT INFORMATION */}
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-[#00984a]" /> 3. Patient Information (রোগীর তথ্য) *
                </h3>

                {isAuthenticated && authUser ? (
                  <div className="bg-emerald-50/70 p-3.5 sm:p-5 rounded-2xl border-2 border-emerald-300 space-y-3 text-xs font-bold text-slate-700 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-[#00984a]" />
                        <span className="font-black text-slate-900 text-xs">Verified Account Session</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-full border border-emerald-300">Logged In</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1">Patient Full Name *</label>
                        <input
                          type="text"
                          required
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                        />
                      </div>

                      <div>
                        <label className="block mb-1">Contact Mobile (১১ ডিজিট) *</label>
                        <input
                          type="tel"
                          required
                          maxLength={11}
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block mb-1">Age (বয়স) *</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={120}
                          value={patientAge}
                          onChange={(e) => setPatientAge(Number(e.target.value))}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                        />
                      </div>

                      <div>
                        <label className="block mb-1">Gender (লিঙ্গ) *</label>
                        <select
                          value={patientGender}
                          onChange={(e: any) => setPatientGender(e.target.value)}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] cursor-pointer"
                        >
                          <option value="MALE">Male (পুরুষ)</option>
                          <option value="FEMALE">Female (মহিলা)</option>
                          <option value="OTHER">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setPatientType('NEW');
                          setIsPatientVerified(false);
                          setLoginError(null);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 border cursor-pointer ${
                          patientType === 'NEW'
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <User className="w-3.5 h-3.5" /> New Patient
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setPatientType('REGISTERED');
                          setLoginError(null);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1 border cursor-pointer ${
                          patientType === 'REGISTERED'
                            ? 'bg-brand-gradient text-white border-transparent shadow-sm'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Already Registered ?
                      </button>
                    </div>

                    {patientType === 'REGISTERED' ? (
                      !isPatientVerified ? (
                        <div className="bg-emerald-50/60 p-3.5 sm:p-5 rounded-2xl border border-emerald-200 space-y-3 animate-in fade-in text-xs font-bold text-slate-700">
                          <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-[#00984a]" /> Sign In to Load Profile
                          </h4>

                          {loginError && (
                            <div className="bg-red-50 text-red-700 p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 border border-red-200">
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                              <span>{loginError}</span>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block mb-1 text-[11px]">Mobile / Email *</label>
                              <input
                                type="text"
                                value={loginIdentifier}
                                onChange={(e) => setLoginIdentifier(e.target.value)}
                                placeholder="01XXXXXXXXX or email"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                              />
                            </div>
                            <div>
                              <label className="block mb-1 text-[11px]">Password *</label>
                              <input
                                type="password"
                                minLength={6}
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                              />
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handlePatientLogin}
                            disabled={patientLoginMutation.isPending}
                            className="bg-[#00984a] hover:bg-[#006642] text-white font-bold px-5 py-2 rounded-xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            {patientLoginMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                            <span>Sign In & Load Profile</span>
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white p-3.5 rounded-2xl border-2 border-emerald-300 shadow-sm flex justify-between items-center text-xs">
                          <div>
                            <strong className="text-slate-900 text-sm block">{patientName}</strong>
                            <span className="text-slate-500 font-mono text-xs">{patientPhone}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setIsPatientVerified(false);
                              setLoginPassword('');
                            }}
                            className="text-xs font-bold text-slate-400 hover:text-red-600 underline cursor-pointer"
                          >
                            Change
                          </button>
                        </div>
                      )
                    ) : (
                      /* NEW PATIENT FORM */
                      <div className="bg-white p-3.5 sm:p-5 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in text-xs font-bold text-slate-700">
                        <div className="flex justify-between items-center border-b pb-1.5">
                          <span className="text-[10.5px] font-black text-slate-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#00984a]" /> Patient Details & Auto Account
                          </span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">● Instant Login</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                          <div>
                            <label className="block mb-1">Patient Full Name *</label>
                            <input
                              type="text"
                              required
                              value={patientName}
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder="Full Name"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label>Mobile (১১ ডিজিট) *</label>
                              {patientPhone.length === 11 && BD_PHONE_REGEX.test(patientPhone) && (
                                <span className="text-[9px] text-[#00984a]">✓ OK</span>
                              )}
                            </div>
                            <input
                              type="text"
                              required
                              maxLength={11}
                              value={patientPhone}
                              onChange={(e) => {
                                const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
                                setPatientPhone(digits);
                              }}
                              placeholder="01XXXXXXXXX"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] font-mono"
                            />
                          </div>

                          <div className="sm:col-span-2 lg:col-span-1">
                            <label className="block mb-1">Set Password (কমপক্ষে ৬টি) *</label>
                            <div className="relative">
                              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="password"
                                required
                                minLength={6}
                                value={newPatientPassword}
                                onChange={(e) => setNewPatientPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <label className="block mb-1">Age (বয়স) *</label>
                            <input
                              type="number"
                              required
                              min={1}
                              max={120}
                              value={patientAge}
                              onChange={(e) => setPatientAge(Number(e.target.value))}
                              placeholder="30"
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                            />
                          </div>

                          <div>
                            <label className="block mb-1">Gender (লিঙ্গ) *</label>
                            <select
                              value={patientGender}
                              onChange={(e: any) => setPatientGender(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a] cursor-pointer"
                            >
                              <option value="MALE">Male</option>
                              <option value="FEMALE">Female</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-1 text-xs font-bold text-slate-700">
                  <label className="block mb-1">Special Clinical Request / Notes (ঐচ্ছিক)</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Doctor referral or specific requests..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-900 font-medium focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              {/* 🌟 CONFIRM BUTTON (LIVE CALCULATED NET AMOUNT) */}
              <button
                type="submit"
                disabled={bookingMutation.isPending || isRegisteringAndBooking || currentCartItems.length === 0}
                className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-4 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                {isRegisteringAndBooking || bookingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Placing Diagnostic Order...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Confirm Diagnostic Test Booking (৳{netPayable})</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* 🌟 RIGHT COLUMN: LIVE CALCULATED ORDER SUMMARY */}
          <div className="w-full min-w-0 lg:sticky lg:top-24">
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
              <h3 className="text-sm sm:text-base font-black text-slate-900 border-b border-slate-100 pb-2.5 flex items-center justify-between">
                <span>Order Summary</span>
                <span className="text-xs font-bold text-[#00984a]">{currentCartItems.length} Tests</span>
              </h3>

              {currentCartItems.length > 0 ? (
                <div className="space-y-3">
                  <div className="space-y-2 max-h-56 overflow-y-auto no-scrollbar">
                    {currentCartItems.map((item: any) => {
                      const itemPrice = Number(item.discountPrice) || Number(item.regularPrice) || Number(item.price) || 0;

                      return (
                        <div key={item._id || item.id} className="flex justify-between items-start text-xs pb-2 border-b border-slate-100 gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-slate-900 truncate">{item.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{item.code}</span>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="font-bold text-slate-900 block">৳{itemPrice}</span>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item._id || item.id)}
                              className="text-[10px] text-red-500 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 space-y-1.5 text-xs text-slate-600 border-t border-slate-200">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span className="font-bold text-slate-900">৳{calculatedRegularTotal}</span>
                    </div>
                    {calculatedSavings > 0 && (
                      <div className="flex justify-between text-[#00984a] font-bold">
                        <span>Discount Savings:</span>
                        <span>-৳{calculatedSavings}</span>
                      </div>
                    )}
                    {collectionType === 'HOME_COLLECTION' && (
                      <div className="flex justify-between text-slate-800 font-bold">
                        <span>Home Collection Fee:</span>
                        <span>+৳200</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs sm:text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      <span>Total Net Amount:</span>
                      <span className="text-emerald-700 font-black">৳{netPayable}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  Your cart is empty. <Link to="/tests" className="text-[#00984a] underline block mt-1">Browse Tests</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestBookingCheckoutPage;