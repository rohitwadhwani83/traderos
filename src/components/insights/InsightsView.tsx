import React, { useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { generateTraderIntelligence } from '../../services/ai/journalInsights';
import { WeeklyReviewCard } from './WeeklyReviewCard';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Target,
  Clock,
  Compass,
  Zap,
  TrendingDown,
  Info,
} from 'lucide-react';

export const InsightsView: React.FC = () => {
  const { filteredTrades, tradePlans } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;

  const intelligence = useMemo(() => {
    return generateTraderIntelligence(filteredTrades, tradePlans);
  }, [filteredTrades, tradePlans]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            My Trading Intelligence
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Behavioral pattern recognition, statistical edge analysis, and risk leaks derived from your recorded history.
        </p>
      </div>

      {/* AI Coach Summary Card */}
      <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-[#121629] via-[#0f1422] to-[#0a0d14] p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white tracking-tight">Executive AI Coach</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/25">
              {intelligence.confidence}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {intelligence.confidenceReason}
          </span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed p-4 rounded-xl bg-[#090d16]/80 border border-slate-800">
          &ldquo;{intelligence.coachSummary}&rdquo;
        </p>
      </div>

      {/* 2-Column: My Edge & My Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* My Edge */}
        <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">My Statistical Edge</h3>
          </div>

          {intelligence.myEdge.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Log at least 5 trades to calculate your statistical edge.
            </p>
          ) : (
            intelligence.myEdge.map((edge, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">{edge.title}</span>
                  <span className="font-mono font-bold text-slate-200">{edge.stat}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{edge.description}</p>
              </div>
            ))
          )}
        </div>

        {/* My Weaknesses */}
        <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">My Weaknesses</h3>
          </div>

          {intelligence.myWeaknesses.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No recurrent structural weaknesses identified in current dataset.
            </p>
          ) : (
            intelligence.myWeaknesses.map((weak, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-[#0c101a] border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-400">{weak.title}</span>
                  <span className="font-mono text-slate-400 text-[11px]">{weak.stat}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{weak.description}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Row: Best Conditions Matrix & Risk Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Best Conditions Matrix */}
        <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Compass className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">My Optimal Conditions</h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                Top Instrument
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {intelligence.bestConditions.bestInstrument}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                Top Strategy
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {intelligence.bestConditions.bestStrategy}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                Best Timeframe
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block">
                {intelligence.bestConditions.bestTimeframe}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                Prime Session
              </span>
              <span className="text-sm font-bold text-white mt-0.5 block truncate">
                {intelligence.bestConditions.bestTradingSession}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Profile & Discipline Score */}
        <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <Target className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Risk Profile & Plan Discipline
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                Risk Discipline Score
              </span>
              <span className="text-2xl font-bold text-indigo-400 mono-nums mt-0.5 block">
                {intelligence.myRiskProfile.riskDisciplineScore}/100
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0c101a] border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase tracking-wide block">
                Plan Follow Rate (Planned vs Actual)
              </span>
              <span className="text-2xl font-bold text-emerald-400 mono-nums mt-0.5 block">
                {intelligence.myDiscipline.planFollowRatePercent}%
              </span>
              <span className="text-[10px] text-slate-400">
                {intelligence.myDiscipline.executedAccordingToPlanCount} / {intelligence.myDiscipline.plannedCount} plans
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed p-3 rounded-xl bg-[#0c101a] border border-slate-800">
            {intelligence.myRiskProfile.notes}
          </p>
        </div>
      </div>

      {/* Biggest Leaks */}
      {intelligence.biggestLeaks.length > 0 && (
        <div className="rounded-2xl border border-rose-500/20 bg-[#101522] p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-semibold text-white tracking-tight">
                My Biggest Capital Leaks
              </h3>
            </div>
            <span className="text-[11px] text-rose-400">Avoidable Drag</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {intelligence.biggestLeaks.map((leak, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0c101a] border border-rose-500/25 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-rose-300">{leak.title}</span>
                  <span className="font-mono font-bold text-rose-400">
                    -{formatCurrency(leak.costAmount, currency)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{leak.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Weekly Review */}
      <WeeklyReviewCard />
    </div>
  );
};
