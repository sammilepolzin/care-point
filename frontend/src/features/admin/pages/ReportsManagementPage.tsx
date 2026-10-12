import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  FileText, 
  Upload, 
  Search, 
  Trash2, 
  Eye, 
  Clock, 
  X, 
  Send, 
  Download, 
  Phone, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Users,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import api from '@/lib/axios';

interface MedicalReport {
  _id: string;
  reportId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number;
  patientGender?: string;
  testName: string;
  testCode: string;
  departmentName?: string;
  reportFileUrl: string;
  fileName: string;
  publishedAt: string;
  status: string;
  verifiedBy: string;
  notes?: string;
}

interface TestCategory {
  _id: string;
  name: string;
}

export const ReportsManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('');

  // Accordion State: DEFAULT IS FALSE (CLOSED BY DEFAULT)
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingReport, setViewingReport] = useState<MedicalReport | null>(null);

  // Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientAge, setPatientAge] = useState<number>(30);
  const [patientGender, setPatientGender] = useState('MALE');
  const [testName, setTestName] = useState('Complete Blood Count (CBC)');
  const [testCode, setTestCode] = useState('CBC-01');
  const [departmentName, setDepartmentName] = useState('Hematology');
  const [verifiedBy, setVerifiedBy] = useState('Dr. K. Rahman (Chief Pathologist)');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: categories } = useQuery<TestCategory[]>({
    queryKey: ['admin-test-categories'],
    queryFn: async () => {
      const res = await api.get('/test-categories');
      return res.data.data;
    },
  });

  const { data: reports, isLoading } = useQuery<MedicalReport[]>({
    queryKey: ['admin-reports', searchTerm, selectedDeptFilter],
    queryFn: async () => {
      let url = `/reports?search=${searchTerm}`;
      if (selectedDeptFilter) url += `&department=${selectedDeptFilter}`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('/reports/publish', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      closeModal();
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to publish medical report.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/reports/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reports'] }),
  });

  const filteredAndGroupedPatients = React.useMemo(() => {
    if (!reports) return [];
    
    let list = reports;
    if (selectedDateFilter) {
      list = list.filter((r) => r.publishedAt && r.publishedAt.startsWith(selectedDateFilter));
    }

    const map = new Map<string, { patientName: string; patientPhone: string; reports: MedicalReport[] }>();

    list.forEach((rpt) => {
      const phoneKey = rpt.patientPhone;
      if (!map.has(phoneKey)) {
        map.set(phoneKey, {
          patientName: rpt.patientName,
          patientPhone: rpt.patientPhone,
          reports: [],
        });
      }
      map.get(phoneKey)!.reports.push(rpt);
    });

    return Array.from(map.values());
  }, [reports, selectedDateFilter]);

  // Toggle Accordion (Expands on Click)
  const toggleAccordion = (phoneKey: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [phoneKey]: !prev[phoneKey],
    }));
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setError(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an official PDF medical report file.');
      return;
    }

    const formData = new FormData();
    formData.append('reportPdf', selectedFile);
    formData.append('patientName', patientName);
    formData.append('patientPhone', patientPhone);
    formData.append('patientAge', String(patientAge));
    formData.append('patientGender', patientGender);
    formData.append('testName', testName);
    formData.append('testCode', testCode);
    formData.append('departmentName', departmentName);
    formData.append('verifiedBy', verifiedBy);

    publishMutation.mutate(formData);
  };

  const getStreamUrl = (reportId: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
    return `${baseUrl}/reports/view/${reportId}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Medical Reports Publishing & Archive</h1>
          <p className="text-xs text-slate-500 mt-1">
            Collapsible patient dossiers (closed by default). Filter archives by publication date, department, or phone.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setIsModalOpen(true);
          }}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-4 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Upload className="w-4 h-4" /> Upload & Publish Report
        </button>
      </div>

      {/* ADVANCED FILTER BAR WITH DATE SEARCH */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Patient or Phone</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Name, Phone (017...), or Report ID..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter by Published Date</label>
          <div className="relative">
            <input
              type="date"
              value={selectedDateFilter}
              onChange={(e) => setSelectedDateFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
            />
            {selectedDateFilter && (
              <button
                onClick={() => setSelectedDateFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-red-500 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Filter by Department</label>
          <select
            value={selectedDeptFilter}
            onChange={(e) => setSelectedDeptFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          >
            <option value="">All Departments (সকল বিভাগ)</option>
            {categories?.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* COLLAPSIBLE ACCORDION PATIENT DOSSIERS (CLOSED BY DEFAULT) */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs bg-white rounded-3xl border border-slate-200">
            Loading medical archives...
          </div>
        ) : filteredAndGroupedPatients.length > 0 ? (
          filteredAndGroupedPatients.map((group) => {
            // Default Closed: isExpanded is true ONLY if user explicitly clicked
            const isExpanded = !!expandedFolders[group.patientPhone];

            return (
              <div
                key={group.patientPhone}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition"
              >
                {/* Accordion Header Bar */}
                <div
                  onClick={() => toggleAccordion(group.patientPhone)}
                  className="p-4 px-6 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between transition border-b border-slate-100 select-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#00984a] flex items-center justify-center font-bold">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{group.patientName}</h3>
                        <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                          {group.reports.length} Tests Ready
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-[#00984a]" /> {group.patientPhone}
                      </p>
                    </div>
                  </div>

                  <button className="p-1.5 text-slate-400 hover:text-slate-700">
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-[#00984a]" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {/* Collapsed Table (Shown only when clicked) */}
                {isExpanded && (
                  <div className="p-4 overflow-x-auto animate-in fade-in duration-150">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-3">Report ID</th>
                          <th className="p-3">Test Procedure</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Verified Pathologist</th>
                          <th className="p-3">Published Date</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {group.reports.map((rpt) => (
                          <tr key={rpt._id} className="hover:bg-slate-50/80 transition">
                            <td className="p-3 font-mono font-bold text-slate-900">{rpt.reportId}</td>
                            <td className="p-3 font-bold text-slate-900">{rpt.testName}</td>
                            <td className="p-3">
                              <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                                {rpt.departmentName || 'Pathology'}
                              </span>
                            </td>
                            <td className="p-3 text-slate-600">{rpt.verifiedBy}</td>
                            <td className="p-3">{new Date(rpt.publishedAt).toLocaleDateString()}</td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setViewingReport(rpt)}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                  title="View Report PDF"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <a
                                  href={getStreamUrl(rpt._id)}
                                  download={rpt.fileName}
                                  className="p-1.5 text-[#00984a] hover:bg-emerald-50 rounded-lg transition"
                                  title="Download PDF"
                                >
                                  <Download className="w-4 h-4" />
                                </a>
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Delete report ${rpt.reportId}?`)) {
                                      deleteMutation.mutate(rpt._id);
                                    }
                                  }}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                  title="Delete Report"
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
            );
          })
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center text-slate-400 text-xs">
            No medical reports found matching your date or search filter.
          </div>
        )}
      </div>

      {/* PDF INSPECTOR MODAL WITH DEDICATED BACK BUTTON */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 pt-20">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[82vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-slate-200">
            {/* Modal Header */}
            <div className="p-3.5 px-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
              {/* BACK BUTTON */}
              <button
                onClick={() => setViewingReport(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4 text-[#00984a]" />
                <span>Back</span>
              </button>

              <div className="text-center hidden sm:block">
                <h3 className="font-bold text-sm">Medical Report Inspector: {viewingReport.reportId}</h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={getStreamUrl(viewingReport._id)}
                  download={viewingReport.fileName}
                  className="bg-[#00984a] hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
                <button onClick={() => setViewingReport(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg transition ml-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Split Screen Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-80 p-6 bg-slate-50 border-r border-slate-200 overflow-y-auto space-y-4 text-xs shrink-0">
                <div>
                  <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Patient Profile
                  </span>
                  <h4 className="font-black text-slate-900 text-base mt-2">{viewingReport.patientName}</h4>
                  <p className="text-slate-600 flex items-center gap-1 mt-1 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-[#00984a]" /> {viewingReport.patientPhone}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <p className="text-slate-500">Test Procedure:</p>
                  <p className="font-bold text-slate-900">{viewingReport.testName}</p>
                  <p className="text-slate-500">Code: <strong className="text-slate-800">{viewingReport.testCode}</strong></p>
                  <p className="text-slate-500">Department: <strong className="text-slate-800">{viewingReport.departmentName || 'Pathology'}</strong></p>
                </div>

                <div className="pt-3 border-t border-slate-200 space-y-2">
                  <p className="text-slate-500">Clinical Verification:</p>
                  <p className="font-bold text-slate-900">{viewingReport.verifiedBy}</p>
                  <p className="text-slate-500">Published: <strong className="text-slate-800">{new Date(viewingReport.publishedAt).toLocaleString()}</strong></p>
                </div>
              </div>

              {/* Streamed Document Viewer */}
              <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
                <iframe
                  src={getStreamUrl(viewingReport._id)}
                  className="w-full h-full border-0"
                  title="PDF Inspector Preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD REPORT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#00984a]" /> Upload Official Medical PDF Report
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
              <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-300 text-center space-y-2">
                <FileText className="w-8 h-8 text-[#00984a] mx-auto" />
                <p className="font-bold text-slate-800 text-xs">
                  {selectedFile ? selectedFile.name : 'Select Official PDF Report File'}
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,application/pdf"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-4 py-1.5 rounded-xl font-bold transition inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#00984a]" /> Choose PDF from PC
                </button>
                <p className="text-[10px] text-slate-400">PDF format only (Max 25MB)</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Mohammad Ali"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Patient Mobile Number *</label>
                  <input
                    type="text"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Test Name *</label>
                  <input
                    type="text"
                    required
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    placeholder="e.g. Lipid Profile Panel"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Test Code *</label>
                  <input
                    type="text"
                    required
                    value={testCode}
                    onChange={(e) => setTestCode(e.target.value)}
                    placeholder="e.g. LIPID-02"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Department</label>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    placeholder="Biochemistry"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>

                <div>
                  <label className="block mb-1">Verified Clinical Pathologist</label>
                  <input
                    type="text"
                    value={verifiedBy}
                    onChange={(e) => setVerifiedBy(e.target.value)}
                    placeholder="Dr. K. Rahman (MBBS, FCPS)"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
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
                  disabled={publishMutation.isPending}
                  className="w-1/2 bg-brand-gradient hover:opacity-95 text-white font-black py-2.5 rounded-xl transition shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{publishMutation.isPending ? 'Publishing...' : 'Publish & Send SMS'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};