import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  change?: string;
  isPositive?: boolean;
  isNegative?: boolean;
  icon?: LucideIcon;
  variant?: 'default' | 'primary' | 'accent';
  onClick?: () => void;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subtext,
  change,
  isPositive,
  isNegative,
  icon: Icon,
  variant = 'default',
  onClick,
  className = '',
}) => {
  const borderClass =
    variant === 'primary'
      ? 'border-indigo-500/30 bg-[#121826]'
      : 'border-slate-800/80 bg-[#101522] hover:border-slate-700/80';

  return (
    <div
      onClick={onClick}
      className={`rounded-xl p-4 transition-all duration-150 border ${borderClass} ${
        onClick ? 'cursor-pointer hover:bg-[#141b2c]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between text-xs text-slate-400 font-medium mb-1.5">
        <span className="tracking-wide uppercase text-[11px] text-slate-400">{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      </div>

      <div className="flex items-baseline justify-between gap-1.5 flex-wrap">
        <span
          className={`text-lg sm:text-xl font-bold tracking-tight mono-nums whitespace-nowrap ${
            isPositive
              ? 'text-emerald-400'
              : isNegative
              ? 'text-rose-400'
              : 'text-slate-100'
          }`}
        >
          {value}
        </span>
        {change && (
          <span
            className={`text-[11px] font-semibold mono-nums whitespace-nowrap px-1.5 py-0.5 rounded ${
              isPositive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isNegative
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : 'text-slate-400'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1 text-[11px] text-slate-400 truncate">{subtext}</p>
      )}
    </div>
  );
};
