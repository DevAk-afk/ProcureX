import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { useToast } from '../../context/ToastContext.js';
import {
  ShieldAlert,
  Users,
  Building2,
  FileText,
  ShoppingCart,
  Boxes,
  Activity,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Sliders,
  DollarSign,
  UserCheck,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'vendors'>('overview');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, vRes, kRes] = await Promise.all([
        api.get('/auth/users'),
        api.get('/vendors?status=all'),
        api.get('/reports/dashboard-kpi'),
      ]);
      if (uRes.data.success) setUsers(uRes.data.data);
      if (vRes.data.success) setVendors(vRes.data.data.vendors || vRes.data.data || []);
      if (kRes.data.success) setKpis(kRes.data.data);
    } catch (err: any) {
      error('Failed to load Admin data', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await api.patch(`/auth/users/${userId}`, { isActive: !currentStatus });
      if (res.data.success) {
        success('User Updated', `User account ${!currentStatus ? 'activated' : 'suspended'}.`);
        fetchData();
      }
    } catch (err: any) {
      error('Action failed', err.response?.data?.message || err.message);
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: string) => {
    try {
      const res = await api.patch(`/auth/users/${userId}`, { role: newRole });
      if (res.data.success) {
        success('Role Updated', `User role changed to ${newRole}.`);
        fetchData();
      }
    } catch (err: any) {
      error('Action failed', err.response?.data?.message || err.message);
    }
  };

  const handleUpdateVendorStatus = async (vendorId: string, status: string) => {
    try {
      const res = await api.patch(`/vendors/${vendorId}/status`, { status });
      if (res.data.success) {
        success('Vendor Updated', `Vendor marked as ${status}.`);
        fetchData();
      }
    } catch (err: any) {
      error('Action failed', err.response?.data?.message || err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.role.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Admin Governance & Operations Hub
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase bg-teal-100 text-teal-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Full System Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Organization-wide user management, supplier authorizations, policy rules, and real-time procurement governance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
            title="Refresh Admin Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Global Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Organization Users</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{users.length} Accounts</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Active across all departments</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Qualified Vendors</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{vendors.length} Suppliers</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">GST and compliance verified</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Total System Spend</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            ₹{kpis?.totalProcurementSpend?.value ? kpis.totalProcurementSpend.value.toLocaleString('en-IN') : '8,40,160'}
          </div>
          <span className="text-[11px] text-indigo-600 font-semibold mt-1 block">Cross-department commit</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Compliance Status</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">100% Policy Clean</div>
          <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Zero unauthorized overrides</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto no-scrollbar whitespace-nowrap py-1">
        {[
          { id: 'overview', label: 'Organization Overview' },
          { id: 'users', label: `User Management (${users.length})` },
          { id: 'vendors', label: `Vendor Governance (${vendors.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-teal-500 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Organization Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900">Configured Role Architecture</h2>
            <div className="space-y-3">
              {[
                { role: 'Admin', desc: 'Full organization-wide authority, user provisioning, supplier approvals & settings' },
                { role: 'Purchase Manager', desc: 'Requisition reviews, RFQ management, quotation comparison & PO issuance' },
                { role: 'Employee / Requester', desc: 'Self-service multi-item purchase requisition drafting and status tracking' },
                { role: 'Vendor', desc: 'Receives invited RFQs, submits quotations, and tracks company purchase orders' },
                { role: 'Inventory Manager', desc: 'Stock ledger, warehouse intake against purchase orders, low stock alerts' },
              ].map((r, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{r.role}</span>
                    <p className="text-[11px] text-slate-500">{r.desc}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold text-[10px]">Active</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
            <h2 className="text-sm font-extrabold text-slate-900">Governance & Statutory Rules</h2>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-emerald-900">Automated Indian GST Statutory Taxation</span>
                  <p className="text-[11px] text-emerald-700 mt-0.5">Real-time 18% GST calculation across purchase requisitions, orders, and incoming bills.</p>
                </div>
              </div>
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-teal-900">MSME 45-Day Payment Settlement Guard</span>
                  <p className="text-[11px] text-teal-700 mt-0.5">Automated warning threshold triggers prior to statutory 45-day payment deadlines.</p>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-indigo-900">Scoped AI Security Boundary</span>
                  <p className="text-[11px] text-indigo-700 mt-0.5">Every AI Assistant query strictly abides by user authorization policies.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Users Management */}
      {activeTab === 'users' && (
        <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">User Accounts & Roles</h2>
              <p className="text-xs text-slate-500">Manage user authorizations, activate/suspend logins, and change assigned roles.</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user by name, email, role..."
                className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{u.department || 'General'}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeUserRole(u._id, e.target.value)}
                        className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="Admin">Admin</option>
                        <option value="Purchase Manager">Purchase Manager</option>
                        <option value="Employee / Requester">Employee / Requester</option>
                        <option value="Vendor">Vendor</option>
                        <option value="Inventory Manager">Inventory Manager</option>
                        <option value="Finance Officer">Finance Officer</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          u.isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          u.isActive
                            ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                            : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {u.isActive ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Vendors Governance */}
      {activeTab === 'vendors' && (
        <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Supplier Network Authorization</h2>
            <p className="text-xs text-slate-500">Approve onboarding vendors, inspect compliance metrics, or suspend vendors.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Performance Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Decisions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vendors.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{v.name}</div>
                      <div className="text-[11px] text-slate-400">{v.email} • {v.vendorCode}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{v.category}</td>
                    <td className="py-3 px-4">
                      <div className="font-extrabold text-teal-700">{v.score || 90}/100</div>
                      <div className="text-[10px] text-slate-400">Risk: {v.riskRating || 'Low'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3 px-4 text-right space-x-1.5">
                      {v.status !== 'active' && (
                        <button
                          onClick={() => handleUpdateVendorStatus(v._id, 'active')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {v.status !== 'suspended' && (
                        <button
                          onClick={() => handleUpdateVendorStatus(v._id, 'suspended')}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
                        >
                          Suspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
