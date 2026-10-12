import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ImageIcon, 
  Plus, 
  Trash2, 
  Upload, 
  X, 
  AlertCircle,
  Edit,
  CheckCircle2,
  Camera
} from 'lucide-react';
import api from '@/lib/axios';

interface GalleryPhoto {
  _id: string;
  title: string;
  category: 'FACILITIES' | 'LABORATORY' | 'DOCTOR_CHAMBERS' | 'EQUIPMENT';
  imageUrl: string;
  description?: string;
  isFeatured: boolean;
}

export const GalleryManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const editFileInputRef = useRef<HTMLInputElement | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'FACILITIES' | 'LABORATORY' | 'DOCTOR_CHAMBERS' | 'EQUIPMENT'>('LABORATORY');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: photos, isLoading } = useQuery<GalleryPhoto[]>({
    queryKey: ['admin-gallery'],
    queryFn: async () => {
      const res = await api.get('/gallery');
      return res.data.data;
    },
  });

  // Universal Uploader without broken Content-Type override
  const handleFileUpload = async (file: File, onSuccess: (url: string) => void) => {
    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);
    setError(null);

    try {
      const res = await api.post('/upload/image', formData);
      if (res.data.success) {
        onSuccess(res.data.data.imageUrl);
        setSuccessMsg('Photo uploaded from PC successfully!');
        setTimeout(() => setSuccessMsg(null), 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/gallery', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to save photo'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/gallery/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
      setEditingPhoto(null);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update photo'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/gallery/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-gallery'] });
      queryClient.invalidateQueries({ queryKey: ['public-gallery'] });
    },
  });

  const openAddModal = () => {
    setEditingPhoto(null);
    setTitle('');
    setImageUrl('');
    setDescription('');
    setCategory('LABORATORY');
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPhoto(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) {
      setError('Please choose a photo from your computer.');
      return;
    }
    createMutation.mutate({ title, category, imageUrl, description });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;
    updateMutation.mutate({
      id: editingPhoto._id,
      data: {
        title: editingPhoto.title,
        category: editingPhoto.category,
        description: editingPhoto.description,
        imageUrl: editingPhoto.imageUrl,
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Facility & Laboratory Photo Gallery</h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload, edit descriptions, change categories, and replace photos of clinical analyzers, specialist chambers, and patient suites.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Upload New Photo
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs">Loading photos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {photos && photos.length > 0 ? (
              photos.map((item) => (
                <div key={item._id} className="rounded-2xl border border-slate-200 overflow-hidden relative group bg-white shadow-2xs flex flex-col justify-between">
                  <div>
                    <img src={item.imageUrl} alt={item.title} className="w-full h-40 object-cover" />
                    <div className="p-3.5">
                      <span className="text-[9px] font-black text-[#00984a] uppercase bg-emerald-50 px-2 py-0.5 rounded">
                        {item.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs truncate mt-1.5">{item.title}</h4>
                      {item.description && (
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS (EDIT & DELETE) */}
                  <div className="p-3 pt-0 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => setEditingPhoto({ ...item })}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      title="Edit Photo"
                    >
                      <Edit className="w-3.5 h-3.5" /> Edit
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete photo "${item.title}"?`)) deleteMutation.mutate(item._id);
                      }}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-16 text-slate-400 text-xs">No gallery photos uploaded yet.</div>
            )}
          </div>
        )}
      </div>

      {/* 1. ADD PHOTO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-xs font-bold text-slate-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-[#00984a]" /> Upload Gallery Photo
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed text-center space-y-2">
                {imageUrl ? (
                  <img src={imageUrl} alt="Uploaded" className="w-full h-36 object-cover rounded-xl border" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-[#00984a] mx-auto" />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, setImageUrl);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-white border px-4 py-1.5 rounded-xl font-bold flex items-center gap-1.5 mx-auto shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                  <span>{isUploading ? 'Uploading...' : 'Choose Photo from PC'}</span>
                </button>
              </div>

              <div>
                <label className="block mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Roche Cobas Automated Laboratory Suite"
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="LABORATORY">Laboratory Suite</option>
                  <option value="EQUIPMENT">Advanced Equipment</option>
                  <option value="DOCTOR_CHAMBERS">Doctor Chambers</option>
                  <option value="FACILITIES">Centre Facilities</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Description (Textarea)</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief details about this facility..."
                  className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={closeModal} className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || isUploading} className="w-1/2 bg-brand-gradient text-white font-black py-2.5 rounded-xl shadow">
                  {createMutation.isPending ? 'Saving...' : 'Save Photo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. FULL EDIT PHOTO MODAL */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 text-xs font-bold text-slate-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#00984a]" /> Edit Gallery Photo
              </h3>
              <button onClick={() => setEditingPhoto(null)} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border text-center space-y-2">
                <img src={editingPhoto.imageUrl} alt="Preview" className="w-full h-36 object-cover rounded-xl border" />
                <input
                  type="file"
                  ref={editFileInputRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f, (url) => setEditingPhoto({ ...editingPhoto, imageUrl: url }));
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => editFileInputRef.current?.click()}
                  disabled={isUploading}
                  className="bg-white border px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 mx-auto shadow-2xs hover:bg-slate-100"
                >
                  <Camera className="w-3.5 h-3.5 text-[#00984a]" />
                  <span>{isUploading ? 'Uploading...' : 'Replace Photo from PC'}</span>
                </button>
              </div>

              <div>
                <label className="block mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Category *</label>
                <select
                  value={editingPhoto.category}
                  onChange={(e: any) => setEditingPhoto({ ...editingPhoto, category: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                >
                  <option value="LABORATORY">Laboratory Suite</option>
                  <option value="EQUIPMENT">Advanced Equipment</option>
                  <option value="DOCTOR_CHAMBERS">Doctor Chambers</option>
                  <option value="FACILITIES">Centre Facilities</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Description (Textarea)</label>
                <textarea
                  rows={3}
                  value={editingPhoto.description || ''}
                  onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditingPhoto(null)} className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" disabled={updateMutation.isPending || isUploading} className="w-1/2 bg-brand-gradient text-white font-black py-2.5 rounded-xl shadow">
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};