import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Requisition, Product, Vendor } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  FileText,
  Plus,
  Search,
  Send,
  ShoppingCart,
  Trash2,
  RefreshCw,
  CheckCircle,
  Eye,
} from 'lucide-react';

export const RequisitionsPage: React.FC = () => {
  const { success, error } = useToast();
  const { user } = useAuth();

  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState<Requisition | null>(null);

  // New Requisition Form State
  const [departmentName, setDepartmentName] = useState(user?.department || 'Information Technology');
  const [justification, setJustification] = useState('');
  const [preferredVendorId, setPreferredVendorId] = useState('');
  const [lineItems, setLineItems] = useState<
    Array<{ productId: string; sku: string; productName: string; quantity: number; estimatedUnitPrice: number; total: number }>
  >([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, pRes, vRes] = await Promise.all([
        api.get('/requisitions'),
        api.get('/products'),
        api.get('/vendors'),
      ]);
      if (rRes.data.success) setRequisitions(rRes.data.data);
      if (pRes.data.success) setProducts(pRes.data.data);
      if (vRes.data.success) setVendors(vRes.data.data);
    } catch (err: any) {
      error('Failed to load requisitions', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddLineItem = () => {
    if (products.length > 0) {
      const firstProduct = products[0];
      setLineItems([
        ...lineItems,
        {
          productId: firstProduct._id,
          sku: firstProduct.sku,
          productName: firstProduct.name,
          quantity: 1,
          estimatedUnitPrice: firstProduct.unitPrice,
          total: firstProduct.unitPrice,
        },
      ]);
    } else {
      setLineItems([
        ...lineItems,
        {
          productId: '',
          sku: `CUSTOM-${Date.now().toString().slice(-4)}`,
          productName: 'New Product Item',
          quantity: 1,
          estimatedUnitPrice: 1000,
          total: 1000,
        },
      ]);
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    if (productId === 'custom_new') {
      const updated = [...lineItems];
      updated[index] = {
        productId: '',
        sku: `ITEM-${Date.now().toString().slice(-4)}`,
        productName: '',
        quantity: updated[index]?.quantity || 1,
        estimatedUnitPrice: 0,
        total: 0,
      };
      setLineItems(updated);
      return;
    }
    const prod = products.find((p) => p._id === productId);
    if (!prod) return;
    const updated = [...lineItems];
    updated[index] = {
      productId: prod._id,
      sku: prod.sku,
      productName: prod.name,
      quantity: updated[index].quantity || 1,
      estimatedUnitPrice: prod.unitPrice,
      total: (updated[index].quantity || 1) * prod.unitPrice,
    };
    setLineItems(updated);
  };

  const handleCustomFieldChange = (index: number, field: 'productName' | 'sku' | 'estimatedUnitPrice', val: any) => {
    const updated = [...lineItems];
    if (field === 'estimatedUnitPrice') {
      const price = Number(val) || 0;
      updated[index].estimatedUnitPrice = price;
      updated[index].total = updated[index].quantity * price;
    } else {
      (updated[index] as any)[field] = val;
    }
    setLineItems(updated);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const validQty = Math.max(1, qty || 1);
    const updated = [...lineItems];
    updated[index].quantity = validQty;
    updated[index].total = validQty * updated[index].estimatedUnitPrice;
    setLineItems(updated);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleCreateRequisition = async (submitNow: boolean) => {
    if (lineItems.length === 0) {
      error('Validation', 'Please add at least one line item to the requisition.');
      return;
    }
    try {
      const preferredVendor = vendors.find((v) => v._id === preferredVendorId);
      const res = await api.post('/requisitions', {
        departmentName,
        justification,
        preferredVendorId: preferredVendorId || undefined,
        preferredVendorName: preferredVendor?.name,
        lineItems,
        submitNow,
      });

      if (res.data.success) {
        success(
          submitNow ? 'Requisition Submitted' : 'Draft Saved',
          `Requisition ${res.data.data.reqNumber} recorded.`
        );
        setIsCreateModalOpen(false);
        setLineItems([]);
        setJustification('');
        fetchData();
      }
    } catch (err: any) {
      error('Creation failed', err.response?.data?.message || err.message);
    }
  };

  const handleSubmitDraft = async (reqId: string) => {
    try {
      const res = await api.post(`/requisitions/${reqId}/submit`);
      if (res.data.success) {
        success('Requisition Submitted', 'Requisition sent to manager approval queue.');
        fetchData();
      }
    } catch (err: any) {
      error('Action failed', err.message);
    }
  };

  const handleConvertToPO = async (reqId: string) => {
    try {
      const res = await api.post(`/requisitions/${reqId}/convert-to-po`, {});
      if (res.data.success) {
        success('Purchase Order Generated', `${res.data.message}`);
        fetchData();
      }
    } catch (err: any) {
      error('Conversion failed', err.response?.data?.message || err.message);
    }
  };

  const totalEstimatedCost = lineItems.reduce((acc, i) => acc + i.total, 0);

  const filtered = requisitions.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Purchase Requisitions
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Departmental purchasing requests, line-item justification, and approval routing.
          </p>
        </div>

        <button
          onClick={() => {
            if (lineItems.length === 0) handleAddLineItem();
            setIsCreateModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Create Requisition
        </button>
      </div>

      {/* Requisitions List Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="p-4 border-b border-procure-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 bg-white"
            >
              <option value="all">All Requisitions</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="converted_to_po">Converted to PO</option>
              <option value="rejected">Rejected</option>
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
                <th className="py-3.5 px-4">Req Number</th>
                <th className="py-3.5 px-4">Requester</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Est. Value (₹)</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Required By</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No requisitions found.
                  </td>
                </tr>
              ) : (
                filtered.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-teal-700 font-mono text-xs">{r.reqNumber}</span>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{r.justification}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{r.requesterName}</td>
                    <td className="py-3 px-4 text-slate-600">{r.departmentName}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      ₹{r.estimatedTotal.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={r.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(r.requiredDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status === 'draft' && (
                          <button
                            onClick={() => handleSubmitDraft(r._id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md hover:bg-teal-100 transition-colors"
                          >
                            <Send className="w-3 h-3" /> Submit
                          </button>
                        )}
                        {r.status === 'approved' && (
                          <button
                            onClick={() => handleConvertToPO(r._id)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md hover:bg-emerald-100 transition-colors"
                          >
                            <ShoppingCart className="w-3 h-3" /> Create PO
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedReq(r)}
                          className="p-1.5 text-slate-400 hover:text-slate-600 rounded"
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

      {/* Create Requisition Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Purchase Requisition"
        subtitle="Specify product line items, quantities, and business justification."
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
              <input
                type="text"
                value={departmentName}
                onChange={(e) => setDepartmentName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Preferred Supplier (Optional)</label>
              <select
                value={preferredVendorId}
                onChange={(e) => setPreferredVendorId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Select Supplier</option>
                {vendors.map((v) => (
                  <option key={v._id} value={v._id}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Business Justification</label>
            <textarea
              rows={2}
              required
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="State procurement necessity and project allocation..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Line Items Builder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Requisition Items</span>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="text-xs text-teal-600 hover:text-teal-700 font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Line Item
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {lineItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50/50 flex flex-col gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <select
                        value={item.productId || 'custom_new'}
                        onChange={(e) => handleProductSelect(idx, e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white text-xs font-medium"
                      >
                        <option value="custom_new">+ Custom Product / Unlisted Item</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({p.sku}) — ₹{p.unitPrice.toLocaleString('en-IN')}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-20">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(idx, Number(e.target.value))}
                        placeholder="Qty"
                        className="w-full p-2 rounded-lg border border-slate-200 bg-white text-center text-xs font-semibold"
                      />
                    </div>

                    <div className="w-24 text-right font-bold text-teal-700">
                      ₹{item.total.toLocaleString('en-IN')}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveLineItem(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {!item.productId && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-slate-200/60">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Item Name</label>
                        <input
                          type="text"
                          required
                          value={item.productName}
                          onChange={(e) => handleCustomFieldChange(idx, 'productName', e.target.value)}
                          placeholder="e.g. Ergonomic Office Chair"
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">SKU / Code</label>
                        <input
                          type="text"
                          value={item.sku}
                          onChange={(e) => handleCustomFieldChange(idx, 'sku', e.target.value)}
                          placeholder="e.g. FURN-091"
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Est. Unit Price (₹)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.estimatedUnitPrice}
                          onChange={(e) => handleCustomFieldChange(idx, 'estimatedUnitPrice', e.target.value)}
                          placeholder="0"
                          className="w-full p-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 text-sm font-bold text-slate-800">
              <span>Total Estimated Value:</span>
              <span className="text-teal-700 text-base">₹{totalEstimatedCost.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleCreateRequisition(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => handleCreateRequisition(true)}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
            >
              Submit for Approval
            </button>
          </div>
        </div>
      </Modal>

      {/* View Requisition Details Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Requisition ${selectedReq.reqNumber}`}
          subtitle={`Requested by ${selectedReq.requesterName} • ${selectedReq.departmentName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-700 block mb-1">Justification:</span>
              <p className="text-slate-600 leading-relaxed">{selectedReq.justification}</p>
            </div>

            <div>
              <span className="font-bold text-slate-700 block mb-2">Line Items</span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {selectedReq.lineItems.map((item, i) => (
                  <div key={i} className="p-3 flex items-center justify-between bg-white">
                    <div>
                      <div className="font-semibold text-slate-800">{item.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">SKU: {item.sku}</div>
                    </div>
                    <div className="text-right">
                      <div>
                        {item.quantity} × ₹{item.estimatedUnitPrice.toLocaleString('en-IN')}
                      </div>
                      <strong className="text-slate-900">₹{item.total.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval History */}
            <div>
              <span className="font-bold text-slate-700 block mb-2">Approval Chain</span>
              <div className="space-y-2">
                {selectedReq.approvalHistory.map((h, i) => (
                  <div key={i} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">{h.approverName}</span>
                      <span className="text-slate-500 ml-1">({h.role})</span>
                      {h.remarks && <p className="text-slate-600 text-[11px] mt-0.5">{h.remarks}</p>}
                    </div>
                    <StatusBadge status={h.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
