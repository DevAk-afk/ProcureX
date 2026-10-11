import mongoose, { Document, Schema } from 'mongoose';

export interface IBudget extends Document {
  fiscalYear: string; // e.g. "FY 2025-26"
  departmentId: mongoose.Types.ObjectId;
  departmentName: string;
  costCenter: string;
  totalAllocated: number;
  committedAmount: number; // approved PO commitments
  actualSpent: number; // invoices paid
  availableBalance: number;
  warningThresholdPercent: number; // default 80%
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema = new Schema<IBudget>(
  {
    fiscalYear: { type: String, required: true, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true },
    departmentName: { type: String, required: true },
    costCenter: { type: String, required: true, trim: true },
    totalAllocated: { type: Number, required: true, min: 0 },
    committedAmount: { type: Number, default: 0, min: 0 },
    actualSpent: { type: Number, default: 0, min: 0 },
    availableBalance: { type: Number, required: true },
    warningThresholdPercent: { type: Number, default: 80, min: 1, max: 100 },
    currency: { type: String, default: 'INR' },
  },
  { timestamps: true }
);

BudgetSchema.index({ fiscalYear: 1, departmentId: 1 }, { unique: true });

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);
