import { Router } from 'express';
import {
  getContracts,
  getContractById,
  createContract,
  updateContract,
} from '../controllers/contract.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', getContracts);
router.get('/:id', getContractById);
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER),
  createContract
);
router.put(
  '/:id',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER),
  updateContract
);

export default router;
