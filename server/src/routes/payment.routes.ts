import { Router } from 'express';
import { getPayments, createPayment } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', getPayments);
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.FINANCE_OFFICER, ROLES.PROCUREMENT_MANAGER),
  createPayment
);

export default router;
