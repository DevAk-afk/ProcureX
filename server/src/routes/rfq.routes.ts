import { Router } from 'express';
import {
  getRFQs,
  getRFQById,
  createRFQ,
  submitQuote,
  awardRFQ,
} from '../controllers/rfq.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/', getRFQs);
router.get('/:id', getRFQById);
router.post(
  '/',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER),
  createRFQ
);
router.post('/:id/quotes', submitQuote);
router.post(
  '/:id/award',
  requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER),
  awardRFQ
);

export default router;
