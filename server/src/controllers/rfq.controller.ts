import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { RFQ } from '../models/RFQ.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getRFQs = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search } = req.query;
  const query: any = {};
  if (status && status !== 'all') query.status = status;
  if (search) query.title = { $regex: search as string, $options: 'i' };

  if (req.user?.role === 'Vendor' && req.user.vendorId) {
    query.$or = [{ invitedVendors: req.user.vendorId }, { 'quotations.vendorId': req.user.vendorId }];
  }

  let rfqs = await RFQ.find(query).sort({ createdAt: -1 });

  // Vendor Privacy Rule: Vendors must never see competing vendor quotations or prices
  if (req.user?.role === 'Vendor' && req.user.vendorId) {
    const userVendorIdStr = req.user.vendorId.toString();
    rfqs = rfqs.map((rfq) => {
      const sanitized = rfq.toObject();
      sanitized.quotations = (sanitized.quotations || []).filter(
        (q: any) => q.vendorId?.toString() === userVendorIdStr
      );
      return sanitized as any;
    });
  }

  res.status(200).json({ success: true, data: rfqs });
};

export const getRFQById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const rfq = await RFQ.findById(id).populate('invitedVendors', 'name vendorCode category score');
  if (!rfq) {
    res.status(404).json({ success: false, message: 'RFQ not found.' });
    return;
  }
  res.status(200).json({ success: true, data: rfq });
};

export const createRFQ = async (req: AuthRequest, res: Response): Promise<void> => {
  const count = await RFQ.countDocuments();
  const year = new Date().getFullYear();
  const rfqNumber = `RFQ-${year}-${String(count + 1).padStart(4, '0')}`;

  const { title, description, requisitionId, lineItems, deadlineDate, invitedVendors = [] } = req.body;

  const rfq = await RFQ.create({
    rfqNumber,
    title,
    description,
    requisitionId,
    lineItems,
    deadlineDate: deadlineDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    invitedVendors,
    status: 'open',
    quotations: [],
  });

  await logAudit(req, 'RFQ_CREATE', 'RFQ', rfq._id.toString(), { rfqNumber, title });
  res.status(201).json({ success: true, message: 'RFQ published to invited suppliers.', data: rfq });
};

export const submitQuote = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { vendorId, vendorName, lineItems, grandTotal, deliveryDays, paymentTerms, notes } = req.body;

  const rfq = await RFQ.findById(id);
  if (!rfq || rfq.status !== 'open') {
    res.status(400).json({ success: false, message: 'RFQ not found or is closed for submissions.' });
    return;
  }

  const effectiveVendorId = req.user?.vendorId || vendorId;
  const effectiveVendorName = req.user?.name || vendorName || 'Vendor';

  // Check if quote already submitted by this vendor
  const existingIndex = rfq.quotations.findIndex((q) => q.vendorId.toString() === effectiveVendorId.toString());
  const quoteData = {
    vendorId: effectiveVendorId,
    vendorName: effectiveVendorName,
    submissionDate: new Date(),
    lineItems,
    grandTotal,
    deliveryDays: deliveryDays || 7,
    paymentTerms: paymentTerms || 'Net 30',
    notes,
    isSelected: false,
  };

  if (existingIndex >= 0) {
    rfq.quotations[existingIndex] = quoteData as any;
  } else {
    rfq.quotations.push(quoteData as any);
  }

  await rfq.save();
  await logAudit(req, 'RFQ_QUOTE_SUBMIT', 'RFQ', rfq._id.toString(), { vendorName: effectiveVendorName });

  res.status(200).json({ success: true, message: 'Quotation submitted successfully.', data: rfq });
};

export const awardRFQ = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { quoteId } = req.body;

  const rfq = await RFQ.findById(id);
  if (!rfq) {
    res.status(404).json({ success: false, message: 'RFQ not found.' });
    return;
  }

  const selectedQuote = rfq.quotations.find((q: any) => q._id.toString() === quoteId);
  if (!selectedQuote) {
    res.status(400).json({ success: false, message: 'Selected quotation does not exist.' });
    return;
  }

  rfq.quotations.forEach((q: any) => {
    q.isSelected = q._id.toString() === quoteId;
  });
  rfq.status = 'awarded';
  rfq.awardedVendorId = selectedQuote.vendorId;
  await rfq.save();

  // Automatically generate PO for the awarded supplier
  const count = await PurchaseOrder.countDocuments();
  const year = new Date().getFullYear();
  const poNumber = `PO-${year}-${String(count + 101).padStart(4, '0')}`;

  const po = await PurchaseOrder.create({
    poNumber,
    vendorId: selectedQuote.vendorId,
    vendorName: selectedQuote.vendorName,
    lineItems: selectedQuote.lineItems.map((item) => ({
      sku: 'SKU-RFQ',
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: 18,
      total: item.total,
    })),
    subtotal: selectedQuote.grandTotal / 1.18,
    taxTotal: selectedQuote.grandTotal - (selectedQuote.grandTotal / 1.18),
    grandTotal: selectedQuote.grandTotal,
    expectedDeliveryDate: new Date(Date.now() + selectedQuote.deliveryDays * 24 * 60 * 60 * 1000),
    paymentTerms: selectedQuote.paymentTerms,
    status: 'approved',
    notes: `Awarded from RFQ ${rfq.rfqNumber}`,
  });

  await logAudit(req, 'RFQ_AWARD', 'RFQ', rfq._id.toString(), {
    awardedVendor: selectedQuote.vendorName,
    poNumber: po.poNumber,
  });

  res.status(200).json({
    success: true,
    message: `RFQ awarded to ${selectedQuote.vendorName}. Generated PO ${po.poNumber}.`,
    data: { rfq, purchaseOrder: po },
  });
};
