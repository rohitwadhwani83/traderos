import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { PieChart, BarChart2 } from 'lucide-react';

type BreakdownCategory =
  | 'instrument'
  | 'strategy'
  | 'assetClass'
  | 'direction'
  | 'timeframe'
  | 'dayOfWeek';

export const BreakdownCharts: React.FC = () => {
  const { filteredTrades } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;
  const [activeCategory, setActiveCategory] = useState<BreakdownCategory>('instrument');

  const categories: { id: BreakdownCategory; label: string }[] = [
    { id: 'instrument', label: 'Instrument' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'assetClass', label: 'Asset Class' },
    { id: 'direction', label: 'Long vs Short' },
    { id: 'timeframe', label: 'Timeframe' },
    { id: 'dayOfWeek', label: 'Day of Week' },
  ];

  // Group data
  const dataMap: Record<
    string,
    { label: string; count: number; wins: number; totalPnL: number }
  > = {};

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (const t of filteredTrades) {
    let key = '';
    if (activeCategory === 'instrument') key = t.instrument;
    else if (activeCategory === 'strategy') key = t.strategy;
    else if (activeCategory === 'assetClass') key = t.assetClass;
    else if (activeCategory === 'direction') key = t.direction;
    else if (activeCategory === 'timeframe') key = t.timeframe || '5m';
    else if (activeCategory === 'dayOfWeek') {
      const d = new Date(t.date).getDay();
      key = days[d] || 'Unknown';
    }

    if (!dataMap[key]) {
      dataMap[key] = { label: key, count: 0, wins: 0, totalPnL: 0 };
    }
    const pnl = t.netPnL ?? t.grossPnL;
    dataMap[key].count++;
    dataMap[key].totalPnL += pnl;
    if (pnl > 0) dataMap[key].wins++;
  }

  const items = Object.values(dataMap).sort((a, b) => b.totalPnL - a.totalPnL);
  const maxAbsPnL = Math.max(...items.map((i) => Math.abs(i.totalPnL)), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5">
      {/* Header with Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">
            Trading Breakdown
          </h2>
        </div>

        {/* Tab pills */}
        <div className="flex items-center gap-1 overflow-x-auto bg-[#0a0d14] border border-slate-800 rounded-lg p-0.5 text-xs">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
                activeCategory === c.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* List / Bar Breakdown */}
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-xs text-slate-400 py-6 text-center">No trades found for breakdown.</div>
        ) : (
          items.map((item) => {
            const winRate = item.count > 0 ? Math.round((item.wins / item.count) * 100) : 0;
            const isProfit = item.totalPnL >= 0;
            const barWidth = Math.min(100, Math.round((Math.abs(item.totalPnL) / maxAbsPnL) * 100));

            return (
              <div key={item.label} className="p-3 rounded-xl bg-[#0c101a] border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{item.label}</span>
                    <span className="text-[11px] text-slate-400">
                      {item.count} trade{item.count > 1 ? 's' : ''} • {winRate}% Win
                    </span>
                  </div>
                  <span
                    className={`font-semibold mono-nums ${
                      isProfit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {formatCurrency(item.totalPnL, currency, true)}
                  </span>
                </div>

                {/* Relative progress bar */}
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isProfit ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
