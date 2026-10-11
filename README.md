# ProcureX — AI-Powered Procurement Management Platform

A complete, production-ready, full-stack enterprise SaaS procurement platform built with the MERN stack and powered by AI intelligence.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+
- **MongoDB** (optional — falls back to in-memory MongoDB automatically if not running)

### Installation

```bash
# 1. Clone / open the project
cd ProcureX

# 2. Install root dependencies (concurrently)
npm install

# 3. Install server dependencies
npm install --prefix server

# 4. Install client dependencies
npm install --prefix client
```

### Running the Application

```bash
# Start both backend and frontend simultaneously
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (React/Vite) | http://localhost:3000 |
| Backend API | http://localhost:5000/api/v1 |
| Health Check | http://localhost:5000/api/v1/health |

> The database is **auto-seeded** on first startup with all demo accounts, vendors, products, and procurement workflows.

---

## 🔐 Demo Login Credentials

All demo accounts use the password: **`Password123!`**

| Role | Email | Access Level |
|------|-------|-------------|
| Super Admin | admin@procurex.com | Full system access |
| Procurement Manager | proc.manager@procurex.com | Procurement + approvals |
| Procurement Officer | proc.officer@procurex.com | Create requisitions & POs |
| Department Manager | dept.manager@procurex.com | Department approvals |
| Finance Officer | finance@procurex.com | Invoices & payments |
| Inventory Manager | inventory@procurex.com | Inventory & GRNs |
| Vendor | vendor@techlogix.com | Vendor portal (own data only) |

Use the **1-click demo login** buttons on the Login page to instantly switch between roles.

---

## ✨ Features

### Core Procurement Modules
- **Vendor Management** — Profiles, AI scoring, rankings, CSV export
- **Product Catalog** — Products linked to vendors with pricing history
- **Purchase Requisitions** — Create, submit, approve/reject with audit trail
- **Approval Workflows** — Role-based multi-step approval with self-approval prevention
- **Purchase Orders** — Generate from approved requisitions, printable HTML view
- **RFQ / Quotations** — Request for quotations, supplier comparison
- **Goods Receipts (GRN)** — Receive goods against POs, partial receipts
- **3-Way Invoice Matching** — Automated PO ↔ GRN ↔ Invoice reconciliation
- **Payments** — Track payment status, bank details, scheduled payments
- **Budgets** — Department budgets with utilization tracking
- **Contracts** — Vendor contracts with expiry alerts
- **Inventory** — Stock levels, transaction history, low-stock alerts

### AI Intelligence Center
- **AI Procurement Copilot** — Conversational AI with real MongoDB data access
- **Vendor Intelligence** — AI-powered vendor scoring and recommendations
- **Spend Analytics AI** — Anomaly detection and spend optimization
- **Demand Forecasting** — Predictive inventory replenishment
- **Price Intelligence** — Market price benchmarking
- **Risk Assessment** — Vendor and supply chain risk analysis
- **Contract Intelligence** — Contract expiry and renewal insights
- **Invoice Fraud Detection** — Duplicate and anomaly detection
- **Automation Rules** — Trigger-based workflow automation
- **Predictive PO Matching** — Smart requisition-to-PO pairing

### Analytics & Reporting
- **Dashboard** — 8 KPI cards, vendor scoring dashboard, spend breakdown
- **Reports** — Spend by category, vendor performance, approval cycle time
- **Audit Logs** — Full activity trail for every action

---

## 🏗️ Architecture

```
ProcureX/
├── client/                    # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── common/        # KPICard, StatusBadge, ScoreRing, Modal, Drawer
│   │   │   ├── vendor/        # VendorRankingCard, VendorDetailsDrawer
│   │   │   └── layout/        # AppLayout, PublicNavbar, PublicFooter
│   │   ├── context/           # AuthContext, ToastContext
│   │   ├── lib/               # api.ts (Axios), types/
│   │   └── pages/             # All application pages
│   ├── vite.config.ts         # Proxy → localhost:5000
│   └── tailwind.config.js     # procure-* design tokens
│
├── server/                    # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/            # db.ts (MongoDB), constants.ts
│   │   ├── models/            # 16 Mongoose models
│   │   ├── controllers/       # 16 domain controllers
│   │   ├── routes/            # 16 REST route files
│   │   ├── middleware/        # auth.ts, rbac.ts, auditLogger.ts, errorHandler.ts
│   │   ├── services/          # scoringService, aiService, automationService, threeWayMatchingService
│   │   └── scripts/           # seed.ts (demo dataset)
│   ├── tests/                 # Supertest integration tests (9/9 passing)
│   └── .env                   # Environment configuration
│
├── docker-compose.yml         # Optional MongoDB container
└── package.json               # Root monorepo scripts
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TypeScript |
| Styling | Tailwind CSS, shadcn/ui components |
| State | TanStack Query, React Hook Form |
| Validation | Zod |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT + HttpOnly cookies |
| AI | Google Gemini API (falls back to deterministic responses) |
| Testing | Vitest, Supertest, Playwright |

---

## 📊 Vendor Scoring Algorithm

```
Score = (Delivery × 0.35) + (Quality × 0.30) + (Price × 0.20) + (Compliance × 0.15)
```

Scores are recalculated automatically on each goods receipt submission and invoice payment.

---

## 🔒 Security

- JWT tokens stored in **HttpOnly cookies** (not localStorage)
- **RBAC middleware** on every protected route
- **Resource-based authorization** (vendors see only their own data)
- **Self-approval prevention** (users cannot approve their own requisitions)
- **Zod request validation** on all POST/PUT endpoints
- **Audit logging** for all state-changing operations
- **Rate limiting** on authentication endpoints
- CORS configured for development and production origins

---

## 🧪 Testing

```bash
# Run backend integration tests (9 tests)
npm test

# Run with coverage
npm --prefix server run test -- --coverage
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `server/.env` and configure:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/procurex
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
GEMINI_API_KEY=         # Optional: enables real AI responses
```

> Without `GEMINI_API_KEY`, the AI Copilot uses intelligent deterministic fallbacks with real database data.

---

## 🐳 Docker (Optional MongoDB)

```bash
# Start MongoDB container only
docker-compose up -d mongo

# Then run the app normally
npm run dev
```

---

## 📝 Other Scripts

```bash
npm run build       # Build both server and client for production
npm run seed        # Re-seed the database with demo data
npm run dev:server  # Start only the backend
npm run dev:client  # Start only the frontend
```

---

## 📄 License

MIT — Built for demonstration and evaluation purposes.
