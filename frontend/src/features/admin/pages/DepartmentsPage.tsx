import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Plus, Edit, Trash2, AlertCircle, X, Upload, Activity } from 'lucide-react';
import api from '@/lib/axios';

interface Department {
  _id: string;
  name: string;
  bnName?: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
}

export const DepartmentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Create Form State
  const [name, setName] = useState('');
  const [bnName, setBnName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Edit Modal State
  const [editDept, setEditDept] = useState<Department | null>(null);
  const [editName, setEditName] = useState('');
  const [editBnName, setEditBnName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIconUrl, setEditIconUrl] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newDept: any) => api.post('/departments', newDept),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setName('');
      setBnName('');
      setDescription('');
      setIconUrl('');
      setError(null);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create department'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Department> }) => {
      return api.put(`/departments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      setEditDept(null);
      setModalError(null);
    },
    onError: (err: any) => setModalError(err.response?.data?.message || 'Failed to update department'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/departments/${id}/status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  // Image Upload handler
  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);

    try {
      const res = await api.post('/upload/doctor-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        if (isEdit) {
          setEditIconUrl(res.data.data.imageUrl);
        } else {
          setIconUrl(res.data.data.imageUrl);
        }
      }
    } catch (err: any) {
      setError('Failed to upload department icon');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({ name, bnName, description, iconUrl });
  };

  const openEditModal = (dept: Department) => {
    setEditDept(dept);
    setEditName(dept.name);
    setEditBnName(dept.bnName || '');
    setEditDescription(dept.description || '');
    setEditIconUrl(dept.iconUrl || '');
    setModalError(null);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDept || !editName.trim()) return;
    updateMutation.mutate({
      id: editDept._id,
      data: { name: editName, bnName: editBnName, description: editDescription, iconUrl: editIconUrl },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Medical Departments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage clinical specialties, upload custom icons, and control active/inactive chambers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#00984a]" /> Add New Department
          </h3>

          {error && (
            <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleCreate} className="space-y-4">
            {/* Icon Upload Box */}
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center gap-3">
              {iconUrl ? (
                <img src={iconUrl} alt="Icon" className="w-12 h-12 rounded-xl object-cover border border-emerald-300" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center shrink-0">
                  <Activity className="w-6 h-6" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => handleIconUpload(e, false)}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Icon/Image'}</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department Name (English) *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cardiology, Neurology"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bengali Label (বাংলা নাম)
              </label>
              <input
                type="text"
                value={bnName}
                onChange={(e) => setBnName(e.target.value)}
                placeholder="যেমন: হৃদরোগ বিভাগ"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of department services..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              />
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{createMutation.isPending ? 'Saving...' : 'Add Department'}</span>
            </button>
          </form>
        </div>

        {/* List Table */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-black text-slate-900 mb-4">
            Department Registry ({departments?.length || 0})
          </h3>

          {isLoading ? (
            <div className="text-center py-10 text-xs text-slate-400">Loading departments...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Department</th>
                    <th className="p-3">Bengali Title</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {departments?.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3 flex items-center gap-3">
                        {d.iconUrl ? (
                          <img src={d.iconUrl} alt={d.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00984a] flex items-center justify-center">
                            <Activity className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{d.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{d.description || 'No description'}</p>
                        </div>
                      </td>
                      <td className="p-3 text-slate-600 font-semibold">{d.bnName || '—'}</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleStatusMutation.mutate(d._id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black border transition ${
                            d.isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {d.isActive ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(d)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete ${d.name}?`)) {
                                deleteMutation.mutate(d._id);
                              }
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editDept && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-[#00984a]" /> Edit Department
              </h3>
              <button onClick={() => setEditDept(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Bengali Label (বাংলা নাম)
                </label>
                <input
                  type="text"
                  value={editBnName}
                  onChange={(e) => setEditBnName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditDept(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="w-1/2 bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl text-xs transition shadow-md disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};