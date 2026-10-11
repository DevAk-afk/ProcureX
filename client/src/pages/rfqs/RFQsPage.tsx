import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Vendor, Product } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Send,
  Plus,
  Search,
  CheckCircle2,
  Award,
  RefreshCw,
  Eye,
  ShoppingCart,
} from 'lucide-react';

export const RFQsPage: React.FC = () => {
  const { success, error } = useToast();

  const [rfqs, setRfqs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRFQ, setSelectedRFQ] = useState<any | null>(null);

  // New RFQ State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [lineItems, setLineItems] = useState<Array<{ productName: string; quantity: number }>>([
    { productName: 'Commercial Laptops Core i7', quantity: 20 },
  ]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, vRes, pRes] = await Promise.all([
        api.get('/rfqs'),
        api.get('/vendors'),
        api.get('/products'),
      ]);
      if (rRes.data.success) setRfqs(rRes.data.data);
      if (vRes.data.success) setVendors(vRes.data.data);
      if (pRes.data.success) setProducts(pRes.data.data);
    } catch (err: any) {
      error('Failed to load RFQs', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateRFQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/rfqs', {
        title,
        description,
        invitedVendors: selectedVendors,
        lineItems,
      });

      if (res.data.success) {
        success('RFQ Published', `Request for quotation ${res.data.data.rfqNumber} sent to invited suppliers.`);
        setIsCreateModalOpen(false);
        setTitle('');
        setDescription('');
        fetchData();
      }
    } catch (err: any) {
      error('Creation failed', err.response?.data?.message || err.message);
    }
  };

  const handleAward = async (rfqId: string, quoteId: string) => {
    try {
      const res = await api.post(`/rfqs/${rfqId}/award`, { quoteId });
      if (res.data.success) {
        success('RFQ Awarded', res.data.message);
        setSelectedRFQ(null);
        fetchData();
      }
    } catch (err: any) {
      error('Award failed', err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Requests for Quotation (RFQ)
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Publish procurement tenders, compare supplier quotes side by side, and award purchase orders.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create RFQ
        </button>
      </div>

      {/* RFQ List Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">RFQ Identifier</th>
                <th className="py-3.5 px-4">Title & Description</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4">Quotations Received</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rfqs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No active RFQ tenders currently published.
                  </td>
                </tr>
              ) : (
                rfqs.map((rfq) => (
                  <tr key={rfq._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700 text-sm">
                      {rfq.rfqNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{rfq.title}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{rfq.description}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(rfq.deadlineDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {rfq.quotations?.length || 0} quotes
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={rfq.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedRFQ(rfq)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-lg hover:bg-teal-100 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" /> Compare Quotes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quote Comparison Modal */}
      {selectedRFQ && (
        <Modal
          isOpen={!!selectedRFQ}
          onClose={() => setSelectedRFQ(null)}
          title={`Quotation Comparison: ${selectedRFQ.rfqNumber}`}
          subtitle={selectedRFQ.title}
          maxWidth="3xl"
        >
          <div className="space-y-5 text-xs">
            {(!selectedRFQ.quotations || selectedRFQ.quotations.length === 0) ? (
              <div className="p-8 text-center text-slate-400">
                No quotations submitted yet by invited suppliers.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-3">Supplier</th>
                      <th className="p-3">Turnaround</th>
                      <th className="p-3">Payment Terms</th>
                      <th className="p-3">Quoted Amount (₹)</th>
                      <th className="p-3 text-right">Decision</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedRFQ.quotations.map((q: any) => (
                      <tr key={q._id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-bold text-slate-800">{q.vendorName}</td>
                        <td className="p-3 text-slate-600">{q.deliveryDays} days</td>
                        <td className="p-3 text-slate-600">{q.paymentTerms}</td>
                        <td className="p-3 font-black text-slate-900 text-sm">
                          ₹{q.grandTotal.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3 text-right">
                          {q.isSelected ? (
                            <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Awarded
                            </span>
                          ) : (
                            selectedRFQ.status !== 'awarded' && (
                              <button
                                onClick={() => handleAward(selectedRFQ._id, q._id)}
                                className="inline-flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-sm"
                              >
                                <Award className="w-3.5 h-3.5" /> Award Contract
                              </button>
                            )
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Create RFQ Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Publish New RFQ"
        subtitle="Invite qualified suppliers to tender quotations."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateRFQ} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Tender Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Sourcing 50 Commercial Laptops & Monitors"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Description & Requirements</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline specific technical parameters, warranty terms, and delivery location..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Invite Qualified Suppliers</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-200 rounded-xl p-2.5">
              {vendors.map((v) => (
                <label key={v._id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedVendors.includes(v._id)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedVendors([...selectedVendors, v._id]);
                      else setSelectedVendors(selectedVendors.filter((id) => id !== v._id));
                    }}
                    className="rounded text-teal-600 focus:ring-teal-500"
                  />
                  <span>
                    <strong>{v.name}</strong> ({v.category} • Score: {v.score}/100)
                  </span>
                </label>
              ))}
            </div>
          </div>

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
              Publish Tender
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
