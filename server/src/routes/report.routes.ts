import { Router } from 'express';
import {
  getDashboardKPIs,
  getSpendAnalytics,
  getInvoiceAging,
} from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/dashboard-kpi', getDashboardKPIs);
router.get('/spend-analytics', getSpendAnalytics);
router.get('/invoice-aging', getInvoiceAging);

export default router;
