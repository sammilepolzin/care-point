import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Stethoscope, 
  Plus, 
  MapPin, 
  Clock, 
  Search, 
  AlertCircle, 
  X, 
  Edit, 
  Trash2, 
  Upload, 
  Power,
  Calendar
} from 'lucide-react';
import api from '@/lib/axios';

interface Department {
  _id: string;
  name: string;
}

interface Doctor {
  _id: string;
  name: string;
  department: Department;
  qualification: string;
  specialization: string;
  consultationFee: number;
  followUpFee: number;
  chamberRoom: string;
  availableDays: string[];
  phone: string;
  email?: string;
  photoUrl: string;
  isActive: boolean;
}

const ALL_DAYS = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const DoctorsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [qualification, setQualification] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [consultationFee, setConsultationFee] = useState<number>(1000);
  const [followUpFee, setFollowUpFee] = useState<number>(500);
  const [chamberRoom, setChamberRoom] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Departments
  const { data: departments } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => {
      const res = await api.get('/departments');
      return res.data.data;
    },
  });

  // Fetch Doctors
  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['doctors', searchTerm, selectedDeptFilter, statusFilter],
    queryFn: async () => {
      let url = `/doctors?search=${searchTerm}`;
      if (selectedDeptFilter) url += `&departmentId=${selectedDeptFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (doctorData: any) => api.post('/doctors', doctorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to add doctor'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/doctors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update doctor profile'),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/doctors/${id}/status`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/doctors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctors'] }),
  });

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);
    setError(null);

    try {
      const res = await api.post('/upload/doctor-image', formData);
      if (res.data.success) {
        setPhotoUrl(res.data.data.imageUrl);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const toggleDay = (day: string) => {
    if (availableDays.includes(day)) {
      setAvailableDays(availableDays.filter((d) => d !== day));
    } else {
      setAvailableDays([...availableDays, day]);
    }
  };

  const openAddModal = () => {
    setEditingDoctor(null);
    setName('');
    setDepartmentId('');
    setQualification('');
    setSpecialization('');
    setConsultationFee(1000);
    setFollowUpFee(500);
    setChamberRoom('');
    setAvailableDays(['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']);
    setPhone('');
    setEmail('');
    setPhotoUrl('https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setDepartmentId(doc.department?._id || '');
    setQualification(doc.qualification);
    setSpecialization(doc.specialization);
    setConsultationFee(doc.consultationFee);
    setFollowUpFee(doc.followUpFee || 500);
    setChamberRoom(doc.chamberRoom);
    setAvailableDays(doc.availableDays && doc.availableDays.length > 0 ? doc.availableDays : ['Saturday', 'Sunday', 'Monday']);
    setPhone(doc.phone);
    setEmail(doc.email || '');
    setPhotoUrl(doc.photoUrl);
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!departmentId) {
      setError('Please select a department');
      return;
    }
    if (availableDays.length === 0) {
      setError('Please select at least one available chamber day');
      return;
    }

    const payload = {
      name,
      department: departmentId,
      qualification,
      specialization,
      consultationFee,
      followUpFee,
      chamberRoom,
      availableDays,
      phone,
      email,
      photoUrl,
    };

    if (editingDoctor) {
      updateMutation.mutate({ id: editingDoctor._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Doctors & Specialists Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Register doctors, upload photos, set chamber available days, and manage fees.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Specialist Doctor
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name or phone..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          />
        </div>

        <select
          value={selectedDeptFilter}
          onChange={(e) => setSelectedDeptFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
        >
          <option value="">All Departments (সকল বিভাগ)</option>
          {departments?.map((d) => (
            <option key={d._id} value={d._id}>{d.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
        >
          <option value="">All Status (সব স্ট্যাটাস)</option>
          <option value="active">Active Chambers Only</option>
          <option value="inactive">Inactive Doctors</option>
        </select>
      </div>

      {/* Doctor Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-slate-400">Loading doctor profiles...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors?.map((doc) => (
            <div
              key={doc._id}
              className={`bg-white rounded-3xl border ${
                doc.isActive ? 'border-slate-200/90' : 'border-rose-200 bg-rose-50/20'
              } p-5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img
                      src={doc.photoUrl}
                      alt={doc.name}
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-300 shadow"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                        doc.isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                      {doc.department?.name || 'Department'}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1 truncate">{doc.name}</h3>
                    <p className="text-[11px] text-slate-500 truncate">{doc.qualification}</p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4">
                  <p className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-[#00984a] shrink-0" /> Chamber:{' '}
                    <strong className="text-slate-800">{doc.chamberRoom}</strong>
                  </p>
                  <p className="flex items-center gap-2 truncate">
                    <Calendar className="w-3.5 h-3.5 text-[#00984a] shrink-0" /> Days:{' '}
                    <strong className="text-slate-800 truncate">
                      {doc.availableDays?.join(', ') || 'Saturday, Sunday, Monday'}
                    </strong>
                  </p>
                </div>
              </div>

              {/* Bottom Control Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block">Fee (Visit/Follow-up)</span>
                  <span className="text-sm font-black text-slate-900">
                    ৳{doc.consultationFee} <span className="text-[10px] text-slate-400">/ ৳{doc.followUpFee || 0}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleStatusMutation.mutate(doc._id)}
                    className={`p-2 rounded-xl transition ${
                      doc.isActive ? 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100' : 'text-rose-600 bg-rose-50 hover:bg-rose-100'
                    }`}
                    title={doc.isActive ? 'Deactivate Doctor' : 'Activate Doctor'}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openEditModal(doc)}
                    className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition"
                    title="Edit Doctor Profile"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Delete profile of ${doc.name}?`)) {
                        deleteMutation.mutate(doc._id);
                      }
                    }}
                    className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl transition"
                    title="Delete Doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#00984a]" />
                {editingDoctor ? 'Edit Doctor Profile' : 'Register Specialist Doctor'}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Image Upload Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                <img
                  src={photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                  alt="Doctor Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-300 shadow shrink-0"
                />
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-xs mb-1">Doctor Photo (ছবি আপলোড)</p>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-xl font-bold transition shadow-sm"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>{isUploading ? 'Uploading...' : 'Choose Image from PC'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 mt-1">Supports JPG, PNG, WEBP</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Prof. Dr. M. A. Rahman"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    required
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  >
                    <option value="">Select Department</option>
                    {departments?.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 01711000000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              {/* Dynamic Available Days Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Available Chamber Days (চেম্বারে বসার দিনসমূহ) *
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_DAYS.map((day) => {
                    const isSelected = availableDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                          isSelected
                            ? 'bg-[#00984a] text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Degrees & Qualifications *</label>
                <input
                  type="text"
                  required
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. MBBS, FCPS, MD (Cardiology)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Specialization Focus *</label>
                <input
                  type="text"
                  required
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Senior Interventional Cardiologist"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">First Visit Fee (৳) *</label>
                  <input
                    type="number"
                    required
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Follow-up Fee (৳)</label>
                  <input
                    type="number"
                    value={followUpFee}
                    onChange={(e) => setFollowUpFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Chamber Room *</label>
                  <input
                    type="text"
                    required
                    value={chamberRoom}
                    onChange={(e) => setChamberRoom(e.target.value)}
                    placeholder="Room 302"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
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
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingDoctor ? 'Update Doctor' : 'Register Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};