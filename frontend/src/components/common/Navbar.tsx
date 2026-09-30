import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  PhoneCall, 
  Menu, 
  X, 
  ChevronDown, 
  Download, 
  MessageSquare, 
  Stethoscope, 
  TestTube2, 
  Home, 
  Heart, 
  ShieldCheck, 
  Building2, 
  CalendarDays, 
  LogIn, 
  User, 
  LogOut, 
  Target, 
  Award, 
  Cpu, 
  Users, 
  ImageIcon, 
  FileText,
  Share2
} from 'lucide-react';
import { FacebookIcon, YoutubeIcon, LinkedinIcon } from './SocialIcons';
import { useAuth } from '@/features/auth/context/AuthContext';
import { ComplainModal } from './ComplainModal';
import api from '@/lib/axios';

interface SystemSettings {
  siteName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  topbarHotlineText?: string;
  topbarStatusText?: string;
  topbarCertText?: string;
  hotline?: string;
  customSocialLinks?: Array<{ id: string; platform: string; url: string; iconUrl?: string }>;
}

const CarePointLogo: React.FC<{ logoUrl?: string; siteName?: string; tagline?: string }> = ({
  logoUrl,
  siteName = 'Care Point',
  tagline = 'Diagnostic & Consultation Centre',
}) => (
  <Link to="/" className="flex items-center gap-2.5 shrink-0" aria-label={`${siteName} home`}>
    {logoUrl ? (
      <img 
        src={logoUrl} 
        alt={siteName} 
        className="h-11 sm:h-12 w-auto max-w-[170px] object-contain shrink-0" 
      />
    ) : (
      <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
        {siteName ? siteName[0] : 'C'}
      </div>
    )}
    
    <div className="leading-tight min-w-0">
      <span className="block font-black text-base sm:text-lg text-[#00984a] truncate leading-tight">
        {siteName}
      </span>
      <span className="block text-[8px] sm:text-[9px] font-bold uppercase tracking-wide text-slate-500 truncate mt-0.5">
        {tagline}
      </span>
    </div>
  </Link>
);

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<'findCare' | 'about' | null>(null);
  const [mobileSubMenu, setMobileSubMenu] = useState<'findCare' | 'about' | null>(null);
  const [isComplainOpen, setIsComplainOpen] = useState(false);
  
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  const { data: settings } = useQuery<SystemSettings>({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (settings?.faviconUrl) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
    if (settings?.siteName) {
      document.title = `${settings.siteName} | ${settings.tagline || 'Diagnostic Centre'}`;
    }
  }, [settings?.faviconUrl, settings?.siteName, settings?.tagline]);

  useEffect(() => {
    setActiveMegaMenu(null);
    setIsOpen(false);
    setMobileSubMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveMegaMenu(null);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return '/admin/dashboard';
    return '/patient/dashboard';
  };

  const hotlineText = settings?.topbarHotlineText || settings?.hotline || '09666 787801';
  const statusText = settings?.topbarStatusText || 'Online Services: Active 24/7';
  const certText = settings?.topbarCertText || 'ISO 9001:2015 Certified';

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      <ComplainModal isOpen={isComplainOpen} onClose={() => setIsComplainOpen(false)} />

      <header className="w-full bg-white sticky top-0 z-50 shadow-sm relative" ref={navRef}>
        
        {/* TOP BRAND BAR */}
        <div className="bg-brand-gradient text-white text-[10px] sm:text-xs py-1.5 px-3 sm:px-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center font-medium">
            <div className="flex items-center gap-2 sm:gap-4">
              <a 
                href={`tel:${hotlineText.replace(/\D/g, '')}`} 
                className="flex items-center gap-1.5 font-black tracking-wide text-white hover:text-amber-300 transition"
              >
                <PhoneCall className="w-3.5 h-3.5 text-amber-300 shrink-0" /> 
                <span>{hotlineText}</span>
              </a>
              <span className="text-emerald-300">|</span>
              <span className="flex items-center gap-1.5 text-emerald-50 font-bold bg-white/10 px-2 py-0.5 rounded-full">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-300"></span>
                </span>
                <span>{statusText}</span>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-emerald-100 hidden sm:flex items-center gap-1 text-xs border-r border-emerald-400/40 pr-3">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> {certText}
              </span>

              <div className="flex items-center gap-2 text-white">
                {settings?.customSocialLinks && settings.customSocialLinks.length > 0 ? (
                  settings.customSocialLinks.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-amber-300 transition flex items-center justify-center p-0.5"
                      title={item.platform}
                    >
                      {item.iconUrl ? (
                        <img src={item.iconUrl} alt={item.platform} className="w-3.5 h-3.5 object-contain" />
                      ) : item.platform.toLowerCase().includes('youtube') ? (
                        <YoutubeIcon className="w-3.5 h-3.5" />
                      ) : item.platform.toLowerCase().includes('linkedin') ? (
                        <LinkedinIcon className="w-3.5 h-3.5" />
                      ) : item.platform.toLowerCase().includes('facebook') ? (
                        <FacebookIcon className="w-3.5 h-3.5" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </a>
                  ))
                ) : (
                  <>
                    <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition"><FacebookIcon className="w-3.5 h-3.5" /></a>
                    <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition"><YoutubeIcon className="w-3.5 h-3.5" /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition"><LinkedinIcon className="w-3.5 h-3.5" /></a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN NAVBAR */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative bg-white z-50">
          <div className="flex justify-between items-center h-20">
            <CarePointLogo logoUrl={settings?.logoUrl} siteName={settings?.siteName} tagline={settings?.tagline} />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1 text-sm font-bold text-slate-700">
              <Link to="/" className={`px-3.5 py-2 rounded-xl transition ${location.pathname === '/' ? 'text-[#00984a] bg-emerald-50' : 'hover:text-[#00984a]'}`}>Home</Link>

              {/* Find Care Mega Menu */}
              <div className="relative" onMouseEnter={() => setActiveMegaMenu('findCare')} onMouseLeave={() => setActiveMegaMenu(null)}>
                <button type="button" className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${activeMegaMenu === 'findCare' ? 'text-[#00984a] bg-emerald-50' : 'hover:text-[#00984a]'}`}>
                  <span>Find Care</span><ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {activeMegaMenu === 'findCare' && (
                  <div className="absolute left-0 top-full mt-2 w-[560px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 z-50 grid grid-cols-2 gap-3.5 animate-in fade-in duration-200">
                    <Link to="/today-doctors" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center shrink-0 group-hover:bg-[#00984a] group-hover:text-white transition"><CalendarDays className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-slate-900 text-sm group-hover:text-[#00984a]">Today's Doctors</h4><p className="text-xs text-slate-500 mt-0.5">Today's active chambers</p></div>
                    </Link>
                    <Link to="/doctors" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center shrink-0 group-hover:bg-[#00984a] group-hover:text-white transition"><Stethoscope className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-slate-900 text-sm group-hover:text-[#00984a]">All Specialist Doctors</h4><p className="text-xs text-slate-500 mt-0.5">Find professors & book</p></div>
                    </Link>
                    <Link to="/departments" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center shrink-0 group-hover:bg-[#00984a] group-hover:text-white transition"><Building2 className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-slate-900 text-sm group-hover:text-[#00984a]">Medical Departments</h4><p className="text-xs text-slate-500 mt-0.5">Clinical units & services</p></div>
                    </Link>
                    <Link to="/tests" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center shrink-0 group-hover:bg-[#00984a] group-hover:text-white transition"><TestTube2 className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-slate-900 text-sm group-hover:text-[#00984a]">Diagnostic Tests</h4><p className="text-xs text-slate-500 mt-0.5">Pathology & pricing</p></div>
                    </Link>
                    <Link to="/home-collection" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center shrink-0 group-hover:bg-[#00984a] group-hover:text-white transition"><Home className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-slate-900 text-sm group-hover:text-[#00984a]">Home Collection</h4><p className="text-xs text-slate-500 mt-0.5">Doorstep sample pickup</p></div>
                    </Link>
                    <Link to="/packages" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center shrink-0 group-hover:bg-[#00984a] group-hover:text-white transition"><Heart className="w-5 h-5" /></div>
                      <div><h4 className="font-bold text-slate-900 text-sm group-hover:text-[#00984a]">Health Packages</h4><p className="text-xs text-slate-500 mt-0.5">Executive body checkup</p></div>
                    </Link>
                  </div>
                )}
              </div>

              {/* About Menu */}
              <div className="relative" onMouseEnter={() => setActiveMegaMenu('about')} onMouseLeave={() => setActiveMegaMenu(null)}>
                <button type="button" className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${activeMegaMenu === 'about' ? 'text-[#00984a] bg-emerald-50' : 'hover:text-[#00984a]'}`}>
                  <span>About</span><ChevronDown className="w-4 h-4 text-slate-400" />
                </button>
                {activeMegaMenu === 'about' && (
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-[650px] bg-white rounded-3xl shadow-2xl border border-slate-100 p-7 z-50 animate-in fade-in duration-200">
                    <h3 className="font-black text-slate-900 text-xs uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">About Care Point</h3>
                    <div className="grid grid-cols-3 gap-4 text-left">
                      <Link to="/mission" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group"><h4 className="font-bold text-slate-800 text-sm group-hover:text-[#00984a]">Our Mission</h4><p className="text-[11px] text-slate-400 mt-0.5">Core Values</p></Link>
                      <Link to="/chairman-message" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group"><h4 className="font-bold text-slate-800 text-sm group-hover:text-[#00984a]">Chairman</h4><p className="text-[11px] text-slate-400 mt-0.5">Founder's vision</p></Link>
                      <Link to="/managing-director" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group"><h4 className="font-bold text-slate-800 text-sm group-hover:text-[#00984a]">Managing Director</h4><p className="text-[11px] text-slate-400 mt-0.5">CEO statement</p></Link>
                      <Link to="/technologies" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group"><h4 className="font-bold text-slate-800 text-sm group-hover:text-[#00984a]">Technologies</h4><p className="text-[11px] text-slate-400 mt-0.5">Analyzers</p></Link>
                      <Link to="/management-team" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group"><h4 className="font-bold text-slate-800 text-sm group-hover:text-[#00984a]">Management Team</h4><p className="text-[11px] text-slate-400 mt-0.5">Board of Directors</p></Link>
                      <Link to="/gallery" className="p-3 rounded-2xl bg-white hover:bg-[#f0fdf4] border border-slate-100 hover:border-[#00984a] transition group"><h4 className="font-bold text-slate-800 text-sm group-hover:text-[#00984a]">Gallery</h4><p className="text-[11px] text-slate-400 mt-0.5">Photos</p></Link>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/report-search" className="report-glow-btn flex items-center gap-2 text-[#00984a] font-black text-sm px-4 py-2.5 rounded-xl bg-white border-2 border-[#00984a] hover:bg-[#00984a] hover:text-white transition-all active:scale-95 ml-2 group">
                <Download className="w-4 h-4 animate-bounce group-hover:text-white text-[#00984a]" /><span>Report Download</span>
              </Link>
              <Link to="/contact" className={`px-3.5 py-2 rounded-xl transition ${location.pathname === '/contact' ? 'text-[#00984a] bg-emerald-50' : 'hover:text-[#00984a]'}`}>Contact</Link>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsComplainOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#f0fdf4] hover:bg-[#00984a] text-[#006642] hover:text-white border border-emerald-300 hover:border-[#00984a] font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs group"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#00984a] group-hover:text-white" />
                <span>Complain & Advise</span>
              </button>

              {isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link to={getDashboardPath()} className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition shadow-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-[10px]">{user?.name ? user.name[0].toUpperCase() : 'U'}</div>
                    <span>{user?.name?.split(' ')[0] || 'My Portal'}</span>
                  </Link>
                  <button onClick={logout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"><LogOut className="w-4 h-4" /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link to="/login" className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-[#00984a] px-3 py-2 rounded-xl transition hover:bg-slate-100">
                    <LogIn className="w-4 h-4 text-[#00984a]" /><span>Sign In</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <div className="lg:hidden flex items-center z-50 relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2.5 rounded-xl text-[#00984a] bg-emerald-50 hover:bg-emerald-100 focus:outline-none"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* 📱 PERFECT MOBILE ABSOLUTE OVERLAY DRAWER */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-emerald-100 shadow-2xl z-50 max-h-[80vh] overflow-y-auto">
            <div className="p-4 space-y-3 pb-8">
              <Link to="/" onClick={() => setIsOpen(false)} className="block py-2.5 px-3 rounded-xl font-bold text-slate-800 hover:bg-[#f0fdf4] hover:text-[#00984a] text-sm">Home</Link>
              
              <button
                type="button"
                onClick={() => { setIsOpen(false); setIsComplainOpen(true); }}
                className="w-full text-left py-2.5 px-3 rounded-xl font-bold text-[#006642] bg-[#f0fdf4] border border-emerald-200 flex items-center gap-2 text-sm"
              >
                <MessageSquare className="w-4 h-4 text-[#00984a]" /> Complain & Advise
              </button>

              {/* Mobile Find Care Dropdown */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileSubMenu(mobileSubMenu === 'findCare' ? null : 'findCare');
                  }}
                  className={`w-full flex items-center justify-between py-2.5 px-3.5 font-bold text-sm transition ${mobileSubMenu === 'findCare' ? 'bg-emerald-50 text-[#00984a]' : 'text-slate-800 hover:bg-slate-50'}`}
                >
                  <span>Find Care</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileSubMenu === 'findCare' ? 'rotate-180 text-[#00984a]' : ''}`} />
                </button>
                {mobileSubMenu === 'findCare' && (
                  <div className="p-2 space-y-1.5 bg-[#f8fafc] text-xs">
                    <Link to="/today-doctors" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><CalendarDays className="w-4 h-4 text-[#00984a]" /> Today's Doctors</Link>
                    <Link to="/doctors" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><Stethoscope className="w-4 h-4 text-[#00984a]" /> All Doctors</Link>
                    <Link to="/departments" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><Building2 className="w-4 h-4 text-[#00984a]" /> Departments</Link>
                    <Link to="/tests" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><TestTube2 className="w-4 h-4 text-[#00984a]" /> Tests</Link>
                    <Link to="/packages" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><Heart className="w-4 h-4 text-[#00984a]" /> Health Packages</Link>
                  </div>
                )}
              </div>

              {/* Mobile About Us Dropdown */}
              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setMobileSubMenu(mobileSubMenu === 'about' ? null : 'about');
                  }}
                  className={`w-full flex items-center justify-between py-2.5 px-3.5 font-bold text-sm transition ${mobileSubMenu === 'about' ? 'bg-emerald-50 text-[#00984a]' : 'text-slate-800 hover:bg-slate-50'}`}
                >
                  <span>About Us</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileSubMenu === 'about' ? 'rotate-180 text-[#00984a]' : ''}`} />
                </button>
                {mobileSubMenu === 'about' && (
                  <div className="p-2 space-y-1.5 bg-[#f8fafc] text-xs">
                    <Link to="/mission" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><Target className="w-4 h-4 text-[#00984a]" /> Mission & Vision</Link>
                    <Link to="/chairman-message" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><Award className="w-4 h-4 text-[#00984a]" /> Chairman Message</Link>
                    <Link to="/technologies" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><Cpu className="w-4 h-4 text-[#00984a]" /> Technologies</Link>
                    <Link to="/management-team" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><Users className="w-4 h-4 text-[#00984a]" /> Management Team</Link>
                    <Link to="/gallery" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 p-2 rounded-xl font-semibold text-slate-700 hover:bg-emerald-50 hover:text-[#00984a] transition"><ImageIcon className="w-4 h-4 text-[#00984a]" /> Gallery</Link>
                  </div>
                )}
              </div>

              <Link to="/contact" onClick={() => setIsOpen(false)} className="block py-2.5 px-3 rounded-xl font-bold text-slate-800 hover:bg-[#f0fdf4] hover:text-[#00984a] text-sm">Contact</Link>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <Link to="/report-search" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-xs font-black bg-brand-gradient text-white rounded-xl shadow-md flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" /> Download Medical Report
                </Link>

                {isAuthenticated ? (
                  <button onClick={() => { setIsOpen(false); logout(); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-red-600 bg-red-50 border border-red-200 shadow-2xs">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                ) : (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link to="/login" onClick={() => setIsOpen(false)} className="text-center py-2.5 text-xs font-bold border border-slate-300 rounded-xl text-slate-700 flex items-center justify-center gap-1.5"><LogIn className="w-3.5 h-3.5 text-[#00984a]" /> Sign In</Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="text-center py-2.5 text-xs font-black bg-[#00984a] text-white rounded-xl">Register</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};