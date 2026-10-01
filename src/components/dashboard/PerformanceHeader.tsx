import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { MetricCard } from '../common/MetricCard';
import { formatCurrency, formatPercent } from '../../utils/formatters';
import { Wallet, TrendingUp, Award, Activity, ShieldAlert, Target } from 'lucide-react';

export const PerformanceHeader: React.FC = () => {
  const { metrics, filteredTrades } = useTrading();
  const { user, currentUser } = useAuth();
  const currency = user.preferences.defaultCurrency;

  // Compute greeting based on local time
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Compute Today's Trades & PnL
  const today = new Date().toISOString().split('T')[0];
  const todayTrades = filteredTrades.filter((t) => t.date === today);
  const todayPnL = todayTrades.reduce((acc, t) => acc + (t.netPnL ?? t.grossPnL), 0);
  const todayWins = todayTrades.filter((t) => (t.netPnL ?? t.grossPnL) > 0).length;
  const todayLosses = todayTrades.filter((t) => (t.netPnL ?? t.grossPnL) < 0).length;

  return (
    <div className="space-y-4">
      {/* Top Greeting Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase">
            {greeting}, {currentUser?.name || user.name || 'Trader'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Your trading snapshot • {filteredTrades.length} trades recorded
          </p>
        </div>

        {/* Today's Mini Bar */}
        <div className="flex items-center gap-3 bg-[#101522] border border-slate-800 px-3.5 py-2 rounded-xl">
          <div className="text-right">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Today's P/L</div>
            <div
              className={`text-sm font-semibold mono-nums ${
                todayPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {todayTrades.length > 0 ? formatCurrency(todayPnL, currency, true) : '₹0'}
            </div>
          </div>
          <div className="h-6 w-px bg-slate-800" />
          <div className="text-xs text-slate-300">
            <span className="font-semibold text-white">{todayTrades.length}</span> Trades
            <span className="text-slate-400 text-[11px] ml-1.5">
              ({todayWins}W • {todayLosses}L)
            </span>
          </div>
        </div>
      </div>

      {/* Prioritized Performance Metrics Grid */}
      {/* Hierarchy: Capital -> P/L -> Win Rate -> Profit Factor -> Drawdown -> Expectancy */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricCard
          label="Current Capital"
          value={formatCurrency(metrics.currentCapital, currency)}
          subtext={`Started at ${formatCurrency(metrics.startingCapital, currency)}`}
          icon={Wallet}
        />

        <MetricCard
          label="Total Net P/L"
          value={formatCurrency(metrics.totalNetPnL, currency, true)}
          subtext={`${formatPercent(metrics.totalReturnPercent)} overall return`}
          isPositive={metrics.totalNetPnL > 0}
          isNegative={metrics.totalNetPnL < 0}
          icon={TrendingUp}
        />

        <MetricCard
          label="Win Rate"
          value={`${metrics.winRate}%`}
          subtext={`${metrics.winningTrades}W • ${metrics.losingTrades}L • ${metrics.breakEvenTrades}BE`}
          isPositive={metrics.winRate >= 50}
          isNegative={metrics.winRate < 45}
          icon={Award}
        />

        <MetricCard
          label="Profit Factor"
          value={metrics.profitFactor > 0 ? metrics.profitFactor.toFixed(2) : '—'}
          subtext={metrics.profitFactor >= 1.5 ? 'Strong statistical edge' : 'Target > 1.5'}
          isPositive={metrics.profitFactor >= 1.5}
          isNegative={metrics.profitFactor < 1.0}
          icon={Activity}
        />

        <MetricCard
          label="Max Drawdown"
          value={`-${metrics.maxDrawdownPercent}%`}
          subtext={formatCurrency(metrics.maxDrawdownAmount, currency)}
          isNegative={metrics.maxDrawdownPercent > 10}
          icon={ShieldAlert}
        />

        <MetricCard
          label="Expectancy"
          value={formatCurrency(metrics.expectancy, currency, true)}
          subtext={`Avg R:R 1:${metrics.averageRR}`}
          isPositive={metrics.expectancy > 0}
          isNegative={metrics.expectancy < 0}
          icon={Target}
        />
      </div>
    </div>
  );
};
