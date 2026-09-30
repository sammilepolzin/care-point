import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ImageIcon, X, Sparkles, ZoomIn } from 'lucide-react';
import api from '@/lib/axios';

interface GalleryPhoto {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  description?: string;
  isFeatured: boolean;
}

export const GalleryPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [previewPhoto, setPreviewPhoto] = useState<GalleryPhoto | null>(null);

  const categories = [
    { label: 'All Photos', value: 'ALL' },
    { label: 'Laboratory Suite', value: 'LABORATORY' },
    { label: 'Advanced Equipment', value: 'EQUIPMENT' },
    { label: 'Doctor Chambers', value: 'DOCTOR_CHAMBERS' },
    { label: 'Centre Facilities', value: 'FACILITIES' },
  ];

  const { data: photos, isLoading } = useQuery<GalleryPhoto[]>({
    queryKey: ['public-gallery', selectedCategory],
    queryFn: async () => {
      let url = '/gallery';
      if (selectedCategory !== 'ALL') url += `?category=${selectedCategory}`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] py-6 sm:py-12 pb-24 space-y-6 sm:space-y-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-2xl sm:rounded-3xl p-5 sm:p-10 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-white/20 px-2.5 sm:px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> World-Class Infrastructure
          </span>
          <h1 className="text-xl sm:text-4xl font-black mt-2">Facility Photo Gallery</h1>
          <p className="text-emerald-100 text-[10px] sm:text-sm mt-1 sm:mt-2 max-w-xl mx-auto leading-snug">
            Take a virtual tour of our modern diagnostic labs, specialist consultation chambers, and patient care areas.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.value
                  ? 'bg-brand-gradient text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-[#00984a]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Photos Grid: Exactly 2 Columns on Mobile */}
        {isLoading ? (
          <div className="text-center py-20 text-xs text-slate-400">Loading gallery images...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {photos && photos.length > 0 ? (
              photos.map((item) => (
                <div
                  key={item._id}
                  onClick={() => setPreviewPhoto(item)}
                  className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#00984a] transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="relative aspect-square sm:aspect-4/3 overflow-hidden bg-slate-100">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow">
                        <ZoomIn className="w-4 h-4 sm:w-5 h-5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-5">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded inline-block truncate max-w-full">
                      {item.category.replace('_', ' ')}
                    </span>
                    <h4 className="font-bold text-slate-900 text-[10px] sm:text-sm mt-0.5 sm:mt-1 group-hover:text-[#00984a] transition truncate">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-[8.5px] sm:text-xs text-slate-500 mt-0.5 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
                No photos uploaded in this category.
              </div>
            )}
          </div>
        )}

        {/* FULLSCREEN LIGHTBOX MODAL */}
        {previewPhoto && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 flex flex-col">
              <button
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 bg-slate-900/80 text-white p-1.5 sm:p-2 rounded-full hover:bg-slate-900 transition"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <div className="max-h-[60vh] sm:max-h-[70vh] bg-black flex items-center justify-center">
                <img
                  src={previewPhoto.imageUrl}
                  alt={previewPhoto.title}
                  className="max-h-[60vh] sm:max-h-[70vh] w-auto object-contain"
                />
              </div>

              <div className="p-4 sm:p-6 bg-white">
                <span className="text-[9px] sm:text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded">
                  {previewPhoto.category.replace('_', ' ')}
                </span>
                <h3 className="font-black text-slate-900 text-sm sm:text-lg mt-1 leading-snug">{previewPhoto.title}</h3>
                {previewPhoto.description && (
                  <p className="text-[10px] sm:text-xs text-slate-600 mt-1 leading-relaxed">{previewPhoto.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};