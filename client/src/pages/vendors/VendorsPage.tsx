import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Vendor } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { ScoreRing } from '../../components/common/ScoreRing.js';
import { Modal } from '../../components/common/Modal.js';
import { VendorDetailsDrawer } from '../../components/vendor/VendorDetailsDrawer.js';
import { useToast } from '../../context/ToastContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Building2,
  Plus,
  Search,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const VendorsPage: React.FC = () => {
  const { success, error } = useToast();
  const { user } = useAuth();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // New Vendor Form
  const [newVendor, setNewVendor] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    category: 'IT Equipment',
    gstin: '',
    paymentTerms: 'Net 30',
    onTimeDeliveryRate: 85,
    qualityScore: 85,
    priceCompetitiveness: 85,
    complianceScore: 90,
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vendors');
      if (res.data.success) {
        setVendors(res.data.data);
      }
    } catch (err: any) {
      error('Failed to load vendors', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/vendors', newVendor);
      if (res.data.success) {
        success('Vendor Created', `${newVendor.name} has been added to qualified suppliers.`);
        setIsAddModalOpen(false);
        fetchVendors();
      }
    } catch (err: any) {
      error('Creation failed', err.response?.data?.message || err.message);
    }
  };

  const handleUpdateStatus = async (vendorId: string, status: string) => {
    try {
      await api.patch(`/vendors/${vendorId}/status`, { status });
      success('Status Updated', `Vendor status changed to ${status}.`);
      fetchVendors();
    } catch (err: any) {
      error('Action failed', err.message);
    }
  };

  const filtered = vendors.filter((v) => {
    if (statusFilter !== 'all' && v.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.vendorCode.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        v.contactPerson.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Vendor Directory & Lifecycle
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Manage qualified vendors, monitor composite ratings, and audit certifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/v1/vendors/export/csv"
            className="inline-flex items-center gap-1.5 bg-white border border-procure-border text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </a>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-procure-border rounded-xl p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search vendor name, code, contact person..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <button
          onClick={fetchVendors}
          className="p-2.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
          title="Reload"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Vendors Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Score & Rank</th>
                <th className="py-3.5 px-4">Delivery</th>
                <th className="py-3.5 px-4">Quality</th>
                <th className="py-3.5 px-4">Risk</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No vendors found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800 text-sm">{v.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {v.vendorCode} • {v.contactPerson}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">{v.category}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-800">{v.score}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                          #{v.rank}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{v.onTimeDeliveryRate}%</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{v.qualityScore}%</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.riskRating} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={v.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedVendor(v);
                            setIsDrawerOpen(true);
                          }}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Scorecard"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {v.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateStatus(v._id, 'active')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Approve Onboarding"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {v.status === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(v._id, 'suspended')}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Suspend"
                          >
                            <AlertTriangle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Onboard New Supplier"
        subtitle="Register vendor profile with initial evaluation metrics."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Company Name</label>
              <input
                type="text"
                required
                value={newVendor.name}
                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                placeholder="e.g. Apex Industrial Systems"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={newVendor.category}
                onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="IT Equipment">IT Equipment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Industrial & Safety">Industrial & Safety</option>
                <option value="Cloud & Telecom">Cloud & Telecom</option>
                <option value="Logistics">Logistics</option>
                <option value="Facilities">Facilities</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Contact Person</label>
              <input
                type="text"
                required
                value={newVendor.contactPerson}
                onChange={(e) => setNewVendor({ ...newVendor, contactPerson: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Email</label>
              <input
                type="email"
                required
                value={newVendor.email}
                onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                placeholder="sales@company.com"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Phone</label>
              <input
                type="text"
                required
                value={newVendor.phone}
                onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                placeholder="+91 98000 00000"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">GSTIN Number</label>
              <input
                type="text"
                value={newVendor.gstin}
                onChange={(e) => setNewVendor({ ...newVendor, gstin: e.target.value })}
                placeholder="29AAAAA0000A1Z5"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Delivery Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={newVendor.onTimeDeliveryRate}
                onChange={(e) => setNewVendor({ ...newVendor, onTimeDeliveryRate: Number(e.target.value) })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Quality Score (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={newVendor.qualityScore}
                onChange={(e) => setNewVendor({ ...newVendor, qualityScore: Number(e.target.value) })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-600 block mb-1">Compliance (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={newVendor.complianceScore}
                onChange={(e) => setNewVendor({ ...newVendor, complianceScore: Number(e.target.value) })}
                className="w-full text-xs p-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
            >
              Add Vendor & Calculate Score
            </button>
          </div>
        </form>
      </Modal>

      {/* Details Drawer */}
      <VendorDetailsDrawer
        vendor={selectedVendor}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedVendor(null);
        }}
      />
    </div>
  );
};
