import React from 'react';
import { Drawer } from '../common/Drawer.js';
import { ScoreRing } from '../common/ScoreRing.js';
import { StatusBadge } from '../common/StatusBadge.js';
import { Vendor } from '../../types/index.js';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  FileCheck2,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface VendorDetailsDrawerProps {
  vendor: Vendor | null;
  isOpen: boolean;
  onClose: () => void;
  onAction?: (action: string, vendor: Vendor) => void;
}

export const VendorDetailsDrawer: React.FC<VendorDetailsDrawerProps> = ({
  vendor,
  isOpen,
  onClose,
  onAction,
}) => {
  if (!vendor) return null;

  const spendData = vendor.spendHistory || [
    { month: 'Oct', amount: 450000 },
    { month: 'Nov', amount: 620000 },
    { month: 'Dec', amount: 780000 },
    { month: 'Jan', amount: 550000 },
    { month: 'Feb', amount: 890000 },
  ];

  const breakdownMetrics = [
    { label: 'On-Time Delivery', value: `${vendor.onTimeDeliveryRate}%`, weight: '35% weight', color: 'bg-teal-500' },
    { label: 'Product Quality', value: `${vendor.qualityScore}%`, weight: '30% weight', color: 'bg-emerald-500' },
    { label: 'Price Competitiveness', value: `${vendor.priceCompetitiveness}%`, weight: '20% weight', color: 'bg-cyan-500' },
    { label: 'Compliance & Docs', value: `${vendor.complianceScore}%`, weight: '15% weight', color: 'bg-indigo-500' },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={vendor.name}
      subtitle={`Vendor Code: ${vendor.vendorCode} • Category: ${vendor.category}`}
      width="xl"
    >
      <div className="space-y-6">
        {/* Scorecard Hero Banner */}
        <div className="bg-gradient-to-br from-teal-50/70 via-slate-50 to-white border border-teal-100 rounded-2xl p-5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <ScoreRing score={vendor.score} size="lg" strokeColor="#16B5A5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-slate-800 tracking-tight">
                  Rank #{vendor.rank}
                </span>
                <StatusBadge status={vendor.riskRating} size="sm" />
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Based on automated composite evaluation of deliveries, quality audits, and pricing.
              </p>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={vendor.status} size="md" />
          </div>
        </div>

        {/* AI Observation Card */}
        <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
              ProcureX AI Sourcing Insight
            </h5>
            <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
              {vendor.score >= 85
                ? `Preferred tier supplier: Consistently maintains above-benchmark delivery reliability (${vendor.onTimeDeliveryRate}%) with verified GST compliance. Recommended for direct order conversion.`
                : `Moderate performance tier: Recent pricing benchmarks indicate high competitiveness, though delivery turnaround should be monitored for time-sensitive orders.`}
            </p>
          </div>
        </div>

        {/* Component Score Breakdown */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
            Evaluation Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {breakdownMetrics.map((m, idx) => (
              <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">{m.label}</span>
                  <span className="text-xs text-slate-400">{m.weight}</span>
                </div>
                <div className="text-xl font-bold text-slate-800 mt-1">{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Spend History Chart */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Procurement Spend History
            </h4>
            <span className="text-xs text-slate-400">Past 5 Months (₹)</span>
          </div>
          <div className="h-44 w-full bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendData}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Spend']}
                />
                <Bar dataKey="amount" fill="#16B5A5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Company & Legal Info */}
        <div>
          <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
            Organization & Compliance Details
          </h4>
          <div className="bg-white border border-procure-border rounded-xl divide-y divide-slate-100 text-xs">
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Contact Person</span>
              <span className="font-semibold text-slate-800">{vendor.contactPerson}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Email</span>
              <span className="font-semibold text-slate-800">{vendor.email}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Phone</span>
              <span className="font-semibold text-slate-800">{vendor.phone}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">GSTIN / Tax ID</span>
              <span className="font-mono font-semibold text-teal-700">{vendor.gstin || '29AAACT1011A1Z2'}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-slate-500">Payment Terms</span>
              <span className="font-semibold text-slate-800">{vendor.paymentTerms}</span>
            </div>
          </div>
        </div>

        {/* Compliance Certificates */}
        {vendor.documents && vendor.documents.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider">
              Verified Compliance Documents
            </h4>
            <div className="space-y-2">
              {vendor.documents.map((doc, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span className="font-medium text-slate-800">{doc.name}</span>
                  </div>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px] font-semibold">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
};
