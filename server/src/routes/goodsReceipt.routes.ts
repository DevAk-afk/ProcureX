import { Router } from 'express';
import {
  getGoodsReceipts,
  getGoodsReceiptById,
  createGoodsReceipt,
} from '../controllers/goodsReceipt.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', getGoodsReceipts);
router.get('/:id', getGoodsReceiptById);
router.post(
  '/',
  requireRoles(
    ROLES.SUPER_ADMIN,
    ROLES.PROCUREMENT_MANAGER,
    ROLES.PROCUREMENT_OFFICER,
    ROLES.INVENTORY_MANAGER
  ),
  createGoodsReceipt
);

export default router;
