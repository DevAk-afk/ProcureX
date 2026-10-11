import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { seedDatabase } from '../src/scripts/seed.js';

describe('ProcureX End-to-End Procurement Workflow Test', () => {
  let adminToken: string;
  let approverToken: string;
  let officerToken: string;
  let vendorId: string;
  let productId: string;
  let requisitionId: string;
  let purchaseOrderId: string;
  let grnId: string;

  beforeAll(async () => {
    await connectDB();
    await seedDatabase();

    // Login as Super Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@procurex.com', password: 'Password123!' });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.token;

    // Login as Department Manager / Approver
    const approverRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'dept.manager@procurex.com', password: 'Password123!' });
    expect(approverRes.status).toBe(200);
    approverToken = approverRes.body.token;

    // Login as Procurement Officer
    const officerRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'proc.officer@procurex.com', password: 'Password123!' });
    expect(officerRes.status).toBe(200);
    officerToken = officerRes.body.token;
  }, 120000);

  afterAll(async () => {
    await disconnectDB();
  });

  it('1. Fetches dashboard KPIs successfully', async () => {
    const res = await request(app)
      .get('/api/v1/reports/dashboard-kpi')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.activeVendors.value).toBeGreaterThan(0);
    expect(res.body.data.totalProcurementSpend.value).toBeGreaterThan(0);
  });

  it('2. Creates a new qualified vendor and calculates automated score', async () => {
    const res = await request(app)
      .post('/api/v1/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Nexus Tech Systems',
        contactPerson: 'Sunil Rao',
        email: 'sunil@nexustech.com',
        phone: '+91 98888 77777',
        category: 'IT Equipment',
        onTimeDeliveryRate: 94,
        qualityScore: 92,
        priceCompetitiveness: 88,
        complianceScore: 95,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.score).toBeGreaterThan(80);
    expect(res.body.data.riskRating).toBe('Low');
    vendorId = res.body.data._id;
  });

  it('3. Creates a new product catalog item', async () => {
    const res = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        sku: 'TEST-SRV-01',
        name: 'Enterprise Rackmount Server 2U',
        category: 'IT Equipment',
        unitPrice: 180000,
        preferredVendorId: vendorId,
        currentStock: 12,
        reorderThreshold: 5,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    productId = res.body.data._id;
  });

  it('4. Creates and submits a purchase requisition', async () => {
    const res = await request(app)
      .post('/api/v1/requisitions')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        departmentName: 'Information Technology',
        requiredDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        justification: 'Data center capacity expansion.',
        preferredVendorId: vendorId,
        preferredVendorName: 'Nexus Tech Systems',
        lineItems: [
          {
            productId,
            sku: 'TEST-SRV-01',
            productName: 'Enterprise Rackmount Server 2U',
            quantity: 2,
            estimatedUnitPrice: 180000,
            total: 360000,
          },
        ],
        submitNow: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('submitted');
    expect(res.body.data.estimatedTotal).toBe(360000);
    requisitionId = res.body.data._id;
  });

  it('5. Approves the submitted requisition', async () => {
    const res = await request(app)
      .post(`/api/v1/requisitions/${requisitionId}/approve`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ remarks: 'Budget verified and approved.' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('approved');
  });

  it('6. Converts approved requisition to Purchase Order', async () => {
    const res = await request(app)
      .post(`/api/v1/requisitions/${requisitionId}/convert-to-po`)
      .set('Authorization', `Bearer ${officerToken}`)
      .send({ vendorId, vendorName: 'Nexus Tech Systems' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.poNumber).toMatch(/^PO-/);
    expect(res.body.data.status).toBe('approved');
    purchaseOrderId = res.body.data._id;
  });

  it('7. Records partial Goods Receipt against PO and updates stock', async () => {
    const res = await request(app)
      .post('/api/v1/goods-receipts')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        purchaseOrderId,
        warehouseLocation: 'Bengaluru Central Warehouse',
        lineItems: [
          {
            productId,
            productName: 'Enterprise Rackmount Server 2U',
            sku: 'TEST-SRV-01',
            orderedQuantity: 2,
            receivedQuantity: 1,
            acceptedQuantity: 1,
            rejectedQuantity: 0,
            damagedQuantity: 0,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    grnId = res.body.data._id;

    // Verify product stock increased by 1 (was 12 -> now 13)
    const prodRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Authorization', `Bearer ${officerToken}`);
    expect(prodRes.body.data.currentStock).toBe(13);
  });

  it('8. Performs 3-way matching on invoice and detects overbilling quantity discrepancy', async () => {
    // Attempting to bill for 2 units when only 1 was received in GRN
    const res = await request(app)
      .post('/api/v1/invoices')
      .set('Authorization', `Bearer ${officerToken}`)
      .send({
        invoiceNumber: 'INV-TEST-999',
        purchaseOrderId,
        grnId,
        subtotal: 360000,
        grandTotal: 424800,
        lineItems: [
          {
            productId,
            productName: 'Enterprise Rackmount Server 2U',
            sku: 'TEST-SRV-01',
            quantity: 2, // overbilling! GRN only accepted 1 unit
            unitPrice: 180000,
            total: 360000,
          },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('discrepancy');
    expect(res.body.data.matchingResult.isMatched).toBe(false);
    expect(res.body.data.matchingResult.hasQuantityVariance).toBe(true);
    expect(res.body.data.matchingResult.discrepancies.length).toBeGreaterThan(0);
  });

  it('9. Copilot AI answers procurement queries grounded in real database records', async () => {
    const res = await request(app)
      .post('/api/v1/ai/copilot')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ query: 'What is our total procurement spend to date?' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reply).toContain('total procurement spend');
    expect(res.body.data.toolCalls.length).toBeGreaterThan(0);
  });
});
