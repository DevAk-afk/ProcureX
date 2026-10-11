import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Department } from '../models/Department.js';
import { Vendor } from '../models/Vendor.js';
import { Product } from '../models/Product.js';
import { Requisition } from '../models/Requisition.js';
import { PurchaseOrder } from '../models/PurchaseOrder.js';
import { GoodsReceipt } from '../models/GoodsReceipt.js';
import { InventoryTransaction } from '../models/InventoryTransaction.js';
import { Invoice } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Budget } from '../models/Budget.js';
import { Contract } from '../models/Contract.js';
import { AutomationRule } from '../models/AutomationRule.js';
import { Notification } from '../models/Notification.js';
import { ROLES } from '../config/constants.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async (options: { clearExisting?: boolean } = {}) => {
  const shouldClear = options.clearExisting ?? (process.argv.includes('--reset') || process.argv.includes('--force'));

  const existingUsers = await User.countDocuments();
  if (existingUsers > 0 && !shouldClear) {
    console.log(`[Seed] Safe mode active: ${existingUsers} existing user accounts detected in database.`);
    console.log('[Seed] Preserving persistent database records. (Use "npm run seed -- --reset" to force clear & reseed).');
    return;
  }

  console.log('[Seed] Starting database seeding for ProcureX...');

  if (shouldClear) {
    console.log('[Seed] Clearing existing records for clean baseline setup...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Vendor.deleteMany({}),
      Product.deleteMany({}),
      Requisition.deleteMany({}),
      PurchaseOrder.deleteMany({}),
      GoodsReceipt.deleteMany({}),
      InventoryTransaction.deleteMany({}),
      Invoice.deleteMany({}),
      Payment.deleteMany({}),
      Budget.deleteMany({}),
      Contract.deleteMany({}),
      AutomationRule.deleteMany({}),
      Notification.deleteMany({}),
    ]);
  }

  // 2. Departments
  const departments = await Department.create([
    { name: 'Information Technology', code: 'IT', managerName: 'Deepak Sharma', managerEmail: 'dept.manager@procurex.com', budgetAllocated: 2500000, budgetCommitted: 850000, budgetSpent: 620000 },
    { name: 'Facilities & Administration', code: 'FAC', managerName: 'Priya Iyer', managerEmail: 'priya.i@procurex.com', budgetAllocated: 1200000, budgetCommitted: 350000, budgetSpent: 280000 },
    { name: 'Operations & Logistics', code: 'OPS', managerName: 'Rajesh Varma', managerEmail: 'rajesh.v@procurex.com', budgetAllocated: 1800000, budgetCommitted: 520000, budgetSpent: 410000 },
    { name: 'Human Resources', code: 'HR', managerName: 'Ananya Roy', managerEmail: 'ananya.r@procurex.com', budgetAllocated: 800000, budgetCommitted: 150000, budgetSpent: 120000 },
  ]);

  // 3. Vendors
  const vendors = await Vendor.create([
    {
      vendorCode: 'VND-0101',
      name: 'TechLogix Solutions Ltd',
      contactPerson: 'Arun Krishnan',
      email: 'vendor@techlogix.com',
      phone: '+91 98450 12345',
      category: 'IT Equipment',
      productsAndServices: ['Commercial Laptops', 'Enterprise Monitors', 'Networking Equipment', 'Servers'],
      gstin: '29AAACT1011A1Z2',
      paymentTerms: 'Net 30',
      score: 96,
      rank: 1,
      rankTrend: 'stable',
      onTimeDeliveryRate: 98,
      qualityScore: 96,
      priceCompetitiveness: 92,
      complianceScore: 99,
      riskRating: 'Low',
      status: 'active',
      spendHistory: [
        { month: 'Oct', amount: 450000 },
        { month: 'Nov', amount: 620000 },
        { month: 'Dec', amount: 780000 },
        { month: 'Jan', amount: 550000 },
        { month: 'Feb', amount: 890000 },
      ],
      performanceHistory: [
        { date: 'Oct', delivery: 97, quality: 95, price: 91 },
        { date: 'Nov', delivery: 98, quality: 96, price: 92 },
        { date: 'Dec', delivery: 98, quality: 97, price: 93 },
        { date: 'Jan', delivery: 99, quality: 96, price: 92 },
        { date: 'Feb', delivery: 98, quality: 96, price: 92 },
      ],
      documents: [
        { name: 'ISO 9001:2015 Certificate', type: 'certification', url: '/docs/iso9001.pdf', status: 'verified' },
        { name: 'GST Registration Certificate', type: 'tax', url: '/docs/gstin.pdf', status: 'verified' },
      ],
    },
    {
      vendorCode: 'VND-0102',
      name: 'Apex Industrial Supplies Ltd',
      contactPerson: 'Sunil Mehta',
      email: 'sunil@apexindustrial.in',
      phone: '+91 98201 67890',
      category: 'Industrial & Safety',
      productsAndServices: ['Safety Helmets', 'Protective Gloves', 'Industrial Racks', 'Safety Shoes'],
      gstin: '27AABCA2022B1Z8',
      paymentTerms: 'Net 45',
      score: 91,
      rank: 2,
      rankTrend: 'up',
      onTimeDeliveryRate: 92,
      qualityScore: 94,
      priceCompetitiveness: 88,
      complianceScore: 95,
      riskRating: 'Low',
      status: 'active',
      spendHistory: [
        { month: 'Oct', amount: 210000 },
        { month: 'Nov', amount: 280000 },
        { month: 'Dec', amount: 310000 },
        { month: 'Jan', amount: 260000 },
        { month: 'Feb', amount: 340000 },
      ],
      performanceHistory: [
        { date: 'Oct', delivery: 90, quality: 92, price: 86 },
        { date: 'Nov', delivery: 91, quality: 93, price: 87 },
        { date: 'Dec', delivery: 92, quality: 94, price: 88 },
        { date: 'Jan', delivery: 93, quality: 94, price: 89 },
        { date: 'Feb', delivery: 92, quality: 94, price: 88 },
      ],
    },
    {
      vendorCode: 'VND-0103',
      name: 'Vertex Cloud & Networks',
      contactPerson: 'Karan Malhotra',
      email: 'karan@vertexcloud.com',
      phone: '+91 99102 34567',
      category: 'Cloud & Telecom',
      productsAndServices: ['Leased Line Telecom', 'Managed Router Services', 'Cloud Storage Backup'],
      gstin: '07AAACV3033C1Z5',
      paymentTerms: 'Net 30',
      score: 88,
      rank: 3,
      rankTrend: 'stable',
      onTimeDeliveryRate: 95,
      qualityScore: 90,
      priceCompetitiveness: 82,
      complianceScore: 94,
      riskRating: 'Low',
      status: 'active',
      spendHistory: [
        { month: 'Oct', amount: 150000 },
        { month: 'Nov', amount: 150000 },
        { month: 'Dec', amount: 150000 },
        { month: 'Jan', amount: 180000 },
        { month: 'Feb', amount: 180000 },
      ],
      performanceHistory: [
        { date: 'Oct', delivery: 94, quality: 89, price: 81 },
        { date: 'Nov', delivery: 95, quality: 90, price: 82 },
        { date: 'Dec', delivery: 95, quality: 90, price: 82 },
        { date: 'Jan', delivery: 96, quality: 91, price: 83 },
        { date: 'Feb', delivery: 95, quality: 90, price: 82 },
      ],
    },
    {
      vendorCode: 'VND-0104',
      name: 'PrimeOffice Enterprises',
      contactPerson: 'Meera Nambiar',
      email: 'sales@primeoffice.in',
      phone: '+91 94471 98765',
      category: 'Office Supplies',
      productsAndServices: ['Ergonomic Chairs', 'Standing Desks', 'Paper Reams', 'Stationery Bundles'],
      gstin: '32AABCP4044D1Z4',
      paymentTerms: 'Net 30',
      score: 82,
      rank: 4,
      rankTrend: 'down',
      onTimeDeliveryRate: 84,
      qualityScore: 86,
      priceCompetitiveness: 88,
      complianceScore: 85,
      riskRating: 'Medium',
      status: 'active',
      spendHistory: [
        { month: 'Oct', amount: 120000 },
        { month: 'Nov', amount: 190000 },
        { month: 'Dec', amount: 240000 },
        { month: 'Jan', amount: 160000 },
        { month: 'Feb', amount: 210000 },
      ],
      performanceHistory: [
        { date: 'Oct', delivery: 86, quality: 87, price: 89 },
        { date: 'Nov', delivery: 85, quality: 86, price: 88 },
        { date: 'Dec', delivery: 84, quality: 85, price: 87 },
        { date: 'Jan', delivery: 83, quality: 85, price: 88 },
        { date: 'Feb', delivery: 84, quality: 86, price: 88 },
      ],
    },
    {
      vendorCode: 'VND-0105',
      name: 'LogiFlow Express Cargo',
      contactPerson: 'Vikram Joshi',
      email: 'ops@logiflowcargo.com',
      phone: '+91 97234 56789',
      category: 'Logistics',
      productsAndServices: ['Freight Shipping', 'Warehouse Shuttles', 'Cold-Chain Transport'],
      gstin: '24AAACL5055E1Z3',
      paymentTerms: 'Net 15',
      score: 79,
      rank: 5,
      rankTrend: 'up',
      onTimeDeliveryRate: 80,
      qualityScore: 82,
      priceCompetitiveness: 85,
      complianceScore: 81,
      riskRating: 'Medium',
      status: 'active',
      spendHistory: [
        { month: 'Oct', amount: 95000 },
        { month: 'Nov', amount: 110000 },
        { month: 'Dec', amount: 140000 },
        { month: 'Jan', amount: 125000 },
        { month: 'Feb', amount: 160000 },
      ],
      performanceHistory: [
        { date: 'Oct', delivery: 78, quality: 80, price: 84 },
        { date: 'Nov', delivery: 79, quality: 81, price: 85 },
        { date: 'Dec', delivery: 80, quality: 82, price: 85 },
        { date: 'Jan', delivery: 81, quality: 82, price: 86 },
        { date: 'Feb', delivery: 80, quality: 82, price: 85 },
      ],
    },
    {
      vendorCode: 'VND-0106',
      name: 'EcoClean Facility Services',
      contactPerson: 'Shalini Gupta',
      email: 'contact@ecoclean.co.in',
      phone: '+91 98118 76543',
      category: 'Facilities',
      productsAndServices: ['HVAC Maintenance', 'Facility Deep Cleaning', 'Waste Management'],
      gstin: '06AABCE6066F1Z1',
      paymentTerms: 'Net 30',
      score: 74,
      rank: 6,
      rankTrend: 'stable',
      onTimeDeliveryRate: 76,
      qualityScore: 78,
      priceCompetitiveness: 80,
      complianceScore: 75,
      riskRating: 'Medium',
      status: 'active',
      spendHistory: [
        { month: 'Oct', amount: 65000 },
        { month: 'Nov', amount: 70000 },
        { month: 'Dec', amount: 75000 },
        { month: 'Jan', amount: 72000 },
        { month: 'Feb', amount: 80000 },
      ],
      performanceHistory: [
        { date: 'Oct', delivery: 75, quality: 77, price: 79 },
        { date: 'Nov', delivery: 76, quality: 78, price: 80 },
        { date: 'Dec', delivery: 76, quality: 78, price: 80 },
        { date: 'Jan', delivery: 77, quality: 79, price: 81 },
        { date: 'Feb', delivery: 76, quality: 78, price: 80 },
      ],
    },
    {
      vendorCode: 'VND-0107',
      name: 'Alpha Precision Tools',
      contactPerson: 'Ramesh Chauhan',
      email: 'ramesh@alphatools.in',
      phone: '+91 93245 87654',
      category: 'Manufacturing',
      productsAndServices: ['CNC Milling Parts', 'Calibration Meters', 'Custom Fasteners'],
      gstin: '27AAACA7077G1Z7',
      paymentTerms: 'Net 30',
      score: 65,
      rank: 7,
      rankTrend: 'down',
      onTimeDeliveryRate: 68,
      qualityScore: 72,
      priceCompetitiveness: 70,
      complianceScore: 66,
      riskRating: 'High',
      status: 'active',
      spendHistory: [
        { month: 'Oct', amount: 80000 },
        { month: 'Nov', amount: 95000 },
        { month: 'Dec', amount: 85000 },
        { month: 'Jan', amount: 90000 },
        { month: 'Feb', amount: 110000 },
      ],
      performanceHistory: [
        { date: 'Oct', delivery: 70, quality: 74, price: 71 },
        { date: 'Nov', delivery: 69, quality: 73, price: 70 },
        { date: 'Dec', delivery: 68, quality: 72, price: 70 },
        { date: 'Jan', delivery: 67, quality: 71, price: 69 },
        { date: 'Feb', delivery: 68, quality: 72, price: 70 },
      ],
    },
  ]);

  // 4. Users (All 7 required roles)
  const users = await User.create([
    {
      name: 'Alexander Vance',
      email: 'admin@procurex.com',
      password: 'Password123!',
      role: ROLES.ADMIN,
      department: 'Executive Administration',
      phone: '+91 98000 00001',
    },
    {
      name: 'Priya Nambiar',
      email: 'ops.admin@procurex.com',
      password: 'Password123!',
      role: ROLES.ADMIN,
      department: 'Operations Administration',
      phone: '+91 98000 00010',
    },
    {
      name: 'Rohit Kulkarni',
      email: 'proc.manager@procurex.com',
      password: 'Password123!',
      role: ROLES.PURCHASE_MANAGER,
      department: 'Global Sourcing & Procurement',
      phone: '+91 98000 00002',
    },
    {
      name: 'Sneha Deshmukh',
      email: 'proc.officer@procurex.com',
      password: 'Password123!',
      role: ROLES.PROCUREMENT_OFFICER,
      department: 'Global Sourcing & Procurement',
      phone: '+91 98000 00003',
    },
    {
      name: 'Rahul Verma',
      email: 'employee@procurex.com',
      password: 'Password123!',
      role: ROLES.EMPLOYEE,
      department: 'Engineering & DevOps',
      phone: '+91 98000 00015',
    },
    {
      name: 'Deepak Sharma',
      email: 'dept.manager@procurex.com',
      password: 'Password123!',
      role: ROLES.DEPARTMENT_MANAGER,
      department: 'Information Technology',
      phone: '+91 98000 00004',
    },
    {
      name: 'Kavita Sundaram',
      email: 'finance@procurex.com',
      password: 'Password123!',
      role: ROLES.FINANCE_OFFICER,
      department: 'Finance & Accounts',
      phone: '+91 98000 00005',
    },
    {
      name: 'Gaurav Patil',
      email: 'inventory@procurex.com',
      password: 'Password123!',
      role: ROLES.INVENTORY_MANAGER,
      department: 'Warehouse & Logistics',
      phone: '+91 98000 00006',
    },
    {
      name: 'Arun Krishnan',
      email: 'vendor@techlogix.com',
      password: 'Password123!',
      role: ROLES.VENDOR,
      vendorId: vendors[0]._id,
      department: 'TechLogix Representative',
      phone: '+91 98450 12345',
    },
  ]);

  // 5. Products Catalog
  const products = await Product.create([
    {
      sku: 'IT-LAP-01',
      name: 'Dell Latitude 5540 15.6" Core i7 16GB/512GB',
      category: 'IT Equipment',
      description: 'Enterprise business laptop with Intel 13th Gen Core i7 and vPro security.',
      unitOfMeasure: 'Unit',
      unitPrice: 62500,
      preferredVendorId: vendors[0]._id,
      leadTimeDays: 7,
      taxRate: 18,
      minOrderQty: 5,
      currentStock: 14,
      reorderThreshold: 10,
      status: 'active',
    },
    {
      sku: 'IT-MON-02',
      name: 'Dell UltraSharp 27" 4K USB-C Monitor U2723QE',
      category: 'IT Equipment',
      description: 'IPS Black technology with 98% DCI-P3 and 90W power delivery.',
      unitOfMeasure: 'Unit',
      unitPrice: 38000,
      preferredVendorId: vendors[0]._id,
      leadTimeDays: 5,
      taxRate: 18,
      minOrderQty: 2,
      currentStock: 8,
      reorderThreshold: 10,
      status: 'active',
    },
    {
      sku: 'NET-SW-03',
      name: 'Cisco Catalyst 1000 Series 24-Port Gigabit Switch',
      category: 'IT Equipment',
      description: 'Managed enterprise switch with 4x 1G SFP uplinks and PoE+ support.',
      unitOfMeasure: 'Unit',
      unitPrice: 42000,
      preferredVendorId: vendors[0]._id,
      leadTimeDays: 10,
      taxRate: 18,
      minOrderQty: 1,
      currentStock: 4,
      reorderThreshold: 5,
      status: 'active',
    },
    {
      sku: 'OFF-CHR-01',
      name: 'ErgoComfort High-Back Mesh Task Chair',
      category: 'Office Supplies',
      description: 'Synchro-tilt mechanism with 3D adjustable armrests and lumbar support.',
      unitOfMeasure: 'Unit',
      unitPrice: 12500,
      preferredVendorId: vendors[3]._id,
      leadTimeDays: 7,
      taxRate: 18,
      minOrderQty: 4,
      currentStock: 25,
      reorderThreshold: 15,
      status: 'active',
    },
    {
      sku: 'OFF-DSK-02',
      name: 'Motorized Dual-Motor Height Adjustable Standing Desk',
      category: 'Office Supplies',
      description: 'Electric sit-stand desk 1500x750mm with digital height memory.',
      unitOfMeasure: 'Unit',
      unitPrice: 28000,
      preferredVendorId: vendors[3]._id,
      leadTimeDays: 10,
      taxRate: 18,
      minOrderQty: 2,
      currentStock: 6,
      reorderThreshold: 8,
      status: 'active',
    },
    {
      sku: 'IND-HLM-01',
      name: '3M SecureFit Hard Hat Vented Ratchet Suspension',
      category: 'Industrial & Safety',
      description: 'Industrial safety helmet ANSI/ISEA Z89.1 Type 1 Class C compliant.',
      unitOfMeasure: 'Box (10 pcs)',
      unitPrice: 4500,
      preferredVendorId: vendors[1]._id,
      leadTimeDays: 4,
      taxRate: 18,
      minOrderQty: 5,
      currentStock: 35,
      reorderThreshold: 20,
      status: 'active',
    },
    {
      sku: 'IND-GLV-02',
      name: 'Ansell HyFlex Cut-Resistant Industrial Nitrile Gloves',
      category: 'Industrial & Safety',
      description: 'Level 4 cut resistance with oil-repellent coating.',
      unitOfMeasure: 'Pack (12 pairs)',
      unitPrice: 2800,
      preferredVendorId: vendors[1]._id,
      leadTimeDays: 3,
      taxRate: 18,
      minOrderQty: 10,
      currentStock: 42,
      reorderThreshold: 25,
      status: 'active',
    },
    {
      sku: 'NET-CAB-01',
      name: 'Schneider D-Link Cat6 UTP 305m Solid Copper Cable Drum',
      category: 'IT Equipment',
      description: '250MHz bandwidth verified 23 AWG 4-pair cable.',
      unitOfMeasure: 'Drum',
      unitPrice: 8500,
      preferredVendorId: vendors[0]._id,
      leadTimeDays: 4,
      taxRate: 18,
      minOrderQty: 2,
      currentStock: 5,
      reorderThreshold: 8,
      status: 'active',
    },
  ]);

  // 6. Requisitions
  const req1 = await Requisition.create({
    reqNumber: 'REQ-2026-0001',
    requesterId: users[3]._id, // Deepak Sharma (IT Manager)
    requesterName: users[3].name,
    requesterEmail: users[3].email,
    departmentName: 'Information Technology',
    costCenter: 'CC-IT-101',
    requiredDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    lineItems: [
      {
        productId: products[0]._id,
        sku: products[0].sku,
        productName: products[0].name,
        quantity: 10,
        estimatedUnitPrice: 62500,
        total: 625000,
      },
    ],
    estimatedTotal: 625000,
    justification: 'Quarterly hardware refresh for incoming software engineering cohort.',
    preferredVendorId: vendors[0]._id,
    preferredVendorName: vendors[0].name,
    status: 'approved',
    approvalHistory: [
      {
        step: 1,
        approverId: users[1]._id,
        approverName: users[1].name,
        role: users[1].role,
        status: 'approved',
        remarks: 'Budget allocation verified against IT FY26 CapEx.',
        actionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const req2 = await Requisition.create({
    reqNumber: 'REQ-2026-0002',
    requesterId: users[2]._id,
    requesterName: users[2].name,
    requesterEmail: users[2].email,
    departmentName: 'Facilities & Administration',
    costCenter: 'CC-FAC-201',
    requiredDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    lineItems: [
      {
        productId: products[3]._id,
        sku: products[3].sku,
        productName: products[3].name,
        quantity: 8,
        estimatedUnitPrice: 12500,
        total: 100000,
      },
      {
        productId: products[4]._id,
        sku: products[4].sku,
        productName: products[4].name,
        quantity: 4,
        estimatedUnitPrice: 28000,
        total: 112000,
      },
    ],
    estimatedTotal: 212000,
    justification: 'Ergonomic furniture setup for new project room on Floor 3.',
    preferredVendorId: vendors[3]._id,
    preferredVendorName: vendors[3].name,
    status: 'submitted',
    approvalHistory: [
      {
        step: 1,
        approverName: 'Department Approver',
        role: 'Department Manager / Approver',
        status: 'pending',
      },
    ],
  });

  // 7. Purchase Orders
  const po1 = await PurchaseOrder.create({
    poNumber: 'PO-2026-0101',
    requisitionId: req1._id,
    vendorId: vendors[0]._id,
    vendorName: vendors[0].name,
    vendorEmail: vendors[0].email,
    lineItems: [
      {
        productId: products[0]._id,
        sku: products[0].sku,
        productName: products[0].name,
        quantity: 10,
        receivedQuantity: 10,
        unitPrice: 62500,
        discount: 0,
        taxRate: 18,
        total: 737500,
      },
    ],
    subtotal: 625000,
    taxTotal: 112500,
    shippingCharges: 0,
    grandTotal: 737500,
    status: 'partially_received',
    expectedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    paymentTerms: 'Net 30',
    approvalHistory: [
      {
        step: 1,
        approverId: users[1]._id,
        approverName: users[1].name,
        role: users[1].role,
        status: 'approved',
        remarks: 'PO released to supplier',
        actionDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const po2 = await PurchaseOrder.create({
    poNumber: 'PO-2026-0102',
    vendorId: vendors[1]._id,
    vendorName: vendors[1].name,
    vendorEmail: vendors[1].email,
    lineItems: [
      {
        productId: products[5]._id,
        sku: products[5].sku,
        productName: products[5].name,
        quantity: 10,
        receivedQuantity: 10,
        unitPrice: 4500,
        discount: 0,
        taxRate: 18,
        total: 53100,
      },
      {
        productId: products[6]._id,
        sku: products[6].sku,
        productName: products[6].name,
        quantity: 15,
        receivedQuantity: 15,
        unitPrice: 2800,
        discount: 0,
        taxRate: 18,
        total: 49560,
      },
    ],
    subtotal: 87000,
    taxTotal: 15660,
    shippingCharges: 0,
    grandTotal: 102660,
    status: 'fully_received',
    expectedDeliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    paymentTerms: 'Net 45',
  });

  // 8. Goods Receipts
  const grn1 = await GoodsReceipt.create({
    grnNumber: 'GRN-2026-0101',
    purchaseOrderId: po1._id,
    poNumber: po1.poNumber,
    vendorId: vendors[0]._id,
    vendorName: vendors[0].name,
    receivedBy: 'Gaurav Patil',
    warehouseLocation: 'Bengaluru Central Warehouse',
    lineItems: [
      {
        productId: products[0]._id,
        productName: products[0].name,
        sku: products[0].sku,
        orderedQuantity: 10,
        receivedQuantity: 10,
        acceptedQuantity: 10,
        rejectedQuantity: 0,
        damagedQuantity: 0,
      },
    ],
    notes: 'All 10 laptop cartons inspected and verified with seals intact.',
  });

  const grn2 = await GoodsReceipt.create({
    grnNumber: 'GRN-2026-0102',
    purchaseOrderId: po2._id,
    poNumber: po2.poNumber,
    vendorId: vendors[1]._id,
    vendorName: vendors[1].name,
    receivedBy: 'Gaurav Patil',
    warehouseLocation: 'Bengaluru Central Warehouse',
    lineItems: [
      {
        productId: products[5]._id,
        productName: products[5].name,
        sku: products[5].sku,
        orderedQuantity: 10,
        receivedQuantity: 10,
        acceptedQuantity: 10,
        rejectedQuantity: 0,
        damagedQuantity: 0,
      },
      {
        productId: products[6]._id,
        productName: products[6].name,
        sku: products[6].sku,
        orderedQuantity: 15,
        receivedQuantity: 15,
        acceptedQuantity: 15,
        rejectedQuantity: 0,
        damagedQuantity: 0,
      },
    ],
  });

  // 9. Invoices
  // Invoice 1: Perfectly matched
  const inv1 = await Invoice.create({
    invoiceNumber: 'INV-TL-8842',
    vendorId: vendors[0]._id,
    vendorName: vendors[0].name,
    purchaseOrderId: po1._id,
    poNumber: po1.poNumber,
    grnId: grn1._id,
    grnNumber: grn1.grnNumber,
    invoiceDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    currency: 'INR',
    subtotal: 625000,
    taxDetails: { cgst: 56250, sgst: 56250, igst: 0, totalTax: 112500 },
    grandTotal: 737500,
    amountPaid: 737500,
    balanceDue: 0,
    status: 'paid',
    paymentStatus: 'paid',
    matchingResult: {
      isMatched: true,
      hasPriceVariance: false,
      hasQuantityVariance: false,
      hasTaxVariance: false,
      varianceAmount: 0,
      discrepancies: [],
      matchingNotes: 'Automated 3-way match verified against PO-2026-0101 and GRN-2026-0101.',
    },
    lineItems: [
      {
        productId: products[0]._id,
        productName: products[0].name,
        sku: products[0].sku,
        quantity: 10,
        unitPrice: 62500,
        total: 737500,
      },
    ],
  });

  // Invoice 2: Discrepancy (Price Variance for review)
  const inv2 = await Invoice.create({
    invoiceNumber: 'INV-AP-4912',
    vendorId: vendors[1]._id,
    vendorName: vendors[1].name,
    purchaseOrderId: po2._id,
    poNumber: po2.poNumber,
    grnId: grn2._id,
    grnNumber: grn2.grnNumber,
    invoiceDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    currency: 'INR',
    subtotal: 92000,
    taxDetails: { cgst: 8280, sgst: 8280, igst: 0, totalTax: 16560 },
    grandTotal: 108560,
    amountPaid: 0,
    balanceDue: 108560,
    status: 'discrepancy',
    paymentStatus: 'unpaid',
    matchingResult: {
      isMatched: false,
      hasPriceVariance: true,
      hasQuantityVariance: false,
      hasTaxVariance: false,
      varianceAmount: 5900,
      discrepancies: [
        'Grand total mismatch: Invoiced amount is ₹1,08,560, but PO authorized amount is ₹1,02,660 (Variance: ₹5,900)',
        'Unit price variance on "3M SecureFit Hard Hat": Invoiced at ₹4,900, PO agreed price is ₹4,500',
      ],
      matchingNotes: 'Flagged for human procurement officer review prior to disbursement.',
    },
    lineItems: [
      {
        productId: products[5]._id,
        productName: products[5].name,
        sku: products[5].sku,
        quantity: 10,
        unitPrice: 4900,
        total: 57820,
      },
      {
        productId: products[6]._id,
        productName: products[6].name,
        sku: products[6].sku,
        quantity: 15,
        unitPrice: 2800,
        total: 49560,
      },
    ],
    msmeFlag: true,
  });

  // 10. Payment
  await Payment.create({
    paymentNumber: 'PAY-2026-0101',
    invoiceId: inv1._id,
    invoiceNumber: inv1.invoiceNumber,
    vendorId: vendors[0]._id,
    vendorName: vendors[0].name,
    amount: 737500,
    paymentDate: new Date(),
    paymentMethod: 'neft_rtgs',
    referenceNumber: 'HDFC9988220192',
    status: 'completed',
    recordedBy: 'Kavita Sundaram',
    notes: 'Settled full balance under Net 30 terms.',
  });

  // 11. Budgets
  await Budget.create([
    {
      fiscalYear: 'FY 2025-26',
      departmentId: departments[0]._id,
      departmentName: 'Information Technology',
      costCenter: 'CC-IT-101',
      totalAllocated: 2500000,
      committedAmount: 850000,
      actualSpent: 737500,
      availableBalance: 912500,
      warningThresholdPercent: 80,
    },
    {
      fiscalYear: 'FY 2025-26',
      departmentId: departments[1]._id,
      departmentName: 'Facilities & Administration',
      costCenter: 'CC-FAC-201',
      totalAllocated: 1200000,
      committedAmount: 212000,
      actualSpent: 102660,
      availableBalance: 885340,
      warningThresholdPercent: 80,
    },
  ]);

  // 12. Contracts
  await Contract.create([
    {
      contractNumber: 'CTR-2025-001',
      title: 'Annual Enterprise Hardware Supply & Support Agreement',
      vendorId: vendors[0]._id,
      vendorName: vendors[0].name,
      category: 'IT Hardware',
      startDate: new Date('2025-04-01'),
      endDate: new Date('2026-03-31'),
      contractValue: 5000000,
      renewalAlertDays: 45,
      slaTerms: 'Next business day on-site hardware warranty replacement.',
      paymentConditions: 'Net 30 days after digital delivery confirmation.',
      terminationClauses: '30 days written notice for breach of SLA metrics.',
      status: 'active',
    },
    {
      contractNumber: 'CTR-2025-002',
      title: 'Facility Maintenance & HVAC Servicing Master Contract',
      vendorId: vendors[5]._id,
      vendorName: vendors[5].name,
      category: 'Facilities',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      contractValue: 950000,
      renewalAlertDays: 30,
      slaTerms: '4-hour emergency turnaround for critical HVAC outages.',
      paymentConditions: 'Monthly milestone billing on the 5th.',
      terminationClauses: 'Mutual 15-day termination clause.',
      status: 'expiring_soon',
    },
  ]);

  // 13. Automation Rules
  await AutomationRule.create([
    {
      name: 'Requisition Approval Triage',
      description: 'Notify Department Managers and Procurement Leads whenever a new requisition is submitted.',
      trigger: 'requisition_submitted',
      actionType: 'notification',
      actionConfig: { targetRole: 'Department Manager / Approver' },
      isEnabled: true,
      runCount: 4,
      lastExecutionStatus: 'success',
      lastRunAt: new Date(),
    },
    {
      name: 'Low Stock Safeguard',
      description: 'Trigger procurement alert when stock on critical catalog items falls below threshold.',
      trigger: 'inventory_low',
      actionType: 'notification',
      actionConfig: { targetRole: 'Procurement Officer' },
      isEnabled: true,
      runCount: 2,
      lastExecutionStatus: 'success',
      lastRunAt: new Date(),
    },
    {
      name: 'Invoice Discrepancy Escalation',
      description: 'Flag 3-way matching price or quantity variance to Finance Officers.',
      trigger: 'invoice_variance_high',
      actionType: 'notification',
      actionConfig: { targetRole: 'Finance Officer' },
      isEnabled: true,
      runCount: 1,
      lastExecutionStatus: 'success',
      lastRunAt: new Date(),
    },
  ]);

  // 14. Notifications
  await Notification.create([
    {
      roleScope: 'all',
      title: 'Welcome to ProcureX Platform',
      message: 'System initialization complete. Database connected with live demo records.',
      type: 'success',
      link: '/app',
      isRead: false,
    },
    {
      roleScope: 'Finance Officer',
      title: 'Invoice Discrepancy Flagged: INV-AP-4912',
      message: 'Variance of ₹5,900 detected against PO-2026-0102 from Apex Industrial Supplies.',
      type: 'warning',
      link: '/app/invoices',
      isRead: false,
    },
    {
      roleScope: 'Department Manager / Approver',
      title: 'New Requisition for Approval: REQ-2026-0002',
      message: 'Requisition by Sneha Deshmukh for ₹2,12,000 is awaiting review.',
      type: 'info',
      link: '/app/approvals',
      isRead: false,
    },
  ]);

  console.log('[Seed] Database successfully seeded with demo accounts, vendors, products, and procurement workflows!');
};

// Direct script execution support
if (process.argv[1]?.includes('seed')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      process.exit(0);
    } catch (e: any) {
      console.error('[Seed Error]:', e);
      process.exit(1);
    }
  })();
}
