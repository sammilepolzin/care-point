import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronDown, 
  ChevronRight, 
  Stethoscope, 
  Calendar, 
  TestTube2, 
  XCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import api from '@/lib/axios';

interface Department {
  _id: string;
  name: string;
  bnName?: string;
}

interface Doctor {
  _id: string;
  name: string;
  department: Department;
  qualification: string;
  specialization: string;
  consultationFee: number;
  chamberRoom: string;
  availableDays?: string[];
  phone: string;
  photoUrl: string;
  isActive: boolean;
}

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
}

interface SystemSettings {
  showDoctorFees: boolean;
  heroSlides?: Array<{ id: string; imageUrl: string; title?: string; subtitle?: string; linkUrl?: string }>;
}

const DAYS_MAP = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const HeroSection: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<'doctor' | 'appointment' | 'test'>('doctor');
  
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const days = [
    'Saturday',
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ];

  // 1. Fetch Dynamic Website Settings (SLIDERS ARE NOW FULLY DYNAMIC!)
  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['hero-departments'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
  });

  const { data: allDoctors, isLoading: isDoctorsLoading } = useQuery<Doctor[]>({
    queryKey: ['hero-doctors'],
    queryFn: async () => {
      const res = await api.get('/doctors?status=active');
      return res.data.data;
    },
  });

  const { data: allTests, isLoading: isTestsLoading } = useQuery<DiagnosticTest[]>({
    queryKey: ['hero-tests'],
    queryFn: async () => {
      const res = await api.get('/tests?active=true');
      return res.data.data;
    },
  });

  // DYNAMIC SLIDES FROM ADMIN DATABASE
  const slides = useMemo(() => {
    if (settings?.heroSlides && settings.heroSlides.length > 0) {
      return settings.heroSlides.map((s, idx) => ({
        id: s.id || idx,
        img: s.imageUrl,
        title: s.title || '',
        subtitle: s.subtitle || '',
      }));
    }
    // Default fallback
    return [
      { id: 1, img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1920&auto=format&fit=crop', title: '', subtitle: '' },
      { id: 2, img: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=1920&auto=format&fit=crop', title: '', subtitle: '' },
      { id: 3, img: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?q=80&w=1920&auto=format&fit=crop', title: '', subtitle: '' },
    ];
  }, [settings?.heroSlides]);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length]);

  const handleSlideChange = (newIndex: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrentSlide(newIndex);
    if (slides.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 6000);
    }
  };

  const hasUserFilteredDoctor = Boolean(selectedDeptId || selectedDay || searchQuery.trim());

  const filteredDoctors = useMemo(() => {
    if (!allDoctors || !hasUserFilteredDoctor) return [];
    return allDoctors.filter((doc) => {
      const matchDept = !selectedDeptId || doc.department?._id === selectedDeptId;
      const matchDay =
        !selectedDay ||
        (doc.availableDays && doc.availableDays.length > 0
          ? doc.availableDays.includes(selectedDay)
          : true);
      const matchQuery =
        !searchQuery ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department?.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDept && matchDay && matchQuery;
    });
  }, [allDoctors, selectedDeptId, selectedDay, searchQuery, hasUserFilteredDoctor]);

  const filteredTests = useMemo(() => {
    if (!allTests) return [];
    if (!searchQuery.trim()) return allTests;
    return allTests.filter((test) => {
      return (
        test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [allTests, searchQuery]);

  const clearFilters = () => {
    setSelectedDeptId('');
    setSelectedDay('');
    setSearchQuery('');
  };

  const showFee = settings?.showDoctorFees !== false;
  const activeSlideImage = slides[currentSlide % slides.length]?.img || slides[0].img;

  return (
    <section className="relative bg-white pb-14 border-b border-slate-200">
      {/* 1. SLIDER (DYNAMIC IMAGES & NO ARROWS) */}
      <div className="relative w-full h-[360px] sm:h-[480px] lg:h-[560px] overflow-hidden bg-slate-100 shadow-inner">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url(${activeSlideImage})` }}
        >
          <div className="absolute inset-0 bg-white/10 backdrop-blur-[0.5px]" />
        </div>

        {/* Clean Bottom Dot Indicators */}
        {slides.length > 1 && (
          <div className="absolute bottom-20 sm:bottom-28 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => handleSlideChange(idx)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  (currentSlide % slides.length) === idx ? 'w-8 bg-[#00984a]' : 'w-2.5 bg-white/80 shadow-sm'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. DYNAMIC 3-TAB FILTER WIDGET */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-24 lg:-mt-28 relative z-30">
        <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-7 border-2 border-emerald-100 text-slate-900">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-5">
            <button
              type="button"
              onClick={() => { setActiveTab('doctor'); clearFilters(); }}
              className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'doctor'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                  : 'bg-brand-gradient text-white border-transparent hover:opacity-95'
              }`}
            >
              <Stethoscope className="w-4 h-4" /> Find a Doctor
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('appointment')}
              className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'appointment'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                  : 'bg-brand-gradient text-white border-transparent hover:opacity-95'
              }`}
            >
              <Calendar className="w-4 h-4" /> Book Appointment
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('test'); clearFilters(); }}
              className={`py-3 px-4 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 border ${
                activeTab === 'test'
                  ? 'bg-white text-slate-900 border-slate-300 shadow-sm'
                  : 'bg-brand-gradient text-white border-transparent hover:opacity-95'
              }`}
            >
              <TestTube2 className="w-4 h-4" /> Diagnostic Tests & Pricing
            </button>
          </div>

          {activeTab === 'appointment' ? (
            <div className="py-3 text-center animate-in fade-in duration-200">
              <Link
                to="/appointment"
                className="w-full block py-4 px-6 rounded-2xl border-2 border-[#00984a] bg-white hover:bg-[#f0fdf4] text-slate-800 font-bold text-base sm:text-lg transition-all shadow-sm group text-center"
              >
                <span>Make An Appointment </span>
                <span className="text-[#00984a] font-black group-hover:underline">Now →</span>
              </Link>
            </div>
          ) : activeTab === 'doctor' ? (
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="relative">
                  <select
                    value={selectedDeptId}
                    onChange={(e) => setSelectedDeptId(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#00984a] pr-10"
                  >
                    <option value="">All Departments (সকল বিশেষজ্ঞ বিভাগ)</option>
                    {departments?.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name} {dept.bnName ? `(${dept.bnName})` : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
                </div>

                <div className="relative">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="w-full appearance-none bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#00984a] pr-10"
                  >
                    <option value="">All Available Days (সকল দিন)</option>
                    {days.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none shrink-0" />
                </div>
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search doctor by name or specialization (e.g. Dr. Rahman, Cardiologist)..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00984a] pr-16"
                />
                {hasUserFilteredDoctor && (
                  <button
                    onClick={clearFilters}
                    className="absolute right-3 text-[11px] font-bold text-slate-400 hover:text-red-500 transition flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              {hasUserFilteredDoctor ? (
                <div className="mt-3 overflow-hidden rounded-xl border border-emerald-800/20 shadow-md animate-in fade-in duration-150">
                  <div className="bg-brand-gradient text-white px-4 py-2.5 flex justify-between items-center text-xs sm:text-sm font-black tracking-wide">
                    <span>Specialist Doctor & Days</span>
                    <span>Department {showFee ? '& Fee' : ''}</span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto bg-white">
                    {isDoctorsLoading ? (
                      <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#00984a]" /> Loading doctors...
                      </div>
                    ) : filteredDoctors.length > 0 ? (
                      filteredDoctors.map((doc) => (
                        <Link
                          key={doc._id}
                          to={`/doctors/${doc._id}/book`}
                          className="p-3 hover:bg-[#f0fdf4] transition flex items-center justify-between group cursor-pointer"
                        >
                          <div className="flex items-center gap-3 pr-2">
                            <img
                              src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                              alt={doc.name}
                              className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shadow shrink-0"
                            />
                            <div>
                              <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#00984a] transition leading-tight">
                                {doc.name}
                              </h4>
                              <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{doc.qualification}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                                  Chamber: {doc.chamberRoom}
                                </span>
                                <span className="text-[9px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium truncate max-w-[140px] sm:max-w-none">
                                  Days: {doc.availableDays?.join(', ') || 'Sat, Sun, Mon'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-slate-400 shrink-0">
                            <div className="text-right">
                              <span className="text-xs font-bold text-slate-800 block">
                                {doc.department?.name}
                              </span>
                              {showFee && (
                                <span className="text-[11px] font-black text-[#00984a]">
                                  ৳{doc.consultationFee}
                                </span>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#00984a] group-hover:translate-x-1 transition" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                        নির্বাচিত দিন বা বিভাগে কোনো ডাক্তার পাওয়া যায়নি।
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 text-center bg-[#f0fdf4] rounded-xl border border-emerald-100 text-xs text-slate-500 flex items-center justify-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#00984a]" />
                  <span>উপরে আপনার কাঙ্ক্ষিত বিশেষজ্ঞ বিভাগ ও দিন নির্বাচন করুন কিংবা ডাক্তারের নাম লিখুন।</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-[#f0fdf4] p-3 rounded-xl border border-emerald-200 text-xs font-semibold text-[#006642]">
                💡 সকল প্যাথলজি ও রেডিওলজি টেস্টের অনুমোদিত মূল্য তালিকা।
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type test name or code (e.g. CBC, Creatinine, Lipid, Thyroid, MRI, X-Ray)..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00984a] pr-16"
                />
                {searchQuery && (
                  <button
                    onClick={clearFilters}
                    className="absolute right-3 text-[11px] font-bold text-slate-400 hover:text-red-500 transition flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              <div className="mt-3 overflow-hidden rounded-xl border border-emerald-800/20 shadow-md animate-in fade-in duration-150">
                <div className="bg-brand-gradient text-white px-4 py-2.5 flex justify-between items-center text-xs sm:text-sm font-black tracking-wide">
                  <span>Diagnostic Test & Prep</span>
                  <div className="flex gap-4 sm:gap-6">
                    <span className="hidden sm:inline">Delivery Time</span>
                    <span>Fee (BDT)</span>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto bg-white">
                  {isTestsLoading ? (
                    <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#00984a]" /> Loading test catalog...
                    </div>
                  ) : filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <div
                        key={test._id}
                        className="p-3 hover:bg-[#f0fdf4] transition flex items-center justify-between group"
                      >
                        <div className="pr-2">
                          <h4 className="font-bold text-slate-900 text-xs sm:text-sm group-hover:text-[#00984a] transition">
                            {test.name}
                          </h4>
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold mt-0.5 inline-block">
                            {test.category} • Prep: {test.preparationInstructions}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                          <span className="text-xs text-slate-500 hidden sm:inline">{test.reportDeliveryTime}</span>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 line-through block font-medium">৳{test.regularPrice}</span>
                            <span className="text-xs sm:text-sm font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                              ৳{test.discountPrice}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs font-semibold">
                      কোনো ডায়াগনস্টিক টেস্ট পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};