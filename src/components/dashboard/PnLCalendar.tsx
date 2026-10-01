import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export const PnLCalendar: React.FC = () => {
  const { filteredTrades } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;

  // Track currently viewed month (defaults to Feb 2026 based on demo/current dates)
  const [currentDate, setCurrentDate] = useState(() => {
    // If trades exist, find most recent trade month
    if (filteredTrades.length > 0) {
      const dates = filteredTrades.map((t) => t.date).sort();
      const latest = dates[dates.length - 1];
      const [y, m] = latest.split('-');
      return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    }
    return new Date();
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Compute daily totals for this month
  const dailyPnL: Record<string, { pnl: number; count: number; wins: number; losses: number }> = {};
  let monthTotalPnL = 0;
  let winningDaysCount = 0;
  let losingDaysCount = 0;

  for (const trade of filteredTrades) {
    const [y, m, d] = trade.date.split('-');
    if (parseInt(y, 10) === year && parseInt(m, 10) - 1 === month) {
      const key = `${y}-${m}-${d}`;
      const pnl = trade.netPnL ?? trade.grossPnL;
      if (!dailyPnL[key]) {
        dailyPnL[key] = { pnl: 0, count: 0, wins: 0, losses: 0 };
      }
      dailyPnL[key].pnl += pnl;
      dailyPnL[key].count++;
      if (pnl > 0) dailyPnL[key].wins++;
      else if (pnl < 0) dailyPnL[key].losses++;
    }
  }

  // Count winning / losing days
  for (const day of Object.values(dailyPnL)) {
    monthTotalPnL += day.pnl;
    if (day.pnl > 0) winningDaysCount++;
    else if (day.pnl < 0) losingDaysCount++;
  }

  // Generate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const weekHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5">
      {/* Header with Month Nav & Monthly Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-indigo-400" />
          <h2 className="text-base font-semibold text-white tracking-tight">P/L Calendar</h2>
          <span className="text-xs text-slate-400 ml-1">Daily trade outcomes</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Monthly PnL summary badge */}
          <div className="text-xs px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Month:</span>
            <span
              className={`font-semibold mono-nums ${
                monthTotalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(monthTotalPnL, currency, true)}
            </span>
            <span className="text-slate-400 text-[11px]">
              ({winningDaysCount}G / {losingDaysCount}R)
            </span>
          </div>

          {/* Month selector arrows */}
          <div className="flex items-center gap-1 bg-[#0a0d14] border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={prevMonth}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-medium text-slate-200 min-w-[100px] text-center">
              {monthName}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400 mb-1">
        {weekHeaders.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1.5">
        {/* Leading empty slots */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div
            key={`empty_${i}`}
            className="h-16 sm:h-20 rounded-lg bg-slate-900/20 border border-transparent"
          />
        ))}

        {/* Days of month */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const dayNum = i + 1;
          const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(
            dayNum
          ).padStart(2, '0')}`;
          const stat = dailyPnL[dayStr];

          let bgClass = 'bg-[#0e1320] border-slate-800/60 text-slate-400';
          let pnlClass = 'text-slate-400';

          if (stat) {
            if (stat.pnl > 0) {
              bgClass = 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300';
              pnlClass = 'text-emerald-400';
            } else if (stat.pnl < 0) {
              bgClass = 'bg-rose-950/20 border-rose-500/30 text-rose-300';
              pnlClass = 'text-rose-400';
            } else {
              bgClass = 'bg-slate-800/40 border-slate-700/60 text-slate-300';
              pnlClass = 'text-slate-300';
            }
          }

          return (
            <div
              key={dayNum}
              className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-lg border transition-all flex flex-col justify-between ${bgClass}`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-300">{dayNum}</span>
                {stat && (
                  <span className="text-[10px] text-slate-400">
                    {stat.count}t
                  </span>
                )}
              </div>

              {stat ? (
                <div className="text-left mt-auto">
                  <div className={`text-xs sm:text-sm font-semibold mono-nums truncate ${pnlClass}`}>
                    {stat.pnl >= 0 ? '+' : ''}
                    {formatCurrency(stat.pnl, currency)}
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 mt-auto">—</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
