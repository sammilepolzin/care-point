import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Phone, 
  KeyRound, 
  Send, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  ShieldCheck, 
  Clock, 
  RotateCcw, 
  Loader2, 
  X,
  Timer,
  ArrowLeft
} from 'lucide-react';
import api from '@/lib/axios';

interface MedicalReport {
  _id: string;
  reportId: string;
  patientName: string;
  patientPhone: string;
  testName: string;
  testCode: string;
  departmentName?: string;
  reportFileUrl: string;
  fileName: string;
  publishedAt: string;
  verifiedBy: string;
}

export const ReportSearchPage: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [previewReport, setPreviewReport] = useState<MedicalReport | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerSeconds]);

  const sendOtpMutation = useMutation({
    mutationFn: async (phoneNumber: string) => {
      return api.post('/auth/patient/send-otp', { phone: phoneNumber });
    },
    onSuccess: (res) => {
      setOtpSent(true);
      setTimerSeconds(60);
      setErrorMessage(null);
      if (res.data.data?.debugOtp) {
        setDebugOtp(res.data.data.debugOtp);
      }
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to send verification code. Please check your mobile number.');
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async ({ phoneNumber, code }: { phoneNumber: string; code: string }) => {
      return api.post('/auth/patient/verify-otp', { phone: phoneNumber, otp: code });
    },
    onSuccess: () => {
      setIsVerified(true);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Invalid or expired OTP code. Please try again.');
    },
  });

  const { data: reports, isLoading: isLoadingReports } = useQuery<MedicalReport[]>({
    queryKey: ['patient-authorized-reports', phone],
    queryFn: async () => {
      const res = await api.get(`/reports/patient-reports?phone=${phone}`);
      return res.data.data;
    },
    enabled: isVerified && !!phone,
  });

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || phone.length < 11) {
      setErrorMessage('Please enter a valid 11-digit mobile number (e.g. 017XXXXXXXX)');
      return;
    }
    sendOtpMutation.mutate(phone);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length < 4) {
      setErrorMessage('Please enter the 4-digit code sent to your mobile.');
      return;
    }
    verifyOtpMutation.mutate({ phoneNumber: phone, code: otpCode });
  };

  const getStreamUrl = (reportId: string) => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'https://care-point-y06f.onrender.com/api/v1';
    return `${baseUrl}/reports/view/${reportId}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-8 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-300" /> OTP Verified Health Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-2">Download Verified Medical Reports</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Access and download all your pathology, radiology & imaging diagnostic reports securely.
          </p>
        </div>

        {/* STEP 1 & 2: OTP VERIFICATION */}
        {!isVerified ? (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center mx-auto mb-2 font-bold">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-black text-slate-900 text-base">Patient Report Verification</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {!otpSent ? 'Enter your registered mobile number to receive a secure code.' : `Enter the 4-digit code sent to ${phone}`}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Mobile Number (মোবাইল নম্বর) *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-semibold text-slate-900 focus:outline-none focus:border-[#00984a]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendOtpMutation.isPending}
                  className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{sendOtpMutation.isPending ? 'Sending Code...' : 'Send Verification OTP Code'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs font-bold text-slate-700 animate-in fade-in">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label>Enter 4-Digit Code *</label>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[11px] text-[#00984a] font-bold hover:underline flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Change Number
                    </button>
                  </div>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="e.g. 4821"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 font-black tracking-widest text-center text-slate-900 text-base focus:outline-none focus:border-[#00984a]"
                    />
                  </div>

                  <div className="flex justify-between items-center mt-2 px-1 text-[11px]">
                    {timerSeconds > 0 ? (
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <Timer className="w-3.5 h-3.5 text-[#00984a]" /> Resend code in: <strong className="text-slate-900">00:{timerSeconds < 10 ? `0${timerSeconds}` : timerSeconds}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => sendOtpMutation.mutate(phone)}
                        disabled={sendOtpMutation.isPending}
                        className="text-[#00984a] font-black hover:underline"
                      >
                        Resend OTP Code
                      </button>
                    )}
                  </div>

                  {debugOtp && (
                    <p className="text-[11px] text-emerald-800 font-bold bg-emerald-100/80 p-2 rounded-lg mt-2 text-center">
                      💡 Test OTP Code: <span className="font-black text-slate-900 text-sm">{debugOtp}</span>
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={verifyOtpMutation.isPending}
                  className="w-full bg-brand-gradient hover:opacity-95 text-white font-black py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {verifyOtpMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                  <span>{verifyOtpMutation.isPending ? 'Verifying...' : 'Verify & Access Reports'}</span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* STEP 3: AUTHORIZED ALL REPORTS */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#00984a] flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    ✓ Verified Mobile: {phone}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">Your Published Reports ({reports?.length || 0})</h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsVerified(false);
                  setOtpSent(false);
                  setOtpCode('');
                }}
                className="text-xs font-bold text-slate-500 hover:text-red-600 underline"
              >
                Log Out / Switch Mobile
              </button>
            </div>

            {isLoadingReports ? (
              <div className="text-center py-16 text-slate-400 text-xs">Loading authorized reports...</div>
            ) : reports && reports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reports.map((rpt) => (
                  <div
                    key={rpt._id}
                    className="p-5 bg-slate-50 rounded-2xl border border-slate-200 shadow-2xs hover:border-[#00984a] hover:bg-white transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                          {rpt.reportId}
                        </span>
                        <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Official PDF
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm mt-1">{rpt.testName}</h4>
                      <p className="text-[11px] text-slate-500">Patient: <strong className="text-slate-800">{rpt.patientName}</strong></p>
                      <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#00984a]" /> Published: {new Date(rpt.publishedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex gap-2">
                      <button
                        onClick={() => setPreviewReport(rpt)}
                        className="flex-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#00984a]" /> View
                      </button>

                      <a
                        href={getStreamUrl(rpt._id)}
                        download={rpt.fileName}
                        className="flex-1 bg-brand-gradient hover:opacity-95 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-2xs text-center"
                      >
                        <Download className="w-3.5 h-3.5" /> Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200 text-slate-400 text-xs">
                No published medical reports found for this mobile number.
              </div>
            )}
          </div>
        )}

        {/* PREVIEW MODAL WITH DEDICATED BACK BUTTON */}
        {previewReport && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 pt-20">
            <div className="bg-white rounded-3xl w-full max-w-4xl h-[82vh] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 border border-slate-200">
              <div className="p-3.5 px-6 bg-slate-900 text-white flex justify-between items-center shrink-0">
                {/* BACK BUTTON WITH ARROW */}
                <button
                  onClick={() => setPreviewReport(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border border-slate-700"
                >
                  <ArrowLeft className="w-4 h-4 text-[#00984a]" />
                  <span>Back to Reports</span>
                </button>

                <div className="text-center hidden sm:block">
                  <h3 className="font-bold text-sm truncate max-w-xs">{previewReport.testName}</h3>
                  <p className="text-[10px] text-slate-400">Ref: {previewReport.reportId}</p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={getStreamUrl(previewReport._id)}
                    download={previewReport.fileName}
                    className="bg-[#00984a] hover:bg-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                  <button
                    onClick={() => setPreviewReport(null)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
                    title="Close preview"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* PDF Document Stream */}
              <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
                <iframe
                  src={getStreamUrl(previewReport._id)}
                  className="w-full h-full border-0"
                  title="Medical Report Preview"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};