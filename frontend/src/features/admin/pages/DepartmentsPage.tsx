import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit, 
  AlertCircle, 
  X, 
  Camera,
  Upload
} from 'lucide-react';
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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [name, setName] = useState('');
  const [bnName, setBnName] = useState('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: departments, isLoading } = useQuery<Department[]>({
    queryKey: ['admin-departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data.data;
    },
  });

  // Image Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);
    setError(null);

    try {
      const res = await api.post('/upload/image', formData);
      if (res.data.success) {
        setIconUrl(res.data.data.imageUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/departments', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      queryClient.invalidateQueries({ queryKey: ['public-departments'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to add department'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/departments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      queryClient.invalidateQueries({ queryKey: ['public-departments'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update department'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/departments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-departments'] });
      queryClient.invalidateQueries({ queryKey: ['public-departments'] });
    },
  });

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setBnName('');
    setDescription('');
    setIconUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setName(dept.name);
    setBnName(dept.bnName || '');
    setDescription(dept.description || '');
    setIconUrl(dept.iconUrl || '');
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDept(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Department Name is required');
      return;
    }

    const payload = { name, bnName, description, iconUrl };

    if (editingDept) {
      updateMutation.mutate({ id: editingDept._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Medical Departments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage clinical specialties, edit descriptions, and upload department cover photos.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Department
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        {isLoading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading departments...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments && departments.length > 0 ? (
              departments.map((dept) => (
                <div key={dept._id} className="p-4 rounded-2xl border border-slate-200 hover:border-[#00984a] transition-all bg-white shadow-2xs group flex flex-col justify-between">
                  <div>
                    {dept.iconUrl ? (
                      <img src={dept.iconUrl} alt={dept.name} className="w-12 h-12 rounded-xl object-cover mb-3 border border-slate-200" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold mb-3">
                        <Building2 className="w-5 h-5" />
                      </div>
                    )}
                    <h4 className="font-bold text-slate-900 text-sm">{dept.name}</h4>
                    {dept.bnName && <p className="text-[10px] text-emerald-700 font-bold mt-0.5">{dept.bnName}</p>}
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">{dept.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      onClick={() => openEditModal(dept)}
                      className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete department ${dept.name}?`)) deleteMutation.mutate(dept._id);
                      }}
                      className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-xs font-bold transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs">No medical departments found.</div>
            )}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-xs font-bold text-slate-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#00984a]" />
                {editingDept ? 'Edit Department' : 'Add New Department'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Image Upload Box */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border">
                {iconUrl ? (
                  <img src={iconUrl} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-emerald-300" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-[#00984a] flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full bg-white border border-slate-300 py-2 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>{isUploading ? 'Uploading...' : 'Upload Department Photo'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block mb-1">Department Name (English) *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cardiology"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block mb-1">Bengali Name (বাংলা নাম)</label>
                <input
                  type="text"
                  value={bnName}
                  onChange={(e) => setBnName(e.target.value)}
                  placeholder="e.g. হৃদরোগ বিভাগ"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block mb-1">Clinical Description (Textarea)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details about services provided in this department..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-slate-900 font-medium focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={closeModal} className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold transition">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || isUploading} className="w-1/2 bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl shadow transition">
                  {createMutation.isPending ? 'Saving...' : 'Save Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};