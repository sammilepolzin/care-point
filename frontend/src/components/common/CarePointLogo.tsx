import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  className?: string;
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}

export const CarePointLogo: React.FC<LogoProps> = ({ 
  className = '', 
  variant = 'dark',
  size = 'md' 
}) => {
  const isLight = variant === 'light';

  return (
    <Link to="/" className={`inline-flex items-center gap-3 group ${className}`}>
      {/* Brand Rounded Medical Plus Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        <svg 
          viewBox="0 0 100 100" 
          className={size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-11 h-11'}
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cpBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#006642" />
              <stop offset="100%" stopColor="#00984a" />
            </linearGradient>
          </defs>
          <path
            d="M 38 10 
               C 38 7, 43 5, 50 5 
               C 57 5, 62 7, 62 10 
               L 62 38 
               L 90 38 
               C 93 38, 95 43, 95 50 
               C 95 57, 93 62, 90 62 
               L 62 62 
               L 62 90 
               C 62 93, 57 95, 50 95 
               C 43 95, 38 93, 38 90 
               L 38 62 
               L 10 62 
               C 7 62, 5 57, 5 50 
               C 5 43, 7 38, 10 38 
               L 38 38 
               Z"
            stroke="url(#cpBrandGrad)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Brand Typography & Tagline */}
      <div className="flex flex-col">
        <span className={`font-black tracking-tight leading-none ${
          size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-2xl'
        } ${isLight ? 'text-white' : 'text-slate-900'}`}>
          Care <span className="text-[#00984a]">Point</span>
        </span>

        <span className={`tracking-wide font-bold uppercase mt-0.5 ${
          size === 'sm' ? 'text-[7.5px]' : 'text-[9px]'
        } ${isLight ? 'text-emerald-100' : 'text-slate-600'}`}>
          Diagnostic & Consultation Centre
        </span>

        {/* ECG Line Divider */}
        <div className="flex items-center gap-1 mt-0.5">
          <div className="h-[1px] bg-[#00984a] w-4" />
          <svg className="w-5 h-2 text-[#00984a]" viewBox="0 0 40 16" fill="none">
            <path d="M0 8H12L15 2L19 14L23 5L26 10L28 8H40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="h-[1px] bg-[#00984a] w-4" />
        </div>

        <span className={`text-[7px] font-semibold tracking-wider ${
          isLight ? 'text-emerald-200' : 'text-[#006642]'
        }`}>
          Accurate • Trusted • Reliable
        </span>
      </div>
    </Link>
  );
};