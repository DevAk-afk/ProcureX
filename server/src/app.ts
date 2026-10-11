import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';

import authRoutes from './routes/auth.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import productRoutes from './routes/product.routes.js';
import requisitionRoutes from './routes/requisition.routes.js';
import purchaseOrderRoutes from './routes/purchaseOrder.routes.js';
import rfqRoutes from './routes/rfq.routes.js';
import goodsReceiptRoutes from './routes/goodsReceipt.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import budgetRoutes from './routes/budget.routes.js';
import contractRoutes from './routes/contract.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import automationRoutes from './routes/automation.routes.js';
import reportRoutes from './routes/report.routes.js';
import aiRoutes from './routes/ai.routes.js';

import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ─── Security & Utility Middleware ──────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  cors({
    origin: isProd
      ? (process.env.CLIENT_URL || true)   // allow same-origin in prod
      : 'http://localhost:3000',
    credentials: true,
  })
);
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

import { getDatabaseInfo } from './config/db.js';

// ─── Health Check ────────────────────────────────────────────────────────────
const handleHealthCheck = (_req: express.Request, res: express.Response) => {
  const dbInfo = getDatabaseInfo();
  const isHealthy = dbInfo.status === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'degraded',
    platform: 'ProcureX Enterprise Procurement',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbInfo.status,
      storageType: dbInfo.mode,
      host: dbInfo.host,
      name: dbInfo.databaseName,
      isPersistent: dbInfo.isPersistent,
    },
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

app.get('/api/v1/health', handleHealthCheck);
app.get('/health', handleHealthCheck);

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/requisitions', requisitionRoutes);
app.use('/api/v1/purchase-orders', purchaseOrderRoutes);
app.use('/api/v1/rfqs', rfqRoutes);
app.use('/api/v1/goods-receipts', goodsReceiptRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/budgets', budgetRoutes);
app.use('/api/v1/contracts', contractRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/automations', automationRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/ai', aiRoutes);

// ─── Serve React Build in Production ────────────────────────────────────────
// In production the client is built into ../client/dist and served statically
if (isProd) {
  const clientDistPath = path.join(process.cwd(), 'client', 'dist');
  app.use(express.static(clientDistPath));

  // All non-API routes → serve React's index.html (client-side routing)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// ─── Centralized Error Handler ───────────────────────────────────────────────
app.use(errorHandler);

export default app;
