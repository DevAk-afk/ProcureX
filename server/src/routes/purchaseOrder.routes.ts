import { Router } from 'express';
import {
  getPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePOStatus,
  getPurchaseOrderPrintView,
} from '../controllers/purchaseOrder.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/:id/pdf', getPurchaseOrderPrintView);
router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER),
  createPurchaseOrder
);
router.patch(
  '/:id/status',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR),
  updatePOStatus
);

export default router;
