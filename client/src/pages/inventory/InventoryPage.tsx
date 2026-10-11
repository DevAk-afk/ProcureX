import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Product, InventoryTransaction } from '../../types/index.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Boxes,
  Plus,
  Minus,
  Search,
  History,
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'stock' | 'transactions'>('stock');
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deltaQty, setDeltaQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, tRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/inventory/transactions'),
      ]);
      if (pRes.data.success) setProducts(pRes.data.data);
      if (tRes.data.success) setTransactions(tRes.data.data);
    } catch (err: any) {
      error('Failed to load inventory', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || deltaQty === 0 || !adjustReason) {
      error('Validation', 'Please provide a non-zero quantity and audit reason.');
      return;
    }

    try {
      const res = await api.post('/inventory/adjust', {
        productId: selectedProduct._id,
        quantityDelta: deltaQty,
        reason: adjustReason,
      });

      if (res.data.success) {
        success('Inventory Adjusted', res.data.message);
        setIsAdjustModalOpen(false);
        setDeltaQty(0);
        setAdjustReason('');
        setSelectedProduct(null);
        fetchData();
      }
    } catch (err: any) {
      error('Adjustment failed', err.response?.data?.message || err.message);
    }
  };

  const filtered = products.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Inventory & Stock Ledgers
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Real-time stock on hand, physical adjustments with mandatory audit trails, and movement ledgers.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'stock' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Stock Levels ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'transactions' ? 'bg-white text-teal-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Transaction Movement Ledger
          </button>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">SKU / Item</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Available Stock</th>
                  <th className="py-3.5 px-4">Reorder Limit</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => {
                  const isLow = p.currentStock <= p.reorderThreshold;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                        <div className="text-[11px] text-teal-700 font-mono font-semibold">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 font-black text-sm text-slate-800">
                        {p.currentStock} {p.unitOfMeasure}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.reorderThreshold}</td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                            <AlertTriangle className="w-3 h-3" /> Reorder Suggested
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Optimal Level
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsAdjustModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" /> Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Transactions Movement Ledger Table */
        <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Tx Number</th>
                  <th className="py-3.5 px-4">Product / SKU</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Delta</th>
                  <th className="py-3.5 px-4">Balance After</th>
                  <th className="py-3.5 px-4">Audit Reason</th>
                  <th className="py-3.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700">{tx.transactionNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{tx.productName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{tx.sku}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700 uppercase tracking-wide text-[10px]">
                      {tx.type}
                    </td>
                    <td className="py-3 px-4 font-black">
                      <span className={tx.quantityDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {tx.quantityDelta > 0 ? `+${tx.quantityDelta}` : tx.quantityDelta}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">{tx.balanceAfter}</td>
                    <td className="py-3 px-4 text-slate-600">{tx.reason}</td>
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {selectedProduct && (
        <Modal
          isOpen={isAdjustModalOpen}
          onClose={() => setIsAdjustModalOpen(false)}
          title={`Adjust Inventory: ${selectedProduct.name}`}
          subtitle={`SKU: ${selectedProduct.sku} • Current Stock: ${selectedProduct.currentStock} units`}
          maxWidth="md"
        >
          <form onSubmit={handleAdjustStock} className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Quantity Delta (positive to add, negative to deduct)
              </label>
              <input
                type="number"
                required
                value={deltaQty}
                onChange={(e) => setDeltaQty(Number(e.target.value))}
                placeholder="+10 or -5"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Calculated balance after: <strong>{selectedProduct.currentStock + deltaQty}</strong> units
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Mandatory Audit Reason
              </label>
              <textarea
                rows={3}
                required
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="e.g. Physical inventory cycle count adjustment, breakage write-off..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
              >
                Record Adjustment & Audit Ledger
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
