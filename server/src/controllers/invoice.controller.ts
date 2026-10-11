import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Invoice } from '../models/Invoice.js';
import { Vendor } from '../models/Vendor.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { GoodsReceipt } from '../models/GoodsReceipt.js';
import { performThreeWayMatch } from '../services/threeWayMatchingService.js';
import { logAudit } from '../middleware/auditLogger.js';
import { triggerAutomations } from '../services/automationService.js';

export const getInvoices = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, paymentStatus, vendorId, search, page = '1', limit = '50' } = req.query;

  const query: any = {};
  if (req.user?.role === 'Vendor' && req.user.vendorId) {
    query.vendorId = req.user.vendorId;
  } else if (vendorId && vendorId !== 'all') {
    query.vendorId = vendorId;
  }

  if (status && status !== 'all') query.status = status;
  if (paymentStatus && paymentStatus !== 'all') query.paymentStatus = paymentStatus;
  if (search) {
    query.$or = [
      { invoiceNumber: { $regex: search as string, $options: 'i' } },
      { poNumber: { $regex: search as string, $options: 'i' } },
      { vendorName: { $regex: search as string, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [invoices, total] = await Promise.all([
    Invoice.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Invoice.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: invoices,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
};

export const getInvoiceById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const invoice = await Invoice.findById(id).populate('vendorId');
  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found.' });
    return;
  }
  res.status(200).json({ success: true, data: invoice });
};

export const createInvoice = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    invoiceNumber,
    vendorId,
    vendorName,
    purchaseOrderId,
    grnId,
    invoiceDate,
    dueDate,
    subtotal,
    taxDetails,
    grandTotal,
    lineItems = [],
    msmeFlag = false,
  } = req.body;

  // Retrieve PO and GRN if linked
  let po = null;
  let grn = null;

  if (purchaseOrderId) {
    po = await PurchaseOrder.findById(purchaseOrderId);
  }
  if (grnId) {
    grn = await GoodsReceipt.findById(grnId);
    if (!po && grn?.purchaseOrderId) {
      po = await PurchaseOrder.findById(grn.purchaseOrderId);
    }
  } else if (po) {
    // Look up latest GRN for this PO
    grn = await GoodsReceipt.findOne({ purchaseOrderId: po._id }).sort({ createdAt: -1 });
  }

  // Calculate taxes if not provided
  const calcSubtotal = Number(subtotal) || lineItems.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0);
  const calcTax = taxDetails?.totalTax ?? (calcSubtotal * 0.18);
  const calcGrandTotal = Number(grandTotal) || (calcSubtotal + calcTax);

  // Perform 3-Way Match
  const matchResult = performThreeWayMatch(
    { grandTotal: calcGrandTotal, subtotal: calcSubtotal, lineItems },
    po,
    grn
  );

  const initialStatus = matchResult.isMatched ? 'matched' : (matchResult.discrepancies.length > 0 ? 'discrepancy' : 'received');

  const invDate = invoiceDate ? new Date(invoiceDate) : new Date();
  const msmeDueDate = msmeFlag ? new Date(invDate.getTime() + 45 * 24 * 60 * 60 * 1000) : undefined;

  let effectiveVendorId = vendorId || po?.vendorId || grn?.vendorId;
  if (!effectiveVendorId) {
    // Fallback to first active vendor in DB if detached
    const firstVendor = await Vendor.findOne();
    effectiveVendorId = firstVendor?._id;
  }

  const invoice = await Invoice.create({
    invoiceNumber,
    vendorId: effectiveVendorId,
    vendorName: vendorName || po?.vendorName || 'Supplier',
    purchaseOrderId: po?._id,
    poNumber: po?.poNumber,
    grnId: grn?._id,
    grnNumber: grn?.grnNumber,
    invoiceDate: invDate,
    dueDate: dueDate ? new Date(dueDate) : new Date(invDate.getTime() + 30 * 24 * 60 * 60 * 1000),
    subtotal: calcSubtotal,
    taxDetails: {
      cgst: taxDetails?.cgst ?? (calcTax / 2),
      sgst: taxDetails?.sgst ?? (calcTax / 2),
      igst: taxDetails?.igst ?? 0,
      totalTax: calcTax,
    },
    grandTotal: calcGrandTotal,
    amountPaid: 0,
    balanceDue: calcGrandTotal,
    status: initialStatus,
    matchingResult: matchResult,
    lineItems,
    paymentStatus: 'unpaid',
    msmeFlag,
    msmeDueDate,
  });

  await logAudit(req, 'INVOICE_CREATE', 'Invoice', invoice._id.toString(), {
    invoiceNumber,
    isMatched: matchResult.isMatched,
    status: initialStatus,
  });

  if (!matchResult.isMatched && matchResult.discrepancies.length > 0) {
    await triggerAutomations('invoice_variance_high', {
      invoiceNumber: invoice.invoiceNumber,
      poNumber: invoice.poNumber,
      varianceAmount: matchResult.varianceAmount,
      link: `/app/invoices`,
    });
  }

  res.status(201).json({
    success: true,
    message: matchResult.isMatched
      ? 'Invoice recorded and 3-way match verified.'
      : 'Invoice recorded with discrepancy flagged for review.',
    data: invoice,
  });
};

export const updateInvoiceStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found.' });
    return;
  }

  invoice.status = status;
  if (remarks) {
    invoice.matchingResult.matchingNotes = remarks;
  }

  await invoice.save();
  await logAudit(req, 'INVOICE_STATUS_CHANGE', 'Invoice', invoice._id.toString(), { status, remarks });

  res.status(200).json({ success: true, message: `Invoice status updated to ${status}.`, data: invoice });
};
