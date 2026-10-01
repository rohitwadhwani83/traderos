import React from 'react';
import { EmotionalState, AssetClass, TradeDirection, TradePlanStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'profit' | 'loss' | 'neutral' | 'ai' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  const variantClasses = {
    profit: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    loss: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    neutral: 'bg-slate-800 text-slate-300 border border-slate-700/60',
    ai: 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30',
    warning: 'bg-amber-500/15 text-amber-300 border border-amber-500/30',
    outline: 'border border-slate-700 text-slate-400 bg-transparent',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium tracking-tight ${sizeClasses} ${variantClasses} ${className}`}
    >
      {children}
    </span>
  );
};

export const EmotionBadge: React.FC<{ emotion?: EmotionalState }> = ({ emotion }) => {
  if (!emotion) return null;

  const getVariant = (e: EmotionalState) => {
    switch (e) {
      case 'Calm':
      case 'Disciplined':
      case 'Confident':
        return 'profit';
      case 'Fearful':
      case 'Greedy':
      case 'FOMO':
        return 'warning';
      case 'Revenge':
      case 'Impulsive':
        return 'loss';
      default:
        return 'neutral';
    }
  };

  return <Badge variant={getVariant(emotion)}>{emotion}</Badge>;
};

export const DirectionBadge: React.FC<{ direction: TradeDirection }> = ({ direction }) => {
  return (
    <Badge variant={direction === 'LONG' ? 'profit' : 'loss'}>
      {direction}
    </Badge>
  );
};

export const AssetBadge: React.FC<{ assetClass: AssetClass }> = ({ assetClass }) => {
  return (
    <Badge variant="outline" className="text-slate-400 border-slate-800 bg-slate-900/50">
      {assetClass}
    </Badge>
  );
};

export const PlanStatusBadge: React.FC<{ status: TradePlanStatus }> = ({ status }) => {
  const variant = {
    PLANNED: 'ai',
    EXECUTED: 'profit',
    SKIPPED: 'neutral',
    INVALIDATED: 'loss',
    EXPIRED: 'outline',
  }[status] as BadgeProps['variant'];

  return <Badge variant={variant}>{status}</Badge>;
};
