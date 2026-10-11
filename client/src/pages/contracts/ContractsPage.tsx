import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Contract } from '../../types/index.js';
import { StatusBadge } from '../../components/common/StatusBadge.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { FileSignature, Plus, Search, RefreshCw, AlertTriangle } from 'lucide-react';

export const ContractsPage: React.FC = () => {
  const { success, error } = useToast();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/contracts');
      if (res.data.success) setContracts(res.data.data);
    } catch (err: any) {
      error('Failed to load contracts', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Vendor Contracts & SLAs
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Master service agreements, supplier SLAs, termination clauses, and automated renewal countdowns.
          </p>
        </div>

        <button onClick={fetchData} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contracts.map((c) => {
          const daysLeft = Math.ceil(
            (new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          const isExpiring = daysLeft <= c.renewalAlertDays;

          return (
            <div
              key={c._id}
              className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-800">{c.title}</h3>
                  <span className="text-xs text-teal-700 font-mono font-bold block mt-0.5">
                    {c.contractNumber} • {c.vendorName}
                  </span>
                </div>
                <StatusBadge status={c.status} size="sm" />
              </div>

              <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                <div>
                  <strong className="text-slate-700">SLA:</strong> {c.slaTerms}
                </div>
                <div>
                  <strong className="text-slate-700">Payment Conditions:</strong> {c.paymentConditions}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Contract Value</span>
                  <span className="font-bold text-slate-900 text-sm">
                    ₹{c.contractValue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[11px]">Valid Until</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(c.endDate).toLocaleDateString('en-IN')}
                  </span>
                </div>
              </div>

              {isExpiring && (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Expiring in {daysLeft} days — Action required for renewal or RFP.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
