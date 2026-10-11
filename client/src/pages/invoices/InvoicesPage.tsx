import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Invoice, PurchaseOrder, GoodsReceipt } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Receipt,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export const InvoicesPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [openPOs, setOpenPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // New Invoice Form State
  const [newInvoice, setNewInvoice] = useState({
    invoiceNumber: '',
    purchaseOrderId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    subtotal: 0,
    grandTotal: 0,
    msmeFlag: false,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [invRes, poRes] = await Promise.all([
        api.get('/invoices'),
        api.get('/purchase-orders'),
      ]);
      if (invRes.data.success) setInvoices(invRes.data.data);
      if (poRes.data.success) setOpenPOs(poRes.data.data);
    } catch (err: any) {
      error('Failed to load invoices', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const po = openPOs.find((p) => p._id === newInvoice.purchaseOrderId);
      const res = await api.post('/invoices', {
        invoiceNumber: newInvoice.invoiceNumber,
        purchaseOrderId: newInvoice.purchaseOrderId,
        invoiceDate: newInvoice.invoiceDate,
        subtotal: newInvoice.subtotal,
        grandTotal: newInvoice.grandTotal,
        msmeFlag: newInvoice.msmeFlag,
        lineItems: po?.lineItems || [],
      });

      if (res.data.success) {
        success('Invoice Recorded', res.data.message);
        setIsCreateModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      error('Invoice record failed', err.response?.data?.message || err.message);
    }
  };

  const handleOverrideApproval = async (invoiceId: string) => {
    try {
      const res = await api.patch(`/invoices/${invoiceId}/status`, {
        status: 'approved',
        remarks: `Discrepancy approved with manual authorization by ${user?.name}.`,
      });
      if (res.data.success) {
        success('Invoice Approved', 'Invoice authorized for payment disbursement.');
        setSelectedInvoice(null);
        fetchData();
      }
    } catch (err: any) {
      error('Action failed', err.message);
    }
  };

  const filtered = invoices.filter((inv) => {
    if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Invoices & 3-Way Matching
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Automated reconciliation between POs, Goods Receipts, and invoices with GST & MSME tracking.
          </p>
        </div>

        <button
          onClick={() => {
            if (openPOs.length > 0 && !newInvoice.purchaseOrderId) {
              const first = openPOs[0];
              setNewInvoice({
                ...newInvoice,
                purchaseOrderId: first._id,
                subtotal: first.subtotal,
                grandTotal: first.grandTotal,
              });
            }
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Enter Invoice
        </button>
      </div>

      {/* Invoice Filter Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-procure-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Invoices</option>
              <option value="matched">Matched (Clean)</option>
              <option value="discrepancy">Discrepancy (Flagged)</option>
              <option value="paid">Paid</option>
              <option value="received">Pending Review</option>
            </select>
          </div>
          <button onClick={fetchData} className="p-1.5 text-slate-400 hover:text-slate-600">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">PO Reference</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Grand Total (₹)</th>
                <th className="py-3.5 px-4">Balance Due (₹)</th>
                <th className="py-3.5 px-4">3-Way Match</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No invoices recorded matching this status.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700 text-sm">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {inv.poNumber || 'Unlinked'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{inv.vendorName}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{inv.grandTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      ₹{inv.balanceDue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      {inv.matchingResult.isMatched ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Matched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Discrepancy
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={inv.paymentStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Invoice & 3-Way Match Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          subtitle={`Supplier: ${selectedInvoice.vendorName} • PO: ${selectedInvoice.poNumber || 'N/A'}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs">
            {/* 3-Way Match Result Card */}
            <div
              className={`p-4 rounded-xl border ${
                selectedInvoice.matchingResult.isMatched
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/60 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span className="flex items-center gap-1.5">
                  {selectedInvoice.matchingResult.isMatched ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                  )}
                  3-Way Matching Engine Status:
                </span>
                <span>
                  {selectedInvoice.matchingResult.isMatched ? 'VERIFIED MATCH' : 'DISCREPANCY FLAGGED'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {selectedInvoice.matchingResult.matchingNotes}
              </p>

              {/* List Discrepancies if any */}
              {selectedInvoice.matchingResult.discrepancies?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-rose-200 space-y-1">
                  <span className="font-bold text-[11px] block">Detected Issues:</span>
                  {selectedInvoice.matchingResult.discrepancies.map((d, i) => (
                    <div key={i} className="text-[11px] text-rose-800 flex items-start gap-1">
                      • {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tax & Totals Breakdown */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-bold text-slate-800">
                  ₹{selectedInvoice.subtotal.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">CGST (9%):</span>
                <span>₹{(selectedInvoice.taxDetails?.cgst || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">SGST (9%):</span>
                <span>₹{(selectedInvoice.taxDetails?.sgst || 0).toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-teal-700">₹{selectedInvoice.grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Close
              </button>

              {selectedInvoice.status === 'discrepancy' && (
                <button
                  onClick={() => handleOverrideApproval(selectedInvoice._id)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
                >
                  Authorize Manual Override & Approve
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Enter Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Record Supplier Invoice"
        subtitle="Perform automated 3-way match against authorized PO and Goods Receipt."
        maxWidth="md"
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Invoice Number</label>
            <input
              type="text"
              required
              value={newInvoice.invoiceNumber}
              onChange={(e) => setNewInvoice({ ...newInvoice, invoiceNumber: e.target.value })}
              placeholder="e.g. INV-TL-9902"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Associated Purchase Order</label>
            <select
              value={newInvoice.purchaseOrderId}
              onChange={(e) => {
                const poId = e.target.value;
                const po = openPOs.find((p) => p._id === poId);
                setNewInvoice({
                  ...newInvoice,
                  purchaseOrderId: poId,
                  subtotal: po ? po.subtotal : 0,
                  grandTotal: po ? po.grandTotal : 0,
                });
              }}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
            >
              {openPOs.map((po) => (
                <option key={po._id} value={po._id}>
                  {po.poNumber} — {po.vendorName} (₹{po.grandTotal.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Invoiced Subtotal (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={newInvoice.subtotal}
                onChange={(e) => setNewInvoice({ ...newInvoice, subtotal: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Invoiced Grand Total (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={newInvoice.grandTotal}
                onChange={(e) => setNewInvoice({ ...newInvoice, grandTotal: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={newInvoice.msmeFlag}
              onChange={(e) => setNewInvoice({ ...newInvoice, msmeFlag: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            Supplier is MSME Registered (Enforces 45-day statutory payment deadline)
          </label>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
            >
              Record & Execute 3-Way Match
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
