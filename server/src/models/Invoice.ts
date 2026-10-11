import mongoose, { Document, Schema } from 'mongoose';
import { INVOICE_STATUSES } from '../config/constants.js';

export interface IInvoiceLineItem {
  productId?: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface IInvoice extends Document {
  invoiceNumber: string;
  vendorId: mongoose.Types.ObjectId;
  vendorName: string;
  purchaseOrderId?: mongoose.Types.ObjectId;
  poNumber?: string;
  grnId?: mongoose.Types.ObjectId;
  grnNumber?: string;
  invoiceDate: Date;
  dueDate: Date;
  currency: string;
  subtotal: number;
  taxDetails: {
    cgst: number;
    sgst: number;
    igst: number;
    totalTax: number;
  };
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status:
    | 'received'
    | 'matching'
    | 'matched'
    | 'discrepancy'
    | 'approved'
    | 'paid'
    | 'rejected';
  matchingResult: {
    isMatched: boolean;
    hasPriceVariance: boolean;
    hasQuantityVariance: boolean;
    hasTaxVariance: boolean;
    varianceAmount: number;
    discrepancies: string[];
    matchingNotes?: string;
  };
  lineItems: IInvoiceLineItem[];
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  msmeFlag?: boolean;
  msmeDueDate?: Date;
  fileUrl?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, trim: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String, required: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    poNumber: { type: String },
    grnId: { type: Schema.Types.ObjectId, ref: 'GoodsReceipt' },
    grnNumber: { type: String },
    invoiceDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    currency: { type: String, default: 'INR' },
    subtotal: { type: Number, required: true, min: 0 },
    taxDetails: {
      cgst: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
      totalTax: { type: Number, default: 0 },
    },
    grandTotal: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balanceDue: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(INVOICE_STATUSES),
      default: INVOICE_STATUSES.RECEIVED,
    },
    matchingResult: {
      isMatched: { type: Boolean, default: false },
      hasPriceVariance: { type: Boolean, default: false },
      hasQuantityVariance: { type: Boolean, default: false },
      hasTaxVariance: { type: Boolean, default: false },
      varianceAmount: { type: Number, default: 0 },
      discrepancies: [{ type: String }],
      matchingNotes: { type: String },
    },
    lineItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String, required: true },
        sku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid', 'overdue'],
      default: 'unpaid',
    },
    msmeFlag: { type: Boolean, default: false },
    msmeDueDate: { type: Date },
    fileUrl: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

InvoiceSchema.index({ invoiceNumber: 1, vendorId: 1 }, { unique: true });

export const Invoice = mongoose.model<IInvoice>('Invoice', InvoiceSchema);
