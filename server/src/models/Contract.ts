import mongoose, { Document, Schema } from 'mongoose';

export interface IContract extends Document {
  contractNumber: string;
  title: string;
  vendorId: mongoose.Types.ObjectId;
  vendorName: string;
  category: string;
  startDate: Date;
  endDate: Date;
  contractValue: number;
  renewalAlertDays: number;
  slaTerms: string;
  paymentConditions: string;
  terminationClauses: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'terminated';
  documentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    contractNumber: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true, trim: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String, required: true },
    category: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    contractValue: { type: Number, required: true, min: 0 },
    renewalAlertDays: { type: Number, default: 30 },
    slaTerms: { type: String, default: 'Standard 99.5% uptime SLA, 24-hr resolution' },
    paymentConditions: { type: String, default: 'Net 30 days after invoice verification' },
    terminationClauses: { type: String, default: '30-day prior written notice required' },
    status: {
      type: String,
      enum: ['active', 'expiring_soon', 'expired', 'terminated'],
      default: 'active',
    },
    documentUrl: { type: String },
  },
  { timestamps: true }
);

export const Contract = mongoose.model<IContract>('Contract', ContractSchema);
