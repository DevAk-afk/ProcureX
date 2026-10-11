import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Product, Vendor } from '../../types/index.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Package,
  Plus,
  Search,
  Download,
  AlertTriangle,
  RefreshCw,
  Boxes,
} from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'IT Equipment',
    unitPrice: 1000,
    unitOfMeasure: 'Unit',
    preferredVendorId: '',
    leadTimeDays: 7,
    currentStock: 20,
    reorderThreshold: 10,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pRes, vRes] = await Promise.all([api.get('/products'), api.get('/vendors')]);
      if (pRes.data.success) setProducts(pRes.data.data);
      if (vRes.data.success) setVendors(vRes.data.data);
    } catch (err: any) {
      error('Failed to load catalog', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/products', newProduct);
      if (res.data.success) {
        success('Product Added', `${newProduct.name} (${newProduct.sku}) added to catalog.`);
        setIsAddModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      error('Creation failed', err.response?.data?.message || err.message);
    }
  };

  const filtered = products.filter((p) => {
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (lowStockOnly && p.currentStock > p.reorderThreshold) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
    }
    return true;
  });

  const categories = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Product & Sourcing Catalog
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Standard enterprise catalog items, SKU pricing, lead times, and inventory thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/api/v1/products/export/csv"
            className="inline-flex items-center gap-1.5 bg-white border border-procure-border text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export CSV
          </a>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-procure-border rounded-xl p-4 shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product name, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer ml-2">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
            />
            Low Stock Only
          </label>
        </div>

        <button onClick={fetchData} className="p-2.5 text-slate-500 hover:text-slate-800 rounded-lg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Catalog Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">SKU / Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Unit Price (₹)</th>
                <th className="py-3.5 px-4">Stock on Hand</th>
                <th className="py-3.5 px-4">Reorder Limit</th>
                <th className="py-3.5 px-4">Lead Time</th>
                <th className="py-3.5 px-4">Preferred Supplier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No products found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => {
                  const isLow = p.currentStock <= p.reorderThreshold;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800 text-sm">{p.name}</div>
                        <div className="text-[11px] text-teal-700 font-mono font-semibold">{p.sku}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{p.category}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        ₹{p.unitPrice.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-extrabold px-2 py-0.5 rounded-md ${
                            isLow ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {p.currentStock} {p.unitOfMeasure}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.reorderThreshold}</td>
                      <td className="py-3 px-4 text-slate-600">{p.leadTimeDays} days</td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {(p.preferredVendorId as any)?.name || 'Standard Sourcing'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Catalog Product"
        subtitle="Register SKU and inventory parameters."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">SKU Identifier</label>
              <input
                type="text"
                required
                value={newProduct.sku}
                onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                placeholder="e.g. IT-LAP-05"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Product Name</label>
              <input
                type="text"
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="e.g. Apple MacBook Air M3"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="IT Equipment">IT Equipment</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Industrial & Safety">Industrial & Safety</option>
                <option value="Logistics">Logistics</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Unit Price (₹)</label>
              <input
                type="number"
                required
                min={0}
                value={newProduct.unitPrice}
                onChange={(e) => setNewProduct({ ...newProduct, unitPrice: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Unit of Measure</label>
              <input
                type="text"
                value={newProduct.unitOfMeasure}
                onChange={(e) => setNewProduct({ ...newProduct, unitOfMeasure: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Opening Stock</label>
              <input
                type="number"
                min={0}
                value={newProduct.currentStock}
                onChange={(e) => setNewProduct({ ...newProduct, currentStock: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Reorder Limit</label>
              <input
                type="number"
                min={0}
                value={newProduct.reorderThreshold}
                onChange={(e) => setNewProduct({ ...newProduct, reorderThreshold: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Lead Time (Days)</label>
              <input
                type="number"
                min={1}
                value={newProduct.leadTimeDays}
                onChange={(e) => setNewProduct({ ...newProduct, leadTimeDays: Number(e.target.value) })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
