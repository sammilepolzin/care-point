import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  TestTube2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  AlertCircle, 
  X, 
  Layers,
  Clock, 
  Home,
  Upload,
  Activity
} from 'lucide-react';
import api from '@/lib/axios';

interface TestCategory {
  _id: string;
  name: string;
}

interface DiagnosticTest {
  _id: string;
  name: string;
  code: string;
  category: string;
  preparationInstructions: string;
  sampleType: string;
  reportDeliveryTime: string;
  regularPrice: number;
  discountPrice: number;
  homeCollectionAvailable: boolean;
  iconUrl?: string;
  isActive: boolean;
}

export const TestsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Add/Edit Test Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<DiagnosticTest | null>(null);

  // Quick Add Category Modal
  const [isQuickCatModalOpen, setIsQuickCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatBnName, setNewCatBnName] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState('');
  const [regularPrice, setRegularPrice] = useState<number>(500);
  const [discountPrice, setDiscountPrice] = useState<number>(400);
  const [preparationInstructions, setPreparationInstructions] = useState('No fasting required');
  const [sampleType, setSampleType] = useState('Blood (EDTA)');
  const [reportDeliveryTime, setReportDeliveryTime] = useState('Same Day (6 Hours)');
  const [homeCollectionAvailable, setHomeCollectionAvailable] = useState(true);
  const [iconUrl, setIconUrl] = useState('');
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Categories
  const { data: categories } = useQuery<TestCategory[]>({
    queryKey: ['admin-test-categories'],
    queryFn: async () => {
      const res = await api.get('/test-categories');
      return res.data.data;
    },
  });

  // Fetch Tests
  const { data: tests, isLoading } = useQuery<DiagnosticTest[]>({
    queryKey: ['admin-tests', searchTerm, categoryFilter],
    queryFn: async () => {
      let url = `/tests?active=false&search=${searchTerm}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/tests', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tests'] });
      queryClient.invalidateQueries({ queryKey: ['public-popular-tests'] });
      queryClient.invalidateQueries({ queryKey: ['public-tests-catalog'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create test'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/tests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tests'] });
      queryClient.invalidateQueries({ queryKey: ['public-popular-tests'] });
      queryClient.invalidateQueries({ queryKey: ['public-tests-catalog'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update test'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/tests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tests'] });
      queryClient.invalidateQueries({ queryKey: ['public-popular-tests'] });
      queryClient.invalidateQueries({ queryKey: ['public-tests-catalog'] });
    },
  });

  const quickCategoryMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/test-categories', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-test-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-test-categories'] });
      setCategory(res.data.data.name);
      setNewCatName('');
      setNewCatBnName('');
      setIsQuickCatModalOpen(false);
    },
  });

  // Handle Test Icon Upload
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploadingIcon(true);

    try {
      const res = await api.post('/upload/doctor-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setIconUrl(res.data.data.imageUrl);
      }
    } catch (err: any) {
      setError('Failed to upload test icon image');
    } finally {
      setIsUploadingIcon(false);
    }
  };

  const openAddModal = () => {
    setEditingTest(null);
    setName('');
    setCode(`TST-${Math.floor(100 + Math.random() * 900)}`);
    setCategory(categories?.[0]?.name || '');
    setRegularPrice(500);
    setDiscountPrice(400);
    setPreparationInstructions('No fasting required');
    setSampleType('Blood (EDTA)');
    setReportDeliveryTime('Same Day (6 Hours)');
    setHomeCollectionAvailable(true);
    setIconUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (t: DiagnosticTest) => {
    setEditingTest(t);
    setName(t.name);
    setCode(t.code);
    setCategory(t.category);
    setRegularPrice(t.regularPrice);
    setDiscountPrice(t.discountPrice);
    setPreparationInstructions(t.preparationInstructions);
    setSampleType(t.sampleType);
    setReportDeliveryTime(t.reportDeliveryTime);
    setHomeCollectionAvailable(t.homeCollectionAvailable);
    setIconUrl(t.iconUrl || '');
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTest(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setError('Please select or create a category');
      return;
    }
    const payload = {
      name,
      code,
      category,
      regularPrice,
      discountPrice,
      preparationInstructions,
      sampleType,
      reportDeliveryTime,
      homeCollectionAvailable,
      iconUrl,
    };

    if (editingTest) {
      updateMutation.mutate({ id: editingTest._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleQuickCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    quickCategoryMutation.mutate({ name: newCatName, bnName: newCatBnName });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Diagnostic Tests & Pricing Catalog</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage pathology, radiology, pricing, discounts, upload test icons, and maintain categories.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/test-categories"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-[#00984a]" /> Manage Categories
          </Link>
          <button
            onClick={openAddModal}
            className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Diagnostic Test
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative sm:col-span-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test by name or code..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
        >
          <option value="">All Categories (সকল ক্যাটাগরি)</option>
          {categories?.map((c) => (
            <option key={c._id} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading tests catalog...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Test Code / Name</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Sample & Delivery</th>
                  <th className="p-3.5">Pricing (Reg / Disc)</th>
                  <th className="p-3.5">Home Sample</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {tests && tests.length > 0 ? (
                  tests.map((test) => (
                    <tr key={test._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 flex items-center gap-3">
                        {test.iconUrl ? (
                          <img src={test.iconUrl} alt={test.name} className="w-10 h-10 rounded-xl object-cover border border-emerald-300 shadow-sm shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold shrink-0">
                            <TestTube2 className="w-5 h-5" />
                          </div>
                        )}
                        <div>
                          <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-800">
                            {test.code}
                          </span>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">{test.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-xs">{test.preparationInstructions}</p>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2.5 py-1 rounded-md">
                          {test.category}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="text-slate-800 font-semibold">{test.sampleType}</p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-[#00984a]" /> {test.reportDeliveryTime}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <span className="text-slate-400 line-through text-[11px] mr-1">৳{test.regularPrice}</span>
                        <strong className="text-slate-900 font-black text-sm">৳{test.discountPrice}</strong>
                      </td>

                      <td className="p-3.5">
                        {test.homeCollectionAvailable ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            Available
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Center Only</span>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(test)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete test ${test.name}?`)) {
                                deleteMutation.mutate(test._id);
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
                      No diagnostic tests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL WITH DIRECT ICON UPLOAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <TestTube2 className="w-5 h-5 text-[#00984a]" />
                {editingTest ? 'Edit Diagnostic Test' : 'Add New Diagnostic Test'}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              
              {/* Test Icon / Image Upload Box */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3.5">
                {iconUrl ? (
                  <img src={iconUrl} alt="Test Icon Preview" className="w-12 h-12 rounded-xl object-cover border border-emerald-300 shadow-sm shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold shrink-0">
                    <TestTube2 className="w-6 h-6" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleIconUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingIcon}
                    className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>{isUploadingIcon ? 'Uploading...' : 'Upload Test Icon/Image'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">Supports PNG, JPG, WEBP icon/photo</p>
                </div>
              </div>

              <div>
                <label className="block mb-1">Test Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC with ESR)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Test Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="e.g. CBC-01"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label>Category *</label>
                    <button
                      type="button"
                      onClick={() => setIsQuickCatModalOpen(true)}
                      className="text-[10px] text-[#00984a] font-bold hover:underline"
                    >
                      + New
                    </button>
                  </div>
                  <select
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  >
                    <option value="">Select Category</option>
                    {categories?.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Regular Price (৳) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={regularPrice}
                    onChange={(e) => setRegularPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Discounted Price (৳) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={discountPrice}
                    onChange={(e) => setDiscountPrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Sample Specimen Type</label>
                  <input
                    type="text"
                    value={sampleType}
                    onChange={(e) => setSampleType(e.target.value)}
                    placeholder="e.g. Blood (EDTA), Urine, Serum"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Report Delivery Timeline</label>
                  <input
                    type="text"
                    value={reportDeliveryTime}
                    onChange={(e) => setReportDeliveryTime(e.target.value)}
                    placeholder="e.g. Same Day (4 Hours)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Preparation Instructions</label>
                <input
                  type="text"
                  value={preparationInstructions}
                  onChange={(e) => setPreparationInstructions(e.target.value)}
                  placeholder="e.g. Overnight 10-12 hours fasting required"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={homeCollectionAvailable}
                    onChange={(e) => setHomeCollectionAvailable(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00984a]"
                  />
                  <span>Available for Home Sample Collection</span>
                </label>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-1/2 bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingTest ? 'Update Test' : 'Save Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK INLINE CREATE CATEGORY MODAL */}
      {isQuickCatModalOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#00984a]" /> Quick Add Category
              </h4>
              <button onClick={() => setIsQuickCatModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCategorySubmit} className="space-y-3 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Histopathology"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block mb-1">Bengali Title (বাংলা নাম)</label>
                <input
                  type="text"
                  value={newCatBnName}
                  onChange={(e) => setNewCatBnName(e.target.value)}
                  placeholder="যেমন: টিস্যু পরীক্ষা"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuickCatModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickCategoryMutation.isPending}
                  className="w-1/2 bg-brand-gradient hover:opacity-95 text-white font-black py-2 rounded-xl transition shadow-sm"
                >
                  {quickCategoryMutation.isPending ? 'Saving...' : 'Add & Select'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};