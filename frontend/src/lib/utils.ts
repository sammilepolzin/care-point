import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 0,
  }).format(amount);
}

// 24-hour time string ("17:00") কে 12-hour AM/PM ("05:00 PM") এ রূপান্তর
export function formatTime12H(timeStr: string): string {
  if (!timeStr) return '';
  if (timeStr.includes('AM') || timeStr.includes('PM') || timeStr.includes('am') || timeStr.includes('pm')) {
    return timeStr;
  }
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 হলে 12
  const formattedHours = hours < 10 ? `0${hours}` : `${hours}`;
  
  return `${formattedHours}:${minutes} ${ampm}`;
}

export function formatSessionRange(startTime: string, endTime: string): string {
  return `${formatTime12H(startTime)} - ${formatTime12H(endTime)}`;
}