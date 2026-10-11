import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Budget } from '../../types/index.js';
import { Modal } from '../../components/common/Modal.js';
import { useToast } from '../../context/ToastContext.js';
import { PieChart, Plus, AlertTriangle, RefreshCw } from 'lucide-react';

export const BudgetsPage: React.FC = () => {
  const { success, error } = useToast();

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/budgets');
      if (res.data.success) setBudgets(res.data.data);
    } catch (err: any) {
      error('Failed to load budgets', err.message);
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
            Department Budgets & Commitments
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Allocated spending limits, approved purchase order commitments, and remaining balances.
          </p>
        </div>

        <button onClick={fetchData} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const utilizedPercent = Math.min(
            100,
            Math.round(((b.committedAmount + b.actualSpent) / b.totalAllocated) * 100)
          );
          const isWarning = utilizedPercent >= b.warningThresholdPercent;

          return (
            <div
              key={b._id}
              className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-800">{b.departmentName}</h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {b.costCenter} • {b.fiscalYear}
                  </span>
                </div>
                {isWarning && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                    <AlertTriangle className="w-3 h-3" /> Approaching Limit ({utilizedPercent}%)
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-slate-600">
                  <span>Utilization</span>
                  <span>{utilizedPercent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                  <div
                    className="bg-teal-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${utilizedPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Allocated</span>
                  <span className="font-bold text-slate-800">
                    ₹{b.totalAllocated.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Committed POs</span>
                  <span className="font-bold text-amber-600">
                    ₹{b.committedAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Available</span>
                  <span className="font-bold text-emerald-600">
                    ₹{b.availableBalance.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
