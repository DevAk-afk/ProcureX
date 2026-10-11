import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PublicNavbar } from '../components/layout/PublicNavbar.js';
import { PublicFooter } from '../components/layout/PublicFooter.js';
import { DashboardHeroPreview } from '../components/landing/DashboardHeroPreview.js';
import { useAuth } from '../context/AuthContext.js';
import {
  ArrowRight,
  CheckCircle2,
  Building2,
  BarChart3,
  FileText,
  ShoppingCart,
  Boxes,
  Receipt,
  PieChart,
  FileSignature,
  CheckSquare,
  FileSpreadsheet,
  Sparkles,
  Zap,
  ShieldCheck,
  Search,
  Bot,
  TrendingUp,
  Cpu,
  Layers,
  Users,
  ChevronRight,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { quickDemoLogin } = useAuth();
  const navigate = useNavigate();

  // Interactive AI Copilot simulator state for section 4.5
  const [activeCopilotQuery, setActiveCopilotQuery] = useState(
    'What is our total procurement spend this quarter?'
  );
  const [copilotReply, setCopilotReply] = useState(
    'Based on authorized purchase records, our total spend across all departments is ₹29,80,000 across 24 verified purchase orders. The highest volume was directed to TechLogix Solutions Ltd (₹12,40,000) with a 98% on-time delivery rate.'
  );

  const copilotSamples = [
    {
      q: 'What is our total procurement spend this quarter?',
      r: 'Based on authorized purchase records, our total spend across all departments is ₹29,80,000 across 24 verified purchase orders. The highest volume was directed to TechLogix Solutions Ltd (₹12,40,000) with a 98% on-time delivery rate.',
    },
    {
      q: 'Which suppliers have the best delivery history?',
      r: '1. TechLogix Solutions Ltd (#1): 98% on-time rate, score 96/100.\n2. Vertex Cloud & Networks (#3): 95% on-time rate, score 88/100.\n3. Apex Industrial Supplies (#2): 92% on-time rate, score 91/100.',
    },
    {
      q: 'Show invoices that do not match purchase orders',
      r: 'Invoice #INV-AP-4912 from Apex Industrial Supplies Ltd flagged a quantity discrepancy: Invoiced 10 units, but warehouse accepted 8 units (Variance: ₹5,900). Pending manual review.',
    },
    {
      q: 'Which products might run out of stock?',
      r: '2 critical items reached their reorder limit:\n- Cisco Catalyst 1000 Gigabit Switch (4 in stock, reorder limit: 5)\n- Motorized Standing Desk (6 in stock, reorder limit: 8). Suggested reorder initiated.',
    },
  ];

  const features = [
    {
      icon: Building2,
      title: 'Vendor Management',
      desc: 'Complete supplier lifecycle from onboarding approval, compliance document verification to performance reviews.',
      path: '/app/vendors',
    },
    {
      icon: TrendingUp,
      title: 'AI Vendor Scoring',
      desc: 'Explainable vendor scorecard weighting delivery, product quality, pricing index, and tax compliance out of 100.',
      path: '/app',
    },
    {
      icon: FileText,
      title: 'Purchase Requisitions',
      desc: 'Structured requisition forms with multi-item catalogs, cost center tags, and budget threshold checks.',
      path: '/app/requisitions',
    },
    {
      icon: ShoppingCart,
      title: 'Purchase Order Automation',
      desc: 'Automated conversion from approved requisitions to purchase orders with PDF generation and vendor tracking.',
      path: '/app/purchase-orders',
    },
    {
      icon: Boxes,
      title: 'Inventory Intelligence',
      desc: 'Multi-warehouse stock levels, auditable stock ledger movements, and automatic depletion sync with Goods Receipts.',
      path: '/app/inventory',
    },
    {
      icon: Receipt,
      title: '3-Way Invoice Matching',
      desc: 'Automated reconciliation between POs, Goods Receipts, and vendor invoices with instant price & quantity variance flags.',
      path: '/app/invoices',
    },
    {
      icon: PieChart,
      title: 'Spend Analytics',
      desc: 'Real-time visibility into commitments, actuals, department budgets, and supplier concentration metrics.',
      path: '/app/reports',
    },
    {
      icon: FileSignature,
      title: 'Contract Management',
      desc: 'Centralized legal agreement repository with automated renewal countdowns, SLA benchmarks, and clause tracking.',
      path: '/app/contracts',
    },
    {
      icon: CheckSquare,
      title: 'Approval Workflows',
      desc: 'Multi-tier authorization hierarchy with strict self-approval prevention and auditable action histories.',
      path: '/app/approvals',
    },
    {
      icon: FileSpreadsheet,
      title: 'Reports & Exports',
      desc: 'Exportable CSV registers and printable summaries for procurement spend, invoice aging, and vendor scorecards.',
      path: '/app/reports',
    },
    {
      icon: Sparkles,
      title: 'AI Procurement Copilot',
      desc: 'Natural-language conversational assistant grounded in your real authorized MongoDB database records with zero hallucinations.',
      path: '/app/ai',
    },
    {
      icon: Zap,
      title: 'Workflow Automation',
      desc: 'Configurable event-driven rules for low-stock triggers, high variance alerts, and approval notifications.',
      path: '/app/automations',
    },
  ];

  const handleModuleClick = (path: string) => {
    const token = localStorage.getItem('procurex_token');
    if (token) {
      navigate(path);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-procure-bg flex flex-col font-sans">
      <PublicNavbar />

      {/* 4.2 Hero Section */}
      <section className="pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden border-b border-procure-border bg-gradient-to-b from-white via-white to-procure-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-800 px-3.5 py-1.5 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" /> Enterprise-Grade AI Procurement Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-procure-text tracking-tight leading-[1.1]">
                Smarter Procurement. <br />
                <span className="text-teal-500">Better Decisions.</span>
              </h1>

              <p className="text-base sm:text-lg text-procure-muted leading-relaxed max-w-xl">
                Manage vendors, automate purchasing, compare quotations, and gain real-time insights with one intelligent procurement platform.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-7 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/demo"
                  className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-800 px-6 py-3.5 rounded-xl font-bold text-sm border border-slate-300 shadow-sm transition-all"
                >
                  <Sparkles className="w-4 h-4 text-teal-600" /> Explore Demo
                </Link>
              </div>

              {/* Benefit statement */}
              <div className="flex items-center gap-6 pt-3 text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Indian GST & MSME Ready
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Grounded AI Copilot
                </span>
              </div>
            </div>

            {/* Right Column: Dashboard Preview inspired by screenshot */}
            <div className="lg:col-span-6 relative">
              <div className="absolute -inset-4 bg-teal-400/10 rounded-3xl blur-2xl -z-10" />
              <DashboardHeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* 4.3 Trust & Value Proposition */}
      <section className="py-20 bg-white border-b border-procure-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-procure-text tracking-tight">
              Everything You Need to Manage Procurement
            </h2>
            <p className="text-sm text-procure-muted mt-2">
              Built from the ground up for modern enterprise organizations requiring strict authorization and financial reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-procure-bg border border-procure-border rounded-2xl p-6 flex flex-col justify-between hover:border-teal-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-100/70 flex items-center justify-center text-teal-700 mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800">Centralized Vendor Management</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Consolidate qualified supplier profiles, compliance documentation, performance history, and GST certificates in a single ledger.
                </p>
              </div>
            </div>

            <div className="bg-procure-bg border border-procure-border rounded-2xl p-6 flex flex-col justify-between hover:border-teal-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100/70 flex items-center justify-center text-emerald-700 mb-4">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800">Faster Purchase Approvals</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Multi-tier approval workflows with policy thresholds, cost center validation, and self-approval protections.
                </p>
              </div>
            </div>

            <div className="bg-procure-bg border border-procure-border rounded-2xl p-6 flex flex-col justify-between hover:border-teal-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-cyan-100/70 flex items-center justify-center text-cyan-700 mb-4">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800">AI-Powered Insights</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Real-time spend anomaly detection, natural-language Copilot queries, automated 3-way invoice matching, and demand forecasting.
                </p>
              </div>
            </div>

            <div className="bg-procure-bg border border-procure-border rounded-2xl p-6 flex flex-col justify-between hover:border-teal-300 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-indigo-100/70 flex items-center justify-center text-indigo-700 mb-4">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-slate-800">Real-Time Spend Visibility</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Track committed PO expenditures against allocated department budgets to eliminate duplicate commitments and overbilling.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.4 Features Section Grid */}
      <section id="features" className="py-20 bg-procure-bg border-b border-procure-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
              Full Spectrum Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-procure-text tracking-tight mt-1">
              End-to-End Enterprise Procurement Modules
            </h2>
            <p className="text-sm text-procure-muted mt-2">
              Every workflow from requisition creation to goods acceptance, invoice matching, and automated supplier scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  onClick={() => handleModuleClick(f.path)}
                  className="bg-white border border-procure-border rounded-2xl p-6 shadow-card hover:shadow-cardHover transition-all flex flex-col justify-between group cursor-pointer hover:border-teal-400"
                >
                  <div>
                    <div className="w-11 h-11 rounded-xl bg-teal-50 group-hover:bg-teal-500 group-hover:text-white transition-colors flex items-center justify-center text-teal-600 mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-slate-800 group-hover:text-teal-600 transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center text-xs font-semibold text-teal-600 group-hover:underline">
                    Access module <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4.5 AI Intelligence Showcase */}
      <section id="ai-intelligence" className="py-20 bg-white border-b border-procure-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
                ProcureX Intelligence Core
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-procure-text tracking-tight">
                Procurement Intelligence That Works With Your Team
              </h2>
              <p className="text-sm text-procure-muted leading-relaxed">
                Unlike generic LLM wrappers, ProcureX uses deterministic backend tools with strict validation. Ask questions in natural English and get exact figures from your database.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Natural-Language Sourcing</h4>
                    <p className="text-xs text-slate-500">Query specifications like "50 laptops within ₹8 lakh" to get instant matched suppliers.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Deterministic 3-Way Match Verification</h4>
                    <p className="text-xs text-slate-500">Compares quantities, unit prices, and tax rates without guessing or fuzzy billing errors.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Predictive Stockout Forecasting</h4>
                    <p className="text-xs text-slate-500">Computes daily consumption burn rate and supplier lead time to trigger reorder safeguards.</p>
                  </div>
                </div>
              </div>

              <div className="pt-3">
                <Link
                  to="/app/ai"
                  className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                >
                  Explore AI Intelligence Center <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Interactive Live AI Copilot Simulator */}
            <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 shadow-2xl text-slate-100 border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-teal-400" />
                  <span className="font-bold text-sm text-white">ProcureX Copilot • Interactive Simulator</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  Tool Calling Active
                </span>
              </div>

              {/* Sample Question Buttons */}
              <div className="py-4 space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Click a real prompt to test:
                </span>
                <div className="flex flex-wrap gap-2">
                  {copilotSamples.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveCopilotQuery(s.q);
                        setCopilotReply(s.r);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left ${
                        activeCopilotQuery === s.q
                          ? 'bg-teal-500/20 text-teal-300 border-teal-500'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      "{s.q}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Chat Message Display */}
              <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="text-teal-400 flex items-center gap-1.5">
                  <span className="font-sans font-bold text-slate-300">User:</span> {activeCopilotQuery}
                </div>
                <div className="text-slate-300 whitespace-pre-line leading-relaxed pl-3 border-l-2 border-teal-500 font-sans">
                  {copilotReply}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>Database Query Tools: GetSpendAnalytics, SearchVendors, SearchInvoices</span>
                <span className="text-teal-400 font-semibold">100% Grounded</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4.6 How It Works */}
      <section id="how-it-works" className="py-20 bg-procure-bg border-b border-procure-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
              Lifecycle Execution
            </span>
            <h2 className="text-3xl font-extrabold text-procure-text tracking-tight mt-1">
              How ProcureX Powers Purchasing
            </h2>
            <p className="text-sm text-procure-muted mt-2">
              A frictionless four-stage lifecycle from requisition to final invoice reconciliation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-procure-border rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-sm mb-4 border border-teal-200">
                01
              </div>
              <h3 className="font-bold text-base text-slate-800">1. Create Requisition</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Staff submit line-item requirements tagged to their department, cost center, and required delivery date.
              </p>
            </div>

            <div className="bg-white border border-procure-border rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-sm mb-4 border border-teal-200">
                02
              </div>
              <h3 className="font-bold text-base text-slate-800">2. Compare & RFQ</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Compare supplier quotations side by side, review automated vendor scores, and award contracts fairly.
              </p>
            </div>

            <div className="bg-white border border-procure-border rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-sm mb-4 border border-teal-200">
                03
              </div>
              <h3 className="font-bold text-base text-slate-800">3. Approve & Order</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Authorized approvers review budget thresholds, sign off with remarks, and automatically dispatch Purchase Orders.
              </p>
            </div>

            <div className="bg-white border border-procure-border rounded-2xl p-6 relative">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-700 font-extrabold flex items-center justify-center text-sm mb-4 border border-teal-200">
                04
              </div>
              <h3 className="font-bold text-base text-slate-800">4. Receive & Match</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Warehouse records physical receipts, while automated 3-way matching reconciles the invoice before payment release.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.7 Use-Case Section */}
      <section id="solutions" className="py-20 bg-white border-b border-procure-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-teal-600 uppercase tracking-widest">
              Tailored for Every Stakeholder
            </span>
            <h2 className="text-3xl font-extrabold text-procure-text tracking-tight mt-1">
              Engineered Across All Roles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-800">Procurement & Sourcing Teams</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Consolidate supplier RFQs, enforce contract SLAs, and track automated vendor scorecards with on-time delivery rates and risk categories.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-800">Finance & Accounts</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Eliminate overbilling with automated 3-way matching, track MSME 45-day payment statutory deadlines, and verify CGST/SGST/IGST breakdowns.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-800">Warehouse & Inventory Managers</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Inspect physical deliveries against POs, record damaged goods, monitor multi-warehouse stock levels, and receive low-stock alerts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4.8 Final Call to Action */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Make Procurement Simpler?
          </h2>
          <p className="text-base text-teal-100 max-w-xl mx-auto leading-relaxed">
            Bring your suppliers, purchasing workflows, and procurement intelligence together in ProcureX.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white text-teal-900 font-bold text-sm shadow-lg hover:bg-slate-100 transition-all"
            >
              Create Your Account
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-700/60 hover:bg-teal-700 text-white font-bold text-sm border border-teal-500/50 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
};
