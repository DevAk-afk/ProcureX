import { Router } from 'express';
import {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  updateVendorStatus,
  recalculateScores,
  exportVendorsCSV,
} from '../controllers/vendor.controller.js';
import { authenticate } from '../middleware/auth.js';
import { requireRoles } from '../middleware/rbac.js';
import { ROLES } from '../config/constants.js';

const router = Router();

router.use(authenticate);

router.get('/export/csv', exportVendorsCSV);
router.post('/recalculate-scores', requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER), recalculateScores);

router.get('/', getVendors);
router.get('/:id', getVendorById);
router.post('/', requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER), createVendor);
router.put('/:id', requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER, ROLES.PROCUREMENT_OFFICER, ROLES.VENDOR), updateVendor);
router.patch('/:id/status', requireRoles(ROLES.SUPER_ADMIN, ROLES.PROCUREMENT_MANAGER), updateVendorStatus);

export default router;
