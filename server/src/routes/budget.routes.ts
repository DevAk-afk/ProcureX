import { Router } from 'express';
import { getBudgets, createBudget, updateBudget } from '../controllers/budget.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', getBudgets);
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.FINANCE_OFFICER, ROLES.PROCUREMENT_MANAGER),
  createBudget
);
router.put(
  '/:id',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.FINANCE_OFFICER),
  updateBudget
);

export default router;
