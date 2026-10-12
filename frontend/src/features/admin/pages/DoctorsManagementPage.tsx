import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Stethoscope, 
  Plus, 
  Trash2, 
  Edit, 
  AlertCircle, 
  X, 
  Camera, 
  Upload, 
  Search, 
  Building2 
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
  workplace?: string;
  consultationFee: number;
  chamberRoom: string;
  availableDays: string[];
  phone: string;
  photoUrl: string;
  isActive: boolean;
}

const BENGALI_DAYS = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

export const DoctorsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [workplace, setWorkplace] = useState(''); // বর্তমান কর্মস্থল
  const [qualification, setQualification] = useState(''); // Multi-line textarea
  const [specialization, setSpecialization] = useState(''); // Multi-line textarea
  const [consultationFee, setConsultationFee] = useState<number>(800);
  const [chamberRoom, setChamberRoom] = useState('Room 302');
  const [selectedDays, setSelectedDays] = useState<string[]>(['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার']);
  const [customDaysText, setCustomDaysText] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: departments } = useQuery<Department[]>({
    queryKey: ['admin-departments-dropdown'],
    queryFn: async () => {
      const res = await api.get('/departments?active=true');
      return res.data.data;
    },
  });

  const { data: doctors, isLoading } = useQuery<Doctor[]>({
    queryKey: ['admin-doctors-list', searchTerm],
    queryFn: async () => {
      const res = await api.get(`/doctors?search=${searchTerm}`);
      return res.data.data;
    },
  });

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
        setPhotoUrl(res.data.data.imageUrl);
      }
    } catch (err: any) {
      setError('Failed to upload doctor photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/doctors', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-featured-doctors'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to save doctor.'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => api.put(`/doctors/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-doctors-list'] });
      queryClient.invalidateQueries({ queryKey: ['public-featured-doctors'] });
      closeModal();
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to update doctor.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/doctors/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-doctors-list'] }),
  });

  const openAddModal = () => {
    setEditingDoctor(null);
    setName('');
    setDepartmentId(departments?.[0]?._id || '');
    setWorkplace('');
    setQualification('');
    setSpecialization('');
    setConsultationFee(800);
    setChamberRoom('Room 302');
    setSelectedDays(['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার']);
    setCustomDaysText('');
    setPhone('');
    setPhotoUrl('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (doc: Doctor) => {
    setEditingDoctor(doc);
    setName(doc.name);
    setDepartmentId(doc.department?._id || '');
    setWorkplace(doc.workplace || '');
    setQualification(doc.qualification || '');
    setSpecialization(doc.specialization || '');
    setConsultationFee(doc.consultationFee || 800);
    setChamberRoom(doc.chamberRoom || 'Room 302');
    setSelectedDays(doc.availableDays || []);
    setCustomDaysText('');
    setPhone(doc.phone || '');
    setPhotoUrl(doc.photoUrl || '');
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDoctor(null);
  };

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Doctor name is required');
      return;
    }

    // Merge selected Bengali days with custom text if provided
    let finalDays = [...selectedDays];
    if (customDaysText.trim()) {
      finalDays = customDaysText.split(',').map((s) => s.trim()).filter(Boolean);
    }

    const payload = {
      name,
      department: departmentId,
      workplace,
      qualification,
      specialization,
      consultationFee: Number(consultationFee) || 0,
      chamberRoom,
      availableDays: finalDays,
      phone,
      photoUrl,
    };

    if (editingDoctor) {
      updateMutation.mutate({ id: editingDoctor._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Doctors & Specialist Physicians</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage consultants, chamber schedules, workplace hospitals, multi-line qualifications, and consultation fees.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Specialist Doctor
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name or specialization..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          />
        </div>
      </div>

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors?.map((doc) => (
          <div key={doc._id} className="bg-white rounded-3xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between hover:border-[#00984a] transition group">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={doc.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'}
                  alt={doc.name}
                  className="w-14 h-14 rounded-2xl object-cover border"
                />
                <div className="min-w-0">
                  <span className="text-[9px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">{doc.department?.name}</span>
                  <h4 className="font-bold text-slate-900 text-sm mt-0.5 truncate">{doc.name}</h4>
                  {doc.workplace && <p className="text-[10px] text-emerald-800 font-bold truncate">{doc.workplace}</p>}
                </div>
              </div>
              <p className="text-xs text-slate-500 whitespace-pre-line line-clamp-2">{doc.qualification}</p>
              <div className="mt-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border">
                <p>Chamber: <strong className="text-slate-900">{doc.chamberRoom}</strong> • Fee: <strong className="text-slate-900">৳{doc.consultationFee}</strong></p>
                <p className="text-[10px] text-slate-400 mt-0.5">Days: {doc.availableDays?.join(', ')}</p>
              </div>
            </div>

            <div className="mt-4 pt-2 border-t flex justify-end gap-2">
              <button onClick={() => openEditModal(doc)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold flex items-center gap-1">
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete doctor ${doc.name}?`)) deleteMutation.mutate(doc._id);
                }}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border text-xs font-bold text-slate-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-[#00984a]" />
                {editingDoctor ? 'Edit Doctor Profile' : 'Add Specialist Doctor'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Photo Upload */}
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border">
                {photoUrl ? (
                  <img src={photoUrl} alt="Preview" className="w-14 h-14 rounded-2xl object-cover border border-emerald-300" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#00984a] flex items-center justify-center">
                    <Camera className="w-6 h-6" />
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
                    className="bg-white border px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>{isUploading ? 'Uploading...' : 'Choose Doctor Photo from PC'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Doctor Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Prof. Dr. Md. Rafiqul Islam"
                    className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block mb-1">Department *</label>
                  <select
                    required
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                  >
                    {departments?.map((d) => (
                      <option key={d._id} value={d._id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Workplace / Hospital Field */}
              <div>
                <label className="block mb-1">Current Workplace / Hospital (বর্তমান কর্মস্থল / হাসপাতাল)</label>
                <input
                  type="text"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder="যেমন: ঢাকা মেডিকেল কলেজ ও হাসপাতাল / অধ্যাপক ও বিভাগীয় প্রধান, BSMMU"
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 font-semibold"
                />
              </div>

              {/* Multi-line Degrees & Qualifications Textarea */}
              <div>
                <label className="block mb-1">Degrees & Qualifications (একাধিক লাইনে বিস্তারিত লিখুন)</label>
                <textarea
                  rows={2}
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="MBBS (DMC), FCPS (Medicine), MD (Cardiology), FRCP (Glasgow)..."
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              {/* Multi-line Specialization Textarea */}
              <div>
                <label className="block mb-1">Specialization Focus (বিশেষজ্ঞতার ক্ষেত্র)</label>
                <textarea
                  rows={2}
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="হৃদরোগ, উচ্চ রক্তচাপ ও বাতজ্বর বিশেষজ্ঞ (Cardiologist)..."
                  className="w-full bg-slate-50 border rounded-xl p-2.5 text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Consultation Fee (BDT)</label>
                  <input
                    type="number"
                    value={consultationFee}
                    onChange={(e) => setConsultationFee(Number(e.target.value))}
                    className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block mb-1">Chamber Room No.</label>
                  <input
                    type="text"
                    value={chamberRoom}
                    onChange={(e) => setChamberRoom(e.target.value)}
                    placeholder="Room 302"
                    className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Chamber Days in Bengali Checkboxes + Custom Text */}
              <div className="p-3 bg-slate-50 rounded-2xl border space-y-2">
                <label className="block text-[11px] font-bold text-slate-800">Available Chamber Days (চেম্বারে বসার দিনসমূহ)</label>
                
                <div className="flex flex-wrap gap-2">
                  {BENGALI_DAYS.map((day) => (
                    <label key={day} className="flex items-center gap-1.5 p-1.5 px-2 bg-white rounded-lg border text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedDays.includes(day)}
                        onChange={() => toggleDay(day)}
                        className="rounded text-[#00984a]"
                      />
                      <span>{day}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-1">
                  <input
                    type="text"
                    value={customDaysText}
                    onChange={(e) => setCustomDaysText(e.target.value)}
                    placeholder="অথবা কাস্টম দিন লিখুন (যেমন: শনি, সোম, বুধ)"
                    className="w-full bg-white border rounded-xl px-3 py-1.5 text-slate-900 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={closeModal} className="w-1/2 bg-slate-100 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || isUploading} className="w-1/2 bg-brand-gradient text-white font-black py-2.5 rounded-xl shadow">
                  {createMutation.isPending ? 'Saving...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};