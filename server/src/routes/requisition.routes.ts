import { Router } from 'express';
import {
  getRequisitions,
  getRequisitionById,
  createRequisition,
  submitRequisition,
  approveRequisition,
  rejectRequisition,
  convertToPO,
} from '../controllers/requisition.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', getRequisitions);
router.get('/:id', getRequisitionById);
router.post('/', createRequisition);
router.post('/:id/submit', submitRequisition);
router.post(
  '/:id/approve',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.DEPARTMENT_MANAGER),
  approveRequisition
);
router.post(
  '/:id/reject',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.DEPARTMENT_MANAGER),
  rejectRequisition
);
router.post(
  '/:id/convert-to-po',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER),
  convertToPO
);

export default router;
