import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { AutomationRule } from '../../types/index.js';
import { useToast } from '../../context/ToastContext.js';
import { Zap, Play, CheckCircle2, XCircle, RefreshCw, Plus } from 'lucide-react';

export const AutomationsPage: React.FC = () => {
  const { success, error } = useToast();

  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/automations');
      if (res.data.success) setRules(res.data.data);
    } catch (err: any) {
      error('Failed to load rules', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await api.patch(`/automations/${id}/toggle`);
      if (res.data.success) {
        success('Rule Updated', res.data.message);
        fetchRules();
      }
    } catch (err: any) {
      error('Toggle failed', err.message);
    }
  };

  const handleTest = async (id: string) => {
    try {
      const res = await api.post(`/automations/${id}/test`);
      if (res.data.success) {
        success('Dry-Run Execution Complete', res.data.message);
        fetchRules();
      }
    } catch (err: any) {
      error('Test run failed', err.message);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-procure-text tracking-tight">
            Workflow Automation Center
          </h1>
          <p className="text-xs sm:text-sm text-procure-muted mt-1">
            Event-driven triggers for requisition routing, inventory low-stock safeguards, and invoice variance alerts.
          </p>
        </div>

        <button onClick={fetchRules} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((rule) => (
          <div
            key={rule._id}
            className="bg-white border border-procure-border rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      rule.isEnabled ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-800">{rule.name}</h3>
                    <span className="text-[11px] font-mono font-semibold text-teal-700 block">
                      Trigger: {rule.trigger}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggle(rule._id)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                    rule.isEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {rule.isEnabled ? 'Active' : 'Disabled'}
                </button>
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">{rule.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Executed <strong>{rule.runCount}</strong> time(s)
              </span>

              <button
                onClick={() => handleTest(rule._id)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Test Trigger
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
