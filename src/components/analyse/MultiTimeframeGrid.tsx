import React from 'react';
import { MultiTimeframeSummary } from '../../services/marketData/types';
import { SetupBias } from '../../types';
import { Layers, ShieldCheck, AlertCircle } from 'lucide-react';

interface MultiTimeframeGridProps {
  mtf: MultiTimeframeSummary;
}

export const MultiTimeframeGrid: React.FC<MultiTimeframeGridProps> = ({ mtf }) => {
  const getBiasPill = (bias: SetupBias) => {
    switch (bias) {
      case 'BULLISH':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'BEARISH':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700/60';
    }
  };

  const frames: { label: string; name: string; bias: SetupBias; structure: string }[] = [
    { label: '1D', name: 'Higher Timeframe (Anchor)', bias: mtf.tfDaily.bias, structure: mtf.tfDaily.structure },
    { label: '4H', name: 'Trend Anchor', bias: mtf.tf4h.bias, structure: mtf.tf4h.structure },
    { label: '1H', name: 'Intermediate Trend', bias: mtf.tf1h.bias, structure: mtf.tf1h.structure },
    { label: '15M', name: 'Structure Frame', bias: mtf.tf15m.bias, structure: mtf.tf15m.structure },
    { label: '5M', name: 'Execution Frame', bias: mtf.tf5m.bias, structure: mtf.tf5m.structure },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Multi-Timeframe Structure
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Setup Quality:</span>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              mtf.alignmentScore === 'STRONG ALIGNMENT'
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : mtf.alignmentScore === 'PARTIAL ALIGNMENT'
                ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            {mtf.alignmentScore}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {frames.map((f) => (
          <div
            key={f.label}
            className="p-3 rounded-xl bg-[#0c101a] border border-slate-800 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200">{f.label}</span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getBiasPill(
                  f.bias
                )}`}
              >
                {f.bias}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-snug line-clamp-2">
              {f.structure}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
