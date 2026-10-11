import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Payment, Invoice } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import {
  CreditCard,
  Plus,
  Search,
  CheckCircle2,
  RefreshCw,
  Receipt,
  FileCheck,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { success, error } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [unpaidInvoices, setUnpaidInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [payAmount, setPayAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('neft_rtgs');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, invRes] = await Promise.all([
        api.get('/payments'),
        api.get('/invoices'),
      ]);
      if (payRes.data.success) setPayments(payRes.data.data);
      if (invRes.data.success) {
        setUnpaidInvoices(
          invRes.data.data.filter((inv: any) =>
            ['unpaid', 'partial', 'overdue'].includes(inv.paymentStatus)
          )
        );
      }
    } catch (err: any) {
      error('Failed to load payments', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInvoiceSelect = (invId: string) => {
    setSelectedInvoiceId(invId);
    const inv = unpaidInvoices.find((i) => i._id === invId);
    if (inv) {
      setPayAmount(inv.balanceDue);
      setReferenceNumber(`UTR-${Date.now().toString().slice(-8)}`);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || payAmount <= 0 || !referenceNumber) {
      error('Validation', 'Please select an invoice, valid amount, and reference number.');
      return;
    }

    try {
      const res = await api.post('/payments', {
        invoiceId: selectedInvoiceId,
        amount: payAmount,
        paymentMethod,
        referenceNumber,
        notes,
      });

      if (res.data.success) {
        success('Payment Recorded', res.data.message);
        setIsRecordModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      error('Payment failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Disbursements & Payment Records
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Settlement records, NEFT/RTGS UTR transaction tracking, and outstanding supplier balances.
          </p>
        </div>

        <button
          onClick={() => {
            if (unpaidInvoices.length > 0 && !selectedInvoiceId) {
              handleInvoiceSelect(unpaidInvoices[0]._id);
            }
            setIsRecordModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Record Settlement
        </button>
      </div>

      {/* Payment Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Receipt #</th>
                <th className="py-3.5 px-4">Invoice #</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Amount Paid (₹)</th>
                <th className="py-3.5 px-4">Method & UTR</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment settlements recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700 text-sm">
                      {p.paymentNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {p.invoiceNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{p.vendorName}</td>
                    <td className="py-3 px-4 font-black text-slate-900 text-sm">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-700 uppercase tracking-wide text-[10px]">
                        {p.paymentMethod.replace('_', ' ')}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500">{p.referenceNumber}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.paymentDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Invoice Settlement"
        subtitle="Post verified payment reference and update invoice balance."
        maxWidth="md"
      >
        <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Invoice</label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => handleInvoiceSelect(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
            >
              {unpaidInvoices.map((inv) => (
                <option key={inv._id} value={inv._id}>
                  {inv.invoiceNumber} — {inv.vendorName} (Balance: ₹{inv.balanceDue.toLocaleString('en-IN')})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payment Amount (₹)</label>
              <input
                type="number"
                required
                min={1}
                value={payAmount}
                onChange={(e) => setPayAmount(Number(e.target.value))}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="neft_rtgs">NEFT / RTGS</option>
                <option value="bank_transfer">Direct Bank Transfer</option>
                <option value="upi">Corporate UPI</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              UTR / Bank Transaction Reference
            </label>
            <input
              type="text"
              required
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. HDFC12998341"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Notes / Remarks</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Settled within 30-day term"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
            >
              Confirm Settlement
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
