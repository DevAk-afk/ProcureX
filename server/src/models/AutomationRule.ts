import mongoose, { Document, Schema } from 'mongoose';

export interface IAutomationRule extends Document {
  name: string;
  description: string;
  trigger:
    | 'requisition_submitted'
    | 'inventory_low'
    | 'invoice_due'
    | 'contract_renewal'
    | 'po_approved'
    | 'invoice_variance_high';
  conditions: Record<string, any>;
  actionType: 'notification' | 'email' | 'auto_create_po' | 'flag_discrepancy' | 'escalate';
  actionConfig: Record<string, any>;
  isEnabled: boolean;
  lastRunAt?: Date;
  runCount: number;
  lastExecutionStatus?: 'success' | 'failed' | 'skipped';
  lastExecutionError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AutomationRuleSchema = new Schema<IAutomationRule>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    trigger: {
      type: String,
      required: true,
      enum: [
        'requisition_submitted',
        'inventory_low',
        'invoice_due',
        'contract_renewal',
        'po_approved',
        'invoice_variance_high',
      ],
    },
    conditions: { type: Schema.Types.Mixed, default: {} },
    actionType: {
      type: String,
      required: true,
      enum: ['notification', 'email', 'auto_create_po', 'flag_discrepancy', 'escalate'],
    },
    actionConfig: { type: Schema.Types.Mixed, default: {} },
    isEnabled: { type: Boolean, default: true },
    lastRunAt: { type: Date },
    runCount: { type: Number, default: 0 },
    lastExecutionStatus: { type: String, enum: ['success', 'failed', 'skipped'] },
    lastExecutionError: { type: String },
  },
  { timestamps: true }
);

export const AutomationRule = mongoose.model<IAutomationRule>('AutomationRule', AutomationRuleSchema);
