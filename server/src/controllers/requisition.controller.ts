import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Requisition } from '../models/Requisition.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { logAudit } from '../middleware/auditLogger.js';
import { triggerAutomations } from '../services/automationService.js';

export const getRequisitions = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, department, search, page = '1', limit = '50' } = req.query;

  const query: any = {};

  // Privacy & Role-based scoping:
  // - Employee / Requester sees only their own created requisitions
  // - Vendor sees only requisitions where they are preferred vendor
  // - Super Admin, Admin, Purchase/Procurement Managers, Approvers can see organization/department requisitions
  if (req.user?.role === 'Employee / Requester' || req.user?.role === 'Procurement Officer') {
    // If not super admin, filter by own ID if Employee
    if (req.user.role === 'Employee / Requester') {
      query.requesterId = req.user._id;
    }
  } else if (req.user?.role === 'Vendor' && req.user.vendorId) {
    query.preferredVendorId = req.user.vendorId;
  }

  if (status && status !== 'all') query.status = status;
  if (department && department !== 'all') query.departmentName = department;
  if (search) {
    query.$or = [
      { reqNumber: { $regex: search as string, $options: 'i' } },
      { requesterName: { $regex: search as string, $options: 'i' } },
      { justification: { $regex: search as string, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [requisitions, total] = await Promise.all([
    Requisition.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    Requisition.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: requisitions,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
  });
};

export const getRequisitionById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const reqDoc = await Requisition.findById(id).populate('preferredVendorId');
  if (!reqDoc) {
    res.status(404).json({ success: false, message: 'Requisition not found.' });
    return;
  }
  res.status(200).json({ success: true, data: reqDoc });
};

export const createRequisition = async (req: AuthRequest, res: Response): Promise<void> => {
  const count = await Requisition.countDocuments();
  const year = new Date().getFullYear();
  const reqNumber = `REQ-${year}-${String(count + 1).padStart(4, '0')}`;

  const {
    departmentName,
    costCenter,
    requiredDate,
    lineItems,
    justification,
    preferredVendorId,
    preferredVendorName,
    submitNow = false,
  } = req.body;

  const estimatedTotal = (lineItems || []).reduce(
    (acc: number, item: any) => acc + (Number(item.quantity) * Number(item.estimatedUnitPrice)),
    0
  );

  const requisition = await Requisition.create({
    reqNumber,
    requesterId: req.user?._id,
    requesterName: req.user?.name,
    requesterEmail: req.user?.email,
    departmentName: departmentName || req.user?.department || 'General Operations',
    costCenter: costCenter || 'CC-101',
    requiredDate: requiredDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    lineItems: lineItems || [],
    estimatedTotal,
    justification,
    preferredVendorId: preferredVendorId || undefined,
    preferredVendorName,
    status: submitNow ? 'submitted' : 'draft',
    approvalHistory: [
      {
        step: 1,
        approverName: 'Department Manager',
        role: 'Department Manager / Approver',
        status: 'pending',
      },
    ],
  });

  await logAudit(req, 'REQUISITION_CREATE', 'Requisition', requisition._id.toString(), {
    reqNumber,
    total: estimatedTotal,
  });

  if (submitNow) {
    await triggerAutomations('requisition_submitted', {
      reqNumber: requisition.reqNumber,
      requesterName: requisition.requesterName,
      estimatedTotal: requisition.estimatedTotal,
      link: `/app/approvals`,
    });
  }

  res.status(201).json({ success: true, message: 'Requisition created successfully.', data: requisition });
};

export const submitRequisition = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const requisition = await Requisition.findById(id);

  if (!requisition) {
    res.status(404).json({ success: false, message: 'Requisition not found.' });
    return;
  }

  if (requisition.status !== 'draft') {
    res.status(400).json({ success: false, message: 'Only draft requisitions can be submitted.' });
    return;
  }

  requisition.status = 'submitted';
  await requisition.save();

  await logAudit(req, 'REQUISITION_SUBMIT', 'Requisition', requisition._id.toString(), {
    reqNumber: requisition.reqNumber,
  });

  await triggerAutomations('requisition_submitted', {
    reqNumber: requisition.reqNumber,
    requesterName: requisition.requesterName,
    estimatedTotal: requisition.estimatedTotal,
    link: `/app/approvals`,
  });

  res.status(200).json({ success: true, message: 'Requisition submitted for approval.', data: requisition });
};

export const approveRequisition = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { remarks = 'Approved after budget and business need review.' } = req.body;

  const requisition = await Requisition.findById(id);
  if (!requisition) {
    res.status(404).json({ success: false, message: 'Requisition not found.' });
    return;
  }

  if (requisition.status !== 'submitted') {
    res.status(400).json({ success: false, message: `Cannot approve requisition with status '${requisition.status}'.` });
    return;
  }

  // Self-approval restriction: Requester cannot approve their own requisition unless Super Admin
  if (
    req.user?.role !== 'Super Admin' &&
    requisition.requesterId.toString() === req.user?._id.toString()
  ) {
    res.status(403).json({
      success: false,
      message: 'Self-approval policy violation: You cannot approve your own purchase requisition.',
    });
    return;
  }

  requisition.status = 'approved';
  requisition.approvalHistory.push({
    step: requisition.approvalHistory.length + 1,
    approverId: req.user?._id,
    approverName: req.user?.name || 'Authorized Approver',
    role: req.user?.role || 'Approver',
    status: 'approved',
    remarks,
    actionDate: new Date(),
  });

  await requisition.save();
  await logAudit(req, 'REQUISITION_APPROVE', 'Requisition', requisition._id.toString(), {
    reqNumber: requisition.reqNumber,
    approver: req.user?.name,
  });

  res.status(200).json({ success: true, message: 'Requisition approved successfully.', data: requisition });
};

export const rejectRequisition = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { reason = 'Rejected by approver.' } = req.body;

  const requisition = await Requisition.findById(id);
  if (!requisition) {
    res.status(404).json({ success: false, message: 'Requisition not found.' });
    return;
  }

  requisition.status = 'rejected';
  requisition.approvalHistory.push({
    step: requisition.approvalHistory.length + 1,
    approverId: req.user?._id,
    approverName: req.user?.name || 'Approver',
    role: req.user?.role || 'Approver',
    status: 'rejected',
    remarks: reason,
    actionDate: new Date(),
  });

  await requisition.save();
  await logAudit(req, 'REQUISITION_REJECT', 'Requisition', requisition._id.toString(), {
    reqNumber: requisition.reqNumber,
    reason,
  });

  res.status(200).json({ success: true, message: 'Requisition rejected.', data: requisition });
};

export const convertToPO = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { vendorId, vendorName, paymentTerms = 'Net 30' } = req.body;

  const requisition = await Requisition.findById(id);
  if (!requisition) {
    res.status(404).json({ success: false, message: 'Requisition not found.' });
    return;
  }

  if (requisition.status !== 'approved') {
    res.status(400).json({ success: false, message: 'Only approved requisitions can be converted to Purchase Orders.' });
    return;
  }

  const targetVendorId = vendorId || requisition.preferredVendorId;
  const targetVendorName = vendorName || requisition.preferredVendorName || 'Selected Supplier';

  if (!targetVendorId) {
    res.status(400).json({ success: false, message: 'A vendor must be specified to generate the Purchase Order.' });
    return;
  }

  const count = await PurchaseOrder.countDocuments();
  const year = new Date().getFullYear();
  const poNumber = `PO-${year}-${String(count + 101).padStart(4, '0')}`;

  const poLineItems = requisition.lineItems.map((item) => ({
    productId: item.productId,
    sku: item.sku,
    productName: item.productName,
    quantity: item.quantity,
    receivedQuantity: 0,
    unitPrice: item.estimatedUnitPrice,
    discount: 0,
    taxRate: 18,
    total: item.quantity * item.estimatedUnitPrice * 1.18,
  }));

  const subtotal = requisition.lineItems.reduce((acc, item) => acc + item.quantity * item.estimatedUnitPrice, 0);
  const taxTotal = subtotal * 0.18;
  const grandTotal = subtotal + taxTotal;

  const po = await PurchaseOrder.create({
    poNumber,
    requisitionId: requisition._id,
    vendorId: targetVendorId,
    vendorName: targetVendorName,
    lineItems: poLineItems,
    subtotal,
    taxTotal,
    shippingCharges: 0,
    grandTotal,
    status: 'approved',
    expectedDeliveryDate: requisition.requiredDate,
    paymentTerms,
    approvalHistory: [
      {
        step: 1,
        approverId: req.user?._id,
        approverName: req.user?.name,
        role: req.user?.role,
        status: 'approved',
        remarks: `Converted from approved requisition ${requisition.reqNumber}`,
        actionDate: new Date(),
      },
    ],
  });

  requisition.status = 'converted_to_po';
  requisition.purchaseOrderId = po._id;
  await requisition.save();

  await logAudit(req, 'REQUISITION_CONVERT_PO', 'Requisition', requisition._id.toString(), {
    poNumber: po.poNumber,
  });

  res.status(201).json({
    success: true,
    message: `Purchase Order ${po.poNumber} created successfully from requisition.`,
    data: po,
  });
};
