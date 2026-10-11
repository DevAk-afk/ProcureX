export type UserRole =
  | 'Super Admin'
  | 'Admin'
  | 'Purchase Manager'
  | 'Procurement Manager'
  | 'Employee / Requester'
  | 'Procurement Officer'
  | 'Department Manager / Approver'
  | 'Finance Officer'
  | 'Inventory Manager'
  | 'Vendor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  vendorId?: string;
  avatar?: string;
}

export interface Vendor {
  _id: string;
  vendorCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
  productsAndServices?: string[];
  gstin?: string;
  paymentTerms: string;
  score: number;
  rank: number;
  rankTrend: 'up' | 'down' | 'stable';
  onTimeDeliveryRate: number;
  qualityScore: number;
  priceCompetitiveness: number;
  complianceScore: number;
  riskRating: 'Low' | 'Medium' | 'High';
  status: 'pending' | 'active' | 'suspended' | 'rejected' | 'archived';
  spendHistory?: Array<{ month: string; amount: number }>;
  performanceHistory?: Array<{ date: string; delivery: number; quality: number; price: number }>;
  documents?: Array<{ name: string; type: string; url: string; status: string }>;
  rejectionReason?: string;
  createdAt: string;
}

export interface Product {
  _id: string;
  sku: string;
  name: string;
  category: string;
  description?: string;
  unitOfMeasure: string;
  unitPrice: number;
  preferredVendorId?: { _id: string; name: string; vendorCode: string } | string;
  leadTimeDays: number;
  taxRate: number;
  minOrderQty: number;
  currentStock: number;
  reorderThreshold: number;
  status: 'active' | 'discontinued';
  priceHistory?: Array<{ date: string; price: number; changedBy?: string }>;
}

export interface RequisitionLineItem {
  productId?: string;
  sku: string;
  productName: string;
  quantity: number;
  estimatedUnitPrice: number;
  total: number;
}

export interface ApprovalHistoryEntry {
  step: number;
  approverId?: string;
  approverName: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  remarks?: string;
  actionDate?: string;
}

export interface Requisition {
  _id: string;
  reqNumber: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  departmentName: string;
  costCenter?: string;
  requiredDate: string;
  lineItems: RequisitionLineItem[];
  estimatedTotal: number;
  justification: string;
  preferredVendorId?: string;
  preferredVendorName?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled' | 'converted_to_po';
  approvalHistory: ApprovalHistoryEntry[];
  purchaseOrderId?: string;
  createdAt: string;
}

export interface PurchaseOrderLineItem {
  productId?: string;
  sku: string;
  productName: string;
  quantity: number;
  receivedQuantity: number;
  unitPrice: number;
  discount: number;
  taxRate: number;
  total: number;
}

export interface PurchaseOrder {
  _id: string;
  poNumber: string;
  requisitionId?: string;
  vendorId: string | { _id: string; name: string; address?: any; gstin?: string };
  vendorName: string;
  vendorEmail?: string;
  lineItems: PurchaseOrderLineItem[];
  subtotal: number;
  taxTotal: number;
  shippingCharges: number;
  grandTotal: number;
  status:
    | 'draft'
    | 'pending_approval'
    | 'approved'
    | 'sent_to_vendor'
    | 'acknowledged'
    | 'partially_received'
    | 'fully_received'
    | 'closed'
    | 'cancelled';
  expectedDeliveryDate: string;
  paymentTerms: string;
  notes?: string;
  createdAt: string;
}

export interface GoodsReceiptLineItem {
  productId: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  damagedQuantity: number;
}

export interface GoodsReceipt {
  _id: string;
  grnNumber: string;
  purchaseOrderId: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  receivedDate: string;
  receivedBy: string;
  warehouseLocation: string;
  lineItems: GoodsReceiptLineItem[];
  notes?: string;
  createdAt: string;
}

export interface InventoryTransaction {
  _id: string;
  transactionNumber: string;
  productId: string;
  productName: string;
  sku: string;
  warehouse: string;
  type: 'receipt' | 'issue' | 'adjustment' | 'transfer';
  quantityDelta: number;
  balanceAfter: number;
  referenceType: string;
  referenceId?: string;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface Invoice {
  _id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  purchaseOrderId?: string;
  poNumber?: string;
  grnId?: string;
  grnNumber?: string;
  invoiceDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxDetails: { cgst: number; sgst: number; igst: number; totalTax: number };
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  status: 'received' | 'matching' | 'matched' | 'discrepancy' | 'approved' | 'paid' | 'rejected';
  matchingResult: {
    isMatched: boolean;
    hasPriceVariance: boolean;
    hasQuantityVariance: boolean;
    hasTaxVariance: boolean;
    varianceAmount: number;
    discrepancies: string[];
    matchingNotes?: string;
  };
  lineItems: Array<{
    productId?: string;
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  paymentStatus: 'unpaid' | 'partial' | 'paid' | 'overdue';
  msmeFlag?: boolean;
  msmeDueDate?: string;
  createdAt: string;
}

export interface Payment {
  _id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  referenceNumber: string;
  status: 'completed' | 'pending' | 'failed';
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  _id: string;
  fiscalYear: string;
  departmentId: { _id: string; name: string } | string;
  departmentName: string;
  costCenter: string;
  totalAllocated: number;
  committedAmount: number;
  actualSpent: number;
  availableBalance: number;
  warningThresholdPercent: number;
}

export interface Contract {
  _id: string;
  contractNumber: string;
  title: string;
  vendorId: string;
  vendorName: string;
  category: string;
  startDate: string;
  endDate: string;
  contractValue: number;
  renewalAlertDays: number;
  slaTerms: string;
  paymentConditions: string;
  terminationClauses: string;
  status: 'active' | 'expiring_soon' | 'expired' | 'terminated';
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AutomationRule {
  _id: string;
  name: string;
  description: string;
  trigger: string;
  actionType: string;
  actionConfig?: any;
  isEnabled: boolean;
  runCount: number;
  lastRunAt?: string;
  lastExecutionStatus?: string;
}
