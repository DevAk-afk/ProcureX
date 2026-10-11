import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { GoodsReceipt, PurchaseOrder } from '../../types/index.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import {
  PackageCheck,
  Plus,
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const GoodsReceiptsPage: React.FC = () => {
  const { success, error } = useToast();

  const [receipts, setReceipts] = useState<GoodsReceipt[]>([]);
  const [openPOs, setOpenPOs] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [selectedPOId, setSelectedPOId] = useState('');
  const [warehouseLocation, setWarehouseLocation] = useState('Bengaluru Central Warehouse');
  const [receivedItems, setReceivedItems] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [grnRes, poRes] = await Promise.all([
        api.get('/goods-receipts'),
        api.get('/purchase-orders?status=all'),
      ]);
      if (grnRes.data.success) setReceipts(grnRes.data.data);
      if (poRes.data.success) {
        // POs that are approved, sent, or partially received
        setOpenPOs(
          poRes.data.data.filter((p: any) =>
            ['approved', 'sent_to_vendor', 'acknowledged', 'partially_received'].includes(p.status)
          )
        );
      }
    } catch (err: any) {
      error('Failed to load receipts', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePOSelect = (poId: string) => {
    setSelectedPOId(poId);
    const po = openPOs.find((p) => p._id === poId);
    if (!po) return;

    setReceivedItems(
      po.lineItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        orderedQuantity: item.quantity,
        receivedQuantity: item.quantity - (item.receivedQuantity || 0),
        acceptedQuantity: item.quantity - (item.receivedQuantity || 0),
        rejectedQuantity: 0,
        damagedQuantity: 0,
      }))
    );
  };

  const handleCreateGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPOId || receivedItems.length === 0) {
      error('Validation', 'Please select a purchase order with items to receive.');
      return;
    }

    try {
      const res = await api.post('/goods-receipts', {
        purchaseOrderId: selectedPOId,
        warehouseLocation,
        lineItems: receivedItems,
      });

      if (res.data.success) {
        success('Goods Receipt Recorded', `GRN ${res.data.data.grnNumber} generated. Inventory stock updated.`);
        setIsReceiveModalOpen(false);
        fetchData();
      }
    } catch (err: any) {
      error('Receipt failed', err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Goods Receipt Notes (GRN)
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Physical delivery inspection, accepted vs damaged quantities, and real-time stock sync.
          </p>
        </div>

        <button
          onClick={() => {
            if (openPOs.length > 0 && !selectedPOId) {
              handlePOSelect(openPOs[0]._id);
            }
            setIsReceiveModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" /> Receive Delivery (GRN)
        </button>
      </div>

      {/* Receipts Table */}
      <div className="bg-white border border-procure-border rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-procure-border text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">GRN Number</th>
                <th className="py-3.5 px-4">PO Reference</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Warehouse Location</th>
                <th className="py-3.5 px-4">Received By</th>
                <th className="py-3.5 px-4">Received Date</th>
                <th className="py-3.5 px-4">Items Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No goods receipts recorded yet.
                  </td>
                </tr>
              ) : (
                receipts.map((grn) => (
                  <tr key={grn._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-teal-700 text-sm">
                      {grn.grnNumber}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {grn.poNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{grn.vendorName}</td>
                    <td className="py-3 px-4 text-slate-600">{grn.warehouseLocation}</td>
                    <td className="py-3 px-4 text-slate-700">{grn.receivedBy}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(grn.receivedDate).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {grn.lineItems.reduce((acc, i) => acc + i.acceptedQuantity, 0)} units accepted
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Receive Delivery Modal */}
      <Modal
        isOpen={isReceiveModalOpen}
        onClose={() => setIsReceiveModalOpen(false)}
        title="Record Goods Receipt"
        subtitle="Verify delivered quantities against authorized Purchase Order."
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateGRN} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Select Purchase Order</label>
              <select
                value={selectedPOId}
                onChange={(e) => handlePOSelect(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-mono"
              >
                {openPOs.map((po) => (
                  <option key={po._id} value={po._id}>
                    {po.poNumber} — {po.vendorName} (₹{po.grandTotal.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Warehouse Location</label>
              <input
                type="text"
                value={warehouseLocation}
                onChange={(e) => setWarehouseLocation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 block mb-2">Item Delivery Inspection</span>
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              {receivedItems.map((item, idx) => (
                <div key={idx} className="p-3 bg-white space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>{item.productName} ({item.sku})</span>
                    <span className="text-slate-500">Ordered: {item.orderedQuantity}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Accepted Qty</label>
                      <input
                        type="number"
                        min={0}
                        max={item.orderedQuantity}
                        value={item.acceptedQuantity}
                        onChange={(e) => {
                          const updated = [...receivedItems];
                          updated[idx].acceptedQuantity = Number(e.target.value);
                          setReceivedItems(updated);
                        }}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 font-bold text-emerald-700 bg-emerald-50/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Damaged Qty</label>
                      <input
                        type="number"
                        min={0}
                        value={item.damagedQuantity}
                        onChange={(e) => {
                          const updated = [...receivedItems];
                          updated[idx].damagedQuantity = Number(e.target.value);
                          setReceivedItems(updated);
                        }}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200 text-rose-600 bg-rose-50/30"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500 block mb-0.5">Rejected Qty</label>
                      <input
                        type="number"
                        min={0}
                        value={item.rejectedQuantity}
                        onChange={(e) => {
                          const updated = [...receivedItems];
                          updated[idx].rejectedQuantity = Number(e.target.value);
                          setReceivedItems(updated);
                        }}
                        className="w-full p-2 text-xs rounded-lg border border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReceiveModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-600 text-white shadow-sm"
            >
              Complete GRN & Sync Inventory
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
