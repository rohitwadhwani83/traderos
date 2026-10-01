import React, { useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { generateWeeklyTradingReview } from '../../services/ai/weeklyReview';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { Calendar, CheckCircle2, AlertOctagon, TrendingUp, Lightbulb, ShieldAlert } from 'lucide-react';

export const WeeklyReviewCard: React.FC = () => {
  const { filteredTrades } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;

  const review = useMemo(() => {
    return generateWeeklyTradingReview(filteredTrades);
  }, [filteredTrades]);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">AI Weekly Trading Review</h3>
          <span className="text-[11px] text-slate-400">({review.weekRange})</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="px-2.5 py-1 rounded-md bg-[#0c101a] border border-slate-800">
            <span className="text-slate-400">Sample: </span>
            <span className="font-semibold text-white">{review.totalTrades} Trades</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-[#0c101a] border border-slate-800">
            <span className="text-slate-400">Win Rate: </span>
            <span className="font-semibold text-white">{review.winRate}%</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-[#0c101a] border border-slate-800">
            <span className="text-slate-400">Net: </span>
            <span
              className={`font-semibold mono-nums ${
                review.netPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(review.netPnL, currency, true)}
            </span>
          </div>
        </div>
      </div>

      {/* Review Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
        {/* What Went Well */}
        <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>What Went Well</span>
          </div>
          <p className="text-slate-300">{review.whatWentWell}</p>
        </div>

        {/* What Hurt Performance */}
        <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-rose-400">
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>What Hurt Performance</span>
          </div>
          <p className="text-slate-300">{review.whatHurtPerformance}</p>
        </div>

        {/* Biggest Behavioral Pattern */}
        <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Biggest Behavioral Pattern</span>
          </div>
          <p className="text-slate-300">{review.biggestBehavioralPattern}</p>
        </div>

        {/* Biggest Risk */}
        <div className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Biggest Risk</span>
          </div>
          <p className="text-slate-300">{review.biggestRisk}</p>
        </div>
      </div>

      {/* One Thing to Improve Next Week Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 to-purple-950/20 border border-indigo-500/30 flex items-start gap-3">
        <Lightbulb className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-xs font-bold text-white block mb-0.5">
            One Thing to Improve Next Week:
          </span>
          <p className="text-xs text-indigo-200 leading-relaxed font-normal">
            {review.oneThingToImprove}
          </p>
        </div>
      </div>
    </div>
  );
};
