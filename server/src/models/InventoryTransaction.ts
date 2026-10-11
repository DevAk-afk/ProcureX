import mongoose, { Document, Schema } from 'mongoose';

export interface IInventoryTransaction extends Document {
  transactionNumber: string;
  productId: mongoose.Types.ObjectId;
  productName: string;
  sku: string;
  warehouse: string;
  type: 'receipt' | 'issue' | 'adjustment' | 'transfer';
  quantityDelta: number; // positive for addition, negative for deduction
  balanceAfter: number;
  referenceType: 'grn' | 'manual' | 'po' | 'dispatch';
  referenceId?: string;
  reason: string;
  performedBy: string;
  createdAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    transactionNumber: { type: String, required: true, unique: true, uppercase: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    sku: { type: String, required: true },
    warehouse: { type: String, required: true, default: 'Main Warehouse' },
    type: { type: String, enum: ['receipt', 'issue', 'adjustment', 'transfer'], required: true },
    quantityDelta: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    referenceType: { type: String, enum: ['grn', 'manual', 'po', 'dispatch'], required: true },
    referenceId: { type: String },
    reason: { type: String, required: true },
    performedBy: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const InventoryTransaction = mongoose.model<IInventoryTransaction>(
  'InventoryTransaction',
  InventoryTransactionSchema
);
