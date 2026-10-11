import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Sparkles,
  Bot,
  Send,
  Sliders,
  Search,
  FileSpreadsheet,
  Receipt,
  PieChart,
  Boxes,
  ShieldAlert,
  FileSignature,
  Zap,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Download,
  Mail,
  Copy,
} from 'lucide-react';

export const AICenterPage: React.FC = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<
    | 'copilot'
    | 'scoring'
    | 'sourcing'
    | 'quote_analyzer'
    | 'invoice_ocr'
    | 'spend_intel'
    | 'forecast'
    | 'vendor_risk'
    | 'contract_intel'
    | 'report_builder'
    | 'automations'
    | 'settings'
  >('copilot');

  // 1. Copilot State
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<
    Array<{ role: 'user' | 'assistant'; content: string; toolCalls?: any[] }>
  >([
    {
      role: 'assistant',
      content:
        'Hello! I am your ProcureX Copilot. I have live access to your purchase orders, vendor ratings, catalog inventory, and invoice matching records. Ask me anything like:\n- "What is our total procurement spend?"\n- "Which products might run out of stock?"\n- "Show pending approvals"\n- "Which suppliers have the best delivery history?"',
    },
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // 2. Scoring Weights State
  const [weights, setWeights] = useState({
    delivery: 35,
    quality: 30,
    price: 20,
    compliance: 15,
  });

  // 3. Smart Sourcing State
  const [sourcingPrompt, setSourcingPrompt] = useState(
    'Find suppliers for 50 business laptops with 16 GB RAM and 512 GB SSD within a budget of ₹35 lakh deliverable within two weeks'
  );
  const [sourcingResult, setSourcingResult] = useState<any>(null);
  const [sourcingLoading, setSourcingLoading] = useState(false);

  // 4. Quote Analyzer State
  const [quoteList, setQuoteList] = useState<any[]>([
    { vendorName: 'TechLogix Solutions Ltd', price: 625000, deliveryDays: 7, terms: 'Net 30' },
    { vendorName: 'Apex Industrial Systems', price: 685000, deliveryDays: 10, terms: 'Net 45' },
    { vendorName: 'PrimeOffice Supplies', price: 710000, deliveryDays: 12, terms: 'Net 30' },
  ]);
  const [quoteAnalysis, setQuoteAnalysis] = useState<any>(null);

  // 6. Spend Intelligence State
  const [spendIntel, setSpendIntel] = useState<any>(null);

  // 7. Inventory Forecast State
  const [forecasts, setForecasts] = useState<any[]>([]);

  // 8. Vendor Risk State
  const [riskProfiles, setRiskProfiles] = useState<any[]>([]);

  // 10. Report Builder State
  const [reportPrompt, setReportPrompt] = useState('Compare vendor spending across IT and Facilities for the last quarter');
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  // Handlers
  const handleSendCopilot = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!copilotInput.trim()) return;

    const userText = copilotInput;
    setCopilotMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setCopilotInput('');
    setCopilotLoading(true);

    try {
      const res = await api.post('/ai/copilot', { query: userText });
      if (res.data.success) {
        setCopilotMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: res.data.data.reply,
            toolCalls: res.data.data.toolCalls,
          },
        ]);
      }
    } catch (err: any) {
      error('Copilot error', err.message);
    } finally {
      setCopilotLoading(false);
    }
  };

  const handleRunSmartSourcing = async () => {
    setSourcingLoading(true);
    try {
      const res = await api.post('/ai/sourcing', { requirementText: sourcingPrompt });
      if (res.data.success) {
        setSourcingResult(res.data.data);
      }
    } catch (err: any) {
      error('Sourcing failed', err.message);
    } finally {
      setSourcingLoading(false);
    }
  };

  const handleRunQuoteAnalysis = async () => {
    try {
      const res = await api.post('/ai/quote-analyze', { quotes: quoteList });
      if (res.data.success) {
        setQuoteAnalysis(res.data.data);
      }
    } catch (err: any) {
      error('Quote analysis failed', err.message);
    }
  };

  const handleLoadSpendIntel = async () => {
    try {
      const res = await api.get('/ai/spend-intelligence');
      if (res.data.success) setSpendIntel(res.data.data);
    } catch (err: any) {
      error('Spend intelligence failed', err.message);
    }
  };

  const handleLoadForecasts = async () => {
    try {
      const res = await api.get('/ai/inventory-forecast');
      if (res.data.success) setForecasts(res.data.data.forecasts);
    } catch (err: any) {
      error('Forecasting failed', err.message);
    }
  };

  const handleLoadVendorRisk = async () => {
    try {
      const res = await api.get('/ai/vendor-risk');
      if (res.data.success) setRiskProfiles(res.data.data);
    } catch (err: any) {
      error('Risk analysis failed', err.message);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const res = await api.post('/ai/report-builder', { prompt: reportPrompt });
      if (res.data.success) setGeneratedReport(res.data.data);
    } catch (err: any) {
      error('Report generation failed', err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'spend_intel' && !spendIntel) handleLoadSpendIntel();
    if (activeTab === 'forecast' && forecasts.length === 0) handleLoadForecasts();
    if (activeTab === 'vendor_risk' && riskProfiles.length === 0) handleLoadVendorRisk();
    if (activeTab === 'quote_analyzer' && !quoteAnalysis) handleRunQuoteAnalysis();
  }, [activeTab]);

  const navTabs = [
    { id: 'copilot', label: 'AI Copilot', icon: Bot },
    { id: 'scoring', label: 'Vendor Scoring Engine', icon: Sliders },
    { id: 'sourcing', label: 'Smart Sourcing', icon: Search },
    { id: 'quote_analyzer', label: 'Quote Analyzer', icon: FileSpreadsheet },
    { id: 'invoice_ocr', label: 'Invoice Intelligence', icon: Receipt },
    { id: 'spend_intel', label: 'Spend Intelligence', icon: PieChart },
    { id: 'forecast', label: 'Inventory Forecast', icon: Boxes },
    { id: 'vendor_risk', label: 'Vendor Risk', icon: ShieldAlert },
    { id: 'contract_intel', label: 'Contract Intel', icon: FileSignature },
    { id: 'report_builder', label: 'Report Builder', icon: FileSpreadsheet },
    { id: 'automations', label: 'Automations', icon: Zap },
    { id: 'settings', label: 'AI Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
              AI Intelligence Center
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-md">
              12 Modules Active
            </span>
          </div>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Grounded procurement machine intelligence with deterministic database tool calling and explainable analytics.
          </p>
        </div>
      </div>

      {/* Feature Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-procure-border">
        {navTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-teal-500 text-white shadow-sm'
                  : 'bg-white border border-procure-border text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
            </button>
          );
        })}
      </div>

      {/* 1. Copilot View */}
      {activeTab === 'copilot' && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-teal-600" />
              <span className="font-bold text-sm text-slate-800">
                ProcureX Natural-Language Copilot
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Live Database Grounded (No Hallucinations)
            </span>
          </div>

          {/* Chat Messages */}
          <div className="space-y-3 min-h-[350px] max-h-[500px] overflow-y-auto p-3 bg-slate-50/60 rounded-xl border border-slate-100">
            {copilotMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-2xl ${
                  msg.role === 'user'
                    ? 'ml-auto bg-teal-500 text-white font-medium rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.content}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-mono">
                    Tool Executed: {msg.toolCalls.map((t: any) => t.toolName).join(', ')}
                  </div>
                )}
              </div>
            ))}
            {copilotLoading && (
              <div className="bg-white border border-slate-200 p-3 rounded-2xl text-xs text-slate-500 flex items-center gap-2 w-48 shadow-sm">
                <Sparkles className="w-4 h-4 text-teal-500 animate-spin" /> Querying MongoDB records...
              </div>
            )}
          </div>

          {/* Prompt Form */}
          <form onSubmit={handleSendCopilot} className="flex gap-2">
            <input
              type="text"
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              placeholder="Ask anything about purchase spending, supplier ratings, invoices with discrepancies..."
              className="flex-1 text-xs px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              disabled={copilotLoading}
              className="bg-teal-500 hover:bg-teal-600 text-white px-5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>
      )}

      {/* 2. Vendor Scoring Engine View */}
      {activeTab === 'scoring' && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800">
                Explainable Vendor Scoring Weight Configuration
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust criteria coefficients used in the automated supplier rating algorithm.
              </p>
            </div>
            <button
              onClick={async () => {
                await api.post('/vendors/recalculate-scores', {
                  weights: {
                    deliveryWeight: weights.delivery / 100,
                    qualityWeight: weights.quality / 100,
                    priceWeight: weights.price / 100,
                    complianceWeight: weights.compliance / 100,
                  },
                });
                success('Weights Applied', 'All active vendor scores and ranks recalculated.');
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
            >
              Recalculate All Scores
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>On-Time Delivery Weight:</span>
                <span className="text-teal-700">{weights.delivery}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                value={weights.delivery}
                onChange={(e) => setWeights({ ...weights, delivery: Number(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Product Quality Weight:</span>
                <span className="text-teal-700">{weights.quality}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={60}
                value={weights.quality}
                onChange={(e) => setWeights({ ...weights, quality: Number(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Price Competitiveness Weight:</span>
                <span className="text-teal-700">{weights.price}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={50}
                value={weights.price}
                onChange={(e) => setWeights({ ...weights, price: Number(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>Compliance & Audit Weight:</span>
                <span className="text-teal-700">{weights.compliance}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={40}
                value={weights.compliance}
                onChange={(e) => setWeights({ ...weights, compliance: Number(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 3. Smart Sourcing View */}
      {activeTab === 'sourcing' && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-800">Natural-Language Smart Sourcing</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter requirement specifications to parse items, budget, and match authorized vendors.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={sourcingPrompt}
              onChange={(e) => setSourcingPrompt(e.target.value)}
              className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleRunSmartSourcing}
              disabled={sourcingLoading}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" /> Analyze Sourcing
            </button>
          </div>

          {sourcingResult && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-xl text-xs text-teal-900 leading-relaxed">
                <strong>Strategic Insight:</strong> {sourcingResult.strategicInsight}
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Recommended Qualified Suppliers</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sourcingResult.recommendedSuppliers?.map((s: any, idx: number) => (
                    <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                      <div className="font-bold text-slate-800">{s.vendorName}</div>
                      <div className="text-[11px] text-slate-500">{s.category} • Score: {s.score}/100</div>
                      <div className="text-sm font-black text-teal-700">₹{s.estimatedTotalCost.toLocaleString('en-IN')}</div>
                      <p className="text-[11px] text-slate-600">{s.recommendationReason}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4. Quote Analyzer View */}
      {activeTab === 'quote_analyzer' && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800">AI Supplier Quotation Analyzer</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Compares multiple tenders, calculates savings opportunities, and drafts negotiation emails.
              </p>
            </div>
            <button
              onClick={handleRunQuoteAnalysis}
              className="bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Re-analyze Quotes
            </button>
          </div>

          {quoteAnalysis && (
            <div className="space-y-6">
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-3">Vendor</th>
                      <th className="p-3">Quoted Amount (₹)</th>
                      <th className="p-3">Variance vs Lowest</th>
                      <th className="p-3">Delivery Turnaround</th>
                      <th className="p-3">Terms</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quoteAnalysis.analyzedQuotes?.map((q: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{q.vendorName}</td>
                        <td className="p-3 font-black text-slate-900">₹{q.price.toLocaleString('en-IN')}</td>
                        <td className="p-3 font-bold">
                          {q.isLowest ? (
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Lowest Bid</span>
                          ) : (
                            <span className="text-rose-600">+{q.variancePercent} (+₹{q.varianceVsLowest.toLocaleString('en-IN')})</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{q.deliveryDays} days</td>
                        <td className="p-3 text-slate-600">{q.terms}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Draft Negotiation Email */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-teal-600" /> AI Drafted Negotiation Email
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(quoteAnalysis.negotiationEmailDraft);
                      success('Copied', 'Email draft copied to clipboard.');
                    }}
                    className="text-teal-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy Text
                  </button>
                </div>
                <pre className="p-3 bg-white rounded-lg border border-slate-200 font-sans whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {quoteAnalysis.negotiationEmailDraft}
                </pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Invoice OCR View */}
      {activeTab === 'invoice_ocr' && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-800">AI Invoice OCR & Digital Extraction</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Extract line items, tax components, and invoice totals with 3-way match confidence scoring.
            </p>
          </div>

          <div className="p-8 border-2 border-dashed border-teal-300 rounded-2xl bg-teal-50/20 text-center space-y-3">
            <Receipt className="w-10 h-10 text-teal-600 mx-auto" />
            <h4 className="font-bold text-slate-800 text-sm">Upload Invoice PDF or Scanned Image</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Simulated optical character recognition engine instantly extracts supplier tax credentials and compares against purchase orders.
            </p>
            <button
              onClick={async () => {
                const res = await api.post('/ai/invoice-ocr', { rawText: 'sample' });
                success('OCR Complete', `Extracted invoice ${res.data.data.invoiceNumber} with ${res.data.data.ocrConfidence} confidence.`);
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm"
            >
              Simulate Instant OCR Extraction
            </button>
          </div>
        </div>
      )}

      {/* 6. Spend Intelligence View */}
      {activeTab === 'spend_intel' && spendIntel && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-800">Spend Anomaly & Risk Detection</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Statistical rules identify duplicate invoice risks and abnormal supplier concentration.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
              {spendIntel.concentrationRiskIndex}
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase">Detected Anomalies ({spendIntel.anomalies?.length})</h4>
            {spendIntel.anomalies?.map((a: any, idx: number) => (
              <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5 text-rose-700">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> {a.type}
                  </span>
                  <span className="text-slate-500">Impact: ₹{a.impactAmount?.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{a.description}</p>
                <div className="pt-1 text-[11px] text-teal-800 font-semibold">
                  Action: {a.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Forecast View */}
      {activeTab === 'forecast' && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-800">AI Inventory Demand Forecasting</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Predicted consumption across 7, 14, 30, and 90-day horizons with lead-time safeguards.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3">SKU / Item</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Days to Stockout</th>
                  <th className="p-3">14-Day Demand</th>
                  <th className="p-3">30-Day Demand</th>
                  <th className="p-3">Reorder Advice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {forecasts.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{f.productName}</div>
                      <div className="text-[11px] text-teal-700 font-mono">{f.sku}</div>
                    </td>
                    <td className="p-3 font-extrabold text-slate-800">{f.currentStock}</td>
                    <td className="p-3 font-semibold text-slate-700">{f.daysUntilStockout} days</td>
                    <td className="p-3 text-slate-600">{f.forecasts?.['14_days']} units</td>
                    <td className="p-3 text-slate-600">{f.forecasts?.['30_days']} units</td>
                    <td className="p-3">
                      {f.reorderRecommended ? (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                          Reorder {f.suggestedQuantity} units
                        </span>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                          Sufficient
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Vendor Risk View */}
      {activeTab === 'vendor_risk' && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-800">Supplier Risk Intelligence Matrix</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-factor vendor exposure evaluating delivery slippage, quality variance, and document validity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskProfiles.map((r, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span>{r.vendorName} ({r.category})</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] ${
                      r.riskRating === 'Low'
                        ? 'bg-emerald-50 text-emerald-700'
                        : r.riskRating === 'Medium'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {r.riskRating} Risk
                  </span>
                </div>
                <div className="text-[11px] text-slate-500">
                  Risk Factors: {r.riskFactors?.join(' • ')}
                </div>
                <div className="text-[11px] text-teal-800 font-semibold pt-1 border-t border-slate-200">
                  Action: {r.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 10. Report Builder View */}
      {activeTab === 'report_builder' && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-800">AI Natural-Language Report Builder</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Type custom reporting requests to synthesize structured tabular queries.
            </p>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={reportPrompt}
              onChange={(e) => setReportPrompt(e.target.value)}
              className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={handleGenerateReport}
              className="bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-sm"
            >
              Generate Report
            </button>
          </div>

          {generatedReport && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                <strong>{generatedReport.reportTitle}</strong>: {generatedReport.summary}
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 text-[11px]">
                    <tr>
                      <th className="p-3">Category</th>
                      <th className="p-3">Total Orders</th>
                      <th className="p-3">Total Spend (₹)</th>
                      <th className="p-3">Avg Turnaround</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {generatedReport.tableData?.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 font-bold text-slate-800">{row.category}</td>
                        <td className="p-3">{row.totalOrders}</td>
                        <td className="p-3 font-bold">₹{row.spend.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-slate-600">{row.avgTurnaround}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 11. Automations & 12. Settings Fallback */}
      {(activeTab === 'automations' || activeTab === 'contract_intel' || activeTab === 'settings') && (
        <div className="bg-white border border-procure-border rounded-2xl shadow-card p-6 space-y-4">
          <h3 className="font-bold text-base text-slate-800">
            {activeTab === 'automations' ? 'Workflow Automations' : activeTab === 'contract_intel' ? 'Contract Intelligence' : 'AI Model Configuration'}
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The ProcureX AI engine is configured with deterministic allowlisted tool calls and local fallback. When <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-teal-700">GEMINI_API_KEY</code> is set in the environment, external streaming responses are seamlessly augmented.
          </p>
        </div>
      )}
    </div>
  );
};
