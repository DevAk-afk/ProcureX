import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { useToast } from '../../context/ToastContext.js';
import {
  FileText,
  Send,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Plus,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';

export const PurchaseManagerPage: React.FC = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pendingApproval: 0,
    openRfqs: 0,
    activeOrders: 0,
    totalCommitted: 0,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqRes, rfqRes, poRes] = await Promise.all([
        api.get('/requisitions'),
        api.get('/rfqs'),
        api.get('/purchase-orders'),
      ]);

      const reqList = reqRes.data.success ? (reqRes.data.data.requisitions || reqRes.data.data || []) : [];
      const rfqList = rfqRes.data.success ? (rfqRes.data.data.rfqs || rfqRes.data.data || []) : [];
      const poList = poRes.data.success ? (poRes.data.data.purchaseOrders || poRes.data.data || []) : [];

      setRequisitions(reqList);
      setRfqs(rfqList);
      setPurchaseOrders(poList);

      const pending = reqList.filter((r: any) => r.status === 'submitted').length;
      const openRfqCount = rfqList.filter((rfq: any) => rfq.status === 'published' || rfq.status === 'open').length;
      const activePoCount = poList.filter((p: any) => p.status !== 'cancelled' && p.status !== 'fully_received').length;
      const totalSpend = poList.reduce((sum: number, p: any) => sum + (p.totalAmount || 0), 0);

      setStats({
        pendingApproval: pending,
        openRfqs: openRfqCount,
        activeOrders: activePoCount,
        totalCommitted: totalSpend,
      });
    } catch (err: any) {
      error('Data Load Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApproveRequisition = async (id: string) => {
    try {
      const res = await api.patch(`/requisitions/${id}/status`, { status: 'approved' });
      if (res.data.success) {
        success('Requisition Approved', 'The requisition has been approved for RFQ/PO processing.');
        loadData();
      }
    } catch (err: any) {
      error('Approval failed', err.response?.data?.message || err.message);
    }
  };

  const handleRejectRequisition = async (id: string) => {
    try {
      const res = await api.patch(`/requisitions/${id}/status`, { status: 'rejected', reason: 'Rejected by Purchase Manager' });
      if (res.data.success) {
        success('Requisition Rejected', 'The requisition status has been updated.');
        loadData();
      }
    } catch (err: any) {
      error('Rejection failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Purchase Manager Procurement Command
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Requisition approval queue, competitive RFQ negotiation, and purchase order tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/rfqs"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Create RFQ
          </Link>
          <Link
            to="/app/purchase-orders"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Issue PO
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Pending Review</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">{stats.pendingApproval} Requests</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Awaiting manager authorization</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Active RFQs</span>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">{stats.openRfqs} Tenders</div>
          <span className="text-[11px] text-teal-700 font-semibold mt-1 block">Receiving vendor bids</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Active Orders</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.activeOrders} POs</div>
          <span className="text-[11px] text-slate-400 mt-1 block">In fulfillment / shipment</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Committed Spend</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{stats.totalCommitted.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">Approved purchase commitments</span>
        </div>
      </div>

      {/* Section 1: Requisitions Awaiting Approval Queue */}
      <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Requisitions Approval Queue</h2>
            <p className="text-xs text-slate-500">Employee requisitions requiring your commercial authorization.</p>
          </div>
          <Link to="/app/requisitions" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
            View All ({requisitions.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Requisition ID</th>
                <th className="py-3 px-4">Title & Department</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total (Est.)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requisitions.slice(0, 5).map((req) => (
                <tr key={req._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-700">{req.requisitionNumber || req._id?.slice(-6)}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{req.title}</div>
                    <div className="text-[11px] text-slate-400">{req.department || 'General'}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-semibold">
                    {req.lineItems?.length || 1} line item(s)
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ₹{(req.totalEstimatedAmount || req.totalAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={req.status} />
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {req.status === 'submitted' ? (
                      <>
                        <button
                          onClick={() => handleApproveRequisition(req._id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => handleRejectRequisition(req._id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors inline-flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-semibold">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Open RFQs & Recent Purchase Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open RFQs */}
        <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">RFQ Tenders in Bidding</h2>
            <Link to="/app/rfqs" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
              All RFQs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {rfqs.slice(0, 4).map((rfq) => (
              <div key={rfq._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{rfq.title}</div>
                  <div className="text-[11px] text-slate-400">
                    {rfq.rfqNumber} • Closes: {rfq.submissionDeadline ? new Date(rfq.submissionDeadline).toLocaleDateString() : 'Active'}
                  </div>
                </div>
                <div className="text-right">
                  <StatusBadge status={rfq.status} />
                  <span className="text-[10px] text-slate-500 font-medium block mt-1">
                    {rfq.quotations?.length || 0} Bid(s)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Purchase Orders */}
        <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-slate-900">Issued Purchase Orders</h2>
            <Link to="/app/purchase-orders" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
              All POs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {purchaseOrders.slice(0, 4).map((po) => (
              <div key={po._id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-800">{po.poNumber}</div>
                  <div className="text-[11px] text-slate-400">
                    Vendor: {po.vendorId?.name || 'Selected Vendor'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">₹{(po.totalAmount || 0).toLocaleString('en-IN')}</div>
                  <StatusBadge status={po.status} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
