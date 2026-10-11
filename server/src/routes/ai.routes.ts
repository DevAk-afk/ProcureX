import { Router } from 'express';
import {
  handleCopilotChat,
  getConversations,
  getConversationById,
  deleteConversation,
  handleSmartSourcing,
  handleQuoteAnalyze,
  handleInvoiceOCR,
  handleSpendIntelligence,
  handleInventoryForecast,
  handleVendorRisk,
  handleContractIntelligence,
  handleReportBuilder,
} from '../controllers/ai.controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/copilot', handleCopilotChat);
router.get('/conversations', getConversations);
router.get('/conversations/:id', getConversationById);
router.delete('/conversations/:id', deleteConversation);

router.post('/sourcing', handleSmartSourcing);
router.post('/quote-analyze', handleQuoteAnalyze);
router.post('/invoice-ocr', handleInvoiceOCR);
router.get('/spend-intelligence', handleSpendIntelligence);
router.get('/inventory-forecast', handleInventoryForecast);
router.get('/vendor-risk', handleVendorRisk);
router.post('/contract-analyze', handleContractIntelligence);
router.post('/report-builder', handleReportBuilder);

export default router;
