import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Vendor } from '../../types/index.js';
import { KPICard } from '../../components/common/KPICard.js';
import { VendorRankingCard } from '../../components/vendor/VendorRankingCard.js';
import { VendorDetailsDrawer } from '../../components/vendor/VendorDetailsDrawer.js';
import { VendorComparisonChart } from '../../components/vendor/VendorComparisonChart.js';
import {
  DollarSign,
  Building2,
  ShoppingCart,
  FileText,
  CheckSquare,
  Clock,
  Receipt,
  Boxes,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Sparkles,
  Download,
  Plus,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.js';

export const DashboardPage: React.FC = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'reports' | 'settings'>('overview');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState('all');

  // Selected vendor for drawer
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [kpiRes, vendorRes] = await Promise.all([
        api.get('/reports/dashboard-kpi'),
        api.get('/vendors'),
      ]);

      if (kpiRes.data.success) {
        setKpis(kpiRes.data.data);
      }
      if (vendorRes.data.success) {
        setVendors(vendorRes.data.data);
      }
    } catch (err: any) {
      error('Failed to load dashboard data', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRecalculateScores = async () => {
    try {
      await api.post('/vendors/recalculate-scores', {});
      success('Scoring Engine Recalculated', 'All active vendor scores and rankings updated.');
      fetchData();
    } catch (err: any) {
      error('Recalculation error', err.message);
    }
  };

  // Filtered vendors
  const filteredVendors = vendors.filter((v) => {
    if (categoryFilter !== 'all' && v.category !== categoryFilter) return false;
    if (riskFilter !== 'all' && v.riskRating !== riskFilter) return false;
    if (minScoreFilter === '80' && v.score < 80) return false;
    if (minScoreFilter === '60' && v.score < 60) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        v.name.toLowerCase().includes(q) ||
        v.vendorCode.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const categories = Array.from(new Set(vendors.map((v) => v.category))).filter(Boolean);

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Top Welcome & Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-procure-text tracking-tight">
            Procurement Overview
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Real-time spend commitments, supplier scorecard performance, and pending approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl border border-procure-border bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/app/requisitions"
            className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" /> New Requisition
          </Link>
        </div>
      </div>

      {/* 6.2 Dashboard KPI Cards Grid (8 Core Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          title="Procurement Spend"
          value={`₹${(kpis?.totalProcurementSpend?.value || 0).toLocaleString('en-IN')}`}
          change={kpis?.totalProcurementSpend?.change || '+14.2%'}
          isPositive={true}
          icon={DollarSign}
          linkTo="/app/reports"
        />
        <KPICard
          title="Active Qualified Vendors"
          value={kpis?.activeVendors?.value || 0}
          change={kpis?.activeVendors?.change || '+4 new'}
          isPositive={true}
          icon={Building2}
          linkTo="/app/vendors"
        />
        <KPICard
          title="Open Purchase Orders"
          value={kpis?.openPurchaseOrders?.value || 0}
          subtitle={kpis?.openPurchaseOrders?.change || 'Active in pipeline'}
          icon={ShoppingCart}
          linkTo="/app/purchase-orders"
        />
        <KPICard
          title="Pending Approvals"
          value={kpis?.pendingApprovals?.value || 0}
          change={kpis?.pendingApprovals?.change || 'Requires action'}
          isPositive={false}
          icon={CheckSquare}
          linkTo="/app/approvals"
        />
        <KPICard
          title="Pending Requisitions"
          value={kpis?.pendingRequisitions?.value || 0}
          subtitle="Awaiting triage"
          icon={FileText}
          linkTo="/app/requisitions"
        />
        <KPICard
          title="Overdue Deliveries"
          value={kpis?.overdueDeliveries?.value || 0}
          change={kpis?.overdueDeliveries?.change || 'On schedule'}
          isPositive={kpis?.overdueDeliveries?.value === 0}
          icon={Clock}
          linkTo="/app/purchase-orders"
        />
        <KPICard
          title="Unpaid Invoices"
          value={`₹${(kpis?.unpaidInvoices?.value || 0).toLocaleString('en-IN')}`}
          subtitle={`${kpis?.unpaidInvoices?.count || 0} pending payment`}
          icon={Receipt}
          linkTo="/app/invoices"
        />
        <KPICard
          title="Low-Stock Alerts"
          value={kpis?.lowStockProducts?.value || 0}
          change={kpis?.lowStockProducts?.change || 'Healthy stock'}
          isPositive={kpis?.lowStockProducts?.value === 0}
          icon={Boxes}
          linkTo="/app/inventory"
        />
      </div>

      {/* 6.3 Automated Vendor Scoring Dashboard Section (Direct inspiration from screenshot!) */}
      <section className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-6">
        {/* Section Header with Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-procure-border">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-procure-text tracking-tight">
                Automated Vendor Scoring Dashboard
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-md">
                Live Algorithm
              </span>
            </div>
            <p className="text-xs text-procure-muted mt-0.5">
              Multi-criteria vendor rankings derived from delivery turnaround, inspection audits, and pricing competitiveness.
            </p>
          </div>

          {/* Navigation Tabs matching screenshot */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'overview'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('vendors')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'vendors'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vendors ({vendors.length})
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'reports'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'settings'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weights
            </button>
          </div>
        </div>

        {/* Filters Panel matching screenshot */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/80">
          <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
            {/* Search input */}
            <div className="relative w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search vendor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>

            {/* Min Score Filter */}
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Scores</option>
              <option value="80">Score ≥ 80</option>
              <option value="60">Score ≥ 60</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculateScores}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-lg border border-teal-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Recalculate Weights
            </button>
            <a
              href="/api/v1/vendors/export/csv"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" /> Export CSV
            </a>
          </div>
        </div>

        {/* Vendor Ranking Cards (3 Per Row on wide desktop) */}
        {filteredVendors.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Building2 className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="text-sm">No suppliers match the selected filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredVendors.map((vendor) => (
              <VendorRankingCard
                key={vendor._id}
                vendor={vendor}
                onSelect={(v) => {
                  setSelectedVendor(v);
                  setIsDrawerOpen(true);
                }}
              />
            ))}
          </div>
        )}

        {/* Comparative Multi-Metric Benchmark Chart */}
        <div className="pt-4">
          <VendorComparisonChart vendors={vendors} />
        </div>
      </section>

      {/* Slide-over Vendor Details Drawer */}
      <VendorDetailsDrawer
        vendor={selectedVendor}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedVendor(null);
        }}
      />
    </div>
  );
};
