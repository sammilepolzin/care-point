import React from 'react';
import { Activity, Printer, X, ShieldCheck, HeartPulse } from 'lucide-react';

interface Medicine {
  medicineName: string;
  dosage: string;
  timing: string;
  duration: string;
  instructions?: string;
}

interface PrescriptionData {
  _id?: string;
  prescriptionId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  doctor: {
    name: string;
    qualification: string;
    specialization: string;
    chamberRoom?: string;
  };
  department?: { name: string };
  vitals?: {
    bp?: string;
    pulse?: string;
    weight?: string;
    temp?: string;
  };
  chiefComplaints: string[];
  diagnosis: string;
  medicines: Medicine[];
  investigations: string[];
  advice: string[];
  followUpDate?: string;
  createdAt: string;
}

export const PrescriptionPrintView: React.FC<{
  prescription: PrescriptionData;
  onClose?: () => void;
}> = ({ prescription, onClose }) => {
  return (
    <div className="bg-white rounded-3xl w-full max-w-4xl p-8 border border-slate-200 shadow-2xl space-y-6 text-slate-800 print:p-0 print:border-0 print:shadow-none">
      
      {/* Top Controls (Hidden on Print) */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
          <HeartPulse className="w-4 h-4 text-[#00984a]" /> Official Medical Prescription
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="bg-brand-gradient hover:opacity-95 text-white px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow"
          >
            <Printer className="w-4 h-4" /> Print Rx (প্রেসক্রিপশন প্রিন্ট)
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-xl"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 1. OFFICIAL HEADER BANNER */}
      <div className="flex justify-between items-start pb-6 border-b-2 border-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-brand-gradient text-white flex items-center justify-center font-black">
              C
            </div>
            <span className="text-xl font-black tracking-tight text-[#00984a]">Care Point</span>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Diagnostic & Consultation Centre
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            House 42, Road 11, Dhanmondi, Dhaka | Hotline: 09666 787801
          </p>
        </div>

        {/* Doctor Header Info */}
        <div className="text-right max-w-xs">
          <h2 className="font-black text-slate-900 text-base">{prescription.doctor?.name}</h2>
          <p className="text-xs text-[#00984a] font-bold">{prescription.department?.name || 'Consultant'}</p>
          <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{prescription.doctor?.qualification}</p>
          <p className="text-[10px] text-slate-400">Chamber: {prescription.doctor?.chamberRoom || 'Room 302'}</p>
        </div>
      </div>

      {/* 2. PATIENT BAR */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex flex-wrap justify-between items-center text-xs text-slate-700 font-semibold gap-2">
        <span>Patient: <strong className="text-slate-900 font-black">{prescription.patientName}</strong></span>
        <span>Age: <strong>{prescription.patientAge} Y</strong></span>
        <span>Gender: <strong>{prescription.patientGender}</strong></span>
        <span>Phone: <strong>{prescription.patientPhone}</strong></span>
        <span>Date: <strong>{new Date(prescription.createdAt).toLocaleDateString()}</strong></span>
        <span className="font-mono text-slate-400 text-[10px]">Rx ID: {prescription.prescriptionId}</span>
      </div>

      {/* 3. MAIN PRESCRIPTION BODY (SPLIT: VITALS & COMPLAINTS vs Rx MEDICINES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        
        {/* LEFT COLUMN: Vitals, Complaints, Diagnosis, Tests */}
        <div className="space-y-5 border-r md:pr-6 border-slate-200 text-xs">
          
          {/* Vitals */}
          {prescription.vitals && (
            <div className="space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Clinical Vitals</span>
              <div className="grid grid-cols-2 gap-1 text-[11px]">
                <p>BP: <strong className="text-slate-900">{prescription.vitals.bp || '120/80'}</strong></p>
                <p>Pulse: <strong className="text-slate-900">{prescription.vitals.pulse || '76 bpm'}</strong></p>
                <p>Weight: <strong className="text-slate-900">{prescription.vitals.weight || '65 kg'}</strong></p>
                <p>Temp: <strong className="text-slate-900">{prescription.vitals.temp || '98.4 F'}</strong></p>
              </div>
            </div>
          )}

          {/* Chief Complaints */}
          {prescription.chiefComplaints && prescription.chiefComplaints.length > 0 && (
            <div>
              <span className="font-bold text-slate-900 block mb-1">Chief Complaints:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-[11px]">
                {prescription.chiefComplaints.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200">
              <span className="text-[10px] font-black uppercase text-[#00984a] block">Diagnosis:</span>
              <p className="font-bold text-slate-900 text-xs mt-0.5">{prescription.diagnosis}</p>
            </div>
          )}

          {/* Advised Investigations */}
          {prescription.investigations && prescription.investigations.length > 0 && (
            <div className="pt-2">
              <span className="font-bold text-slate-900 block mb-1">Investigations / Tests:</span>
              <ul className="space-y-1 text-slate-700 text-xs font-semibold">
                {prescription.investigations.map((test, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00984a]" /> {test}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* RIGHT 2 COLUMNS: Rx MEDICINES & INSTRUCTIONS */}
        <div className="md:col-span-2 space-y-6 text-xs pl-2">
          
          {/* Rx Symbol */}
          <div className="text-3xl font-black text-[#00984a] font-serif italic border-b border-slate-200 pb-2">
            ℞
          </div>

          {/* Medicine List */}
          <div className="space-y-4">
            {prescription.medicines?.map((med, idx) => (
              <div key={idx} className="pb-3 border-b border-slate-100 space-y-1">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-black text-slate-900 text-sm">{idx + 1}. {med.medicineName}</h4>
                  <span className="font-bold text-[#00984a] bg-emerald-50 px-2.5 py-0.5 rounded text-xs">
                    {med.dosage}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pl-4">
                  <span>Timing: <strong className="text-slate-800">{med.timing}</strong></span>
                  <span>Duration: <strong className="text-slate-800">{med.duration}</strong></span>
                  {med.instructions && <span>Advice: <em>{med.instructions}</em></span>}
                </div>
              </div>
            ))}
          </div>

          {/* Advice / Instructions */}
          {prescription.advice && prescription.advice.length > 0 && (
            <div className="pt-3">
              <span className="font-bold text-slate-900 block mb-1">General Advice:</span>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 text-xs">
                {prescription.advice.map((adv, i) => (
                  <li key={i}>{adv}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Follow-up Date */}
          {prescription.followUpDate && (
            <div className="pt-2 text-xs font-bold text-slate-800">
              Next Follow-up: <span className="text-[#00984a] font-black">{prescription.followUpDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4. FOOTER SIGNATURE */}
      <div className="pt-12 flex justify-between items-end border-t border-slate-200 text-xs text-slate-400">
        <p className="text-[10px]">Prescription generated by Care Point Digital Healthcare Suite.</p>
        <div className="text-center">
          <div className="w-44 border-b border-slate-400 mb-1" />
          <p className="font-bold text-slate-800 text-xs">{prescription.doctor?.name}</p>
          <span className="text-[10px]">Authorized Specialist Signature</span>
        </div>
      </div>
    </div>
  );
};