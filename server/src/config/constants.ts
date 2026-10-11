export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  PROCUREMENT_MANAGER: 'Procurement Manager',
  PURCHASE_MANAGER: 'Purchase Manager',
  PROCUREMENT_OFFICER: 'Procurement Officer',
  EMPLOYEE: 'Employee / Requester',
  DEPARTMENT_MANAGER: 'Department Manager / Approver',
  FINANCE_OFFICER: 'Finance Officer',
  INVENTORY_MANAGER: 'Inventory Manager',
  VENDOR: 'Vendor',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

export const VENDOR_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
} as const;

export const REQUISITION_STATUSES = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  CONVERTED_TO_PO: 'converted_to_po',
} as const;

export const PO_STATUSES = {
  DRAFT: 'draft',
  PENDING_APPROVAL: 'pending_approval',
  APPROVED: 'approved',
  SENT_TO_VENDOR: 'sent_to_vendor',
  ACKNOWLEDGED: 'acknowledged',
  PARTIALLY_RECEIVED: 'partially_received',
  FULLY_RECEIVED: 'fully_received',
  CLOSED: 'closed',
  CANCELLED: 'cancelled',
} as const;

export const INVOICE_STATUSES = {
  RECEIVED: 'received',
  MATCHING: 'matching',
  MATCHED: 'matched',
  DISCREPANCY: 'discrepancy',
  APPROVED: 'approved',
  PAID: 'paid',
  REJECTED: 'rejected',
} as const;

export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';
