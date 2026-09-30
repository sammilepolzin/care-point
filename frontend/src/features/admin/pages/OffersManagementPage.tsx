import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Edit, 
  Calendar, 
  AlertCircle, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import api from '@/lib/axios';

interface OfferItem {
  _id: string;
  title: string;
  subtitle: string;
  couponCode: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  startDate: string;
  endDate: string;
}

export const OffersManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<OfferItem | null>(null);

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(20);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('2026-12-31');
  const [error, setError] = useState<string | null>(null);

  const { data: offers, isLoading } = useQuery<OfferItem[]>({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const res = await api.get('/offers?all=true');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/offers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['public-offers'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create offer'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/offers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['public-offers'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update offer'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/offers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      queryClient.invalidateQueries({ queryKey: ['public-offers'] });
    },
  });

  const openAddModal = () => {
    setEditingOffer(null);
    setTitle('Special 20% Discount on All Pathology Tests');
    setSubtitle('Use coupon code during checkout or home collection');
    setCouponCode('CARE20');
    setDiscountType('PERCENTAGE');
    setDiscountValue(20);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (o: OfferItem) => {
    setEditingOffer(o);
    setTitle(o.title);
    setSubtitle(o.subtitle);
    setCouponCode(o.couponCode);
    setDiscountType(o.discountType);
    setDiscountValue(o.discountValue);
    setStartDate(o.startDate);
    setEndDate(o.endDate);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingOffer(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title, subtitle, couponCode, discountType, discountValue, startDate, endDate };

    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Special Offers & Promotional Coupons</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create discount promo codes, set validity start and end dates with automated lifecycle expiry.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Offer Campaign
        </button>
      </div>

      {/* Offers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading offers...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Campaign Title</th>
                  <th className="p-3.5">Coupon Code</th>
                  <th className="p-3.5">Discount Amount</th>
                  <th className="p-3.5">Validity Dates</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {offers && offers.length > 0 ? (
                  offers.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 text-sm">{o.title}</p>
                        <p className="text-[11px] text-slate-500">{o.subtitle}</p>
                      </td>
                      <td className="p-3.5">
                        <span className="font-mono font-black text-sm bg-slate-100 border px-2.5 py-1 rounded-lg text-slate-900">
                          {o.couponCode}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-black text-[#00984a] text-sm">
                          {o.discountType === 'PERCENTAGE' ? `${o.discountValue}%` : `৳${o.discountValue}`}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {o.startDate} to <strong className="text-slate-900">{o.endDate}</strong>
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditModal(o)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteMutation.mutate(o._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400 text-xs">No offers created yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 relative animate-in zoom-in-95 text-xs font-bold text-slate-700">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#00984a]" />
                {editingOffer ? 'Edit Special Offer' : 'Create Special Offer'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Subtitle / Details</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="CARE20"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900 uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block mb-1">Expiry End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={closeModal} className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" disabled={createMutation.isPending} className="w-1/2 bg-brand-gradient text-white font-black py-2.5 rounded-xl">
                  {createMutation.isPending ? 'Saving...' : 'Save Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};