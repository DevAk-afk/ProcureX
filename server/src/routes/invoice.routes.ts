import { Router } from 'express';
import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoiceStatus,
} from '../controllers/invoice.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', createInvoice);
router.patch(
  '/:id/status',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.FINANCE_OFFICER, ROLES.PROCUREMENT_MANAGER),
  updateInvoiceStatus
);

export default router;
