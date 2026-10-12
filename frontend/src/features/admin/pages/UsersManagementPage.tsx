import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ShieldCheck, 
  Plus, 
  Search, 
  Key, 
  UserCheck, 
  UserX, 
  Sliders, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  Lock,
  Phone,
  Mail,
  User,
  CheckSquare,
  Square
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/features/auth/context/AuthContext';

// 🌟 ১৭টি মাস্টার অ্যাডমিন মডিউল
export const SYSTEM_MODULES = [
  { key: 'dashboard', name: 'Dashboard' },
  { key: 'patients', name: 'Registered Patients' },
  { key: 'users', name: 'Users & Permissions' },
  { key: 'doctors', name: 'Doctors Management' },
  { key: 'departments', name: 'Departments' },
  { key: 'schedules', name: 'Doctor Schedules' },
  { key: 'appointments', name: 'Appointments & Serials' },
  { key: 'tests', name: 'Diagnostic Tests' },
  { key: 'testCategories', name: 'Test Categories' },
  { key: 'packages', name: 'Health Packages' },
  { key: 'offers', name: 'Special Offers' },
  { key: 'testBookings', name: 'Test Bookings' },
  { key: 'reports', name: 'Reports Publishing' },
  { key: 'prescriptions', name: 'Digital Prescription (Rx)' },
  { key: 'messages', name: 'Patient Inquiries' },
  { key: 'gallery', name: 'Photo Gallery' },
  { key: 'settings', name: 'System Settings' },
];

export const UsersManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();

  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSelfPasswordModalOpen, setIsSelfPasswordModalOpen] = useState(false);
  const [passwordModalUser, setPasswordModalUser] = useState<any | null>(null);
  const [permissionsModalUser, setPermissionsModalUser] = useState<any | null>(null);

  // Form States (Create)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('RECEPTIONIST');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Passwords States
  const [currentPassword, setCurrentPassword] = useState('');
  const [selfNewPassword, setSelfNewPassword] = useState('');
  const [selfConfirmPassword, setSelfConfirmPassword] = useState('');

  const [adminNewPassword, setAdminNewPassword] = useState('');
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Fetch Staff & Admin Users
  const { data: users, isLoading } = useQuery<any[]>({
    queryKey: ['admin-staff-users', searchTerm, roleFilter],
    queryFn: async () => {
      let url = `/users?search=${encodeURIComponent(searchTerm)}`;
      if (roleFilter !== 'ALL') url += `&role=${roleFilter}`;
      const res = await api.get(url);
      return res.data.data;
    },
  });

  // 2. Create User Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/users', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-users'] });
      setSuccessMsg(res.data.message || 'Staff created successfully!');
      setErrorMsg(null);
      setIsCreateModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setSelectedPermissions([]);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to create user');
    },
  });

  // 3. Self Password Mutation
  const selfPasswordMutation = useMutation({
    mutationFn: async (payload: any) => api.patch('/users/change-my-password', payload),
    onSuccess: (res) => {
      setSuccessMsg(res.data.message || 'Your password has been changed successfully.');
      setErrorMsg(null);
      setIsSelfPasswordModalOpen(false);
      setCurrentPassword('');
      setSelfNewPassword('');
      setSelfConfirmPassword('');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to change your password'),
  });

  // 4. Admin Reset Other User Password Mutation
  const adminPasswordMutation = useMutation({
    mutationFn: async ({ id, newPassword, confirmPassword }: any) =>
      api.patch(`/users/${id}/password`, { newPassword, confirmPassword }),
    onSuccess: (res) => {
      setSuccessMsg(res.data.message || 'Password reset successfully');
      setErrorMsg(null);
      setPasswordModalUser(null);
      setAdminNewPassword('');
      setAdminConfirmPassword('');
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to reset password'),
  });

  // 5. Delete User Mutation (Super Admin Only)
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/users/${id}`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-users'] });
      setSuccessMsg(res.data.message || 'User deleted permanently');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to delete user'),
  });

  // 6. Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async (id: string) => api.patch(`/users/${id}/status`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-users'] });
      setSuccessMsg(res.data.message || 'Status updated');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to update status'),
  });

  // 7. Update Permissions Mutation
  const permissionsMutation = useMutation({
    mutationFn: async ({ id, role, permissions }: any) =>
      api.patch(`/users/${id}/permissions`, { role, permissions }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin-staff-users'] });
      setSuccessMsg(res.data.message || 'Permissions updated successfully');
      setErrorMsg(null);
      setPermissionsModalUser(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to update permissions'),
  });

  // Permission Matrix Helpers
  const toggleAction = (list: string[], key: string, action: 'view' | 'edit' | 'delete'): string[] => {
    const code = `${key}:${action}`;
    return list.includes(code) ? list.filter((p) => p !== code) : [...list, code];
  };

  const toggleFullModule = (list: string[], key: string): string[] => {
    const codes = [`${key}:view`, `${key}:edit`, `${key}:delete`];
    const hasAll = codes.every((c) => list.includes(c));
    if (hasAll) {
      return list.filter((p) => !codes.includes(p));
    }
    return Array.from(new Set([...list, ...codes]));
  };

  const selectAllSystemPermissions = (): string[] => {
    const all: string[] = [];
    SYSTEM_MODULES.forEach((m) => {
      all.push(`${m.key}:view`, `${m.key}:edit`, `${m.key}:delete`);
    });
    return all;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ name, email, phone, password, role, permissions: selectedPermissions });
  };

  const handleSelfPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selfNewPassword !== selfConfirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }
    if (selfNewPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }
    selfPasswordMutation.mutate({ currentPassword, newPassword: selfNewPassword, confirmPassword: selfConfirmPassword });
  };

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser) return;
    if (adminNewPassword !== adminConfirmPassword) {
      setErrorMsg('New password and confirm password do not match.');
      return;
    }
    if (adminNewPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }
    adminPasswordMutation.mutate({ id: passwordModalUser._id, newPassword: adminNewPassword, confirmPassword: adminConfirmPassword });
  };

  return (
    <div className="space-y-6 pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#006642] bg-[#f0fdf4] border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-3.5 h-3.5" /> 17-Module Granular Access Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Users, Roles & Permissions Control</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Access/View, Edit, and Delete privileges across all 17 clinical and administrative modules.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => {
              setCurrentPassword('');
              setSelfNewPassword('');
              setSelfConfirmPassword('');
              setIsSelfPasswordModalOpen(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-2xl text-xs transition shadow-sm flex items-center gap-1.5"
          >
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>Change My Password</span>
          </button>

          <button
            onClick={() => {
              setSelectedPermissions([]);
              setIsCreateModalOpen(true);
            }}
            className="bg-brand-gradient hover:opacity-95 text-white font-black px-5 py-2.5 rounded-2xl text-xs transition shadow-md flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Staff / User</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#00984a]"
          />
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold overflow-x-auto no-scrollbar">
          {['ALL', 'SUPER_ADMIN', 'ADMIN', 'RECEPTIONIST', 'DOCTOR', 'LAB_TECHNICIAN', 'COLLECTOR', 'ACCOUNTANT'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                roleFilter === r ? 'bg-[#00984a] text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">Loading staff directory...</div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-4">User Details</th>
                  <th className="p-4">Assigned Role</th>
                  <th className="p-4">Mobile & Email</th>
                  <th className="p-4">Configured Permissions</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {users.map((u) => {
                  const isSelf = currentAdmin?._id === u._id;
                  const isTargetSuperAdmin = u.role === 'SUPER_ADMIN';

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shrink-0">
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <strong className="text-slate-900 font-bold text-sm block">
                              {u.name} {isSelf && <span className="text-[10px] text-emerald-600 font-black">(You)</span>}
                            </strong>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {u._id.slice(-6).toUpperCase()}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : u.role === 'ADMIN'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : u.role === 'DOCTOR'
                              ? 'bg-emerald-100 text-[#006642] border border-emerald-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-slate-900 font-bold block">{u.phone}</span>
                        <span className="text-slate-400 text-[11px]">{u.email}</span>
                      </td>

                      <td className="p-4">
                        <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {isTargetSuperAdmin
                            ? 'Full 17-Module System Access'
                            : `${new Set((u.permissions || []).map((p: string) => p.split(':')[0])).size} / 17 Modules Configured`}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
                            u.isActive
                              ? 'bg-emerald-50 text-[#00984a] border border-emerald-200'
                              : 'bg-red-50 text-red-600 border border-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {u.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Password Reset */}
                          <button
                            type="button"
                            onClick={() => {
                              setPasswordModalUser(u);
                              setAdminNewPassword('');
                              setAdminConfirmPassword('');
                            }}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1 text-[11px] font-bold"
                            title="Reset User Password"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-600" />
                            <span>Password</span>
                          </button>

                          {/* Granular Permissions Modal */}
                          {!isTargetSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => setPermissionsModalUser(u)}
                              className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1 text-[11px] font-bold"
                              title="Edit Permissions Matrix"
                            >
                              <Sliders className="w-3.5 h-3.5 text-blue-600" />
                              <span>Perms</span>
                            </button>
                          )}

                          {/* Block / Unblock (Disabled for Self and Super Admin) */}
                          <button
                            type="button"
                            disabled={isSelf || isTargetSuperAdmin}
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to ${u.isActive ? 'block' : 'unblock'} ${u.name}?`)) {
                                toggleStatusMutation.mutate(u._id);
                              }
                            }}
                            className={`p-2 rounded-xl text-[11px] font-bold transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                              u.isActive
                                ? 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                            title={isSelf ? 'You cannot block yourself' : u.isActive ? 'Block Account' : 'Activate Account'}
                          >
                            {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            <span>{u.isActive ? 'Block' : 'Unblock'}</span>
                          </button>

                          {/* Super Admin Permanent Delete (Forbidden for self) */}
                          {isSuperAdmin && !isSelf && !isTargetSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`⚠️ PERMANENT DELETE: Are you sure you want to completely delete account "${u.name}"?`)) {
                                  deleteMutation.mutate(u._id);
                                }
                              }}
                              className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition flex items-center gap-1 text-[11px] font-bold"
                              title="Permanently Delete Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 text-xs font-semibold">
            No staff accounts found.
          </div>
        )}
      </div>

      {/* MODAL 1: CREATE USER WITH 17-MODULE PERMISSION MATRIX */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border text-xs text-slate-700 font-bold animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#00984a]" /> Create New Administrative Staff & Assign Permissions
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariqul Islam"
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1">Select Role *</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 font-bold"
                  >
                    {/* Role Hierarchy: Only Super Admin can create Super Admin or Admin */}
                    {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN (Full Ownership)</option>}
                    {isSuperAdmin && <option value="ADMIN">ADMIN (General Administrator)</option>}
                    <option value="RECEPTIONIST">RECEPTIONIST (Frontdesk & Serial)</option>
                    <option value="DOCTOR">DOCTOR (Physician Consultant)</option>
                    <option value="LAB_TECHNICIAN">LAB_TECHNICIAN (Pathology & Reports)</option>
                    <option value="COLLECTOR">COLLECTOR (Home Phlebotomist)</option>
                    <option value="ACCOUNTANT">ACCOUNTANT (Finance & Billing)</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Official Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="staff@carepoint.com"
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01700000000"
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block mb-1">Initial Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters password"
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setSelectedPermissions(selectAllSystemPermissions())}
                    className="w-full bg-emerald-50 hover:bg-emerald-100 text-[#006642] border border-emerald-300 py-2 px-3 rounded-xl font-bold text-xs"
                  >
                    Select All 17 Modules (Full Access)
                  </button>
                </div>
              </div>

              {/* 🌟 17-MODULE GRANULAR PERMISSIONS MATRIX TABLE */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-slate-900 font-black">Configure 17-Module Granular Permissions:</label>
                  <span className="text-[10px] text-slate-400">View/Access • Edit/Create • Delete Control</span>
                </div>

                <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0 z-10 border-b">
                      <tr>
                        <th className="p-2.5">Module Name</th>
                        <th className="p-2.5 text-center">View / Access</th>
                        <th className="p-2.5 text-center">Create & Edit</th>
                        <th className="p-2.5 text-center">Delete</th>
                        <th className="p-2.5 text-center">Full Control</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {SYSTEM_MODULES.map((m) => {
                        const canView = selectedPermissions.includes(`${m.key}:view`);
                        const canEdit = selectedPermissions.includes(`${m.key}:edit`);
                        const canDelete = selectedPermissions.includes(`${m.key}:delete`);
                        const isFull = canView && canEdit && canDelete;

                        return (
                          <tr key={m.key} className="hover:bg-slate-50/70">
                            <td className="p-2.5 font-bold text-slate-800">{m.name}</td>
                            
                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={canView}
                                onChange={() => setSelectedPermissions((prev) => toggleAction(prev, m.key, 'view'))}
                                className="rounded text-[#00984a] focus:ring-0 cursor-pointer"
                              />
                            </td>

                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={canEdit}
                                onChange={() => setSelectedPermissions((prev) => toggleAction(prev, m.key, 'edit'))}
                                className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            <td className="p-2.5 text-center">
                              <input
                                type="checkbox"
                                checked={canDelete}
                                onChange={() => setSelectedPermissions((prev) => toggleAction(prev, m.key, 'delete'))}
                                className="rounded text-rose-600 focus:ring-0 cursor-pointer"
                              />
                            </td>

                            <td className="p-2.5 text-center">
                              <button
                                type="button"
                                onClick={() => setSelectedPermissions((prev) => toggleFullModule(prev, m.key))}
                                className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                              >
                                {isFull ? 'Uncheck All' : 'Select All'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-black shadow"
                >
                  {createMutation.isPending ? 'Creating Account...' : 'Create Account & Permissions'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE MY OWN PASSWORD */}
      {isSelfPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border text-xs text-slate-700 font-bold animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00984a]" /> Change My Password (আমার পাসওয়ার্ড পরিবর্তন)
              </h3>
              <button onClick={() => setIsSelfPasswordModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSelfPasswordSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">1. Current Password *</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password..."
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">2. New Password *</label>
                <input
                  type="password"
                  required
                  value={selfNewPassword}
                  onChange={(e) => setSelfNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)..."
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">3. Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={selfConfirmPassword}
                  onChange={(e) => setSelfConfirmPassword(e.target.value)}
                  placeholder="Re-type new password..."
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsSelfPasswordModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={selfPasswordMutation.isPending}
                  className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-black shadow"
                >
                  {selfPasswordMutation.isPending ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ADMIN RESET USER PASSWORD */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border text-xs text-slate-700 font-bold animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" /> Reset Password for: {passwordModalUser.name}
              </h3>
              <button onClick={() => setPasswordModalUser(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminPasswordSubmit} className="space-y-4">
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-800 text-[11px]">
                Resetting password for: <strong>{passwordModalUser.name}</strong> ({passwordModalUser.email})
              </div>

              <div>
                <label className="block mb-1">Set New Password *</label>
                <input
                  type="password"
                  required
                  value={adminNewPassword}
                  onChange={(e) => setAdminNewPassword(e.target.value)}
                  placeholder="Enter at least 6 characters..."
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  value={adminConfirmPassword}
                  onChange={(e) => setAdminConfirmPassword(e.target.value)}
                  placeholder="Re-type new password..."
                  className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminPasswordMutation.isPending}
                  className="w-1/2 bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-xl font-black shadow"
                >
                  {adminPasswordMutation.isPending ? 'Updating...' : 'Set Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EDIT 17-MODULE PERMISSIONS MATRIX */}
      {permissionsModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border text-xs text-slate-700 font-bold animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" /> Edit Permissions for: {permissionsModalUser.name}
              </h3>
              <button onClick={() => setPermissionsModalUser(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div>
                  <label className="block mb-1">Assigned Role</label>
                  <select
                    value={permissionsModalUser.role}
                    onChange={(e) => setPermissionsModalUser({ ...permissionsModalUser, role: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 font-bold"
                  >
                    {isSuperAdmin && <option value="ADMIN">ADMIN</option>}
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
                    <option value="COLLECTOR">COLLECTOR</option>
                    <option value="ACCOUNTANT">ACCOUNTANT</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPermissionsModalUser({
                      ...permissionsModalUser,
                      permissions: selectAllSystemPermissions(),
                    })
                  }
                  className="bg-emerald-50 hover:bg-emerald-100 text-[#006642] border border-emerald-300 py-2.5 px-3 rounded-xl font-bold"
                >
                  Select All 17 Modules (Full Access)
                </button>
              </div>

              {/* Matrix Table */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] sticky top-0 z-10 border-b">
                    <tr>
                      <th className="p-2.5">Module Name</th>
                      <th className="p-2.5 text-center">View / Access</th>
                      <th className="p-2.5 text-center">Create & Edit</th>
                      <th className="p-2.5 text-center">Delete</th>
                      <th className="p-2.5 text-center">Full Control</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {SYSTEM_MODULES.map((m) => {
                      const userPerms = permissionsModalUser.permissions || [];
                      const canView = userPerms.includes(`${m.key}:view`);
                      const canEdit = userPerms.includes(`${m.key}:edit`);
                      const canDelete = userPerms.includes(`${m.key}:delete`);
                      const isFull = canView && canEdit && canDelete;

                      return (
                        <tr key={m.key} className="hover:bg-slate-50/70">
                          <td className="p-2.5 font-bold text-slate-800">{m.name}</td>

                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={canView}
                              onChange={() =>
                                setPermissionsModalUser({
                                  ...permissionsModalUser,
                                  permissions: toggleAction(userPerms, m.key, 'view'),
                                })
                              }
                              className="rounded text-[#00984a] focus:ring-0 cursor-pointer"
                            />
                          </td>

                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={canEdit}
                              onChange={() =>
                                setPermissionsModalUser({
                                  ...permissionsModalUser,
                                  permissions: toggleAction(userPerms, m.key, 'edit'),
                                })
                              }
                              className="rounded text-blue-600 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={canDelete}
                              onChange={() =>
                                setPermissionsModalUser({
                                  ...permissionsModalUser,
                                  permissions: toggleAction(userPerms, m.key, 'delete'),
                                })
                              }
                              className="rounded text-rose-600 focus:ring-0 cursor-pointer"
                            />
                          </td>

                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                setPermissionsModalUser({
                                  ...permissionsModalUser,
                                  permissions: toggleFullModule(userPerms, m.key),
                                })
                              }
                              className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                            >
                              {isFull ? 'Uncheck All' : 'Select All'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setPermissionsModalUser(null)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() =>
                    permissionsMutation.mutate({
                      id: permissionsModalUser._id,
                      role: permissionsModalUser.role,
                      permissions: permissionsModalUser.permissions || [],
                    })
                  }
                  disabled={permissionsMutation.isPending}
                  className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-black shadow"
                >
                  {permissionsMutation.isPending ? 'Saving...' : 'Save Permissions Matrix'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagementPage;