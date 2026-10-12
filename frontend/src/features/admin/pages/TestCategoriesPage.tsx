import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Plus, Trash2, Edit, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import api from '@/lib/axios';

interface TestCategory {
  _id: string;
  name: string;
  bnName?: string;
  description?: string;
  isActive: boolean;
}

export const TestCategoriesPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Create Form State
  const [name, setName] = useState('');
  const [bnName, setBnName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editingCategory, setEditingCategory] = useState<TestCategory | null>(null);
  const [editName, setEditName] = useState('');
  const [editBnName, setEditBnName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Fetch Categories
  const { data: categories, isLoading } = useQuery<TestCategory[]>({
    queryKey: ['admin-test-categories'],
    queryFn: async () => {
      const res = await api.get('/test-categories');
      return res.data.data;
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/test-categories', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-test-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-test-categories'] });
      setName('');
      setBnName('');
      setDescription('');
      setError(null);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to add category'),
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TestCategory> }) => {
      return api.put(`/test-categories/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-test-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-test-categories'] });
      setEditingCategory(null);
      setModalError(null);
    },
    onError: (err: any) => setModalError(err.response?.data?.message || 'Failed to update category'),
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/test-categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-test-categories'] });
      queryClient.invalidateQueries({ queryKey: ['public-test-categories'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter category name');
      return;
    }
    createMutation.mutate({ name, bnName, description });
  };

  const openEditModal = (cat: TestCategory) => {
    setEditingCategory(cat);
    setEditName(cat.name);
    setEditBnName(cat.bnName || '');
    setEditDescription(cat.description || '');
    setModalError(null);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editName.trim()) return;
    updateMutation.mutate({
      id: editingCategory._id,
      data: { name: editName, bnName: editBnName, description: editDescription },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Diagnostic Test Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage pathology and radiology categories, edit titles, and maintain clean laboratory taxonomy.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#00984a]" /> Add New Test Category
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
            <div>
              <label className="block mb-1">Category Name (English) *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Microbiology, Serology"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              />
            </div>

            <div>
              <label className="block mb-1">Bengali Title (বাংলা নাম)</label>
              <input
                type="text"
                value={bnName}
                onChange={(e) => setBnName(e.target.value)}
                placeholder="যেমন: অণুজীববিজ্ঞান পরীক্ষা"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              />
            </div>

            <div>
              <label className="block mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short summary of tests in this category..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{createMutation.isPending ? 'Saving...' : 'Add Category'}</span>
            </button>
          </form>
        </div>

        {/* Categories Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-black text-slate-900 mb-4">
            Active Test Categories ({categories?.length || 0})
          </h3>

          {isLoading ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading categories...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Category Name</th>
                    <th className="p-3">Bengali Title</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {categories && categories.length > 0 ? (
                    categories.map((cat) => (
                      <tr key={cat._id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3 font-bold text-slate-900">{cat.name}</td>
                        <td className="p-3 text-slate-600 font-semibold">{cat.bnName || '—'}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{cat.description || '—'}</td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(cat)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Category"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete category ${cat.name}?`)) {
                                  deleteMutation.mutate(cat._id);
                                }
                              }}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Delete Category"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">
                        No categories found. Add one from the form.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* EDIT CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#00984a]" /> Edit Test Category
              </h3>
              <button onClick={() => setEditingCategory(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4 text-xs font-bold text-slate-700">
              <div>
                <label className="block mb-1">Category Name (English) *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block mb-1">Bengali Title (বাংলা নাম)</label>
                <input
                  type="text"
                  value={editBnName}
                  onChange={(e) => setEditBnName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-1/2 bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl transition shadow-md disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Update Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};