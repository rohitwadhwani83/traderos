import React, { useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { generateTraderIntelligence } from '../../services/ai/journalInsights';
import { Sparkles, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';

interface AICoachCardProps {
  onViewInsights: () => void;
}

export const AICoachCard: React.FC<AICoachCardProps> = ({ onViewInsights }) => {
  const { filteredTrades, tradePlans } = useTrading();

  const report = useMemo(() => {
    return generateTraderIntelligence(filteredTrades, tradePlans);
  }, [filteredTrades, tradePlans]);

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-[#121629] via-[#0f1422] to-[#0a0d14] p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-tight">AI Trading Coach</h2>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {report.confidence}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">{report.confidenceReason}</p>
          </div>
        </div>

        <button
          onClick={onViewInsights}
          className="flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors whitespace-nowrap"
        >
          <span>View Insights</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Coach summary text */}
      <div className="mt-4 p-4 rounded-xl bg-[#090c14]/70 border border-slate-800/80">
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
          &ldquo;{report.coachSummary}&rdquo;
        </p>
      </div>

      {/* Mini Highlights */}
      {report.myEdge.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0e1320] border border-slate-800/60 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Edge: </span>
              <span className="text-slate-300">{report.myEdge[0].title}</span>
            </div>
          </div>

          {report.myWeaknesses.length > 0 && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0e1320] border border-slate-800/60 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-200">Alert: </span>
                <span className="text-slate-300">{report.myWeaknesses[0].title}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
