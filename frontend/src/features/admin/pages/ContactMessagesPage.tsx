import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MessageSquare, 
  Trash2, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ExternalLink 
} from 'lucide-react';
import api from '@/lib/axios';

interface MessageItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  subject: string;
  messageType: string;
  message: string;
  status: 'UNREAD' | 'IN_REVIEW' | 'RESOLVED';
  createdAt: string;
}

export const ContactMessagesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const { data: messages, isLoading } = useQuery<MessageItem[]>({
    queryKey: ['admin-messages', statusFilter, typeFilter],
    queryFn: async () => {
      let url = '/messages?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `type=${typeFilter}&`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/messages/${id}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/messages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-messages'] }),
  });

  const sendWhatsApp = (msg: MessageItem) => {
    let cleanPhone = msg.phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '88' + cleanPhone;
    const text = `Hello ${msg.name}, Regarding your inquiry on Care Point Diagnostic ("${msg.subject}"): `;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Patient Messages, Inquiries & Complaints</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming feedback, complaints, and reply directly via WhatsApp or phone call.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-3 text-xs">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border rounded-xl px-4 py-2 font-bold text-slate-700"
        >
          <option value="">All Inquiry Types</option>
          <option value="GENERAL_INQUIRY">General Inquiry</option>
          <option value="COMPLAINT">Complaint</option>
          <option value="ADVICE">Advice</option>
          <option value="APPOINTMENT_HELP">Appointment Help</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-50 border rounded-xl px-4 py-2 font-bold text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="UNREAD">Unread</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs">Loading patient messages...</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {messages && messages.length > 0 ? (
              messages.map((m) => (
                <div key={m._id} className="p-5 hover:bg-slate-50 transition space-y-2">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{m.name}</span>
                      <span className="text-slate-400 text-xs">• {m.phone}</span>
                      <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">
                        {m.messageType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400">{new Date(m.createdAt).toLocaleString()}</span>
                      <select
                        value={m.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: m._id, status: e.target.value })}
                        className="bg-white border rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800"
                      >
                        <option value="UNREAD">Unread</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="RESOLVED">Resolved</option>
                      </select>
                    </div>
                  </div>

                  <h4 className="font-bold text-slate-800 text-xs">{m.subject}</h4>
                  <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">{m.message}</p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => sendWhatsApp(m)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Reply
                    </button>
                    <a
                      href={`tel:${m.phone}`}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-1.5 rounded-xl text-[11px] transition flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Patient
                    </a>
                    <button
                      onClick={() => {
                        if (window.confirm('Delete message?')) deleteMutation.mutate(m._id);
                      }}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-16 text-center text-slate-400 text-xs">No patient messages found.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};