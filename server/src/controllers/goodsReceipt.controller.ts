import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { GoodsReceipt } from '../models/GoodsReceipt.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { Product } from '../models/Product.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { logAudit } from '../middleware/auditLogger.js';
import { triggerAutomations } from '../services/automationService.js';

export const getGoodsReceipts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { poNumber, search } = req.query;
  const query: any = {};
  if (poNumber) query.poNumber = poNumber;
  if (search) {
    query.$or = [
      { grnNumber: { $regex: search as string, $options: 'i' } },
      { poNumber: { $regex: search as string, $options: 'i' } },
      { vendorName: { $regex: search as string, $options: 'i' } },
    ];
  }

  const receipts = await GoodsReceipt.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: receipts });
};

export const getGoodsReceiptById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const grn = await GoodsReceipt.findById(id);
  if (!grn) {
    res.status(404).json({ success: false, message: 'Goods receipt not found.' });
    return;
  }
  res.status(200).json({ success: true, data: grn });
};

export const createGoodsReceipt = async (req: AuthRequest, res: Response): Promise<void> => {
  const count = await GoodsReceipt.countDocuments();
  const year = new Date().getFullYear();
  const grnNumber = `GRN-${year}-${String(count + 101).padStart(4, '0')}`;

  const { purchaseOrderId, warehouseLocation, lineItems = [], notes } = req.body;

  const po = await PurchaseOrder.findById(purchaseOrderId);
  if (!po) {
    res.status(404).json({ success: false, message: 'Purchase Order not found.' });
    return;
  }

  const grn = await GoodsReceipt.create({
    grnNumber,
    purchaseOrderId: po._id,
    poNumber: po.poNumber,
    vendorId: po.vendorId,
    vendorName: po.vendorName,
    receivedBy: req.user?.name || 'Warehouse Staff',
    warehouseLocation: warehouseLocation || 'Bengaluru Central Warehouse',
    lineItems,
    notes,
  });

  // Update PO line item received quantities
  let allFullyReceived = true;
  for (const item of lineItems) {
    const poItem = po.lineItems.find(
      (p) => p.sku === item.sku || p.productName.toLowerCase() === item.productName.toLowerCase()
    );

    if (poItem) {
      poItem.receivedQuantity = (poItem.receivedQuantity || 0) + Number(item.acceptedQuantity);
      if (poItem.receivedQuantity < poItem.quantity) {
        allFullyReceived = false;
      }
    }

    // Increment Product Stock and record InventoryTransaction
    const product = await Product.findOne({ sku: item.sku });
    if (product) {
      const oldStock = product.currentStock;
      const newStock = oldStock + Number(item.acceptedQuantity);
      product.currentStock = newStock;
      await product.save();

      const txCount = await InventoryTransaction.countDocuments();
      await InventoryTransaction.create({
        transactionNumber: `TXN-${year}-${String(txCount + 1001).padStart(5, '0')}`,
        productId: product._id,
        productName: product.name,
        sku: product.sku,
        warehouse: warehouseLocation || 'Bengaluru Central Warehouse',
        type: 'receipt',
        quantityDelta: Number(item.acceptedQuantity),
        balanceAfter: newStock,
        referenceType: 'grn',
        referenceId: grnNumber,
        reason: `Goods received against PO ${po.poNumber}`,
        performedBy: req.user?.name || 'Warehouse Staff',
      });
    }
  }

  po.status = allFullyReceived ? 'fully_received' : 'partially_received';
  await po.save();

  await logAudit(req, 'GRN_CREATE', 'GoodsReceipt', grn._id.toString(), {
    grnNumber,
    poNumber: po.poNumber,
  });

  res.status(201).json({
    success: true,
    message: `Goods receipt ${grnNumber} generated and stock updated.`,
    data: grn,
  });
};
