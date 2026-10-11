import { AutomationRule } from '../models/AutomationRule.js';
import { Notification } from '../models/Notification.js';

export const triggerAutomations = async (
  triggerType:
    | 'requisition_submitted'
    | 'inventory_low'
    | 'invoice_due'
    | 'contract_renewal'
    | 'po_approved'
    | 'invoice_variance_high',
  payload: Record<string, any>
): Promise<void> => {
  try {
    const rules = await AutomationRule.find({ trigger: triggerType, isEnabled: true });

    for (const rule of rules) {
      try {
        if (rule.actionType === 'notification') {
          let title = `[Automated Alert] ${rule.name}`;
          let message = `Triggered for ${payload.referenceNumber || payload.id || 'event'}.`;

          if (triggerType === 'inventory_low') {
            title = `Low Stock Alert: ${payload.productName}`;
            message = `Current stock (${payload.currentStock}) is below reorder threshold (${payload.reorderThreshold}).`;
          } else if (triggerType === 'requisition_submitted') {
            title = `New Requisition for Approval: ${payload.reqNumber}`;
            message = `Requisition by ${payload.requesterName} for ₹${payload.estimatedTotal?.toLocaleString('en-IN')} is awaiting review.`;
          } else if (triggerType === 'invoice_variance_high') {
            title = `Invoice Discrepancy Flagged: ${payload.invoiceNumber}`;
            message = `Variance of ₹${payload.varianceAmount} detected against PO ${payload.poNumber}.`;
          } else if (triggerType === 'po_approved') {
            title = `PO Approved: ${payload.poNumber}`;
            message = `Purchase order for ₹${payload.grandTotal?.toLocaleString('en-IN')} issued to ${payload.vendorName}.`;
          }

          await Notification.create({
            roleScope: rule.actionConfig?.targetRole || 'all',
            title,
            message,
            type: triggerType === 'inventory_low' || triggerType === 'invoice_variance_high' ? 'warning' : 'info',
            link: payload.link || '/app',
          });
        }

        rule.lastRunAt = new Date();
        rule.runCount += 1;
        rule.lastExecutionStatus = 'success';
        await rule.save();
      } catch (err: any) {
        rule.lastExecutionStatus = 'failed';
        rule.lastExecutionError = err.message;
        await rule.save();
      }
    }
  } catch (err: any) {
    console.error('[AutomationService] Error executing automations:', err.message);
  }
};
