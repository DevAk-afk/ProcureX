import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  Building2,
  Package,
  FileText,
  ShoppingCart,
  Send,
  Boxes,
  Receipt,
  PieChart,
  Bot,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { ScoreRing } from '../../components/common/ScoreRing.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';

export const DemoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'vendors' | 'requisitions' | 'pos' | 'rfqs' | 'inventory' | 'ai'>('overview');

  // Realistic sample demo data (completely isolated in-memory)
  const sampleVendors = [
    {
      _id: 'd-v1',
      name: 'TechLogix Solutions Ltd',
      code: 'VND-0101',
      category: 'IT Equipment',
      score: 96,
      rank: 1,
      delivery: 98,
      quality: 96,
      pricing: 92,
      compliance: 99,
      status: 'active',
    },
    {
      _id: 'd-v2',
      name: 'Apex Industrial Supplies Ltd',
      code: 'VND-0102',
      category: 'Industrial & Safety',
      score: 91,
      rank: 2,
      delivery: 92,
      quality: 94,
      pricing: 88,
      compliance: 90,
      status: 'active',
    },
    {
      _id: 'd-v3',
      name: 'Vertex Cloud & Networks',
      code: 'VND-0103',
      category: 'Cloud & Telecom',
      score: 88,
      rank: 3,
      delivery: 95,
      quality: 90,
      pricing: 82,
      compliance: 86,
      status: 'active',
    },
    {
      _id: 'd-v4',
      name: 'PrimeOffice Enterprises',
      code: 'VND-0104',
      category: 'Office Supplies',
      score: 82,
      rank: 4,
      delivery: 84,
      quality: 86,
      pricing: 88,
      compliance: 79,
      status: 'active',
    },
  ];

  const sampleRequisitions = [
    {
      id: 'd-req1',
      num: 'REQ-2026-0041',
      dept: 'Engineering & DevOps',
      requester: 'Rahul Verma',
      itemsCount: 3,
      total: 345000,
      status: 'submitted',
      date: '10 Feb 2026',
    },
    {
      id: 'd-req2',
      num: 'REQ-2026-0042',
      dept: 'Executive & Facility',
      requester: 'Meera Sen',
      itemsCount: 2,
      total: 82000,
      status: 'approved',
      date: '08 Feb 2026',
    },
    {
      id: 'd-req3',
      num: 'REQ-2026-0043',
      dept: 'Information Technology',
      requester: 'Sneha Deshmukh',
      itemsCount: 5,
      total: 512000,
      status: 'converted_to_po',
      date: '05 Feb 2026',
    },
  ];

  const samplePOs = [
    {
      poNum: 'PO-2026-0081',
      vendor: 'TechLogix Solutions Ltd',
      items: 'Dell Latitude 5540 Laptops (×5)',
      total: 312500,
      status: 'sent_to_vendor',
      deliveryDate: '20 Feb 2026',
    },
    {
      poNum: 'PO-2026-0082',
      vendor: 'Apex Industrial Supplies Ltd',
      items: 'Schneider Electric 3-Phase UPS (×2)',
      total: 295000,
      status: 'partially_received',
      deliveryDate: '15 Feb 2026',
    },
  ];

  const sampleRFQs = [
    {
      rfqNum: 'RFQ-2026-0012',
      title: 'Annual Datacenter Switching Infrastructure Refresh',
      status: 'open',
      deadline: '28 Feb 2026',
      invitedCount: 3,
      quotesReceived: 2,
    },
  ];

  const sampleInventory = [
    { sku: 'IT-LAP-01', name: 'Dell Latitude 5540 15.6"', stock: 12, reorder: 5, status: 'Healthy' },
    { sku: 'IT-NET-02', name: 'Cisco Catalyst 1000 Gigabit Switch', stock: 4, reorder: 5, status: 'Low Stock' },
    { sku: 'IND-UPS-01', name: 'Schneider Electric 3-Phase UPS 10kVA', stock: 2, reorder: 2, status: 'Reorder Due' },
    { sku: 'OFF-DSK-01', name: 'Dual-Motor Standing Desk 140x70cm', stock: 18, reorder: 8, status: 'Healthy' },
  ];

  // AI Copilot simulation
  const [aiInput, setAiInput] = useState('');
  const [aiChat, setAiChat] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    {
      role: 'assistant',
      text: 'Hello! I am the ProcureX AI Assistant in **Demo Mode**. You can ask me sample questions about procurement spend, supplier performance, or inventory forecasting.',
    },
  ]);

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const query = aiInput;
    setAiInput('');
    setAiChat((prev) => [...prev, { role: 'user', text: query }]);

    setTimeout(() => {
      let reply = '';
      const q = query.toLowerCase();
      if (q.includes('vendor') || q.includes('supplier')) {
        reply = 'TechLogix Solutions Ltd is our top-rated vendor with an overall score of **96/100**, delivering a 98% on-time rate and 96% quality benchmark across 14 orders.';
      } else if (q.includes('spend') || q.includes('total') || q.includes('cost')) {
        reply = 'In this demo dataset, total quarterly commitments stand at **₹29,80,000** with highest concentration in IT Hardware (42%) and Logistics (22%).';
      } else if (q.includes('stock') || q.includes('inventory')) {
        reply = 'Cisco Catalyst 1000 Gigabit Switch currently has 4 units in stock against a reorder limit of 5. An automatic procurement requisition is recommended.';
      } else {
        reply = `Analysis for "${query}": All 3 active purchase requisitions align with departmental budgets. Zero compliance anomalies flagged in the current evaluation window.`;
      }
      setAiChat((prev) => [...prev, { role: 'assistant', text: reply }]);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-procure-bg flex flex-col font-sans">
      {/* Top Banner: Strict Demo Indicator */}
      <div className="bg-amber-500 text-slate-900 px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-slate-950" />
          <span>DEMO MODE — SAMPLE DATA ONLY. Actions do not alter real production records.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-slate-950 hover:underline text-[11px]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Homepage
          </Link>
          <span className="text-slate-700">|</span>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 bg-slate-900 text-white px-2.5 py-1 rounded-md text-[11px] font-semibold hover:bg-slate-800"
          >
            Live Application Sign In <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Demo Header */}
      <header className="bg-white border-b border-procure-border px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white font-black text-xl shadow-sm">
            P
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-xl text-slate-900">ProcureX Interactive Demo</h1>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Explore vendor scoring, multi-product requisitions, and AI workflows without creating an account.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'vendors', label: 'Vendors (4)' },
            { id: 'requisitions', label: 'Requisitions (3)' },
            { id: 'pos', label: 'Purchase Orders (2)' },
            { id: 'inventory', label: 'Inventory' },
            { id: 'ai', label: 'Demo AI' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === t.id
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Demo Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
                <span className="text-xs font-bold text-slate-500 uppercase">Quarterly Spend</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">₹29,80,000</div>
                <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">↑ 14.2% vs Q3</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
                <span className="text-xs font-bold text-slate-500 uppercase">Active Qualified Vendors</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">4 Partners</div>
                <span className="text-[11px] text-teal-600 font-semibold mt-1 block">Avg Score: 89/100</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
                <span className="text-xs font-bold text-slate-500 uppercase">Open Purchase Orders</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">2 Orders</div>
                <span className="text-[11px] text-amber-600 font-semibold mt-1 block">1 Partial Receipt</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-procure-border shadow-card">
                <span className="text-xs font-bold text-slate-500 uppercase">Low-Stock Alerts</span>
                <div className="text-2xl font-extrabold text-rose-600 mt-1">2 Products</div>
                <span className="text-[11px] text-slate-500 font-semibold mt-1 block">Cisco Switch, UPS</span>
              </div>
            </div>

            {/* Quick Vendor Scorecard Preview */}
            <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Vendor Scoring Engine (Screenshot Model)</h2>
                  <p className="text-xs text-slate-500">Multi-criteria ranking: Delivery (35%), Quality (30%), Price (20%), Compliance (15%)</p>
                </div>
                <button onClick={() => setActiveTab('vendors')} className="text-xs font-bold text-teal-600 hover:underline">
                  View All Vendors →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {sampleVendors.map((v) => (
                  <div key={v._id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-700">{v.code}</span>
                      <ScoreRing score={v.score} size="sm" />
                    </div>
                    <div className="my-3">
                      <h3 className="font-bold text-xs text-slate-900 line-clamp-1">{v.name}</h3>
                      <span className="text-[11px] text-slate-500">{v.category}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 pt-2 border-t border-slate-200 text-[10px]">
                      <div>Delivery: <b className="text-slate-800">{v.delivery}%</b></div>
                      <div>Quality: <b className="text-slate-800">{v.quality}%</b></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Vendors Tab */}
        {activeTab === 'vendors' && (
          <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Evaluated Vendor Registry</h2>
                <p className="text-xs text-slate-500">Sample vendors with multi-criteria weighted audit rankings</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Vendor</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Overall Score</th>
                    <th className="py-3 px-4">On-Time</th>
                    <th className="py-3 px-4">Quality</th>
                    <th className="py-3 px-4">Pricing</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleVendors.map((v) => (
                    <tr key={v._id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-extrabold text-teal-700">#{v.rank}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{v.name}</div>
                        <span className="text-[10px] text-slate-400">{v.code}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{v.category}</td>
                      <td className="py-3 px-4">
                        <span className="font-extrabold text-slate-900">{v.score}</span> / 100
                      </td>
                      <td className="py-3 px-4 font-semibold text-emerald-700">{v.delivery}%</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{v.quality}%</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{v.pricing}%</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={v.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Requisitions Tab */}
        {activeTab === 'requisitions' && (
          <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Multi-Product Purchase Requisitions</h2>
              <p className="text-xs text-slate-500">Sample requisitions illustrating department approvals and multi-item line totals</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Req #</th>
                    <th className="py-3 px-4">Requester</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Items</th>
                    <th className="py-3 px-4">Estimated Total</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleRequisitions.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">{r.num}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{r.requester}</td>
                      <td className="py-3 px-4 text-slate-600">{r.dept}</td>
                      <td className="py-3 px-4 text-slate-600">{r.itemsCount} products</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{r.total.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4"><StatusBadge status={r.status} size="sm" /></td>
                      <td className="py-3 px-4 text-slate-500">{r.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Purchase Orders Tab */}
        {activeTab === 'pos' && (
          <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Automated Purchase Orders</h2>
              <p className="text-xs text-slate-500">Issued vendor purchase orders generated from approved requisitions</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">PO Number</th>
                    <th className="py-3 px-4">Vendor Partner</th>
                    <th className="py-3 px-4">Line Items</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expected Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {samplePOs.map((p) => (
                    <tr key={p.poNum} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-teal-700">{p.poNum}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.vendor}</td>
                      <td className="py-3 px-4 text-slate-600">{p.items}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">₹{p.total.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-4"><StatusBadge status={p.status} size="sm" /></td>
                      <td className="py-3 px-4 text-slate-500">{p.deliveryDate}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card space-y-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Warehouse Inventory & Stock Alerts</h2>
              <p className="text-xs text-slate-500">Real-time stock ledger synchronized with Goods Receipts</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">SKU</th>
                    <th className="py-3 px-4">Item Name</th>
                    <th className="py-3 px-4">Current Stock</th>
                    <th className="py-3 px-4">Reorder Level</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sampleInventory.map((item) => (
                    <tr key={item.sku} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono text-slate-600">{item.sku}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                      <td className="py-3 px-4 font-extrabold text-slate-900">{item.stock} Units</td>
                      <td className="py-3 px-4 text-slate-500">{item.reorder} Units</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Healthy'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Demo AI Tab */}
        {activeTab === 'ai' && (
          <div className="bg-white p-6 rounded-2xl border border-procure-border shadow-card max-w-3xl mx-auto space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900">ProcureX AI Assistant (Demo Simulation)</h2>
                <p className="text-xs text-slate-500">Ask procurement questions against isolated demo dataset</p>
              </div>
            </div>

            <div className="h-72 overflow-y-auto space-y-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
              {aiChat.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl text-xs ${
                      m.role === 'user'
                        ? 'bg-teal-600 text-white font-medium'
                        : 'bg-white border border-slate-200 text-slate-800 shadow-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleAskAi} className="flex gap-2">
              <input
                type="text"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                placeholder="Ask about vendors, spend, or stock shortages..."
                className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm"
              >
                Ask AI
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};
