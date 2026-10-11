import { Router } from 'express';
import {
  getInventoryItems,
  getInventoryTransactions,
  adjustStock,
  getLowStockAlerts,
} from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/alerts', getLowStockAlerts);
router.get('/transactions', getInventoryTransactions);
router.get('/', getInventoryItems);
router.post(
  '/adjust',
  requireRoles(
    ROLES.SUPER_ADMIN,
    ROLES.PROCUREMENT_MANAGER,
    ROLES.INVENTORY_MANAGER
  ),
  adjustStock
);

export default router;
