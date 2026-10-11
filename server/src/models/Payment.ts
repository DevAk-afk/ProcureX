import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  paymentNumber: string;
  invoiceId: mongoose.Types.ObjectId;
  invoiceNumber: string;
  vendorId: mongoose.Types.ObjectId;
  vendorName: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: 'bank_transfer' | 'neft_rtgs' | 'cheque' | 'upi' | 'corporate_card';
  referenceNumber: string;
  status: 'completed' | 'pending' | 'failed';
  recordedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentNumber: { type: String, required: true, unique: true, uppercase: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    invoiceNumber: { type: String, required: true },
    vendorId: { type: Schema.Types.ObjectId, ref: 'Vendor', required: true },
    vendorName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, default: Date.now },
    paymentMethod: {
      type: String,
      enum: ['bank_transfer', 'neft_rtgs', 'cheque', 'upi', 'corporate_card'],
      default: 'neft_rtgs',
    },
    referenceNumber: { type: String, required: true, trim: true },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'completed' },
    recordedBy: { type: String, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
