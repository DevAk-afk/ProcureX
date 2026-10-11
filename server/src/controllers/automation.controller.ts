import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { AutomationRule } from '../models/AutomationRule.js';
import { triggerAutomations } from '../services/automationService.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getAutomationRules = async (req: AuthRequest, res: Response): Promise<void> => {
  const rules = await AutomationRule.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: rules });
};

export const createAutomationRule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, description, trigger, conditions, actionType, actionConfig } = req.body;

  const rule = await AutomationRule.create({
    name,
    description,
    trigger,
    conditions: conditions || {},
    actionType: actionType || 'notification',
    actionConfig: actionConfig || {},
    isEnabled: true,
  });

  await logAudit(req, 'AUTOMATION_RULE_CREATE', 'AutomationRule', rule._id.toString(), { name });
  res.status(201).json({ success: true, message: 'Automation rule created.', data: rule });
};

export const toggleRule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const rule = await AutomationRule.findById(id);
  if (!rule) {
    res.status(404).json({ success: false, message: 'Rule not found.' });
    return;
  }

  rule.isEnabled = !rule.isEnabled;
  await rule.save();

  await logAudit(req, 'AUTOMATION_RULE_TOGGLE', 'AutomationRule', rule._id.toString(), { isEnabled: rule.isEnabled });
  res.status(200).json({ success: true, message: `Rule is now ${rule.isEnabled ? 'enabled' : 'disabled'}.`, data: rule });
};

export const testRule = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const rule = await AutomationRule.findById(id);
  if (!rule) {
    res.status(404).json({ success: false, message: 'Rule not found.' });
    return;
  }

  await triggerAutomations(rule.trigger as any, {
    referenceNumber: 'TEST-TRIGGER-001',
    productName: 'Dell Latitude 5540 Laptop',
    currentStock: 3,
    reorderThreshold: 10,
    estimatedTotal: 150000,
    requesterName: req.user?.name || 'Admin',
    link: '/app',
  });

  rule.lastRunAt = new Date();
  rule.runCount += 1;
  rule.lastExecutionStatus = 'success';
  await rule.save();

  res.status(200).json({ success: true, message: `Test execution succeeded for rule "${rule.name}". Notification dispatched.`, data: rule });
};
