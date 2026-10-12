import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  TestTube2, 
  Search, 
  Home, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  Phone, 
  User, 
  Printer, 
  MessageSquare, 
  Smartphone, 
  X, 
  ShieldCheck
} from 'lucide-react';
import api from '@/lib/axios';

interface TestItem {
  name: string;
  code: string;
  regularPrice: number;
  discountPrice: number;
}

interface TestBooking {
  _id: string;
  bookingId: string;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  collectionType: 'CENTER_VISIT' | 'HOME_COLLECTION';
  collectionAddress?: string;
  collectionLandmark?: string;
  scheduledDate: string;
  scheduledTimeSlot: string;
  tests: TestItem[];
  totalRegularAmount: number;
  totalDiscountAmount: number;
  homeCollectionFee: number;
  netPayableAmount: number;
  paymentMethod: string;
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED';
  status: 'PENDING' | 'CONFIRMED' | 'SAMPLE_COLLECTED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  assignedCollector?: string;
  notes?: string;
  createdAt: string;
}

export const TestBookingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const todayISO = new Date().toISOString().split('T')[0];

  const [dateTab, setDateTab] = useState<'TODAY' | 'ALL' | 'CUSTOM'>('TODAY');
  const [selectedDate, setSelectedDate] = useState<string>(todayISO);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const [inspectOrder, setInspectOrder] = useState<TestBooking | null>(null);
  const [assignModalOrder, setAssignModalOrder] = useState<TestBooking | null>(null);
  const [collectorNameInput, setCollectorNameInput] = useState('Md. Sumon (Senior Phlebotomist)');
  const [collectorStatusInput, setCollectorStatusInput] = useState('CONFIRMED');

  const { data: bookings, isLoading } = useQuery<TestBooking[]>({
    queryKey: ['admin-test-bookings', dateTab, selectedDate, searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      let url = '/test-bookings?';
      if (dateTab === 'TODAY') {
        url += `date=${todayISO}&`;
      } else if (dateTab === 'CUSTOM' && selectedDate) {
        url += `date=${selectedDate}&`;
      }
      if (searchTerm) url += `phone=${searchTerm}&`;
      if (statusFilter) url += `status=${statusFilter}&`;
      if (typeFilter) url += `collectionType=${typeFilter}&`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return api.patch(`/test-bookings/${id}/status`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-test-bookings'] });
      setAssignModalOrder(null);
    },
  });

  const sendWhatsApp = (b: TestBooking) => {
    let cleanPhone = b.patientPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) cleanPhone = '88' + cleanPhone;
    else if (!cleanPhone.startsWith('88')) cleanPhone = '880' + cleanPhone;

    const testsList = b.tests?.map((t) => t.name).join(', ');
    const message = `Care Point Diagnostic & Lab:\n` +
      `Dear ${b.patientName}, your test order ${b.bookingId} is ${b.status}.\n\n` +
      `🧪 Tests: ${testsList}\n` +
      `📅 Schedule: ${b.scheduledDate} (${b.scheduledTimeSlot})\n` +
      `📍 Collection: ${b.collectionType === 'HOME_COLLECTION' ? 'Doorstep Home Sample' : 'Center Visit'}\n` +
      `💰 Total Payable: ৳${b.netPayableAmount}\n` +
      (b.assignedCollector && b.assignedCollector !== 'Not Assigned' ? `🚴 Assigned Phlebotomist: ${b.assignedCollector}\n` : '') +
      `Hotline: 09666 787801`;

    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const sendSimSMS = (b: TestBooking) => {
    const text = `Care Point: Test Order ${b.bookingId} for ${b.patientName} is ${b.status}. Schedule: ${b.scheduledDate} (${b.scheduledTimeSlot}). Total: ৳${b.netPayableAmount}. Hotline: 09666787801`;
    window.location.href = `sms:${b.patientPhone}?body=${encodeURIComponent(text)}`;
  };

  const openAssignModal = (b: TestBooking) => {
    setAssignModalOrder(b);
    setCollectorNameInput(b.assignedCollector && b.assignedCollector !== 'Not Assigned' ? b.assignedCollector : 'Md. Sumon (Senior Phlebotomist)');
    setCollectorStatusInput(b.status === 'PENDING' ? 'CONFIRMED' : b.status);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalOrder) return;
    updateMutation.mutate({
      id: assignModalOrder._id,
      data: {
        assignedCollector: collectorNameInput,
        status: collectorStatusInput,
      },
    });
  };

  const totalOrdersCount = bookings?.length || 0;
  const pendingHomeCollections = bookings?.filter((b) => b.collectionType === 'HOME_COLLECTION' && (b.status === 'PENDING' || b.status === 'CONFIRMED')).length || 0;
  const specimensInLab = bookings?.filter((b) => b.status === 'SAMPLE_COLLECTED' || b.status === 'PROCESSING').length || 0;
  const completedOrders = bookings?.filter((b) => b.status === 'COMPLETED').length || 0;

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Diagnostic Test Orders & Home Collections</h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise pathology queue. Track doorstep collections, assign phlebotomists, and print official test money receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs">
          <button
            onClick={() => setDateTab('TODAY')}
            className={`px-4 py-1.5 rounded-xl font-bold transition ${
              dateTab === 'TODAY' ? 'bg-[#00984a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Orders ({todayISO})
          </button>
          <button
            onClick={() => setDateTab('ALL')}
            className={`px-4 py-1.5 rounded-xl font-bold transition ${
              dateTab === 'ALL' ? 'bg-[#00984a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Dates
          </button>
          <button
            onClick={() => setDateTab('CUSTOM')}
            className={`px-4 py-1.5 rounded-xl font-bold transition ${
              dateTab === 'CUSTOM' ? 'bg-[#00984a] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pick Date
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Total Test Orders</span>
          <p className="text-2xl font-black text-slate-900">{totalOrdersCount}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Home Collections</span>
          <p className="text-2xl font-black text-amber-800">{pendingHomeCollections}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">In-Lab Processing</span>
          <p className="text-2xl font-black text-blue-700">{specimensInLab}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 block mb-1">Reports Published</span>
          <p className="text-2xl font-black text-slate-900">{completedOrders}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        {dateTab === 'CUSTOM' ? (
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Select Custom Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
            />
          </div>
        ) : (
          <div className="relative">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Patient Phone</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by 01XXXXXXXXX..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Collection Mode</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          >
            <option value="">All Collection Types</option>
            <option value="CENTER_VISIT">Center Visit</option>
            <option value="HOME_COLLECTION">Home Collection</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#00984a]"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SAMPLE_COLLECTED">Sample Collected</option>
            <option value="PROCESSING">Processing / In Lab</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-slate-400 text-xs">Loading diagnostic orders queue...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Order Ref ID</th>
                  <th className="p-3.5">Patient Details</th>
                  <th className="p-3.5">Collection Mode</th>
                  <th className="p-3.5">Tests Included</th>
                  <th className="p-3.5">Schedule</th>
                  <th className="p-3.5">Bill Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Alerts</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {bookings && bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5">
                        <button
                          onClick={() => setInspectOrder(b)}
                          className="font-mono font-bold text-slate-900 bg-slate-100 hover:bg-emerald-50 hover:text-[#00984a] px-2 py-1 rounded-lg border transition text-left"
                          title="Click to view voucher"
                        >
                          {b.bookingId}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{b.patientName}</p>
                        <p className="text-[11px] text-slate-500">{b.patientPhone} • {b.patientAge}y, {b.patientGender}</p>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            b.collectionType === 'HOME_COLLECTION'
                              ? 'bg-amber-50 text-amber-800 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {b.collectionType === 'HOME_COLLECTION' ? <Home className="w-3 h-3 text-amber-700" /> : <Building2 className="w-3 h-3 text-[#00984a]" />}
                          {b.collectionType === 'HOME_COLLECTION' ? 'Home Sample' : 'Center Visit'}
                        </span>
                        {b.assignedCollector && b.assignedCollector !== 'Not Assigned' && (
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded mt-1 block w-fit">
                            Collector: {b.assignedCollector}
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-slate-900">{b.tests?.length} Tests:</span>
                        <p className="text-[10px] text-slate-500 truncate max-w-[170px]">
                          {b.tests?.map((t) => t.name).join(', ')}
                        </p>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{b.scheduledDate}</p>
                        <p className="text-[10px] text-slate-500">{b.scheduledTimeSlot}</p>
                      </td>

                      <td className="p-3.5">
                        <p className="font-black text-slate-900 text-sm">৳{b.netPayableAmount}</p>
                        <span className="text-[9px] text-slate-400 font-bold">{b.paymentStatus === 'PAID' ? '✓ Paid' : 'Pending'}</span>
                      </td>

                      <td className="p-3.5">
                        <span className="inline-block px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800">
                          {b.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button onClick={() => sendSimSMS(b)} className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition">
                            <Smartphone className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => sendWhatsApp(b)} className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white transition">
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {b.collectionType === 'HOME_COLLECTION' && (
                            <button
                              onClick={() => openAssignModal(b)}
                              className="bg-amber-100 hover:bg-amber-200 text-amber-900 px-2 py-1 rounded-lg text-[10px] font-bold"
                            >
                              Assign
                            </button>
                          )}
                          <select
                            value={b.status}
                            onChange={(e) => updateMutation.mutate({ id: b._id, data: { status: e.target.value } })}
                            className="bg-slate-50 border rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800"
                          >
                            <option value="PENDING">Pending</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="SAMPLE_COLLECTED">Sample Collected</option>
                            <option value="PROCESSING">Processing</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="CANCELLED">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={9} className="p-12 text-center text-slate-400 text-xs">No diagnostic test orders recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ASSIGN COLLECTOR MODAL */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-xs font-bold text-slate-700">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-[#00984a]" /> Assign Field Phlebotomist
              </h3>
              <button onClick={() => setAssignModalOrder(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-2xl border space-y-1">
                <p>Order: <strong className="text-slate-900">{assignModalOrder.bookingId}</strong></p>
                <p>Patient: <strong className="text-slate-900">{assignModalOrder.patientName}</strong></p>
                <p>Address: <span className="text-slate-600 font-medium">{assignModalOrder.collectionAddress || 'N/A'}</span></p>
              </div>

              <div>
                <label className="block mb-1">Collector Name *</label>
                <input
                  type="text"
                  required
                  value={collectorNameInput}
                  onChange={(e) => setCollectorNameInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Status</label>
                <select
                  value={collectorStatusInput}
                  onChange={(e) => setCollectorStatusInput(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                >
                  <option value="CONFIRMED">Confirmed / On The Way</option>
                  <option value="SAMPLE_COLLECTED">Sample Collected</option>
                  <option value="PROCESSING">Processing / In Lab</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setAssignModalOrder(null)} className="w-1/2 bg-slate-100 py-2.5 rounded-xl font-bold">
                  Cancel
                </button>
                <button type="submit" disabled={updateMutation.isPending} className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-black shadow">
                  {updateMutation.isPending ? 'Updating...' : 'Assign & Notify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🖨️ ADMIN ORDER MONEY RECEIPT MODAL (PERFECT PRINT TEMPLATE) */}
      {inspectOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl p-6 sm:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-4 border-b border-slate-200 no-print">
                <div className="flex items-center gap-2">
                  <TestTube2 className="w-5 h-5 text-[#00984a]" />
                  <h3 className="font-black text-slate-900 text-base">Diagnostic Order Receipt</h3>
                </div>
                <button onClick={() => setInspectOrder(null)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Official Receipt Body */}
              <div className="print-container my-4 p-6 bg-slate-50 rounded-3xl border border-slate-200 space-y-4 text-xs text-slate-700">
                <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Care Point Diagnostic Centre</h2>
                    <p className="text-[10px] text-slate-500">Official Laboratory Money Receipt</p>
                  </div>
                  <div className="text-right">
                    <strong className="text-sm font-black text-slate-900 font-mono bg-white px-2.5 py-1 rounded-lg border">
                      {inspectOrder.bookingId}
                    </strong>
                    <p className="text-[10px] text-slate-400 mt-1">{inspectOrder.scheduledDate}</p>
                  </div>
                </div>

                <div className="space-y-1 py-1">
                  <p>Patient: <strong className="text-slate-900">{inspectOrder.patientName}</strong> ({inspectOrder.patientAge}y, {inspectOrder.patientGender})</p>
                  <p>Contact Phone: <strong className="text-slate-900">{inspectOrder.patientPhone}</strong></p>
                  <p>Collection Mode: <strong className="text-[#00984a]">{inspectOrder.collectionType === 'HOME_COLLECTION' ? 'Doorstep Home Sample' : 'Center Visit'}</strong></p>
                  {inspectOrder.collectionAddress && (
                    <p>Address: <span className="text-slate-700 font-medium">{inspectOrder.collectionAddress}</span></p>
                  )}
                </div>

                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-white border-b border-slate-200 font-bold">
                    <tr><th className="py-2">Test Name</th><th className="py-2 text-right">Fee (BDT)</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {inspectOrder.tests?.map((t, idx) => (
                      <tr key={idx}><td className="py-2">• {t.name}</td><td className="py-2 text-right font-black">৳{t.discountPrice}</td></tr>
                    ))}
                  </tbody>
                </table>

                <div className="pt-2 border-t border-slate-300 space-y-1">
                  <div className="flex justify-between text-slate-500"><span>Subtotal:</span><span>৳{inspectOrder.totalRegularAmount}</span></div>
                  {inspectOrder.totalDiscountAmount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold"><span>Discount Savings:</span><span>-৳{inspectOrder.totalDiscountAmount}</span></div>
                  )}
                  {inspectOrder.homeCollectionFee > 0 && (
                    <div className="flex justify-between text-slate-700 font-bold"><span>Home Collection Fee:</span><span>+৳{inspectOrder.homeCollectionFee}</span></div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-300">
                    <span>Net Amount:</span><span>৳{inspectOrder.netPayableAmount}</span>
                  </div>
                </div>

                <div className="pt-8 flex justify-between items-end border-t border-slate-200 text-[9px] text-slate-400">
                  <p>Care Point Automated Diagnostic Slip</p>
                  <div className="text-center">
                    <div className="w-28 border-b border-slate-400 mb-1" />
                    <span>Cashier Seal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS (NO-PRINT) */}
            <div className="pt-4 border-t border-slate-200 flex gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" /> Print Money Receipt
              </button>
              <button
                onClick={() => sendWhatsApp(inspectOrder)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-1.5 shadow"
              >
                <MessageSquare className="w-4 h-4" /> WhatsApp Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};