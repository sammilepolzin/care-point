import React, { useState } from 'react';
import { Send, CheckCircle2, ShieldCheck, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const PatientFeedbackSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    feedbackType: 'Suggestion',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', feedbackType: 'Suggestion', message: '' });
    }, 4000);
  };

  return (
    <section id="feedback-section" className="py-16 bg-[#f8fafc] border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border-2 border-emerald-100 p-8 sm:p-12 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#2fa866] text-white px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <HeartHandshake className="w-4 h-4" /> আপনার মতামত আমাদের প্রেরণা
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                অভিযোগ ও পরামর্শ বক্স (Complain & Advice)
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                কেয়ার পয়েন্ট ডায়াগনস্টিক সেন্টারের কোনো সেবা সম্পর্কে আপনার কোনো অভিযোগ বা পরামর্শ থাকলে নির্দ্বিধায় লিখুন। আমাদের এক্সিকিউটিভ টিম প্রতিটি বার্তা গুরুত্ব সহকারে দ্রুত ব্যবস্থা গ্রহণ করে।
              </p>

              <div className="pt-2 space-y-2 text-xs text-[#1f7345] font-semibold">
                <p className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2fa866]" /> সরাসরি এক্সিকিউটিভ ম্যানেজমেন্ট কর্তৃক মনিটরকৃত
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#2fa866]" /> রোগীর পরিচয় ও গোপনীয়তা শতভাগ সুরক্ষিত
                </p>
              </div>
            </div>

            {/* Right Feedback Form */}
            <div className="lg:col-span-7">
              <div className="bg-[#f0fdf4] p-6 sm:p-8 rounded-2xl border border-emerald-200">
                {submitted ? (
                  <div className="py-10 text-center space-y-3 bg-white rounded-xl p-6">
                    <div className="w-14 h-14 bg-emerald-100 text-[#2fa866] rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900">ধন্যবাদ! আপনার বার্তা সফলভাবে গৃহীত হয়েছে।</h4>
                    <p className="text-xs text-slate-500">আমাদের কোয়ালিটি ম্যানেজার শীঘ্রই প্রয়োজনীয় ব্যবস্থা গ্রহণ করবেন।</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">আপনার নাম *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="পূর্ণ নাম লিখুন"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2fa866]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 block mb-1">মোবাইল নাম্বার *</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="017XXXXXXXX"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2fa866]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">বার্তার বিষয়</label>
                      <select
                        value={formData.feedbackType}
                        onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2fa866]"
                      >
                        <option value="Suggestion">পরামর্শ (Suggestion)</option>
                        <option value="Complaint">অভিযোগ (Complaint)</option>
                        <option value="Appreciation">প্রশংসা (Appreciation)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">আপনার অভিযোগ বা পরামর্শ লিখুন *</label>
                      <textarea
                        required
                        rows={3}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="অভিযোগ বা পরামর্শের বিস্তারিত বিবরণ লিখুন..."
                        className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#2fa866]"
                      />
                    </div>

                    <Button type="submit" className="w-full bg-[#2fa866] hover:bg-[#268f56] text-white font-black text-xs py-3 rounded-xl shadow transition flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" /> মতামত পাঠান (Submit Feedback)
                    </Button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};