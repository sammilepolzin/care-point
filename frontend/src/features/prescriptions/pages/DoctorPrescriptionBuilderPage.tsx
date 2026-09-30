import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  HeartPulse, 
  Plus, 
  Trash2, 
  Save, 
  Printer, 
  User, 
  Stethoscope, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  FileText
} from 'lucide-react';
import api from '@/lib/axios';
import { PrescriptionPrintView } from '../components/PrescriptionPrintView';

interface Doctor {
  _id: string;
  name: string;
  department?: { name: string };
  qualification: string;
  specialization: string;
  chamberRoom?: string;
}

interface MedicineInput {
  medicineName: string;
  dosage: string;
  timing: string;
  duration: string;
  instructions: string;
}

export const DoctorPrescriptionBuilderPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Selected Doctor & Patient Info
  const [doctorId, setDoctorId] = useState('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number>(32);
  const [patientGender, setPatientGender] = useState('Male');

  // Vitals
  const [bp, setBp] = useState('120/80 mmHg');
  const [pulse, setPulse] = useState('76 bpm');
  const [weight, setWeight] = useState('68 kg');
  const [temp, setTemp] = useState('98.4 F');

  // Diagnosis & Complaints
  const [diagnosis, setDiagnosis] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [complaintsList, setComplaintsList] = useState<string[]>([]);

  // Medicines List
  const [medicines, setMedicines] = useState<MedicineInput[]>([
    { medicineName: 'Tab. Napa Extra 500mg+65mg', dosage: '1+0+1', timing: 'After meal', duration: '5 Days', instructions: 'With water' },
    { medicineName: 'Cap. Seclo 20mg', dosage: '1+0+1', timing: 'Before meal', duration: '14 Days', instructions: '30 mins before food' },
  ]);

  // Investigations & Advice
  const [investigationText, setInvestigationText] = useState('');
  const [investigationsList, setInvestigationsList] = useState<string[]>(['CBC with ESR', 'Lipid Profile']);
  const [adviceText, setAdviceText] = useState('');
  const [adviceList, setAdviceList] = useState<string[]>(['Drink plenty of fluids', 'Avoid fried oily food']);
  const [followUpDate, setFollowUpDate] = useState('After 14 Days');

  const [createdPrescription, setCreatedPrescription] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch Doctors
  const { data: doctors } = useQuery<Doctor[]>({
    queryKey: ['doctors-list-prescription'],
    queryFn: async () => {
      const res = await api.get('/doctors');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/prescriptions', payload),
    onSuccess: (res) => {
      setCreatedPrescription(res.data.data);
      setError(null);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to save prescription.'),
  });

  const addMedicineRow = () => {
    setMedicines([...medicines, { medicineName: '', dosage: '1+0+1', timing: 'After meal', duration: '7 Days', instructions: '' }]);
  };

  const removeMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const updateMedicine = (index: number, field: keyof MedicineInput, value: string) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addComplaint = () => {
    if (complaintText.trim()) {
      setComplaintsList([...complaintsList, complaintText.trim()]);
      setComplaintText('');
    }
  };

  const addInvestigation = () => {
    if (investigationText.trim()) {
      setInvestigationsList([...investigationsList, investigationText.trim()]);
      setInvestigationText('');
    }
  };

  const addAdvice = () => {
    if (adviceText.trim()) {
      setAdviceList([...adviceList, adviceText.trim()]);
      setAdviceText('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId) {
      setError('Please select prescribing doctor');
      return;
    }
    if (!patientName.trim() || !patientPhone.trim() || !diagnosis.trim()) {
      setError('Please fill in patient details and clinical diagnosis');
      return;
    }

    createMutation.mutate({
      doctor: doctorId,
      patientName,
      patientPhone,
      patientAge,
      patientGender,
      vitals: { bp, pulse, weight, temp },
      chiefComplaints: complaintsList,
      diagnosis,
      medicines,
      investigations: investigationsList,
      advice: adviceList,
      followUpDate,
    });
  };

  if (createdPrescription) {
    return (
      <div className="min-h-screen bg-[#f8fafc] py-10 px-4 flex flex-col items-center">
        <PrescriptionPrintView
          prescription={createdPrescription}
          onClose={() => setCreatedPrescription(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <HeartPulse className="w-6 h-6 text-[#00984a]" /> Digital Prescription Builder (Rx)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Create verified clinical prescriptions with vitals, dosage, investigation advice, and 1-click print.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-xs font-bold border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 text-xs font-bold text-slate-700">
        
        {/* Doctor & Patient Info Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">1. Doctor & Patient Information</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Prescribing Doctor *</label>
              <select
                required
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              >
                <option value="">Select Doctor</option>
                {doctors?.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.department?.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Patient Full Name *</label>
              <input
                type="text"
                required
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g. Md. Rafiqul Islam"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              />
            </div>

            <div>
              <label className="block mb-1">Patient Mobile Phone *</label>
              <input
                type="text"
                required
                value={patientPhone}
                onChange={(e) => setPatientPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block mb-1">Age</label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>
              <div>
                <label className="block mb-1">Gender</label>
                <select
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Vitals, Complaints & Diagnosis */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">2. Clinical Vitals & Diagnosis</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block mb-1">Blood Pressure (BP)</label>
              <input
                type="text"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                placeholder="120/80 mmHg"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1">Pulse</label>
              <input
                type="text"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="76 bpm"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1">Weight</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="68 kg"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
            <div>
              <label className="block mb-1">Temperature</label>
              <input
                type="text"
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="98.4 F"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Diagnosis (রোগের নির্ণয়) *</label>
            <input
              type="text"
              required
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension, Type 2 Diabetes Mellitus"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 font-black text-sm focus:outline-none focus:border-[#00984a]"
            />
          </div>

          <div>
            <label className="block mb-1">Chief Complaints (রোগীর উপসর্গসমূহ)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="e.g. Chest discomfort x 3 days"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={addComplaint}
                className="bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold"
              >
                + Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {complaintsList.map((c, i) => (
                <span key={i} className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1">
                  {c} <button type="button" onClick={() => setComplaintsList(complaintsList.filter((_, idx) => idx !== i))} className="text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Medicines List (Rx) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
              <span className="text-[#00984a] text-lg font-serif italic">℞</span> 3. Prescribed Medicines (ওষুধের তালিকা)
            </h3>
            <button
              type="button"
              onClick={addMedicineRow}
              className="bg-emerald-50 hover:bg-emerald-100 text-[#00984a] px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </div>

          <div className="space-y-3">
            {medicines.map((med, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-2.5 items-end">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Medicine Name & Strength *</label>
                  <input
                    type="text"
                    required
                    value={med.medicineName}
                    onChange={(e) => updateMedicine(idx, 'medicineName', e.target.value)}
                    placeholder="Tab. Napa Extra"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={med.dosage}
                    onChange={(e) => updateMedicine(idx, 'dosage', e.target.value)}
                    placeholder="1+0+1"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={med.duration}
                    onChange={(e) => updateMedicine(idx, 'duration', e.target.value)}
                    placeholder="7 Days"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Timing</label>
                    <select
                      value={med.timing}
                      onChange={(e) => updateMedicine(idx, 'timing', e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-slate-900 text-xs"
                    >
                      <option value="After meal">খাওয়ার পরে</option>
                      <option value="Before meal">খাওয়ার আগে</option>
                      <option value="With meal">খাবারের সাথে</option>
                    </select>
                  </div>
                  {medicines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicineRow(idx)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-xl mt-5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Investigations & Advice */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">4. Diagnostic Tests & Advice</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Advised Tests (পরীক্ষার পরামর্শ)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={investigationText}
                  onChange={(e) => setInvestigationText(e.target.value)}
                  placeholder="e.g. ECG 12-Lead, Echocardiography"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
                <button type="button" onClick={addInvestigation} className="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs">
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {investigationsList.map((test, i) => (
                  <span key={i} className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1">
                    {test} <button type="button" onClick={() => setInvestigationsList(investigationsList.filter((_, idx) => idx !== i))} className="text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block mb-1">General Advice (উপদেশ)</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={adviceText}
                  onChange={(e) => setAdviceText(e.target.value)}
                  placeholder="e.g. Walk 30 minutes daily"
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900"
                />
                <button type="button" onClick={addAdvice} className="bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl text-xs">
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {adviceList.map((adv, i) => (
                  <span key={i} className="bg-slate-100 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1">
                    {adv} <button type="button" onClick={() => setAdviceList(adviceList.filter((_, idx) => idx !== i))} className="text-red-500">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="block mb-1">Follow-up Timeline (পরবর্তী সাক্ষাতের সময়)</label>
            <input
              type="text"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              placeholder="e.g. After 14 Days"
              className="w-full sm:w-64 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-bold"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-4 rounded-2xl text-sm transition shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{createMutation.isPending ? 'Saving Rx...' : 'Generate & Print Digital Prescription'}</span>
        </button>
      </form>
    </div>
  );
};