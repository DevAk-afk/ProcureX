import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { useToast } from '../../context/ToastContext.js';
import {
  FileText,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Info,
} from 'lucide-react';

export const EmployeePage: React.FC = () => {
  const { user } = useAuth();
  const { error } = useToast();
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState<any[]>([]);

  const loadMyRequisitions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requisitions');
      if (res.data.success) {
        // Backend filters by requesterId for Employee / Requester automatically
        const data = res.data.data.requisitions || res.data.data || [];
        setRequisitions(data);
      }
    } catch (err: any) {
      error('Failed to load requisitions', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyRequisitions();
  }, []);

  const totalSubmitted = requisitions.filter((r) => r.status === 'submitted').length;
  const totalApproved = requisitions.filter((r) => r.status === 'approved' || r.status === 'converted_to_po').length;
  const totalDraft = requisitions.filter((r) => r.status === 'draft').length;
  const totalValue = requisitions.reduce((sum, r) => sum + (r.totalEstimatedAmount || r.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Employee Requisition & Tracking Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, {user?.name}. Create multi-product requisitions and track procurement fulfillment in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadMyRequisitions}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/requisitions"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> + New Requisition
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">My Requests</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{requisitions.length} Total</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Private requester records</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Awaiting Approval</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{totalSubmitted} Submitted</div>
          <span className="text-[11px] text-slate-400 mt-1 block">With Department & Purchase Manager</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Approved / In PO</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">{totalApproved} Approved</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Procurement order initiated</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Total Value Requested</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalValue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Aggregate requisition total</span>
        </div>
      </div>

      {/* Main Table: My Requisitions */}
      <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">My Purchase Requisitions</h2>
            <p className="text-xs text-slate-500">
              Only your authorized requisition records are accessible.
            </p>
          </div>
          <Link to="/app/requisitions" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
            Manage & Create Line Items <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {requisitions.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No requisitions submitted yet</h3>
            <p className="text-xs text-slate-400 mt-1">Start by requesting office assets, equipment, or supplies.</p>
            <Link
              to="/app/requisitions"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500 text-white hover:bg-teal-600"
            >
              <Plus className="w-3.5 h-3.5" /> Create Your First Requisition
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Req #</th>
                  <th className="py-3 px-4">Subject & Description</th>
                  <th className="py-3 px-4">Line Items</th>
                  <th className="py-3 px-4">Estimated Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Fulfillment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requisitions.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">
                      {req.requisitionNumber || req._id?.slice(-6)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{req.title}</div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{req.description || 'Standard corporate requisition'}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                        {req.lineItems?.length || 1} Item(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{(req.totalEstimatedAmount || req.totalAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={req.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {req.status === 'converted_to_po' ? (
                        <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                          <Truck className="w-3.5 h-3.5" /> PO Dispatched
                        </span>
                      ) : req.status === 'approved' ? (
                        <span className="text-[11px] text-teal-700 font-bold flex items-center justify-end gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="text-[11px] text-rose-600 font-bold flex items-center justify-end gap-1" title={req.rejectionReason}>
                          <XCircle className="w-3.5 h-3.5" /> Needs Revision
                        </span>
                      ) : (
                        <span className="text-[11px] text-amber-600 font-semibold flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5" /> In Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Guidelines Box */}
      <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl flex items-start gap-3">
        <Info className="w-5 h-5 text-teal-700 shrink-0 mt-0.5" />
        <div className="text-xs text-teal-900">
          <span className="font-bold">Multi-Product Requisition Guide:</span> You can add multiple products or custom items to a single requisition by clicking "+ New Requisition" or visiting the Requisitions module. Line totals and GST estimates are automatically calculated.
        </div>
      </div>
    </div>
  );
};
