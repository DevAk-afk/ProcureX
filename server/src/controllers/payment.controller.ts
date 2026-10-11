import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Payment } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getPayments = async (req: AuthRequest, res: Response): Promise<void> => {
  const { vendorId, search } = req.query;
  const query: any = {};
  if (req.user?.role === 'Vendor' && req.user.vendorId) {
    query.vendorId = req.user.vendorId;
  } else if (vendorId) {
    query.vendorId = vendorId;
  }
  if (search) {
    query.$or = [
      { paymentNumber: { $regex: search as string, $options: 'i' } },
      { invoiceNumber: { $regex: search as string, $options: 'i' } },
      { referenceNumber: { $regex: search as string, $options: 'i' } },
    ];
  }

  const payments = await Payment.find(query).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: payments });
};

export const createPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { invoiceId, amount, paymentMethod = 'neft_rtgs', referenceNumber, notes } = req.body;

  const invoice = await Invoice.findById(invoiceId);
  if (!invoice) {
    res.status(404).json({ success: false, message: 'Invoice not found.' });
    return;
  }

  const payAmount = Number(amount);
  if (payAmount <= 0) {
    res.status(400).json({ success: false, message: 'Payment amount must be greater than zero.' });
    return;
  }

  if (payAmount > invoice.balanceDue) {
    res.status(400).json({
      success: false,
      message: `Payment amount (₹${payAmount}) exceeds invoice balance due (₹${invoice.balanceDue}).`,
    });
    return;
  }

  const count = await Payment.countDocuments();
  const year = new Date().getFullYear();
  const paymentNumber = `PAY-${year}-${String(count + 101).padStart(4, '0')}`;

  const payment = await Payment.create({
    paymentNumber,
    invoiceId: invoice._id,
    invoiceNumber: invoice.invoiceNumber,
    vendorId: invoice.vendorId,
    vendorName: invoice.vendorName,
    amount: payAmount,
    paymentMethod,
    referenceNumber: referenceNumber || `UTR-${Date.now()}`,
    status: 'completed',
    recordedBy: req.user?.name || 'Finance Officer',
    notes,
  });

  // Update invoice balance and statuses
  invoice.amountPaid += payAmount;
  invoice.balanceDue = Number((invoice.grandTotal - invoice.amountPaid).toFixed(2));

  if (invoice.balanceDue <= 0.01) {
    invoice.balanceDue = 0;
    invoice.paymentStatus = 'paid';
    invoice.status = 'paid';
  } else {
    invoice.paymentStatus = 'partial';
  }
  await invoice.save();

  await logAudit(req, 'PAYMENT_RECORD', 'Payment', payment._id.toString(), {
    paymentNumber,
    invoiceNumber: invoice.invoiceNumber,
    amount: payAmount,
  });

  res.status(201).json({
    success: true,
    message: `Payment ${paymentNumber} recorded successfully for invoice ${invoice.invoiceNumber}.`,
    data: payment,
  });
};
