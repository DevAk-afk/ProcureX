import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  BarChart3,
  Download,
  Calendar,
  RefreshCw,
  PieChart as PieIcon,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { error } = useToast();

  const [analytics, setAnalytics] = useState<any>(null);
  const [aging, setAging] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [aRes, agRes] = await Promise.all([
        api.get('/reports/spend-analytics'),
        api.get('/reports/invoice-aging'),
      ]);
      if (aRes.data.success) setAnalytics(aRes.data.data);
      if (agRes.data.success) setAging(agRes.data.data);
    } catch (err: any) {
      error('Failed to load reports', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const agingData = aging
    ? [
        { bucket: 'Not Due (Current)', amount: aging.current },
        { bucket: '1-30 Days Overdue', amount: aging.days1_30 },
        { bucket: '31-60 Days Overdue', amount: aging.days31_60 },
        { bucket: '61-90 Days Overdue', amount: aging.days61_90 },
        { bucket: '90+ Days Overdue', amount: aging.days90Plus },
      ]
    : [];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Financial Analytics & Procurement Reports
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Month-over-month expenditure, category allocation, and invoice aging analysis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/v1/vendors/export/csv"
            className="inline-flex items-center gap-1.5 bg-white border border-procure-border text-slate-700 px-3.5 py-2 rounded-xl font-semibold text-xs shadow-sm hover:bg-slate-50 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-500" /> Export Vendor Ledger
          </a>
          <button onClick={fetchData} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Monthly Spend Velocity Chart */}
      <div className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-800">
              Monthly Procurement Spend Velocity vs Budget Limit
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Historical 6-month commitments (₹)</p>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
            CapEx & OpEx Aggregated
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.monthlyTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
              <YAxis
                stroke="#94A3B8"
                fontSize={11}
                tickFormatter={(v) => `₹${v / 1000}k`}
              />
              <Tooltip
                formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Amount']}
                contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="spend" name="Actual Spend" fill="#16B5A5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="budget" name="Department Budget Cap" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Invoice Aging & Top Vendors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Invoice Aging */}
        <div className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-base text-slate-800">Invoice Aging Analysis</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis dataKey="bucket" type="category" stroke="#94A3B8" fontSize={11} width={110} />
                <Tooltip formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Balance']} />
                <Bar dataKey="amount" fill="#D9535D" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Vendors by Spend */}
        <div className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-bold text-base text-slate-800">Top Suppliers by Spend Concentration</h3>
          <div className="divide-y divide-slate-100 text-xs">
            {analytics?.topVendorsBySpend?.map((v: any, idx: number) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 text-sm">
                    {idx + 1}. {v._id}
                  </span>
                  <div className="text-[11px] text-slate-400">{v.orderCount} purchase orders</div>
                </div>
                <div className="font-black text-slate-900 text-sm">
                  ₹{v.total.toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
