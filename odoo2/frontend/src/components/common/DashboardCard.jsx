import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const DashboardCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = null, // e.g. { value: '+12.5%', isPositive: true }
  iconColor = 'text-brand-600',
  iconBg = 'bg-brand-50 border-brand-100',
}) => {
  return (
    <div className="card-container p-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            {title}
          </p>
          <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${iconBg} ${iconColor} shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{subtitle}</span>
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                trend.isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
