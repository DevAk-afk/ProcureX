import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';

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
// Configure permitted CORS origins (Render production frontend, localhost, or env)
const allowedOrigins = [
  'https://procurex-ovml.onrender.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
if (process.env.CLIENT_URL) {
  const customOrigin = process.env.CLIENT_URL.trim().replace(/\/+$/, '');
  if (!allowedOrigins.includes(customOrigin)) {
    allowedOrigins.push(customOrigin);
  }
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server requests or tools like Postman/cURL with no origin header
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      // In production, also allow Render subdomains if deployed with preview branches
      if (origin.endsWith('.onrender.com')) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback: allow with credentials for flexibility
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// ─── Root Endpoint ───────────────────────────────────────────────────────────
// Frontend is hosted separately — just confirm the API is reachable
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'ProcureX API is running.',
    frontend: process.env.CLIENT_URL || 'https://procurex-ovml.onrender.com',
    docs: '/api/v1/health',
  });
});

// ─── Centralized Error Handler ───────────────────────────────────────────────
app.use(errorHandler);

export default app;
