import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  managerName?: string;
  managerEmail?: string;
  budgetAllocated: number;
  budgetCommitted: number;
  budgetSpent: number;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    code: { type: String, required: true, trim: true, unique: true, uppercase: true },
    managerName: { type: String, trim: true },
    managerEmail: { type: String, trim: true, lowercase: true },
    budgetAllocated: { type: Number, default: 0 },
    budgetCommitted: { type: Number, default: 0 },
    budgetSpent: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
