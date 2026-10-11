import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Product } from '../models/Product.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { logAudit } from '../middleware/auditLogger.js';
import { triggerAutomations } from '../services/automationService.js';

export const getInventoryItems = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, category, lowStockOnly } = req.query;

  const query: any = { status: 'active' };
  if (category && category !== 'all') query.category = category;
  if (lowStockOnly === 'true') {
    query.$expr = { $lte: ['$currentStock', '$reorderThreshold'] };
  }
  if (search) {
    query.$or = [
      { name: { $regex: search as string, $options: 'i' } },
      { sku: { $regex: search as string, $options: 'i' } },
    ];
  }

  const items = await Product.find(query).sort({ currentStock: 1 });
  res.status(200).json({ success: true, data: items });
};

export const getInventoryTransactions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, sku, type, limit = '100' } = req.query;
  const query: any = {};
  if (productId) query.productId = productId;
  if (sku) query.sku = sku;
  if (type && type !== 'all') query.type = type;

  const txs = await InventoryTransaction.find(query).sort({ createdAt: -1 }).limit(parseInt(limit as string, 10));
  res.status(200).json({ success: true, data: txs });
};

export const adjustStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, quantityDelta, reason, warehouse = 'Bengaluru Central Warehouse' } = req.body;

  if (!productId || quantityDelta === undefined || !reason) {
    res.status(400).json({ success: false, message: 'Product ID, quantity delta, and audit reason are required.' });
    return;
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  const delta = Number(quantityDelta);
  const newBalance = product.currentStock + delta;
  if (newBalance < 0) {
    res.status(400).json({ success: false, message: `Cannot adjust stock below zero. Current: ${product.currentStock}, Delta: ${delta}` });
    return;
  }

  product.currentStock = newBalance;
  await product.save();

  const count = await InventoryTransaction.countDocuments();
  const year = new Date().getFullYear();
  const transactionNumber = `TXN-${year}-${String(count + 1001).padStart(5, '0')}`;

  const tx = await InventoryTransaction.create({
    transactionNumber,
    productId: product._id,
    productName: product.name,
    sku: product.sku,
    warehouse,
    type: delta >= 0 ? 'adjustment' : 'issue',
    quantityDelta: delta,
    balanceAfter: newBalance,
    referenceType: 'manual',
    reason,
    performedBy: req.user?.name || 'Inventory Manager',
  });

  await logAudit(req, 'INVENTORY_ADJUSTMENT', 'Product', product._id.toString(), {
    sku: product.sku,
    delta,
    newBalance,
    reason,
  });

  if (newBalance <= product.reorderThreshold) {
    await triggerAutomations('inventory_low', {
      productName: product.name,
      currentStock: newBalance,
      reorderThreshold: product.reorderThreshold,
      link: '/app/inventory',
    });
  }

  res.status(200).json({
    success: true,
    message: `Stock updated for ${product.name}. New balance: ${newBalance}.`,
    data: { product, transaction: tx },
  });
};

export const getLowStockAlerts = async (req: AuthRequest, res: Response): Promise<void> => {
  const items = await Product.find({
    status: 'active',
    $expr: { $lte: ['$currentStock', '$reorderThreshold'] },
  }).sort({ currentStock: 1 });

  res.status(200).json({ success: true, count: items.length, data: items });
};
