import mongoose, { Document, Schema } from 'mongoose';

export interface IGoodsReceiptLineItem {
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  damagedQuantity: number;
  rejectionReason?: string;
}

export interface IGoodsReceipt extends Document {
  grnNumber: string;
  purchaseOrderId: mongoose.Types.ObjectId;
  poNumber: string;
  vendorId: mongoose.Types.ObjectId;
  vendorName: string;
  receivedDate: Date;
  receivedBy: string;
  warehouseLocation: string;
  lineItems: IGoodsReceiptLineItem[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoodsReceiptSchema = new Schema<IGoodsReceipt>(
  {
    grnNumber: { type: String, required: true, unique: true, uppercase: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    poNumber: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String, required: true },
    receivedDate: { type: Date, default: Date.now },
    receivedBy: { type: String, required: true },
    warehouseLocation: { type: String, default: 'Main Warehouse - Bengaluru', trim: true },
    lineItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        productName: { type: String, required: true },
        sku: { type: String, required: true },
        orderedQuantity: { type: Number, required: true, min: 1 },
        receivedQuantity: { type: Number, required: true, min: 0 },
        acceptedQuantity: { type: Number, required: true, min: 0 },
        rejectedQuantity: { type: Number, default: 0, min: 0 },
        damagedQuantity: { type: Number, default: 0, min: 0 },
        rejectionReason: { type: String },
      },
    ],
    notes: { type: String },
  },
  { timestamps: true }
);

export const GoodsReceipt = mongoose.model<IGoodsReceipt>('GoodsReceipt', GoodsReceiptSchema);
