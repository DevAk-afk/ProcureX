import React from 'react';
import { ScoreRing } from '../common/ScoreRing.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Vendor } from '../../types/index.js';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, Tooltip } from 'recharts';

interface VendorRankingCardProps {
  vendor: Vendor;
  onSelect: (vendor: Vendor) => void;
}

export const VendorRankingCard: React.FC<VendorRankingCardProps> = ({ vendor, onSelect }) => {
  const initials = vendor.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Mini trend data
  const miniPerformance = vendor.performanceHistory || [
    { date: 'Oct', delivery: 90, quality: 92 },
    { date: 'Nov', delivery: 94, quality: 95 },
    { date: 'Dec', delivery: vendor.onTimeDeliveryRate, quality: vendor.qualityScore },
  ];

  return (
    <div className="bg-white border border-procure-border rounded-card p-5 shadow-card hover:shadow-cardHover transition-all duration-300 flex flex-col justify-between group">
      {/* Card Header: Vendor info & Rank */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center font-bold text-teal-700 text-sm shrink-0">
              {initials}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base leading-tight group-hover:text-teal-600 transition-colors">
                {vendor.name}
              </h4>
              <p className="text-xs text-procure-muted mt-0.5">{vendor.category}</p>
            </div>
          </div>

          {/* Ranking Badge */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-lg shrink-0">
            <span className="text-xs font-extrabold text-slate-700">#{vendor.rank}</span>
            {vendor.rankTrend === 'up' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />}
            {vendor.rankTrend === 'down' && <TrendingDown className="w-3.5 h-3.5 text-rose-500" />}
            {vendor.rankTrend === 'stable' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
          </div>
        </div>

        {/* Centerpiece: Circular Score & Secondary Metrics */}
        <div className="grid grid-cols-12 gap-3 items-center my-4 py-2 border-y border-slate-100">
          {/* Score Ring */}
          <div className="col-span-5 flex flex-col items-center justify-center">
            <ScoreRing score={vendor.score} size="md" />
            <span className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">
              Supplier Score
            </span>
          </div>

          {/* Key Metric Rows */}
          <div className="col-span-7 flex flex-col gap-2 pl-2 border-l border-slate-100">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-teal-600" /> On-Time
                </span>
                <span className="font-bold text-slate-800">{vendor.onTimeDeliveryRate}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${vendor.onTimeDeliveryRate}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Quality
                </span>
                <span className="font-bold text-slate-800">{vendor.qualityScore}%</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${vendor.qualityScore}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50">
              <span className="text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-600" /> Compliance
              </span>
              <span className="font-bold text-slate-800">{vendor.complianceScore}%</span>
            </div>
          </div>
        </div>

        {/* Mini Performance Sparkline Chart */}
        <div className="my-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-medium">3-Month Performance Trend</span>
            <span className="font-semibold text-slate-700">Delivery vs Quality</span>
          </div>
          <div className="h-12 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={miniPerformance}>
                <Line
                  type="monotone"
                  dataKey="delivery"
                  stroke="#16B5A5"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#16B5A5' }}
                />
                <Line
                  type="monotone"
                  dataKey="quality"
                  stroke="#1C9B73"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={{ r: 2, fill: '#1C9B73' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Footer: Risk status & Action button */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-1">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Risk:</span>
          <StatusBadge status={vendor.riskRating} size="sm" />
        </div>

        <button
          onClick={() => onSelect(vendor)}
          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 py-1 px-2.5 rounded-lg hover:bg-teal-50 transition-colors"
        >
          View Full Scorecard <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
