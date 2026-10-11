import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Budget } from '../models/Budget.js';
import { Department } from '../models/Department.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getBudgets = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fiscalYear } = req.query;
  const query: any = {};
  if (fiscalYear) query.fiscalYear = fiscalYear;

  const budgets = await Budget.find(query).populate('departmentId');
  res.status(200).json({ success: true, data: budgets });
};

export const createBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  const { fiscalYear, departmentId, departmentName, costCenter, totalAllocated, warningThresholdPercent = 80 } = req.body;

  const allocated = Number(totalAllocated);
  const budget = await Budget.create({
    fiscalYear: fiscalYear || 'FY 2025-26',
    departmentId,
    departmentName,
    costCenter: costCenter || 'CC-101',
    totalAllocated: allocated,
    committedAmount: 0,
    actualSpent: 0,
    availableBalance: allocated,
    warningThresholdPercent,
  });

  await logAudit(req, 'BUDGET_CREATE', 'Budget', budget._id.toString(), { departmentName, allocated });
  res.status(201).json({ success: true, message: 'Budget allocated successfully.', data: budget });
};

export const updateBudget = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { totalAllocated, warningThresholdPercent } = req.body;

  const budget = await Budget.findById(id);
  if (!budget) {
    res.status(404).json({ success: false, message: 'Budget not found.' });
    return;
  }

  if (totalAllocated !== undefined) {
    budget.totalAllocated = Number(totalAllocated);
    budget.availableBalance = budget.totalAllocated - budget.committedAmount - budget.actualSpent;
  }
  if (warningThresholdPercent !== undefined) {
    budget.warningThresholdPercent = Number(warningThresholdPercent);
  }

  await budget.save();
  await logAudit(req, 'BUDGET_UPDATE', 'Budget', budget._id.toString());

  res.status(200).json({ success: true, message: 'Budget updated.', data: budget });
};
