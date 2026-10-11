import { Router } from 'express';
import {
  getAutomationRules,
  createAutomationRule,
  toggleRule,
  testRule,
} from '../controllers/automation.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', getAutomationRules);
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER),
  createAutomationRule
);
router.patch(
  '/:id/toggle',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER),
  toggleRule
);
router.post(
  '/:id/test',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER),
  testRule
);

export default router;
