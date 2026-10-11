import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../lib/api.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Boxes,
  PackageCheck,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Plus,
  TrendingDown,
  Warehouse,
  CheckCircle2,
} from 'lucide-react';

export const InventoryManagerPage: React.FC = () => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<any[]>([]);
  const [goodsReceipts, setGoodsReceipts] = useState<any[]>([]);
  const [adjustModal, setAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjQuantity, setAdjQuantity] = useState(10);
  const [adjType, setAdjType] = useState<'addition' | 'reduction'>('addition');
  const [adjReason, setAdjReason] = useState('Routine cycle count update');

  const loadInventory = async () => {
    try {
      setLoading(true);
      const [prodRes, grnRes] = await Promise.all([
        api.get('/products'),
        api.get('/goods-receipts'),
      ]);

      const pList = prodRes.data.success ? (prodRes.data.data.products || prodRes.data.data || []) : [];
      const gList = grnRes.data.success ? (grnRes.data.data.goodsReceipts || grnRes.data.data || []) : [];

      setProducts(pList);
      setGoodsReceipts(gList);
    } catch (err: any) {
      error('Inventory Data Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      const res = await api.post(`/products/${selectedProduct._id}/adjust-stock`, {
        quantity: adjType === 'addition' ? adjQuantity : -adjQuantity,
        reason: adjReason,
      });
      if (res.data.success) {
        success('Stock Adjusted', `Inventory count for ${selectedProduct.name} updated.`);
        setAdjustModal(false);
        loadInventory();
      }
    } catch (err: any) {
      error('Adjustment Failed', err.response?.data?.message || err.message);
    }
  };

  const lowStockItems = products.filter((p) => (p.currentStock || 0) <= (p.minStockLevel || p.reorderPoint || 10));
  const totalValuation = products.reduce((sum, p) => sum + ((p.currentStock || 0) * (p.unitPrice || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Warehouse Operations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stock ledger, minimum threshold alerts, and inbound goods receipt processing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadInventory}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/app/goods-receipts"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-teal-500 text-white hover:bg-teal-600 transition-colors shadow-sm"
          >
            <PackageCheck className="w-3.5 h-3.5" /> Inbound GRN
          </Link>
          <Link
            to="/app/inventory"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
          >
            <Warehouse className="w-3.5 h-3.5" /> Full Ledger
          </Link>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Tracked SKUs</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{products.length} Products</div>
          <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Active warehouse catalog</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Low Stock Alerts</span>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">{lowStockItems.length} SKUs</div>
          <span className="text-[11px] text-rose-700 font-semibold mt-1 block">Below safety reorder point</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Inbound Receipts</span>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">{goodsReceipts.length} GRNs</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Processed from verified POs</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
          <span className="text-xs font-bold text-slate-500 uppercase">Inventory Value</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">₹{totalValuation.toLocaleString('en-IN')}</div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">On-hand warehouse asset value</span>
        </div>
      </div>

      {/* Low Stock Warning Banner if any */}
      {lowStockItems.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 flex-1">
            <span className="font-bold">Attention Required:</span> {lowStockItems.length} product(s) have fallen below their minimum safety stock levels. Issue purchase requisitions or notify procurement immediately.
          </div>
        </div>
      )}

      {/* Stock Catalog Table */}
      <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">Current Stock Levels & Thresholds</h2>
            <p className="text-xs text-slate-500">Live inventory balances across central and regional warehouses.</p>
          </div>
          <Link to="/app/products" className="text-xs text-teal-600 font-bold hover:underline flex items-center gap-1">
            Manage Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">On-Hand Stock</th>
                <th className="py-3 px-4">Reorder Point</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4 text-right">Stock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.slice(0, 8).map((prod) => {
                const isLow = (prod.currentStock || 0) <= (prod.minStockLevel || prod.reorderPoint || 10);
                return (
                  <tr key={prod._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{prod.name}</div>
                      <div className="text-[11px] text-slate-400">{prod.unit || 'Units'}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">{prod.sku || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-600">{prod.category || 'General'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-xs ${
                          isLow
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {prod.currentStock ?? 0} {prod.unit || 'units'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {prod.minStockLevel || prod.reorderPoint || 10}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{(prod.unitPrice || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedProduct(prod);
                          setAdjustModal(true);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-procure-border space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Adjust Stock: {selectedProduct.name}
            </h3>
            <form onSubmit={handleAdjustStock} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjType('addition')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      adjType === 'addition'
                        ? 'bg-teal-50 border-teal-500 text-teal-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    + Stock In (Add)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjType('reduction')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      adjType === 'reduction'
                        ? 'bg-rose-50 border-rose-500 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    - Stock Out (Deduct)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjQuantity}
                  onChange={(e) => setAdjQuantity(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Reference Note</label>
                <input
                  type="text"
                  required
                  value={adjReason}
                  onChange={(e) => setAdjReason(e.target.value)}
                  placeholder="Cycle count, damaged write-off, receipt reconciliation..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
