import mongoose, { Document, Schema } from 'mongoose';
import { VENDOR_STATUSES } from '../config/constants.js';

export interface IVendor extends Document {
  vendorCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  category: string;
  productsAndServices: string[];
  gstin?: string;
  paymentTerms: string;
  certifications: string[];
  documents: Array<{
    name: string;
    type: string;
    url: string;
    uploadedAt: Date;
    status: 'verified' | 'pending' | 'expired';
  }>;
  status: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';
  rejectionReason?: string;
  score: number;
  rank: number;
  rankTrend: 'up' | 'down' | 'stable';
  onTimeDeliveryRate: number;
  qualityScore: number;
  priceCompetitiveness: number;
  complianceScore: number;
  riskRating: 'Low' | 'Medium' | 'High';
  spendHistory: Array<{ month: string; amount: number }>;
  performanceHistory: Array<{ date: string; delivery: number; quality: number; price: number }>;
  internalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VendorSchema = new Schema<IVendor>(
  {
    vendorCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, default: 'India', trim: true },
      postalCode: { type: String, trim: true },
    },
    category: { type: String, required: true, trim: true },
    productsAndServices: [{ type: String, trim: true }],
    gstin: { type: String, trim: true, uppercase: true },
    paymentTerms: { type: String, default: 'Net 30', trim: true },
    certifications: [{ type: String, trim: true }],
    documents: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        url: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['verified', 'pending', 'expired'], default: 'pending' },
      },
    ],
    status: {
      type: String,
      enum: Object.values(VENDOR_STATUSES),
      default: VENDOR_STATUSES.ACTIVE,
    },
    rejectionReason: { type: String, trim: true },
    score: { type: Number, default: 0, min: 0, max: 100 },
    rank: { type: Number, default: 0 },
    rankTrend: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    onTimeDeliveryRate: { type: Number, default: 0, min: 0, max: 100 },
    qualityScore: { type: Number, default: 0, min: 0, max: 100 },
    priceCompetitiveness: { type: Number, default: 0, min: 0, max: 100 },
    complianceScore: { type: Number, default: 0, min: 0, max: 100 },
    riskRating: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
    spendHistory: [
      {
        month: { type: String },
        amount: { type: Number },
      },
    ],
    performanceHistory: [
      {
        date: { type: String },
        delivery: { type: Number },
        quality: { type: Number },
        price: { type: Number },
      },
    ],
    internalNotes: { type: String, trim: true },
  },
  { timestamps: true }
);

VendorSchema.index({ name: 'text', vendorCode: 'text', category: 'text' });

export const Vendor = mongoose.model<IVendor>('Vendor', VendorSchema);
