import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import { Vendor } from '../models/Vendor.js';
import { calculateVendorScore, recalculateAllVendorScores } from '../services/scoringService.js';
import { logAudit } from '../middleware/auditLogger.js';

export const getVendors = async (req: AuthRequest, res: Response): Promise<void> => {
  const {
    search,
    category,
    risk,
    status,
    minScore,
    sortBy = 'score',
    order = 'desc',
    page = '1',
    limit = '50',
  } = req.query;

  const query: any = {};

  // Vendor role isolation
  if (req.user?.role === 'Vendor' && req.user.vendorId) {
    query._id = req.user.vendorId;
  } else {
    if (status && status !== 'all') {
      query.status = status;
    } else if (!status) {
      query.status = { $ne: 'archived' };
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (risk && risk !== 'all') {
      query.riskRating = risk;
    }
    if (minScore) {
      query.score = { $gte: Number(minScore) };
    }
    if (search) {
      query.$or = [
        { name: { $regex: search as string, $options: 'i' } },
        { vendorCode: { $regex: search as string, $options: 'i' } },
        { contactPerson: { $regex: search as string, $options: 'i' } },
        { category: { $regex: search as string, $options: 'i' } },
      ];
    }
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const sortObj: any = {};
  sortObj[sortBy as string] = sortOrder;

  const pageNum = parseInt(page as string, 10) || 1;
  const limitNum = parseInt(limit as string, 10) || 50;
  const skip = (pageNum - 1) * limitNum;

  const [vendors, total] = await Promise.all([
    Vendor.find(query).sort(sortObj).skip(skip).limit(limitNum),
    Vendor.countDocuments(query),
  ]);

  // Aggregate scorecard statistics
  const allActiveVendors = await Vendor.find({ status: 'active' });
  const averageScore = allActiveVendors.length
    ? Math.round(allActiveVendors.reduce((acc, v) => acc + v.score, 0) / allActiveVendors.length)
    : 0;
  const avgOnTime = allActiveVendors.length
    ? Math.round(allActiveVendors.reduce((acc, v) => acc + v.onTimeDeliveryRate, 0) / allActiveVendors.length)
    : 0;
  const lowRiskCount = allActiveVendors.filter((v) => v.riskRating === 'Low').length;
  const highRiskCount = allActiveVendors.filter((v) => v.riskRating === 'High').length;

  res.status(200).json({
    success: true,
    data: vendors,
    pagination: {
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      limit: limitNum,
    },
    metrics: {
      totalActive: allActiveVendors.length,
      averageScore,
      averageOnTimeDelivery: avgOnTime,
      lowRiskCount,
      highRiskCount,
    },
  });
};

export const getVendorById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const vendor = await Vendor.findById(id);

  if (!vendor) {
    res.status(404).json({ success: false, message: 'Vendor not found.' });
    return;
  }

  res.status(200).json({ success: true, data: vendor });
};

export const createVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  const count = await Vendor.countDocuments();
  const vendorCode = `VND-${String(count + 101).padStart(4, '0')}`;

  const {
    name,
    contactPerson,
    email,
    phone,
    address,
    category,
    productsAndServices = [],
    gstin,
    paymentTerms = 'Net 30',
    onTimeDeliveryRate = 85,
    qualityScore = 85,
    priceCompetitiveness = 80,
    complianceScore = 90,
  } = req.body;

  const { score, riskRating } = calculateVendorScore({
    onTimeDeliveryRate,
    qualityScore,
    priceCompetitiveness,
    complianceScore,
  });

  const vendor = await Vendor.create({
    vendorCode,
    name,
    contactPerson,
    email,
    phone,
    address,
    category,
    productsAndServices,
    gstin,
    paymentTerms,
    score,
    riskRating,
    onTimeDeliveryRate,
    qualityScore,
    priceCompetitiveness,
    complianceScore,
    status: 'active',
    rank: count + 1,
    spendHistory: [
      { month: 'Nov', amount: 120000 },
      { month: 'Dec', amount: 150000 },
      { month: 'Jan', amount: 190000 },
    ],
    performanceHistory: [
      { date: 'Nov', delivery: onTimeDeliveryRate, quality: qualityScore, price: priceCompetitiveness },
      { date: 'Dec', delivery: onTimeDeliveryRate, quality: qualityScore, price: priceCompetitiveness },
      { date: 'Jan', delivery: onTimeDeliveryRate, quality: qualityScore, price: priceCompetitiveness },
    ],
  });

  await logAudit(req, 'VENDOR_CREATE', 'Vendor', vendor._id.toString(), { name: vendor.name, code: vendor.vendorCode });
  await recalculateAllVendorScores();

  res.status(201).json({ success: true, message: 'Vendor created successfully.', data: vendor });
};

export const updateVendor = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const updateData = req.body;

  const vendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!vendor) {
    res.status(404).json({ success: false, message: 'Vendor not found.' });
    return;
  }

  // Recalculate score if metrics changed
  if (
    updateData.onTimeDeliveryRate !== undefined ||
    updateData.qualityScore !== undefined ||
    updateData.priceCompetitiveness !== undefined ||
    updateData.complianceScore !== undefined
  ) {
    const { score, riskRating } = calculateVendorScore(vendor);
    vendor.score = score;
    vendor.riskRating = riskRating;
    await vendor.save();
    await recalculateAllVendorScores();
  }

  await logAudit(req, 'VENDOR_UPDATE', 'Vendor', vendor._id.toString(), { name: vendor.name });
  res.status(200).json({ success: true, message: 'Vendor updated successfully.', data: vendor });
};

export const updateVendorStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, reason } = req.body;

  const vendor = await Vendor.findById(id);
  if (!vendor) {
    res.status(404).json({ success: false, message: 'Vendor not found.' });
    return;
  }

  vendor.status = status;
  if (reason) vendor.rejectionReason = reason;
  await vendor.save();

  await logAudit(req, 'VENDOR_STATUS_CHANGE', 'Vendor', vendor._id.toString(), { status, reason });
  res.status(200).json({ success: true, message: `Vendor status updated to ${status}.`, data: vendor });
};

export const recalculateScores = async (req: AuthRequest, res: Response): Promise<void> => {
  const weights = req.body.weights;
  await recalculateAllVendorScores(weights);
  res.status(200).json({ success: true, message: 'All vendor scores and ranks recalculated successfully.' });
};

export const exportVendorsCSV = async (req: AuthRequest, res: Response): Promise<void> => {
  const vendors = await Vendor.find({ status: { $ne: 'archived' } }).sort({ rank: 1 });
  const headers = ['Vendor Code', 'Name', 'Category', 'Contact Person', 'Email', 'Score', 'Rank', 'Risk', 'Delivery %', 'Quality %', 'Price %', 'Status'];
  const rows = vendors.map((v) => [
    v.vendorCode,
    `"${v.name}"`,
    `"${v.category}"`,
    `"${v.contactPerson}"`,
    v.email,
    v.score,
    v.rank,
    v.riskRating,
    v.onTimeDeliveryRate,
    v.qualityScore,
    v.priceCompetitiveness,
    v.status,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="vendors_export.csv"');
  res.status(200).send(csvContent);
};
