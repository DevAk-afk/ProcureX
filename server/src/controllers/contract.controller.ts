import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Contract } from '../models/Contract.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getContracts = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, search } = req.query;
  const query: any = {};
  if (status && status !== 'all') query.status = status;
  if (search) {
    query.$or = [
      { contractNumber: { $regex: search as string, $options: 'i' } },
      { title: { $regex: search as string, $options: 'i' } },
      { vendorName: { $regex: search as string, $options: 'i' } },
    ];
  }

  const contracts = await Contract.find(query).sort({ endDate: 1 });
  res.status(200).json({ success: true, data: contracts });
};

export const getContractById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const contract = await Contract.findById(id).populate('vendorId');
  if (!contract) {
    res.status(404).json({ success: false, message: 'Contract not found.' });
    return;
  }
  res.status(200).json({ success: true, data: contract });
};

export const createContract = async (req: AuthRequest, res: Response): Promise<void> => {
  const count = await Contract.countDocuments();
  const year = new Date().getFullYear();
  const contractNumber = `CTR-${year}-${String(count + 101).padStart(4, '0')}`;

  const {
    title,
    vendorId,
    vendorName,
    category,
    startDate,
    endDate,
    contractValue,
    renewalAlertDays,
    slaTerms,
    paymentConditions,
    terminationClauses,
  } = req.body;

  const contract = await Contract.create({
    contractNumber,
    title,
    vendorId,
    vendorName,
    category: category || 'Service & Maintenance',
    startDate: startDate || new Date(),
    endDate: endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    contractValue: Number(contractValue) || 500000,
    renewalAlertDays: renewalAlertDays || 30,
    slaTerms,
    paymentConditions,
    terminationClauses,
    status: 'active',
  });

  await logAudit(req, 'CONTRACT_CREATE', 'Contract', contract._id.toString(), { contractNumber, title });
  res.status(201).json({ success: true, message: 'Contract created successfully.', data: contract });
};

export const updateContract = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const contract = await Contract.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!contract) {
    res.status(404).json({ success: false, message: 'Contract not found.' });
    return;
  }

  await logAudit(req, 'CONTRACT_UPDATE', 'Contract', contract._id.toString());
  res.status(200).json({ success: true, message: 'Contract updated.', data: contract });
};
