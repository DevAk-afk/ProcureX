import React, { useState } from 'react';
import { Vendor } from '../../types/index.js';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { SlidersHorizontal } from 'lucide-react';

interface VendorComparisonChartProps {
  vendors: Vendor[];
}

export const VendorComparisonChart: React.FC<VendorComparisonChartProps> = ({ vendors }) => {
  const [selectedMetric, setSelectedMetric] = useState<'all' | 'delivery' | 'quality' | 'price' | 'compliance'>('all');

  const chartData = vendors.slice(0, 7).map((v) => ({
    name: v.name.length > 15 ? v.name.slice(0, 15) + '...' : v.name,
    overallScore: v.score,
    delivery: v.onTimeDeliveryRate,
    quality: v.qualityScore,
    price: v.priceCompetitiveness,
    compliance: v.complianceScore,
  }));

  return (
    <div className="bg-white border border-procure-border rounded-card p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-procure-text">
            Supplier Performance Multi-Metric Benchmark
          </h3>
          <p className="text-xs text-procure-muted mt-0.5">
            Cross-vendor audit of on-time delivery, certified quality standards, and price competitiveness.
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setSelectedMetric('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMetric === 'all'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Metrics
          </button>
          <button
            onClick={() => setSelectedMetric('delivery')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMetric === 'delivery'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivery
          </button>
          <button
            onClick={() => setSelectedMetric('quality')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMetric === 'quality'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Quality
          </button>
          <button
            onClick={() => setSelectedMetric('price')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              selectedMetric === 'price'
                ? 'bg-white text-teal-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Price
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} angle={-15} textAnchor="end" />
            <YAxis stroke="#94A3B8" fontSize={11} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#FFFFFF',
                borderColor: '#E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

            {(selectedMetric === 'all' || selectedMetric === 'delivery') && (
              <Bar dataKey="delivery" name="On-Time Delivery (%)" fill="#16B5A5" radius={[4, 4, 0, 0]} />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'quality') && (
              <Bar dataKey="quality" name="Quality Score (%)" fill="#1C9B73" radius={[4, 4, 0, 0]} />
            )}
            {(selectedMetric === 'all' || selectedMetric === 'price') && (
              <Bar dataKey="price" name="Price Index (%)" fill="#5C9BA5" radius={[4, 4, 0, 0]} />
            )}
            {selectedMetric === 'all' && (
              <Bar dataKey="compliance" name="Compliance (%)" fill="#94A3B8" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
