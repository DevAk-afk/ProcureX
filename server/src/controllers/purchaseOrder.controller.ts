import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { logAudit } from '../middleware/auditLogger.js';
import { triggerAutomations } from '../services/automationService.js';

export const getPurchaseOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, vendorId, search, page = '1', limit = '50' } = req.query;

  const query: any = {};
  if (req.user?.role === 'Vendor' && req.user.vendorId) {
    query.vendorId = req.user.vendorId;
  } else if (vendorId && vendorId !== 'all') {
    query.vendorId = vendorId;
  }

  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { poNumber: { $regex: search as string, $options: 'i' } },
      { vendorName: { $regex: search as string, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [orders, total] = await Promise.all([
    PurchaseOrder.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    PurchaseOrder.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: orders,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
};

export const getPurchaseOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const po = await PurchaseOrder.findById(id).populate('vendorId');
  if (!po) {
    res.status(404).json({ success: false, message: 'Purchase Order not found.' });
    return;
  }
  res.status(200).json({ success: true, data: po });
};

export const createPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const count = await PurchaseOrder.countDocuments();
  const year = new Date().getFullYear();
  const poNumber = `PO-${year}-${String(count + 101).padStart(4, '0')}`;

  const {
    vendorId,
    vendorName,
    lineItems = [],
    expectedDeliveryDate,
    paymentTerms = 'Net 30',
    deliveryAddress,
    billingAddress,
    notes,
  } = req.body;

  const subtotal = lineItems.reduce((acc: number, item: any) => acc + (Number(item.quantity) * Number(item.unitPrice)), 0);
  const taxTotal = subtotal * 0.18;
  const grandTotal = subtotal + taxTotal;

  const po = await PurchaseOrder.create({
    poNumber,
    vendorId,
    vendorName,
    lineItems,
    subtotal,
    taxTotal,
    grandTotal,
    expectedDeliveryDate: expectedDeliveryDate || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    paymentTerms,
    deliveryAddress,
    billingAddress,
    notes,
    status: 'approved',
    approvalHistory: [
      {
        step: 1,
        approverId: req.user?._id,
        approverName: req.user?.name || 'Officer',
        role: req.user?.role || 'Procurement',
        status: 'approved',
        actionDate: new Date(),
      },
    ],
  });

  await logAudit(req, 'PO_CREATE', 'PurchaseOrder', po._id.toString(), { poNumber, grandTotal });
  await triggerAutomations('po_approved', {
    poNumber: po.poNumber,
    vendorName: po.vendorName,
    grandTotal: po.grandTotal,
  });

  res.status(201).json({ success: true, message: 'Purchase Order created.', data: po });
};

export const updatePOStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const po = await PurchaseOrder.findById(id);
  if (!po) {
    res.status(404).json({ success: false, message: 'Purchase Order not found.' });
    return;
  }

  po.status = status;
  if (remarks) {
    po.approvalHistory.push({
      step: po.approvalHistory.length + 1,
      approverId: req.user?._id,
      approverName: req.user?.name || 'User',
      role: req.user?.role || 'User',
      status,
      remarks,
      actionDate: new Date(),
    });
  }

  await po.save();
  await logAudit(req, 'PO_STATUS_CHANGE', 'PurchaseOrder', po._id.toString(), { status, poNumber: po.poNumber });

  res.status(200).json({ success: true, message: `PO status updated to ${status}.`, data: po });
};

export const getPurchaseOrderPrintView = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const po = await PurchaseOrder.findById(id).populate('vendorId');
  if (!po) {
    res.status(404).json({ success: false, message: 'Purchase Order not found.' });
    return;
  }

  // Generate printable enterprise HTML view
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Purchase Order ${po.poNumber} — ProcureX</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #202B31; padding: 40px; margin: 0; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #16B5A5; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: 800; color: #16B5A5; }
        .meta-table { width: 100%; margin: 30px 0; border-collapse: collapse; }
        .meta-table td { padding: 8px 12px; vertical-align: top; }
        .items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .items-table th { background: #F3F6F7; color: #202B31; padding: 12px; text-align: left; border: 1px solid #E3E9EB; }
        .items-table td { padding: 12px; border: 1px solid #E3E9EB; }
        .totals { margin-top: 20px; text-align: right; width: 300px; margin-left: auto; }
        .totals td { padding: 6px 12px; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; background: #E8F8F5; color: #119A8D; }
        @media print { button { display: none; } }
      </style>
    </head>
    <body>
      <div style="margin-bottom: 20px;">
        <button onclick="window.print()" style="background: #16B5A5; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
          Print / Save as PDF
        </button>
      </div>
      <div class="header">
        <div>
          <div class="logo">ProcureX</div>
          <div style="color: #718087; font-size: 14px; margin-top: 4px;">Smart Enterprise Procurement Platform</div>
        </div>
        <div style="text-align: right;">
          <h2 style="margin: 0; color: #202B31;">PURCHASE ORDER</h2>
          <div style="font-size: 16px; font-weight: bold; color: #119A8D; margin-top: 4px;">${po.poNumber}</div>
          <div style="font-size: 13px; color: #718087;">Date: ${new Date(po.createdAt).toLocaleDateString('en-IN')}</div>
          <div style="margin-top: 6px;"><span class="badge">${po.status.toUpperCase()}</span></div>
        </div>
      </div>

      <table class="meta-table">
        <tr>
          <td style="width: 50%;">
            <strong>Vendor:</strong><br>
            ${po.vendorName}<br>
            ${(po.vendorId as any)?.address?.street || 'Authorized Supplier'}<br>
            ${(po.vendorId as any)?.address?.city || 'Bengaluru'}, ${(po.vendorId as any)?.address?.state || 'Karnataka'}<br>
            GSTIN: ${(po.vendorId as any)?.gstin || '29AAAAA0000A1Z5'}<br>
            Payment Terms: ${po.paymentTerms}
          </td>
          <td style="width: 50%;">
            <strong>Ship / Bill To:</strong><br>
            ProcureX Global Enterprises Ltd.<br>
            ${po.deliveryAddress?.street || 'Plot 42, Tech Park Central'}<br>
            ${po.deliveryAddress?.city || 'Bengaluru'}, ${po.deliveryAddress?.state || 'Karnataka'} - ${po.deliveryAddress?.postalCode || '560100'}<br>
            Expected Delivery: ${new Date(po.expectedDeliveryDate).toLocaleDateString('en-IN')}
          </td>
        </tr>
      </table>

      <table class="items-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item / SKU</th>
            <th>Description</th>
            <th style="text-align: right;">Qty</th>
            <th style="text-align: right;">Unit Price (₹)</th>
            <th style="text-align: right;">GST Rate</th>
            <th style="text-align: right;">Total (₹)</th>
          </tr>
        </thead>
        <tbody>
          ${po.lineItems
            .map(
              (item, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><strong>${item.sku}</strong></td>
              <td>${item.productName}</td>
              <td style="text-align: right;">${item.quantity}</td>
              <td style="text-align: right;">${item.unitPrice.toLocaleString('en-IN')}</td>
              <td style="text-align: right;">${item.taxRate}%</td>
              <td style="text-align: right;"><strong>${item.total.toLocaleString('en-IN')}</strong></td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <table class="totals">
        <tr>
          <td>Subtotal:</td>
          <td>₹${po.subtotal.toLocaleString('en-IN')}</td>
        </tr>
        <tr>
          <td>GST (18%):</td>
          <td>₹${po.taxTotal.toLocaleString('en-IN')}</td>
        </tr>
        <tr style="font-weight: bold; font-size: 18px; border-top: 2px solid #E3E9EB;">
          <td>Grand Total:</td>
          <td style="color: #119A8D;">₹${po.grandTotal.toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </body>
    </html>
  `;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
};
