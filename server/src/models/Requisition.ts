import mongoose, { Document, Schema } from 'mongoose';
import { REQUISITION_STATUSES } from '../config/constants.js';

export interface IRequisitionLineItem {
  productId?: mongoose.Types.ObjectId;
  sku: string;
  productName: string;
  quantity: number;
  estimatedUnitPrice: number;
  total: number;
}

export interface IApprovalHistory {
  step: number;
  approverId?: mongoose.Types.ObjectId;
  approverName: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  remarks?: string;
  actionDate?: Date;
}

export interface IRequisition extends Document {
  reqNumber: string;
  requesterId: mongoose.Types.ObjectId;
  requesterName: string;
  requesterEmail: string;
  departmentId?: mongoose.Types.ObjectId;
  departmentName: string;
  costCenter?: string;
  requiredDate: Date;
  lineItems: IRequisitionLineItem[];
  estimatedTotal: number;
  justification: string;
  preferredVendorId?: mongoose.Types.ObjectId;
  preferredVendorName?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'converted_to_po';
  approvalHistory: IApprovalHistory[];
  purchaseOrderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RequisitionSchema = new Schema<IRequisition>(
  {
    reqNumber: { type: String, required: true, unique: true, uppercase: true },
    requesterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requesterName: { type: String, required: true },
    requesterEmail: { type: String, required: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    departmentName: { type: String, required: true },
    costCenter: { type: String },
    requiredDate: { type: Date, required: true },
    lineItems: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product' },
        sku: { type: String, required: true },
        productName: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        estimatedUnitPrice: { type: Number, required: true, min: 0 },
        total: { type: Number, required: true, min: 0 },
      },
    ],
    estimatedTotal: { type: Number, required: true, min: 0 },
    justification: { type: String, required: true },
    preferredVendorId: { type: Schema.Types.ObjectId, ref: 'Vendor' },
    preferredVendorName: { type: String },
    status: {
      type: String,
      enum: Object.values(REQUISITION_STATUSES),
      default: REQUISITION_STATUSES.DRAFT,
    },
    approvalHistory: [
      {
        step: { type: Number, default: 1 },
        approverId: { type: Schema.Types.ObjectId, ref: 'User' },
        approverName: { type: String, required: true },
        role: { type: String, required: true },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected', 'changes_requested'],
          default: 'pending',
        },
        remarks: { type: String },
        actionDate: { type: Date },
      },
    ],
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
  },
  { timestamps: true }
);

export const Requisition = mongoose.model<IRequisition>('Requisition', RequisitionSchema);
