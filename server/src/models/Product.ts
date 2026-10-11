import mongoose, { Document, Schema } from 'mongoose';

export interface IProduct extends Document {
  sku: string;
  name: string;
  category: string;
  description?: string;
  unitOfMeasure: string;
  unitPrice: number;
  preferredVendorId?: mongoose.Types.ObjectId;
  leadTimeDays: number;
  taxRate: number; // Percentage e.g. 18 for 18% GST
  minOrderQty: number;
  currentStock: number;
  reorderThreshold: number;
  status: 'active' | 'discontinued';
  priceHistory: Array<{
    date: Date;
    price: number;
    changedBy?: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    unitOfMeasure: { type: String, default: 'Unit', trim: true },
    unitPrice: { type: Number, required: true, min: 0 },
    preferredVendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    leadTimeDays: { type: Number, default: 7 },
    taxRate: { type: Number, default: 18 },
    minOrderQty: { type: Number, default: 1 },
    currentStock: { type: Number, default: 0 },
    reorderThreshold: { type: Number, default: 10 },
    status: { type: String, enum: ['active', 'discontinued'], default: 'active' },
    priceHistory: [
      {
        date: { type: Date, default: Date.now },
        price: { type: Number, required: true },
        changedBy: { type: String },
      },
    ],
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', sku: 'text', category: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
