import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const norm = status?.toLowerCase() || '';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['active', 'approved', 'matched', 'fully_received', 'paid', 'completed', 'verified', 'low'].includes(norm)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['pending', 'matching', 'submitted', 'partially_received', 'pending_approval', 'medium', 'open'].includes(norm)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (['rejected', 'discrepancy', 'overdue', 'cancelled', 'high', 'failed', 'suspended', 'expired'].includes(norm)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (['sent_to_vendor', 'acknowledged', 'converted_to_po', 'draft'].includes(norm)) {
    colorClasses = 'bg-teal-50 text-teal-700 border-teal-200/80';
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase font-sans ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {formatText(status)}
    </span>
  );
};
