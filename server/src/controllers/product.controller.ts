import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Product } from '../models/Product.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { search, category, status = 'active', lowStockOnly, page = '1', limit = '50' } = req.query;

  const query: any = {};
  if (status && status !== 'all') query.status = status;
  if (category && category !== 'all') query.category = category;
  if (lowStockOnly === 'true') {
    query.$expr = { $lte: ['$currentStock', '$reorderThreshold'] };
  }
  if (search) {
    query.$or = [
      { name: { $regex: search as string, $options: 'i' } },
      { sku: { $regex: search as string, $options: 'i' } },
      { category: { $regex: search as string, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).populate('preferredVendorId', 'name vendorCode').sort({ name: 1 }).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: products,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const product = await Product.findById(id).populate('preferredVendorId', 'name vendorCode');
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }
  res.status(200).json({ success: true, data: product });
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { sku, name, category, description, unitOfMeasure, unitPrice, preferredVendorId, leadTimeDays, taxRate, minOrderQty, currentStock, reorderThreshold } = req.body;

  const existing = await Product.findOne({ sku: sku.toUpperCase() });
  if (existing) {
    res.status(409).json({ success: false, message: `Product with SKU ${sku} already exists.` });
    return;
  }

  const product = await Product.create({
    sku: sku.toUpperCase(),
    name,
    category,
    description,
    unitOfMeasure: unitOfMeasure || 'Unit',
    unitPrice,
    preferredVendorId: preferredVendorId || undefined,
    leadTimeDays: leadTimeDays || 7,
    taxRate: taxRate || 18,
    minOrderQty: minOrderQty || 1,
    currentStock: currentStock || 0,
    reorderThreshold: reorderThreshold || 10,
    priceHistory: [{ date: new Date(), price: unitPrice, changedBy: req.user?.name }],
  });

  await logAudit(req, 'PRODUCT_CREATE', 'Product', product._id.toString(), { sku: product.sku, name: product.name });
  res.status(201).json({ success: true, message: 'Product created successfully.', data: product });
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const product = await Product.findById(id);
  if (!product) {
    res.status(404).json({ success: false, message: 'Product not found.' });
    return;
  }

  // Record price change if unitPrice changed
  if (updateData.unitPrice && updateData.unitPrice !== product.unitPrice) {
    product.priceHistory.push({
      date: new Date(),
      price: updateData.unitPrice,
      changedBy: req.user?.name,
    });
  }

  Object.assign(product, updateData);
  await product.save();

  await logAudit(req, 'PRODUCT_UPDATE', 'Product', product._id.toString(), { sku: product.sku });
  res.status(200).json({ success: true, message: 'Product updated successfully.', data: product });
};

export const exportProductsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  const products = await Product.find({ status: 'active' }).populate('preferredVendorId', 'name');
  const headers = ['SKU', 'Name', 'Category', 'Unit Price', 'Stock', 'Reorder Threshold', 'UOM', 'Tax Rate %', 'Preferred Supplier'];
  const rows = products.map((p) => [
    p.sku,
    `"${p.name}"`,
    `"${p.category}"`,
    p.unitPrice,
    p.currentStock,
    p.reorderThreshold,
    p.unitOfMeasure,
    p.taxRate,
    `"${(p.preferredVendorId as any)?.name || 'N/A'}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="products_export.csv"');
  res.status(200).send(csvContent);
};
