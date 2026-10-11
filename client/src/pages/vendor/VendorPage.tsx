import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Building2,
  FileText,
  ShoppingCart,
  Send,
  CheckCircle2,
  Clock,
  Truck,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';

export const VendorPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [rfqs, setRfqs] = useState<any[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [vendorProfile, setVendorProfile] = useState<any>(null);

  const loadVendorData = async () => {
    try {
      setLoading(true);
      const [rfqRes, poRes] = await Promise.all([
        api.get('/rfqs'),
        api.get('/purchase-orders'),
      ]);

      const rList = rfqRes.data.success ? (rfqRes.data.data.rfqs || rfqRes.data.data || []) : [];
      const pList = poRes.data.success ? (poRes.data.data.purchaseOrders || poRes.data.data || []) : [];

      setRfqs(rList);
      setPurchaseOrders(pList);

      // Fetch vendor profile if available
      try {
        const vRes = await api.get('/vendors');
        const vList = vRes.data.success ? (vRes.data.data.vendors || vRes.data.data || []) : [];
        if (vList.length > 0) setVendorProfile(vList[0]);
      } catch {
        // fallback
      }
    } catch (err: any) {
      error('Failed to load supplier records', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendorData();
  }, []);

  const handleAcknowledgePo = async (poId: string) => {
    try {
      const res = await api.patch(`/purchase-orders/${poId}/status`, { status: 'acknowledged' });
      if (res.data.success) {
        success('Order Acknowledged', 'Purchase order status updated to Acknowledged.');
        loadVendorData();
      }
    } catch (err: any) {
      error('Update failed', err.response?.data?.message || err.message);
    }
  };

  const activeOrders = purchaseOrders.filter((p) => p.status !== 'cancelled' && p.status !== 'fully_received');
  const totalContractValue = purchaseOrders.reduce((sum, p) => sum + (p.totalAmount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Supplier Partner Portal
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as {user?.name}. Manage RFQ bids, track issued purchase orders, and submit shipping milestones.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadVendorData}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/rfqs"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-sm"
          >
            <Send className="w-3.5 h-3.5" /> Submit RFQ Quote
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Assigned RFQs</span>
          <div className="text-2xl font-extrabold text-teal-600 mt-1">{rfqs.length} Opportunities</div>
          <span className="text-[11px] text-teal-700 font-semibold mt-1 block">Active tender invitations</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Active Orders</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{activeOrders.length} Orders</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Pending delivery / receipt</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Contract Value</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">₹{totalContractValue.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">Total issued PO commitments</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Supplier Score</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{vendorProfile?.score || 96}/100</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Rank #1 • Low Delivery Risk</span>
        </div>
      </div>

      {/* Section 1: Purchase Orders Received */}
      <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Purchase Orders Issued to Your Company</h2>
            <p className="text-xs text-slate-500">Confirm purchase orders and log shipping milestone progress.</p>
          </div>
          <Link to="/app/purchase-orders" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
            View All POs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Line Items</th>
                <th className="py-3 px-4">Order Value (incl. GST)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Delivery Deadline</th>
                <th className="py-3 px-4 text-right">Vendor Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchaseOrders.map((po) => (
                <tr key={po._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-teal-700">{po.poNumber}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {po.items?.length || 1} line item(s)
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    ₹{(po.totalAmount || 0).toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={po.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-500">
                    {po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).toLocaleDateString() : 'Net 15 Days'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {po.status === 'sent_to_vendor' ? (
                      <button
                        onClick={() => handleAcknowledgePo(po._id)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                      >
                        Acknowledge PO
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center justify-end gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: RFQ Opportunities */}
      <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Active RFQ Invitations</h2>
            <p className="text-xs text-slate-500">Submit competitive quotes before closing dates.</p>
          </div>
          <Link to="/app/rfqs" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
            Open RFQ Portal <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rfqs.map((rfq) => (
            <div key={rfq._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-teal-700">{rfq.rfqNumber}</span>
                <StatusBadge status={rfq.status} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">{rfq.title}</h3>
              <p className="text-slate-500 line-clamp-2">{rfq.description || 'Request for enterprise quotations.'}</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                <span className="text-slate-400">
                  Deadline: {rfq.submissionDeadline ? new Date(rfq.submissionDeadline).toLocaleDateString() : 'Rolling'}
                </span>
                <Link
                  to="/app/rfqs"
                  className="font-bold text-teal-600 hover:underline flex items-center gap-0.5"
                >
                  Submit Quote <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
