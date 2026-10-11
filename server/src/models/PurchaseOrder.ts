import mongoose, { Document, Schema } from 'mongoose';
import { PO_STATUSES } from '../config/constants.js';

export interface IPurchaseOrderLineItem {
  productId?: mongoose.Types.ObjectId;
  sku: string;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface IPurchaseOrder extends Document {
  poNumber: string;
  requisitionId?: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  vendorName: string;
  vendorEmail?: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
  };
  lineItems: IPurchaseOrderLineItem[];
  subtotal: number;
  taxTotal: number;
  shippingCharges: number;
  grandTotal: number;
  status:
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'sent_to_vendor'
    | 'acknowledged'
    | 'partially_received'
    | 'fully_received'
    | 'closed'
    | 'cancelled';
  expectedDeliveryDate: Date;
  paymentTerms: string;
  approvalHistory: Array<{
    step: number;
    approverId?: mongoose.Types.ObjectId;
    approverName: string;
    role: string;
    status: string;
    remarks?: string;
    actionDate?: Date;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true, uppercase: true },
    requisitionId: { type: Schema.Types.ObjectId, ref: 'Requisition' },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String, required: true },
    vendorEmail: { type: String },
    deliveryAddress: {
      street: { type: String, default: 'Plot 42, Tech Park Central' },
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      postalCode: { type: String, default: '560100' },
    },
    billingAddress: {
      street: { type: String, default: 'ProcureX HQ, Sector 5' },
      city: { type: String, default: 'Bengaluru' },
      state: { type: String, default: 'Karnataka' },
      postalCode: { type: String, default: '560100' },
    },
    lineItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        sku: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        receivedQuantity: { type: Number, default: 0, min: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        taxRate: { type: Number, default: 18, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    taxTotal: { type: Number, required: true, min: 0 },
    shippingCharges: { type: Number, default: 0, min: 0 },
    grandTotal: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(PO_STATUSES),
      default: PO_STATUSES.APPROVED,
    },
    expectedDeliveryDate: { type: Date, required: true },
    paymentTerms: { type: String, default: 'Net 30' },
    approvalHistory: [
      {
        step: { type: Number, default: 1 },
        approverId: { type: Schema.Types.ObjectId, ref: 'User' },
        approverName: { type: String, required: true },
        role: { type: String, required: true },
        status: { type: String, default: 'approved' },
        remarks: { type: String },
        actionDate: { type: Date, default: Date.now },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
