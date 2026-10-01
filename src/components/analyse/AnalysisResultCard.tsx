import React, { useState } from 'react';
import { MarketAnalysis, TradePlan } from '../../types';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercent, formatRR } from '../../utils/formatters';
import {
  Sparkles,
  BookmarkPlus,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Layers,
  TrendingUp,
  Target,
  FileCheck,
} from 'lucide-react';

interface AnalysisResultCardProps {
  analysis: MarketAnalysis;
}

export const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ analysis }) => {
  const { addTradePlan } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveAsPlan = () => {
    addTradePlan({
      instrument: analysis.instrument,
      assetClass: analysis.assetClass,
      direction: analysis.bias === 'BEARISH' ? 'SHORT' : 'LONG',
      entryZoneMin: analysis.entryZone.min,
      entryZoneMax: analysis.entryZone.max,
      stopLoss: analysis.invalidation,
      target: analysis.targetZone.target1,
      rrRatio: analysis.riskReward,
      reason: `${analysis.setupType}. ${analysis.confirmationConditions}`,
      screenshotUrl: analysis.screenshotUrl,
      status: 'PLANNED',
      date: new Date().toISOString().split('T')[0],
      suggestedPositionSize: 50,
      timeframe: '15m',
    });
    setIsSaved(true);
  };

  const getStatusColor = (status: MarketAnalysis['setupStatus']) => {
    switch (status) {
      case 'POTENTIAL SETUP':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'WATCH':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'WAIT':
        return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700/60';
    }
  };

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-gradient-to-br from-[#121628] via-[#0e1322] to-[#090d16] p-5 shadow-2xl space-y-4">
      {/* 1. Header: Instrument, Quality Badge, Setup Status, Save Plan */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-xl font-bold text-white tracking-tight">
              {analysis.instrument}
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStatusColor(
                analysis.setupStatus
              )}`}
            >
              {analysis.setupStatus}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              {analysis.setupQuality}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
            <span>{analysis.dataSource}</span>
            <span>•</span>
            <span className="flex items-center gap-1 font-mono">
              <Clock className="w-3 h-3 text-slate-400" />
              {analysis.dataTimestamp}
            </span>
          </div>
        </div>

        <button
          onClick={handleSaveAsPlan}
          disabled={isSaved}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            isSaved
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm active:scale-95'
          }`}
        >
          {isSaved ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Saved to Trade Plans</span>
            </>
          ) : (
            <>
              <BookmarkPlus className="w-4 h-4" />
              <span>Save as Trade Plan</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Current Market Data Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-[#090d16] border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Last Price</span>
          <div className="text-base font-bold text-white mono-nums">
            {formatCurrency(analysis.currentPrice, currency)}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Session Change</span>
          <div
            className={`text-base font-bold mono-nums ${
              analysis.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {analysis.change >= 0 ? '+' : ''}
            {analysis.change} ({formatPercent(analysis.changePercent)})
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Session Range</span>
          <div className="text-xs font-semibold text-slate-300 mono-nums mt-0.5">
            L: {analysis.sessionLow} • H: {analysis.sessionHigh}
          </div>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wide">Volume</span>
          <div className="text-xs font-semibold text-slate-300 mono-nums mt-0.5">
            {analysis.volume.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* 8-12. Core Setup Box: Entry Zone, Invalidation, Target, Risk/Reward */}
      <div className="p-4 rounded-xl bg-[#0c101a] border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Setup Type: {analysis.setupType}</span>
          </div>
          <div className="text-slate-400">
            Bias: <span className="font-semibold text-white">{analysis.bias}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-2.5 rounded-lg bg-[#111726] border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Entry Zone</span>
            <div className="text-xs sm:text-sm font-bold text-slate-100 mono-nums mt-0.5">
              {analysis.entryZone.min} – {analysis.entryZone.max}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#111726] border border-slate-800">
            <span className="text-[10px] text-rose-400 uppercase tracking-wide">Invalidation (SL)</span>
            <div className="text-xs sm:text-sm font-bold text-rose-400 mono-nums mt-0.5">
              {analysis.invalidation}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#111726] border border-slate-800">
            <span className="text-[10px] text-emerald-400 uppercase tracking-wide">Target Zone</span>
            <div className="text-xs sm:text-sm font-bold text-emerald-400 mono-nums mt-0.5">
              {analysis.targetZone.target1}
              {analysis.targetZone.target2 ? ` – ${analysis.targetZone.target2}` : ''}
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-[#111726] border border-slate-800">
            <span className="text-[10px] text-indigo-400 uppercase tracking-wide">Risk / Reward</span>
            <div className="text-xs sm:text-sm font-bold text-indigo-300 mono-nums mt-0.5">
              {formatRR(analysis.riskReward)}
            </div>
          </div>
        </div>
      </div>

      {/* 3-7. Technical Data & Momentum Context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800/80 space-y-1">
          <div className="font-semibold text-slate-300">Market Structure (Multi-Timeframe)</div>
          <p className="text-slate-400">{analysis.higherTimeframeStructure}</p>
          <p className="text-slate-400">{analysis.lowerTimeframeStructure}</p>
        </div>

        <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800/80 space-y-1">
          <div className="font-semibold text-slate-300">Momentum & Volatility</div>
          <p className="text-slate-400">{analysis.momentum}</p>
          <p className="text-slate-400">{analysis.volatility}</p>
        </div>
      </div>

      {/* 13-14. Confirmation vs Invalidation Rules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs leading-relaxed">
        <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/25">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>What Would Confirm the Setup?</span>
          </div>
          <p className="text-slate-300">{analysis.confirmationConditions}</p>
        </div>

        <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/25">
          <div className="flex items-center gap-1.5 font-semibold text-rose-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>What Would Invalidate It?</span>
          </div>
          <p className="text-slate-300">{analysis.invalidationConditions}</p>
        </div>
      </div>

      {/* 15. Risk Notes */}
      <div className="p-3 rounded-xl bg-[#0a0e18] border border-slate-800/70 text-[11px] space-y-1 text-slate-400">
        <div className="font-semibold text-slate-300 text-xs">Risk Notes & Guardrails:</div>
        <ul className="list-disc pl-4 space-y-0.5">
          {analysis.riskNotes.map((note, idx) => (
            <li key={idx}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
