import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { IntradayAnalysisResult } from '../../services/ai/intradayAnalysis';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Slash,
  ShieldCheck,
  Target,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Sparkles,
  Calculator,
  Activity,
  Flame,
  BookmarkPlus,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

interface IntradayAnalysisCardProps {
  intraday: IntradayAnalysisResult;
}

export const IntradayAnalysisCard: React.FC<IntradayAnalysisCardProps> = ({ intraday }) => {
  const { user } = useAuth();
  const { addTradePlan } = useTrading();
  const currency = user.preferences.defaultCurrency || 'INR';

  // Interactive Capital for 15% Risk & 30-45% Reward customisation
  const [customCapital, setCustomCapital] = useState<string>(
    String(user.preferences.startingCapital || 100000)
  );
  const [planSaved, setPlanSaved] = useState<boolean>(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState<boolean>(false);

  const numCap = parseFloat(customCapital) || 100000;
  const maxRiskAmount = Number((numCap * (intraday.plan.riskCapitalPercent / 100)).toFixed(2));
  const potentialGainT1 = Number((numCap * (intraday.plan.rewardTarget1Percent / 100)).toFixed(2));
  const potentialGainT2 = Number((numCap * (intraday.plan.rewardTarget2Percent / 100)).toFixed(2));

  const stopDist = intraday.plan.stopDistance;
  const rawUnits = stopDist > 0 ? maxRiskAmount / stopDist : 0;
  const positionSize = rawUnits >= 10
    ? Math.floor(rawUnits)
    : rawUnits >= 1
    ? Number(rawUnits.toFixed(2))
    : Number(rawUnits.toFixed(4));
  const capitalRequired = Number((positionSize * intraday.plan.entryPrice).toFixed(2));
  const capitalUtilization = numCap > 0 ? Number(((capitalRequired / numCap) * 100).toFixed(1)) : 0;

  const isBullish = intraday.verdict === 'BULLISH TRADE';
  const isBearish = intraday.verdict === 'BEARISH TRADE';
  const isNoTrade = intraday.verdict === 'NO TRADE';

  // Handle 1-click Save to Planned Trades
  const handleSavePlan = () => {
    if (isNoTrade) return;
    addTradePlan({
      instrument: intraday.symbol,
      assetClass: intraday.assetClass,
      direction: isBullish ? 'LONG' : 'SHORT',
      entryZoneMin: intraday.plan.entryZoneMin,
      entryZoneMax: intraday.plan.entryZoneMax,
      stopLoss: intraday.plan.stopLoss,
      target: intraday.plan.target1,
      rrRatio: intraday.plan.riskRewardRatioT1,
      suggestedPositionSize: positionSize,
      timeframe: '15m',
      reason: `${intraday.verdict}: ${intraday.verdictSummary} | 15% Capital Risk model aiming for 30%-45% reward.`,
      status: 'PLANNED',
      date: new Date().toISOString().split('T')[0],
    });
    setPlanSaved(true);
    setTimeout(() => setPlanSaved(false), 3000);
  };

  return (
    <div className="space-y-5">
      {/* 1. TOP VERDICT HERO BANNER */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all ${
          isBullish
            ? 'bg-gradient-to-br from-emerald-950/40 via-[#0c141d] to-[#090d16] border-emerald-500/40'
            : isBearish
            ? 'bg-gradient-to-br from-rose-950/40 via-[#180e15] to-[#090d16] border-rose-500/40'
            : 'bg-gradient-to-br from-slate-900/60 via-[#101524] to-[#090d16] border-slate-700/60'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase bg-slate-800/80 text-slate-300 border border-slate-700/60">
                15m &amp; 5m Intraday Model
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {intraday.symbol} • Current Price: <strong className="text-white">{intraday.currentPrice}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Verdict Pill */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl font-bold text-sm sm:text-base tracking-wide shadow-md ${
                  isBullish
                    ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-400/40 animate-pulse'
                    : isBearish
                    ? 'bg-rose-500 text-white ring-2 ring-rose-400/40 animate-pulse'
                    : 'bg-slate-700 text-slate-200'
                }`}
              >
                {isBullish && <TrendingUp className="w-5 h-5 stroke-[2.5]" />}
                {isBearish && <TrendingDown className="w-5 h-5 stroke-[2.5]" />}
                {isNoTrade && <Slash className="w-4 h-4 stroke-[2.5]" />}
                <span>{intraday.verdict}</span>
              </div>

              <span
                className={`text-xs px-2.5 py-1 rounded-md font-medium border ${
                  intraday.verdictConfidence === 'HIGH PROBABILITY'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    : intraday.verdictConfidence === 'MODERATE PROBABILITY'
                    ? 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {intraday.verdictConfidence}
              </span>
            </div>

            <p className="text-xs text-slate-300 pt-1 max-w-2xl leading-relaxed">
              {intraday.verdictSummary}
            </p>
          </div>

          {/* Quick Action / Save Plan Button */}
          {!isNoTrade && (
            <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2">
              <button
                type="button"
                onClick={handleSavePlan}
                disabled={planSaved}
                className={`px-4 py-2 rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all ${
                  planSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95'
                }`}
              >
                {planSaved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Plan Saved to Journal!</span>
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-4 h-4" />
                    <span>Save to Trade Plans</span>
                  </>
                )}
              </button>
              <span className="text-[10px] text-slate-400 font-mono">
                Model: 15% Risk ➔ 30%-45% Reward
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 2. INTRADAY RISK & REWARD MATHEMATICAL ENGINE */}
      <div className="rounded-2xl border border-indigo-500/30 bg-[#0d121f] p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Intraday Risk &amp; Reward Mathematical Engine
              </h3>
              <p className="text-[11px] text-slate-400">
                Calibrated strictly for <span className="text-rose-400 font-semibold">15% Max Capital Risk</span> and <span className="text-emerald-400 font-semibold">30% to 45% Capital Reward</span>.
              </p>
            </div>
          </div>

          {/* Interactive Capital Input */}
          <div className="flex items-center gap-2 bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-1.5">
            <label className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
              Account Capital:
            </label>
            <input
              type="number"
              step="any"
              value={customCapital}
              onChange={(e) => setCustomCapital(e.target.value)}
              className="bg-transparent text-xs font-mono font-bold text-white w-28 focus:outline-none"
            />
          </div>
        </div>

        {/* 4 Execution Pillars: Entry, Stop, Target 1, Target 2 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Best Price Entry */}
          <div className="p-3.5 rounded-xl bg-[#141b2a] border border-slate-800 space-y-1">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              {intraday.plan.bestPriceType}
            </div>
            <div className="text-lg font-bold font-mono text-white">
              {intraday.plan.entryPrice}
            </div>
            <div className="text-[10px] text-indigo-300 font-mono">
              Zone: {intraday.plan.entryZoneMin} – {intraday.plan.entryZoneMax}
            </div>
          </div>

          {/* 2. Invalidation Stop Loss */}
          <div className="p-3.5 rounded-xl bg-[#1a1219] border border-rose-500/20 space-y-1">
            <div className="text-[10px] text-rose-300 uppercase font-semibold flex items-center justify-between">
              <span>Stop Loss</span>
              <span className="font-mono text-rose-400">-15% Capital</span>
            </div>
            <div className="text-lg font-bold font-mono text-rose-300">
              {intraday.plan.stopLoss}
            </div>
            <div className="text-[10px] text-rose-400/80 font-mono">
              Risk: -{formatCurrency(maxRiskAmount, currency)}
            </div>
          </div>

          {/* 3. Target 1 (30% Capital Reward / 1:2 RR) */}
          <div className="p-3.5 rounded-xl bg-[#0f1d1c] border border-emerald-500/20 space-y-1">
            <div className="text-[10px] text-emerald-300 uppercase font-semibold flex items-center justify-between">
              <span>Target 1 (1:2 RR)</span>
              <span className="font-mono text-emerald-400">+30% Capital</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-300">
              {intraday.plan.target1}
            </div>
            <div className="text-[10px] text-emerald-400/80 font-mono">
              Profit: +{formatCurrency(potentialGainT1, currency)}
            </div>
          </div>

          {/* 4. Target 2 (45% Capital Reward / 1:3 RR) */}
          <div className="p-3.5 rounded-xl bg-[#10201d] border border-emerald-500/30 space-y-1">
            <div className="text-[10px] text-emerald-300 uppercase font-semibold flex items-center justify-between">
              <span>Target 2 (1:3 RR)</span>
              <span className="font-mono text-emerald-400">+45% Capital</span>
            </div>
            <div className="text-lg font-bold font-mono text-emerald-300">
              {intraday.plan.target2}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-bold">
              Profit: +{formatCurrency(potentialGainT2, currency)}
            </div>
          </div>
        </div>

        {/* Position Sizing and Capital Allocation Bar */}
        <div className="p-3 rounded-xl bg-[#090d16] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400">Suggested Position Size: </span>
            <span className="font-mono font-bold text-white text-sm">
              {positionSize.toLocaleString(undefined, { maximumFractionDigits: 4 })} units
            </span>
          </div>

          <div>
            <span className="text-slate-400">Capital Required: </span>
            <span className="font-mono font-bold text-slate-200">
              {formatCurrency(capitalRequired, currency)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono ml-1">
              ({capitalUtilization}% account)
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Strict Invalidation Rule: Close on 5m breach of Stop</span>
          </div>
        </div>
      </div>

      {/* 3. OPTIONAL COLLAPSIBLE BACKEND ANALYSIS DETAILS (FVG, LIQUIDITY SWEEP & TRENDLINES) */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
          className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#0a0e1a] hover:bg-[#0f1526] border border-slate-800 text-xs text-slate-400 hover:text-slate-200 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">
              Backend SMC &amp; Technical Breakdown
            </span>
            <span className="hidden sm:inline text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
              Calculated to arrive at Verdict (FVG, Liquidity &amp; Trendlines)
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-indigo-400 group-hover:text-indigo-300 font-medium">
            <span>{showDetailedAnalysis ? 'Minimise Analysis Details' : 'Expand Analysis Details'}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showDetailedAnalysis ? 'rotate-180 text-amber-400' : ''
              }`}
            />
          </div>
        </button>

        {showDetailedAnalysis && (
          <div className="mt-4 space-y-4">
            {/* DUAL TIMEFRAME 15M & 5M ALIGNMENT PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 15m Structural Anchor */}
              <div className="rounded-2xl border border-slate-800 bg-[#101522] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      15-Minute Structural Frame
                    </h4>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      intraday.tf15m.bias === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : intraday.tf15m.bias === 'BEARISH'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {intraday.tf15m.bias} STRUCTURE
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Market Structure: </span>
                    <span className="text-slate-200 font-medium">{intraday.tf15m.structure}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Dynamic Trendline: </span>
                    <span className="text-slate-200 font-mono text-[11px]">{intraday.tf15m.trendline}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                    <span>Key 15m Shelf:</span>
                    <span className="font-mono font-bold text-indigo-300">{intraday.tf15m.keyShelf}</span>
                  </div>
                </div>
              </div>

              {/* 5m Execution Trigger */}
              <div className="rounded-2xl border border-slate-800 bg-[#101522] p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      5-Minute Execution Trigger
                    </h4>
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded ${
                      intraday.tf5m.bias === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : intraday.tf5m.bias === 'BEARISH'
                        ? 'bg-rose-500/20 text-rose-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {intraday.tf5m.bias} TRIGGER
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400">Trigger Signal: </span>
                    <span className="text-slate-200 font-medium">{intraday.tf5m.trigger}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Orderflow Delta: </span>
                    <span className="text-slate-200">{intraday.tf5m.orderflow}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/60">
                    <span>Volume Confirmation:</span>
                    <span className="font-mono text-emerald-400">{intraday.tf5m.volumeConfirmation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SMART MONEY CONCEPTS (SMC): FVG, LIQUIDITY SWEEP & PRICE ACTION */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Fair Value Gap Card */}
              <div className="rounded-2xl border border-slate-800 bg-[#101522] p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Fair Value Gap (FVG)
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      intraday.fvg.status === 'TESTING / MITIGATION'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {intraday.fvg.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Imbalance Type:</span>
                    <span className="font-bold text-indigo-300">{intraday.fvg.type}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Zone Range:</span>
                    <span className="text-white font-bold">{intraday.fvg.bottomPrice} – {intraday.fvg.topPrice}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                    {intraday.fvg.description}
                  </p>
                </div>
              </div>

              {/* Liquidity Sweep Card */}
              <div className="rounded-2xl border border-slate-800 bg-[#101522] p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-rose-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Liquidity Sweep
                    </h4>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                      intraday.liquiditySweep.status === 'SWEPT & RECLAIMED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : intraday.liquiditySweep.status === 'SWEPT & REJECTED'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {intraday.liquiditySweep.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Target Pool:</span>
                    <span className="font-bold text-rose-300">{intraday.liquiditySweep.type}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Key Level:</span>
                    <span className="text-white font-bold">{intraday.liquiditySweep.priceLevel}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                    {intraday.liquiditySweep.implication}
                  </p>
                </div>
              </div>

              {/* Trendline & Price Action Card */}
              <div className="rounded-2xl border border-slate-800 bg-[#101522] p-4 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                      Trendline &amp; Price Action
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    {intraday.trendline.status}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-400">Pattern Setup:</span>
                    <span className="font-bold text-emerald-300">{intraday.priceActionPattern.name}</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-slate-400">Trendline Angle:</span>
                    <span className="text-white font-bold">{intraday.trendline.trendSlope}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                    {intraday.trendline.description}
                  </p>
                </div>
              </div>
            </div>

            {/* DECISION RATIONALE (INSTITUTIONAL CONFLUENCE) */}
            <div className="rounded-2xl border border-slate-800 bg-[#101522] p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Institutional Confluence &amp; Decision Rationale</span>
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                {intraday.decisionRationale.map((rationale, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#090d16] border border-slate-800/80 flex items-start gap-2.5 text-slate-300"
                  >
                    <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="leading-relaxed">{rationale}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
