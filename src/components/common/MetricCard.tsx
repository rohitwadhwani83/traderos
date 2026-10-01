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

      <div className="flex items-baseline gap-2">
        <span
          className={`text-xl font-semibold tracking-tight mono-nums ${
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
            className={`text-xs font-medium mono-nums ${
              isPositive
                ? 'text-emerald-400/90'
                : isNegative
                ? 'text-rose-400/90'
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
