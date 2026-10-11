import mongoose, { Document, Schema } from 'mongoose';

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId;
  warehouse: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  reorderThreshold: number;
  lastRestockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: String, required: true, default: 'Main Warehouse' },
    quantityOnHand: { type: Number, required: true, default: 0, min: 0 },
    quantityReserved: { type: Number, default: 0, min: 0 },
    quantityAvailable: { type: Number, default: 0, min: 0 },
    reorderThreshold: { type: Number, default: 10, min: 0 },
    lastRestockedAt: { type: Date },
  },
  { timestamps: true }
);

InventorySchema.index({ productId: 1, warehouse: 1 }, { unique: true });

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
