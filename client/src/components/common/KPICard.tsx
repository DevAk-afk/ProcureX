import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  isPositive?: boolean;
  linkTo?: string;
  subtitle?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  isPositive = true,
  linkTo,
  subtitle,
}) => {
  const content = (
    <div className="bg-white border border-procure-border rounded-card p-5 shadow-card hover:shadow-cardHover transition-all duration-200 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-procure-muted uppercase tracking-wider">
          {title}
        </span>
        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold text-procure-text tracking-tight font-sans">
          {value}
        </div>

        {(change || subtitle) && (
          <div className="flex items-center gap-2 mt-2">
            {change && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                  isPositive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}
              >
                {change}
              </span>
            )}
            {subtitle && (
              <span className="text-xs text-slate-400 truncate">{subtitle}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="block group">
        {content}
      </Link>
    );
  }

  return content;
};
