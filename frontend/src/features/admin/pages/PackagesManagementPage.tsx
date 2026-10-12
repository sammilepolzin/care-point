import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  Layers 
} from 'lucide-react';
import api from '@/lib/axios';

interface DiagnosticTest {
  _id: string;
  name: string;
  discountPrice: number;
}

interface PackageItem {
  _id: string;
  name: string;
  code: string;
  tagline: string;
  description: string;
  genderTarget: string;
  ageGroup: string;
  includedFeatures: string[];
  includedTests: DiagnosticTest[];
  regularPrice: number;
  packagePrice: number;
  discountPercentage: number;
  isPopular: boolean;
  isActive: boolean;
}

export const PackagesManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageItem | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [tagline, setTagline] = useState('Comprehensive Health Checkup');
  const [description, setDescription] = useState('');
  const [genderTarget, setGenderTarget] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');
  const [ageGroup, setAgeGroup] = useState('All Ages');
  const [regularPrice, setRegularPrice] = useState<number>(5000);
  const [packagePrice, setPackagePrice] = useState<number>(3500);
  const [isPopular, setIsPopular] = useState(true);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [featureInput, setFeatureInput] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>(['Full Body Organ Screening', 'Free Doctor Consultation']);
  const [error, setError] = useState<string | null>(null);

  // Fetch Tests for selection
  const { data: tests } = useQuery<DiagnosticTest[]>({
    queryKey: ['admin-tests-for-packages'],
    queryFn: async () => {
      const res = await api.get('/tests?active=true');
      return res.data.data;
    },
  });

  // Fetch Packages
  const { data: packages, isLoading } = useQuery<PackageItem[]>({
    queryKey: ['admin-packages', searchTerm],
    queryFn: async () => {
      const res = await api.get('/packages?all=true');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/packages', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      queryClient.invalidateQueries({ queryKey: ['public-health-packages'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create package'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/packages/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      queryClient.invalidateQueries({ queryKey: ['public-health-packages'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update package'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/packages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-packages'] });
      queryClient.invalidateQueries({ queryKey: ['public-health-packages'] });
    },
  });

  const openAddModal = () => {
    setEditingPkg(null);
    setName('');
    setCode(`PKG-${Math.floor(100 + Math.random() * 900)}`);
    setTagline('Comprehensive Health Screening');
    setDescription('');
    setGenderTarget('ALL');
    setAgeGroup('All Ages');
    setRegularPrice(5000);
    setPackagePrice(3500);
    setIsPopular(true);
    setSelectedTestIds([]);
    setFeaturesList(['Full Body Organ Screening', 'Free Doctor Consultation']);
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (p: PackageItem) => {
    setEditingPkg(p);
    setName(p.name);
    setCode(p.code);
    setTagline(p.tagline || '');
    setDescription(p.description || '');
    setGenderTarget(p.genderTarget as any);
    setAgeGroup(p.ageGroup || 'All Ages');
    setRegularPrice(p.regularPrice);
    setPackagePrice(p.packagePrice);
    setIsPopular(p.isPopular);
    setSelectedTestIds(p.includedTests?.map((t) => t._id) || []);
    setFeaturesList(p.includedFeatures || []);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPkg(null);
    setError(null);
  };

  const toggleTestSelection = (testId: string) => {
    if (selectedTestIds.includes(testId)) {
      setSelectedTestIds(selectedTestIds.filter((id) => id !== testId));
    } else {
      setSelectedTestIds([...selectedTestIds, testId]);
    }
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      setFeaturesList([...featuresList, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      code,
      tagline,
      description,
      genderTarget,
      ageGroup,
      regularPrice,
      packagePrice,
      isPopular,
      includedFeatures: featuresList,
      includedTests: selectedTestIds,
    };

    if (editingPkg) {
      updateMutation.mutate({ id: editingPkg._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Health Checkup Packages Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create executive full-body checkup packages, select bundle tests, and set promotional discounts.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Health Package
        </button>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading health packages...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Code / Package Name</th>
                  <th className="p-3.5">Target & Age</th>
                  <th className="p-3.5">Included Tests</th>
                  <th className="p-3.5">Pricing & Savings</th>
                  <th className="p-3.5">Popular Tag</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {packages && packages.length > 0 ? (
                  packages.map((pkg) => (
                    <tr key={pkg._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800 text-[10px]">
                          {pkg.code}
                        </span>
                        <p className="font-bold text-slate-900 text-sm mt-0.5">{pkg.name}</p>
                        <p className="text-[10px] text-[#00984a] font-semibold">{pkg.tagline}</p>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-800">{pkg.genderTarget}</span>
                        <p className="text-[10px] text-slate-500">{pkg.ageGroup}</p>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                          {pkg.includedTests?.length || 0} Tests
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="text-slate-400 line-through text-[11px] mr-1">৳{pkg.regularPrice}</span>
                        <strong className="text-slate-900 font-black text-sm">৳{pkg.packagePrice}</strong>
                        <span className="text-[10px] text-emerald-700 block font-bold">({pkg.discountPercentage}% OFF)</span>
                      </td>

                      <td className="p-3.5">
                        {pkg.isPopular ? (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            ★ Popular
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">Regular</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(pkg)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete package ${pkg.name}?`)) {
                                deleteMutation.mutate(pkg._id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 text-xs">
                      No health packages created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT PACKAGE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in zoom-in-95 text-xs font-bold text-slate-700">
            <div className="flex justify-between items-center mb-5 pb-2 border-b">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#00984a]" />
                {editingPkg ? 'Edit Health Checkup Package' : 'Create New Health Package'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Package Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Executive Full Body Screening"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Package Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. PKG-EXEC-01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Tagline</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. 360° Comprehensive Organ Panel"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Regular Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
                <div>
                  <label className="block mb-1">Special Package Price (৳) *</label>
                  <input
                    type="number"
                    required
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              {/* Select Included Tests */}
              <div>
                <label className="block mb-1">Select Bundle Tests ({selectedTestIds.length} Selected)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  {tests?.map((t) => {
                    const isChecked = selectedTestIds.includes(t._id);
                    return (
                      <label key={t._id} className="flex items-center gap-2 p-1.5 bg-white rounded-xl border cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleTestSelection(t._id)}
                          className="rounded text-[#00984a]"
                        />
                        <span className="truncate">{t.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Features List */}
              <div>
                <label className="block mb-1">Included Package Highlights (বুলেট পয়েন্ট)</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="e.g. Free Doctor Consultation"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                  <button type="button" onClick={addFeature} className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold">
                    + Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {featuresList.map((f, i) => (
                    <span key={i} className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs text-slate-700 flex items-center gap-1">
                      {f} <button type="button" onClick={() => setFeaturesList(featuresList.filter((_, idx) => idx !== i))} className="text-red-500">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00984a]"
                  />
                  <span>Mark as Popular Package (ফিচারড প্যাকেজ হিসেবে হাইলাইট করুন)</span>
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button type="button" onClick={closeModal} className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-1/2 bg-brand-gradient text-white font-black py-2.5 rounded-xl shadow transition"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingPkg ? 'Update Package' : 'Save Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};