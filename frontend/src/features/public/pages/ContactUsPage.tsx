import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare 
} from 'lucide-react';
import api from '@/lib/axios';

export const ContactUsPage: React.FC = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [messageType, setMessageType] = useState<'GENERAL_INQUIRY' | 'COMPLAINT' | 'ADVICE'>('GENERAL_INQUIRY');
  const [message, setMessage] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Dynamic Settings for Contact, Map & Numbers
  const { data: settings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => api.post('/messages', payload),
    onSuccess: () => {
      setIsSuccess(true);
      setErrorMsg(null);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to submit message.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    mutation.mutate({
      name,
      phone,
      email: email.trim() || undefined,
      subject,
      messageType,
      message,
    });
  };

  const address = settings?.address || 'House 42, Road 11, Dhanmondi, Dhaka - 1209, Bangladesh.';
  const hotline = settings?.topbarHotlineText || settings?.hotline || '09666 787801';
  const supportPhone = settings?.supportPhone || '+880 1700-000000';
  const officialEmail = settings?.email || 'info@carepoint.com';
  const googleMapUrl = settings?.googleMapUrl || 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3651.9024424301396!2d90.3775498!3d23.7508581!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755b8b33cff13fb%3A0x4a65494d9326e646!2sDhanmondi%2C%20Dhaka!5e0!3m2!1sen!2sbd!4v1700000000000!5m2!1sen!2sbd';

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 sm:py-12 pb-24 space-y-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Banner */}
        <div className="bg-brand-gradient rounded-3xl p-6 sm:p-10 text-white shadow-lg text-center relative overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3.5 py-1 rounded-full inline-flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-amber-300" /> Patient Support & Helpline
          </span>
          <h1 className="text-2xl sm:text-4xl font-black mt-2">Contact Care Point Diagnostic</h1>
          <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl mx-auto">
            Get in touch for appointments, test inquiries, or share your valuable feedback and complaints.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT 1 COL: DYNAMIC CONTACT INFO CARDS */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">Centre Address</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">{address}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">Dedicated Hotlines</h4>
              <p className="text-xs text-slate-600">Hotline: <strong className="text-slate-900">{hotline}</strong></p>
              <p className="text-xs text-slate-600">Support: <strong className="text-slate-900">{supportPhone}</strong></p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <h4 className="font-black text-slate-900 text-sm">Official Email</h4>
              <p className="text-xs text-slate-600 font-medium">{officialEmail}</p>
            </div>
          </div>

          {/* RIGHT 2 COLS: CONTACT & COMPLAINT FORM */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900">Send an Inquiry or File a Complaint</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Our patient service desk reviews every submission and responds via phone/WhatsApp.
              </p>
            </div>

            {isSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Your message has been submitted successfully. A care officer will contact you.</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Md. Hasan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
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
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Category / Type of Inquiry *</label>
                  <select
                    value={messageType}
                    onChange={(e: any) => setMessageType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  >
                    <option value="GENERAL_INQUIRY">General Inquiry (সাধারণ জিজ্ঞাসা)</option>
                    <option value="COMPLAINT">Complaint (অভিযোগ)</option>
                    <option value="ADVICE">Advice / Suggestion (পরামর্শ)</option>
                    <option value="APPOINTMENT_HELP">Appointment Help (সিরিয়াল সহায়তা)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Subject (বিষয়) *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Summary of your question or complaint"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a]"
                />
              </div>

              <div>
                <label className="block mb-1">Detailed Message (বিস্তারিত বর্ণনা) *</label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your feedback, questions or complaints here..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-[#00984a] font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-60 bg-brand-gradient hover:opacity-95 text-white font-black py-3 rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>{mutation.isPending ? 'Sending...' : 'Submit Message'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* DYNAMIC GOOGLE MAP EMBED FROM ADMIN SETTINGS */}
        {googleMapUrl && (
          <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-sm space-y-3">
            <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#00984a]" /> Centre Location Map (Google Maps)
            </h4>
            <div className="w-full h-80 rounded-2xl overflow-hidden border border-slate-200 shadow-inner">
              <iframe
                src={googleMapUrl}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                title="Care Point Location Map"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}