import React from 'react';
import { ScoreRing } from '../common/ScoreRing.js';
import { StatusBadge } from '../common/StatusBadge.js';
import {
  TrendingUp,
  Sparkles,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  BarChart3,
  Layers,
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis } from 'recharts';

export const DashboardHeroPreview: React.FC = () => {
  const sampleVendors = [
    {
      name: 'TechLogix Solutions',
      category: 'IT Hardware & Systems',
      score: 96,
      rank: 1,
      trend: 'up',
      delivery: 98,
      quality: 96,
      risk: 'Low',
      sparkline: [{ v: 92 }, { v: 94 }, { v: 97 }, { v: 98 }],
    },
    {
      name: 'Apex Industrial Ltd',
      category: 'Industrial & Safety Gear',
      score: 91,
      rank: 2,
      trend: 'up',
      delivery: 92,
      quality: 94,
      risk: 'Low',
      sparkline: [{ v: 88 }, { v: 90 }, { v: 91 }, { v: 94 }],
    },
    {
      name: 'Vertex Cloud Services',
      category: 'Enterprise Networks',
      score: 88,
      rank: 3,
      trend: 'stable',
      delivery: 95,
      quality: 90,
      risk: 'Low',
      sparkline: [{ v: 85 }, { v: 86 }, { v: 88 }, { v: 90 }],
    },
  ];

  const miniSpendTrend = [
    { m: 'M1', val: 450 },
    { m: 'M2', val: 620 },
    { m: 'M3', val: 780 },
    { m: 'M4', val: 590 },
    { m: 'M5', val: 890 },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-procure-border p-5 lg:p-6 select-none">
      {/* Top Bar of the Dashboard Preview */}
      <div className="flex items-center justify-between pb-4 border-b border-procure-border mb-4">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-xs font-bold text-slate-700 ml-2">
            Automated Vendor Scoring Dashboard
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Connected Data
        </div>
      </div>

      {/* 3 Vendor Scoring Cards Grid (Direct reference inspired by screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
        {sampleVendors.map((v, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-sm hover:border-teal-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-1 mb-2">
                <div>
                  <h4 className="font-bold text-xs text-slate-800 leading-tight truncate">
                    {v.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 block truncate">{v.category}</span>
                </div>
                <div className="flex items-center gap-0.5 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-extrabold text-slate-700 shrink-0">
                  #{v.rank}
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />
                </div>
              </div>

              {/* Score and metrics */}
              <div className="flex items-center gap-3 my-2.5 py-2 border-y border-slate-100">
                <ScoreRing score={v.score} size="sm" strokeColor="#16B5A5" />
                <div className="flex-1 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-600">
                    <span>On-Time:</span>
                    <strong className="text-slate-800">{v.delivery}%</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Quality:</span>
                    <strong className="text-slate-800">{v.quality}%</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Sparkline & Risk */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {v.risk} Risk
              </span>
              <div className="h-6 w-16">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={v.sparkline}>
                    <Line type="monotone" dataKey="v" stroke="#16B5A5" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Charts & AI Insight Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-2">
        {/* Performance Benchmark Bar */}
        <div className="md:col-span-7 bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-teal-600" /> Procurement Spend Velocity
            </span>
            <span className="text-[10px] text-slate-400">Past 5 Months</span>
          </div>
          <div className="h-16 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={miniSpendTrend}>
                <XAxis dataKey="m" fontSize={9} stroke="#94A3B8" />
                <Bar dataKey="val" fill="#16B5A5" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live AI Procurement Copilot Pill */}
        <div className="md:col-span-5 bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-xl p-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" /> AI Procurement Copilot
            </div>
            <p className="text-[11px] text-slate-600 mt-1.5 leading-snug">
              "Vendor #1 has 98% on-time rate. 3-way match confirmed on PO-2026-0101 with zero variance."
            </p>
          </div>
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-teal-100 text-[10px] font-semibold text-teal-700">
            <span>Deterministic Grounding</span>
            <span className="flex items-center gap-0.5">Verified ✓</span>
          </div>
        </div>
      </div>
    </div>
  );
};
