import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Activity, 
  Calendar, 
  TestTube2, 
  FileText, 
  Users, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Home, 
  Building2, 
  MessageSquare, 
  Sparkles, 
  Plus, 
  TrendingUp, 
  Upload, 
  HeartPulse,
  Settings,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/features/auth/context/AuthContext';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const todayISO = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 1. Fetch Today's Appointments
  const { data: appointments, isLoading: isApptLoading } = useQuery<any[]>({
    queryKey: ['admin-dashboard-appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data.data;
    },
  });

  // 2. Fetch Test Bookings
  const { data: testBookings, isLoading: isTestsLoading } = useQuery<any[]>({
    queryKey: ['admin-dashboard-tests'],
    queryFn: async () => {
      const res = await api.get('/test-bookings');
      return res.data.data;
    },
  });

  // 3. Fetch Doctors
  const { data: doctors } = useQuery<any[]>({
    queryKey: ['admin-dashboard-doctors'],
    queryFn: async () => {
      const res = await api.get('/doctors');
      return res.data.data;
    },
  });

  // 4. Fetch Medical Reports
  const { data: reports } = useQuery<any[]>({
    queryKey: ['admin-dashboard-reports'],
    queryFn: async () => {
      const res = await api.get('/reports');
      return res.data.data;
    },
  });

  // 5. Fetch Patient Inquiries
  const { data: messages } = useQuery<any[]>({
    queryKey: ['admin-dashboard-messages'],
    queryFn: async () => {
      const res = await api.get('/messages?status=UNREAD');
      return res.data.data;
    },
  });

  // Metrics Calculations
  const todayAppts = appointments?.filter((a) => a.appointmentDate === todayISO) || [];
  const pendingHomeCollections = testBookings?.filter((b) => b.collectionType === 'HOME_COLLECTION' && b.status === 'PENDING').length || 0;
  const inLabSpecimens = testBookings?.filter((b) => b.status === 'PROCESSING' || b.status === 'SAMPLE_COLLECTED').length || 0;
  const totalReportsCount = reports?.length || 0;
  const unreadMessagesCount = messages?.length || 0;

  const currentDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const activeDoctorsToday = doctors?.filter((d) => !d.availableDays || d.availableDays.length === 0 || d.availableDays.includes(currentDayName)).length || 0;

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. EXECUTIVE WELCOME & REAL-TIME STATUS BAR */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-emerald-50/80 to-transparent pointer-events-none" />

        <div className="space-y-2 z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#006642] bg-[#f0fdf4] border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00984a]"></span>
              </span>
              <span>Central Hospital Diagnostic Command</span>
            </span>
            <span className="text-xs text-slate-500 font-bold">• {todayFormatted}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-[#00984a]">{user?.name || 'Administrator'}</span>
          </h1>

          <p className="text-xs text-slate-500 font-medium">
            Live clinical telemetry: monitoring specialist chambers, pathology analyzers, and doorstep phlebotomists.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap gap-2.5 z-10 w-full sm:w-auto">
          <Link
            to="/admin/appointments"
            className="flex-1 sm:flex-none bg-brand-gradient hover:opacity-95 text-white font-black text-xs px-4 py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Manage Serials</span>
          </Link>

          <Link
            to="/admin/reports"
            className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4 text-emerald-400" />
            <span>Publish Report</span>
          </Link>
        </div>
      </div>

      {/* 2. 4 EXECUTIVE KPI STAT CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1 */}
        <Link to="/admin/appointments" className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-[#00984a] hover:shadow-md transition group">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500">Today's Serials</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-[#00984a] group-hover:bg-[#00984a] group-hover:text-white transition">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{todayAppts.length}</p>
          <span className="text-[10px] text-[#00984a] font-bold mt-1 block">Active Queue Today →</span>
        </Link>

        {/* Metric 2 */}
        <Link to="/admin/test-bookings" className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-amber-400 hover:shadow-md transition group">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500">Home Collections</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-800">{pendingHomeCollections}</p>
          <span className="text-[10px] text-amber-600 font-bold mt-1 block">Doorstep Pending →</span>
        </Link>

        {/* Metric 3 */}
        <Link to="/admin/reports" className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-blue-400 hover:shadow-md transition group">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500">Reports Published</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{totalReportsCount}</p>
          <span className="text-[10px] text-blue-600 font-bold mt-1 block">Laboratory Archive →</span>
        </Link>

        {/* Metric 4 */}
        <Link to="/admin/doctors" className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs hover:border-purple-400 hover:shadow-md transition group">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-500">Chambers Active</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900">{activeDoctorsToday}</p>
          <span className="text-[10px] text-purple-700 font-bold mt-1 block">Physicians On Duty →</span>
        </Link>
      </div>

      {/* 3. MAIN DASHBOARD CONTENT: 2 COLUMNS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLUMNS: TODAY'S LIVE QUEUE TABLES */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Table A: Today's Appointments Queue */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00984a]" />
                <h3 className="font-black text-slate-900 text-sm">Today's Live Chamber Consultations</h3>
              </div>
              <Link to="/admin/appointments" className="text-xs font-bold text-[#00984a] hover:underline">
                View All Queue
              </Link>
            </div>

            {todayAppts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Serial</th>
                      <th className="p-3">Doctor</th>
                      <th className="p-3">Patient</th>
                      <th className="p-3">Time</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {todayAppts.slice(0, 5).map((a: any) => (
                      <tr key={a._id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900 bg-emerald-50 px-2 py-0.5 rounded w-fit">
                          {a.formattedSerial}
                        </td>
                        <td className="p-3 font-bold text-slate-900">{a.doctor?.name}</td>
                        <td className="p-3">{a.patientName}</td>
                        <td className="p-3 text-slate-500">{a.sessionTime}</td>
                        <td className="p-3 text-right">
                          <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No doctor chamber serials booked for today yet.</div>
            )}
          </div>

          {/* Table B: Recent Diagnostic Orders */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-2">
                <TestTube2 className="w-4 h-4 text-[#00984a]" />
                <h3 className="font-black text-slate-900 text-sm">Recent Diagnostic Pathology Orders</h3>
              </div>
              <Link to="/admin/test-bookings" className="text-xs font-bold text-[#00984a] hover:underline">
                View All Orders
              </Link>
            </div>

            {testBookings && testBookings.length > 0 ? (
              <div className="space-y-2.5">
                {testBookings.slice(0, 4).map((b: any) => (
                  <div key={b._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border text-[10px]">{b.bookingId}</span>
                        <strong className="text-slate-900">{b.patientName}</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{b.tests?.length} Tests • {b.collectionType === 'HOME_COLLECTION' ? '🏠 Home Sample' : '🏥 Center Visit'}</p>
                    </div>
                    <div className="text-right">
                      <strong className="text-slate-900 font-black">৳{b.netPayableAmount}</strong>
                      <span className="block text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded mt-0.5">
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">No recent diagnostic orders found.</div>
            )}
          </div>
        </div>

        {/* RIGHT 1 COLUMN: LIVE ALERTS & QUICK MODULE LAUNCHPAD */}
        <div className="space-y-6">
          
          {/* Quick Module Launchpad */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 border-b pb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#00984a]" /> Fast Administration Launchpad
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link to="/admin/doctors" className="p-3 bg-slate-50 hover:bg-[#f0fdf4] hover:text-[#00984a] rounded-2xl border border-slate-100 font-bold transition flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#00984a]" /> Doctors
              </Link>
              <Link to="/admin/tests" className="p-3 bg-slate-50 hover:bg-[#f0fdf4] hover:text-[#00984a] rounded-2xl border border-slate-100 font-bold transition flex items-center gap-2">
                <TestTube2 className="w-4 h-4 text-[#00984a]" /> Tests Catalog
              </Link>
              <Link to="/admin/packages" className="p-3 bg-slate-50 hover:bg-[#f0fdf4] hover:text-[#00984a] rounded-2xl border border-slate-100 font-bold transition flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#00984a]" /> Packages
              </Link>
              <Link to="/admin/gallery" className="p-3 bg-slate-50 hover:bg-[#f0fdf4] hover:text-[#00984a] rounded-2xl border border-slate-100 font-bold transition flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00984a]" /> Gallery
              </Link>
              <Link to="/admin/prescriptions/create" className="p-3 bg-slate-50 hover:bg-[#f0fdf4] hover:text-[#00984a] rounded-2xl border border-slate-100 font-bold transition flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#00984a]" /> Rx Builder
              </Link>
              <Link to="/admin/settings" className="p-3 bg-slate-50 hover:bg-[#f0fdf4] hover:text-[#00984a] rounded-2xl border border-slate-100 font-bold transition flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00984a]" /> Master Settings
              </Link>
            </div>
          </div>

          {/* Unread Patient Inquiries & Complaints Alert Stream */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-500" /> Patient Complaints & Feedbacks
              </h3>
              {unreadMessagesCount > 0 && (
                <span className="text-[10px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  {unreadMessagesCount} New
                </span>
              )}
            </div>

            {messages && messages.length > 0 ? (
              <div className="space-y-2">
                {messages.slice(0, 3).map((m: any) => (
                  <div key={m._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <strong className="text-slate-900">{m.name}</strong>
                      <span className="text-[9px] text-[#00984a] font-bold uppercase bg-emerald-50 px-1.5 py-0.5 rounded">{m.messageType}</span>
                    </div>
                    <p className="text-slate-600 font-medium truncate">{m.subject}</p>
                    <p className="text-[10px] text-slate-400 line-clamp-2">{m.message}</p>
                  </div>
                ))}
                <Link to="/admin/messages" className="block text-center text-xs font-bold text-[#00984a] hover:underline pt-1">
                  Go to Patient Messages Inbox →
                </Link>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 text-xs">No pending complaints or unread messages.</div>
            )}
          </div>

          {/* System Telemetry Card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-3 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
              System Telemetry Status
            </span>
            <h4 className="font-bold text-sm">Care Point Core Database Engine</h4>
            <div className="space-y-1.5 text-slate-400 text-[11px] pt-1 border-t border-slate-800">
              <p className="flex justify-between"><span>Database:</span> <strong className="text-emerald-400">MongoDB Atlas Connected</strong></p>
              <p className="flex justify-between"><span>API Gateway:</span> <strong className="text-emerald-400">REST v1 Active (Node/Express)</strong></p>
              <p className="flex justify-between"><span>Security:</span> <strong className="text-emerald-400">JWT & Helmet Guard Active</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};