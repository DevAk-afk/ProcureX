import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ToastProvider } from './context/ToastContext.js';

// Public Pages
import { HomePage } from './pages/HomePage.js';
import { AboutPage } from './pages/public/AboutPage.js';
import { ContactPage } from './pages/public/ContactPage.js';
import { PrivacyPolicyPage } from './pages/public/PrivacyPolicyPage.js';
import { TermsOfServicePage } from './pages/public/TermsOfServicePage.js';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage.js';
import { RegisterPage } from './pages/auth/RegisterPage.js';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage.js';

// App Layout & Protected Pages
import { AppLayout } from './components/layout/AppLayout.js';
import { DashboardPage } from './pages/dashboard/DashboardPage.js';
import { VendorsPage } from './pages/vendors/VendorsPage.js';
import { ProductsPage } from './pages/products/ProductsPage.js';
import { RequisitionsPage } from './pages/requisitions/RequisitionsPage.js';
import { ApprovalsPage } from './pages/approvals/ApprovalsPage.js';
import { PurchaseOrdersPage } from './pages/purchaseOrders/PurchaseOrdersPage.js';
import { RFQsPage } from './pages/rfqs/RFQsPage.js';
import { GoodsReceiptsPage } from './pages/goodsReceipts/GoodsReceiptsPage.js';
import { InventoryPage } from './pages/inventory/InventoryPage.js';
import { InvoicesPage } from './pages/invoices/InvoicesPage.js';
import { PaymentsPage } from './pages/payments/PaymentsPage.js';
import { BudgetsPage } from './pages/budgets/BudgetsPage.js';
import { ContractsPage } from './pages/contracts/ContractsPage.js';
import { AICenterPage } from './pages/ai/AICenterPage.js';
import { ReportsPage } from './pages/reports/ReportsPage.js';
import { AutomationsPage } from './pages/automations/AutomationsPage.js';
import { NotificationsPage } from './pages/notifications/NotificationsPage.js';
import { SettingsPage } from './pages/settings/SettingsPage.js';

import { DemoPage } from './pages/demo/DemoPage.js';
import { AdminPage } from './pages/admin/AdminPage.js';
import { PurchaseManagerPage } from './pages/purchaseManager/PurchaseManagerPage.js';
import { EmployeePage } from './pages/employee/EmployeePage.js';
import { VendorPage } from './pages/vendor/VendorPage.js';
import { InventoryManagerPage } from './pages/inventory/InventoryManagerPage.js';

const RoleBasedRedirect: React.FC = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'Admin':
    case 'Super Admin':
      return <Navigate to="/admin" replace />;
    case 'Purchase Manager':
    case 'Procurement Manager':
      return <Navigate to="/purchase-manager" replace />;
    case 'Employee / Requester':
    case 'Procurement Officer':
      return <Navigate to="/employee" replace />;
    case 'Vendor':
      return <Navigate to="/vendor" replace />;
    case 'Inventory Manager':
      return <Navigate to="/inventory" replace />;
    default:
      return <Navigate to="/admin" replace />;
  }
};

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-procure-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-xl animate-pulse">
            P
          </div>
          <span className="text-xs font-semibold text-slate-500">Loading ProcureX Workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user is Admin or Super Admin, permit universal access
    if (user.role !== 'Admin' && user.role !== 'Super Admin') {
      return <Navigate to="/app" replace />;
    }
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Marketing & Legal Pages */}
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />

            {/* Independent Demo Page (Zero login, sample data only) */}
            <Route path="/demo" element={<DemoPage />} />

            {/* Authentication Flow */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Direct Independent Role Dashboard Routes */}
            <Route
              path="/super-admin"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Super Admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminPage />} />
            </Route>

            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Super Admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminPage />} />
            </Route>

            <Route
              path="/purchase-manager"
              element={
                <ProtectedRoute allowedRoles={['Purchase Manager', 'Procurement Manager', 'Admin', 'Super Admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<PurchaseManagerPage />} />
            </Route>

            <Route
              path="/employee"
              element={
                <ProtectedRoute allowedRoles={['Employee / Requester', 'Procurement Officer', 'Admin', 'Super Admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<EmployeePage />} />
            </Route>

            <Route
              path="/vendor"
              element={
                <ProtectedRoute allowedRoles={['Vendor', 'Admin', 'Super Admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<VendorPage />} />
            </Route>

            <Route
              path="/inventory"
              element={
                <ProtectedRoute allowedRoles={['Inventory Manager', 'Admin', 'Super Admin']}>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<InventoryManagerPage />} />
            </Route>

            {/* Main Operational Modules */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<RoleBasedRedirect />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="super-admin" element={<AdminPage />} />
              <Route path="vendors" element={<VendorsPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="requisitions" element={<RequisitionsPage />} />
              <Route path="approvals" element={<ApprovalsPage />} />
              <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
              <Route path="rfqs" element={<RFQsPage />} />
              <Route path="goods-receipts" element={<GoodsReceiptsPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="invoices" element={<InvoicesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="contracts" element={<ContractsPage />} />
              <Route path="ai" element={<AICenterPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="automations" element={<AutomationsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
