import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { PurchaseOrder } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import {
  ShoppingCart,
  Printer,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  Send,
  Truck,
} from 'lucide-react';

export const PurchaseOrdersPage: React.FC = () => {
  const { success, error } = useToast();

  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);

  const fetchPOs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/purchase-orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err: any) {
      error('Failed to load purchase orders', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPOs();
  }, []);

  const handleUpdateStatus = async (poId: string, newStatus: string) => {
    try {
      const res = await api.patch(`/purchase-orders/${poId}/status`, { status: newStatus });
      if (res.data.success) {
        success('Status Updated', `Purchase order updated to ${newStatus}.`);
        fetchPOs();
        if (selectedPO) setSelectedPO(res.data.data);
      }
    } catch (err: any) {
      error('Update failed', err.message);
    }
  };

  const filtered = orders.filter((o) => {
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return o.poNumber.toLowerCase().includes(q) || o.vendorName.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Purchase Orders
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Authorized purchase orders, vendor acknowledgments, delivery tracking, and PDF printing.
          </p>
        </div>

        <button onClick={fetchPOs} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-procure-border rounded-xl p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search PO number or vendor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="sent_to_vendor">Sent to Vendor</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="partially_received">Partially Received</option>
            <option value="fully_received">Fully Received</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">PO Number</th>
                <th className="py-3.5 px-4">Vendor</th>
                <th className="py-3.5 px-4">Grand Total (₹)</th>
                <th className="py-3.5 px-4">Expected Delivery</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No purchase orders found.
                  </td>
                </tr>
              ) : (
                filtered.map((po) => (
                  <tr key={po._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700 text-sm">
                      {po.poNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{po.vendorName}</td>
                    <td className="py-3 px-4 font-black text-slate-900">
                      ₹{po.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={po.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/v1/purchase-orders/${po._id}/pdf`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 font-semibold text-[11px]"
                          title="Print / Save PDF"
                        >
                          <Printer className="w-3.5 h-3.5" /> PDF
                        </a>
                        <button
                          onClick={() => setSelectedPO(po)}
                          className="p-1.5 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PO Details Modal with Status Advancement */}
      {selectedPO && (
        <Modal
          isOpen={!!selectedPO}
          onClose={() => setSelectedPO(null)}
          title={`Purchase Order ${selectedPO.poNumber}`}
          subtitle={`Issued to ${selectedPO.vendorName} • Payment: ${selectedPO.paymentTerms}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* Status Flow Progress Bar */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-2">Order Lifecycle Progression</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedPO.status} size="md" />
                <div className="flex-1" />
                {selectedPO.status === 'approved' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedPO._id, 'sent_to_vendor')}
                    className="inline-flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg font-bold"
                  >
                    <Send className="w-3 h-3" /> Mark Sent to Vendor
                  </button>
                )}
                {selectedPO.status === 'sent_to_vendor' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedPO._id, 'acknowledged')}
                    className="inline-flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg font-bold"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Vendor Acknowledged
                  </button>
                )}
              </div>
            </div>

            {/* Line Items Table */}
            <div>
              <span className="font-bold text-slate-700 block mb-2">Authorized Line Items</span>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                {selectedPO.lineItems.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-800">{item.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        SKU: {item.sku} • Received: {item.receivedQuantity} / {item.quantity}
                      </div>
                    </div>
                    <div className="text-right">
                      <div>
                        {item.quantity} × ₹{item.unitPrice.toLocaleString('en-IN')} (GST {item.taxRate}%)
                      </div>
                      <strong className="text-slate-900">₹{item.total.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mt-3 flex justify-between font-bold text-slate-800">
                <span>Grand Total (incl. GST):</span>
                <span className="text-teal-700 text-sm">₹{selectedPO.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <a
                href={`/api/v1/purchase-orders/${selectedPO._id}/pdf`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:underline"
              >
                <Printer className="w-4 h-4" /> Open Print View
              </a>
              <button
                onClick={() => setSelectedPO(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
