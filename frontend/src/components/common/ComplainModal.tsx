import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MessageSquare, X, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '@/lib/axios';

export const ComplainModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [messageType, setMessageType] = useState<'COMPLAINT' | 'ADVICE' | 'GENERAL_INQUIRY'>('COMPLAINT');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: any) => api.post('/messages', payload),
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setName('');
      setPhone('');
      setSubject('');
      setMessage('');
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to submit. Please try again.'),
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    mutation.mutate({ name, phone, messageType, subject, message });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 animate-in zoom-in-95 text-xs font-bold text-slate-700">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-[#00984a]" /> Patient Complain & Advise Desk
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
        </div>

        {success && (
          <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! Your feedback has been forwarded to our clinical governance board.</span>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Md. Hasan"
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
            <div>
              <label className="block mb-1">Mobile Phone Number *</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">Feedback Category *</label>
            <select
              value={messageType}
              onChange={(e: any) => setMessageType(e.target.value)}
              className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
            >
              <option value="COMPLAINT">Complaint (অভিযোগ)</option>
              <option value="ADVICE">Advice & Suggestion (পরামর্শ)</option>
              <option value="GENERAL_INQUIRY">General Inquiry (সাধারণ জিজ্ঞাসা)</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Subject (সংক্ষিপ্ত বিষয়) *</label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Report delivery delay, Staff conduct, etc."
              className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
            />
          </div>

          <div>
            <label className="block mb-1">Detailed Message (বিস্তারিত বর্ণনা) *</label>
            <textarea
              rows={4}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your complaints or advice in detail..."
              className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button type="button" onClick={onClose} className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl">Cancel</button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-1/2 bg-brand-gradient text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{mutation.isPending ? 'Submitting...' : 'Submit Message'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};