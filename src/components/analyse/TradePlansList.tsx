import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { TradePlan, TradePlanStatus } from '../../types';
import { formatCurrency, formatRR, formatDate } from '../../utils/formatters';
import { DirectionBadge, PlanStatusBadge } from '../common/Badge';
import { Bookmark, CheckCircle2, XCircle, Slash, Trash2, ArrowUpRight } from 'lucide-react';

interface TradePlansListProps {
  onExecutePlan?: (plan: TradePlan) => void;
}

export const TradePlansList: React.FC<TradePlansListProps> = ({ onExecutePlan }) => {
  const { tradePlans, updateTradePlan, deleteTradePlan } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;

  const handleStatusChange = (plan: TradePlan, newStatus: TradePlanStatus) => {
    updateTradePlan({
      ...plan,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });
  };

  if (tradePlans.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#101522] p-6 text-center text-slate-400">
        <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-200">No Trade Plans Saved Yet</h4>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Analyse an instrument or chart screenshot above and click &ldquo;Save as Trade Plan&rdquo;
          to measure how well you follow your own setups.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Saved Trade Plans ({tradePlans.length})
          </h3>
        </div>
        <span className="text-[11px] text-slate-400">Planned vs Actual Engine</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {tradePlans.map((plan) => (
          <div
            key={plan.id}
            className="p-4 rounded-xl bg-[#0c101a] border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DirectionBadge direction={plan.direction} />
                <span className="font-bold text-white tracking-tight text-sm">
                  {plan.instrument}
                </span>
                <PlanStatusBadge status={plan.status} />
              </div>
              <button
                onClick={() => deleteTradePlan(plan.id)}
                className="text-slate-500 hover:text-rose-400 p-1 rounded"
                title="Delete Plan"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[#111726] text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Entry Zone</span>
                <span className="font-mono font-semibold text-slate-200">
                  {plan.entryZoneMin} – {plan.entryZoneMax}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Stop Loss</span>
                <span className="font-mono font-semibold text-rose-400">
                  {plan.stopLoss}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Target (R:R)</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {plan.target} ({formatRR(plan.rrRatio)})
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
              {plan.reason}
            </p>

            {/* Plan status quick actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
              <span className="text-[10px] text-slate-500 font-mono">
                {formatDate(plan.date)}
              </span>

              <div className="flex items-center gap-1.5">
                {plan.status === 'PLANNED' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(plan, 'EXECUTED')}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Mark Executed</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(plan, 'SKIPPED')}
                      className="px-2 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleStatusChange(plan, 'INVALIDATED')}
                      className="px-2 py-1 rounded-md bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 text-[11px]"
                    >
                      Invalidate
                    </button>
                  </>
                )}

                {plan.status !== 'PLANNED' && (
                  <button
                    onClick={() => handleStatusChange(plan, 'PLANNED')}
                    className="text-[11px] text-slate-400 hover:text-white underline"
                  >
                    Reset to Planned
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
