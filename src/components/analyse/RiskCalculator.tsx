import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { calculatePositionSize, calculateRR } from '../../utils/calculations';
import { formatCurrency, formatPercent, formatRR } from '../../utils/formatters';
import { Calculator, ShieldCheck, AlertCircle } from 'lucide-react';
import { TradeDirection } from '../../types';

interface RiskCalculatorProps {
  initialEntry?: number;
  initialStop?: number;
  initialTarget?: number;
  initialDirection?: TradeDirection;
}

export const RiskCalculator: React.FC<RiskCalculatorProps> = ({
  initialEntry = 22850,
  initialStop = 22750,
  initialTarget = 23100,
  initialDirection = 'LONG',
}) => {
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;

  const [capital, setCapital] = useState<string>(String(user.preferences.startingCapital));
  const [riskPercent, setRiskPercent] = useState<string>(
    String(user.preferences.defaultRiskPercent || 1.0)
  );
  const [direction, setDirection] = useState<TradeDirection>(initialDirection);
  const [entryPrice, setEntryPrice] = useState<string>(String(initialEntry));
  const [stopLoss, setStopLoss] = useState<string>(String(initialStop));
  const [target, setTarget] = useState<string>(String(initialTarget));

  const numCap = parseFloat(capital) || 0;
  const numRiskPct = parseFloat(riskPercent) || 0;
  const numEntry = parseFloat(entryPrice) || 0;
  const numStop = parseFloat(stopLoss) || 0;
  const numTarget = parseFloat(target) || 0;

  const {
    positionSize,
    maxRiskAmount,
    riskPerUnit,
    capitalRequired,
    capitalUtilizationPercent,
  } = calculatePositionSize(numCap, numRiskPct, numEntry, numStop);

  const rewardPerUnit = direction === 'LONG'
    ? Math.max(0, numTarget - numEntry)
    : Math.max(0, numEntry - numTarget);
  const potentialReward = Number((rewardPerUnit * positionSize).toFixed(2));
  const rr = calculateRR(maxRiskAmount, potentialReward);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800/80">
        <Calculator className="w-4 h-4 text-indigo-400" />
        <h3 className="text-sm font-semibold text-white tracking-tight">Risk & Position Sizing Calculator</h3>
        <span className="text-[11px] text-slate-400 ml-auto">Mathematical Risk Engine</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Trading Capital
              </label>
              <input
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Max Risk % per Trade
              </label>
              <div className="flex items-center gap-1">
                {[0.5, 1.0, 2.0].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRiskPercent(String(preset))}
                    className={`px-2 py-1 text-[10px] font-medium rounded border ${
                      numRiskPct === preset
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-[#161d2c] border-slate-700 text-slate-400'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-16 bg-[#161d2c] border border-slate-700/80 rounded-lg px-2 py-1 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Entry Price</label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Stop Loss</label>
              <input
                type="number"
                step="any"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Target Price</label>
              <input
                type="number"
                step="any"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Direction toggle */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-400">Direction:</span>
            <button
              type="button"
              onClick={() => setDirection('LONG')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                direction === 'LONG'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400'
              }`}
            >
              LONG
            </button>
            <button
              type="button"
              onClick={() => setDirection('SHORT')}
              className={`px-3 py-1 rounded text-xs font-semibold ${
                direction === 'SHORT'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400'
              }`}
            >
              SHORT
            </button>
          </div>
        </div>

        {/* Right: Calculated Risk Output Card */}
        <div className="p-4 rounded-xl bg-[#090d16] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                Suggested Position Size
              </div>
              <div className="text-xl font-bold text-white mono-nums">
                {positionSize} <span className="text-xs font-normal text-slate-400">units</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase tracking-wide">
                Risk-to-Reward
              </div>
              <div className="text-lg font-bold text-indigo-400 mono-nums">
                {formatRR(rr)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400">Max Loss: </span>
              <span className="font-semibold text-rose-400 mono-nums">
                -{formatCurrency(maxRiskAmount, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Potential Gain: </span>
              <span className="font-semibold text-emerald-400 mono-nums">
                +{formatCurrency(potentialReward, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Risk per Share: </span>
              <span className="font-semibold text-slate-200 mono-nums">
                {formatCurrency(riskPerUnit, currency)}
              </span>
            </div>
            <div>
              <span className="text-slate-400">Capital Required: </span>
              <span className="font-semibold text-slate-200 mono-nums">
                {formatCurrency(capitalRequired, currency)}
              </span>
            </div>
          </div>

          {/* Capital utilization warning / confirmation */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px]">
            {capitalUtilizationPercent > 100 ? (
              <span className="text-rose-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Capital required exceeds account balance ({capitalUtilizationPercent}%). Margin or smaller size required.
              </span>
            ) : (
              <span className="text-emerald-400/90 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                Capital utilization {capitalUtilizationPercent}% within safe boundaries.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
