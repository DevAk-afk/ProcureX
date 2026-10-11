import mongoose, { Document, Schema } from 'mongoose';

export interface IRFQQuotation {
  _id?: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  vendorName: string;
  submissionDate: Date;
  lineItems: Array<{
    productId?: mongoose.Types.ObjectId;
    productName: string;
    unitPrice: number;
    quantity: number;
    total: number;
  }>;
  grandTotal: number;
  deliveryDays: number;
  paymentTerms: string;
  validityDate?: Date;
  notes?: string;
  isSelected?: boolean;
}

export interface IRFQ extends Document {
  rfqNumber: string;
  title: string;
  description?: string;
  requisitionId?: mongoose.Types.ObjectId;
  lineItems: Array<{
    productId?: mongoose.Types.ObjectId;
    productName: string;
    quantity: number;
    targetPrice?: number;
  }>;
  deadlineDate: Date;
  invitedVendors: mongoose.Types.ObjectId[];
  status: 'open' | 'closed' | 'awarded';
  quotations: IRFQQuotation[];
  awardedVendorId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RFQSchema = new Schema<IRFQ>(
  {
    rfqNumber: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    requisitionId: { type: Schema.Types.ObjectId, ref: 'Requisition' },
    lineItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        targetPrice: { type: Number },
      },
    ],
    deadlineDate: { type: Date, required: true },
    invitedVendors: [{ type: Schema.Types.ObjectId, ref: 'Vendor' }],
    status: { type: String, enum: ['open', 'closed', 'awarded'], default: 'open' },
    quotations: [
      {
        vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
        vendorName: { type: String, required: true },
        submissionDate: { type: Date, default: Date.now },
        lineItems: [
          {
            productId: { type: Schema.Types.ObjectId, ref: 'Product' },
            productName: { type: String, required: true },
            unitPrice: { type: Number, required: true },
            quantity: { type: Number, required: true },
            total: { type: Number, required: true },
          },
        ],
        grandTotal: { type: Number, required: true },
        deliveryDays: { type: Number, default: 7 },
        paymentTerms: { type: String, default: 'Net 30' },
        validityDate: { type: Date },
        notes: { type: String },
        isSelected: { type: Boolean, default: false },
      },
    ],
    awardedVendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
  },
  { timestamps: true }
);

export const RFQ = mongoose.model<IRFQ>('RFQ', RFQSchema);
