import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  ShieldCheck, 
  Clock,
  Heart,
  Share2
} from 'lucide-react';
import api from '@/lib/axios';

export const Footer: React.FC = () => {
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const footerLogo = settings?.footerLogoUrl || settings?.logoUrl;
  const siteName = settings?.siteName || 'Care Point';
  const hotline = settings?.topbarHotlineText || settings?.hotline || '09666 787801';
  const email = settings?.email || 'info@carepoint.com';
  const address = settings?.address || 'House 42, Road 11, Dhanmondi, Dhaka - 1209';
  const socialLinks = settings?.customSocialLinks || [];

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-24 lg:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* 1. BRAND IDENTITY & FOOTER LOGO */}
          <div className="space-y-4">
            {footerLogo ? (
              <img src={footerLogo} alt={siteName} className="h-12 w-auto object-contain" />
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-brand-gradient text-white flex items-center justify-center font-black text-lg">
                  C
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{siteName}</h3>
                  <p className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold">Diagnostic Centre</p>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Trusted diagnostic healthcare offering automated clinical pathology, digital imaging, and specialist doctor consultation.
            </p>

            {/* DYNAMIC SOCIAL ICONS IN FOOTER */}
            {socialLinks.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                {socialLinks.map((item: any) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-[#00984a] text-white flex items-center justify-center transition border border-slate-800 p-1"
                    title={item.platform}
                  >
                    {item.iconUrl ? (
                      <img src={item.iconUrl} alt={item.platform} className="w-4 h-4 object-contain" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                  </a>
                ))}
              </div>
            )}

            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> ISO 9001:2015 Accredited
            </span>
          </div>

          {/* 2. CLINICAL SERVICES */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Clinical Services</h4>
            <ul className="space-y-2">
              <li><Link to="/today-doctors" className="hover:text-emerald-400 transition">Today's Available Doctors</Link></li>
              <li><Link to="/doctors" className="hover:text-emerald-400 transition">All Specialist Doctors</Link></li>
              <li><Link to="/tests" className="hover:text-emerald-400 transition">Diagnostic Tests & Pricing</Link></li>
              <li><Link to="/packages" className="hover:text-emerald-400 transition">Health Checkup Packages</Link></li>
              <li><Link to="/home-collection" className="hover:text-emerald-400 transition">Home Sample Collection</Link></li>
            </ul>
          </div>

          {/* 3. INSTITUTIONAL PAGES */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">About Care Point</h4>
            <ul className="space-y-2">
              <li><Link to="/mission" className="hover:text-emerald-400 transition">Our Mission & Vision</Link></li>
              <li><Link to="/chairman-message" className="hover:text-emerald-400 transition">Chairman's Statement</Link></li>
              <li><Link to="/managing-director" className="hover:text-emerald-400 transition">Managing Director's Note</Link></li>
              <li><Link to="/technologies" className="hover:text-emerald-400 transition">Modern Laboratory Analyzers</Link></li>
              <li><Link to="/management-team" className="hover:text-emerald-400 transition">Management & Directors</Link></li>
              <li><Link to="/gallery" className="hover:text-emerald-400 transition">Facility Photo Gallery</Link></li>
            </ul>
          </div>

          {/* 4. EMERGENCY & LOCATION */}
          <div className="space-y-3 text-xs">
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Contact & Location</h4>
            <div className="space-y-2 text-slate-400">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </p>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-300 shrink-0" />
                <strong className="text-white font-mono">{hotline}</strong>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{email}</span>
              </p>
              <p className="flex items-center gap-2 text-emerald-400 pt-1 font-semibold">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Lab Services: Active 24 Hours / 7 Days</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} {siteName} Diagnostic & Consultation Centre. All rights reserved.</p>
          <p className="flex items-center gap-1 text-[11px]">
            Designed for patient precision & care <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};