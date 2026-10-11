import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  exportProductsCSV,
} from '../controllers/product.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/export/csv', exportProductsCSV);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER, ROLES.INVENTORY_MANAGER),
  createProduct
);
router.put(
  '/:id',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER, ROLES.INVENTORY_MANAGER),
  updateProduct
);

export default router;
