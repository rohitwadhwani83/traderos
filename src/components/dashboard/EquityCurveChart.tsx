import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { TimeFilter, EquityCurvePoint } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { TrendingUp, Maximize2 } from 'lucide-react';

export const EquityCurveChart: React.FC = () => {
  const { equityCurve, timeFilter, setTimeFilter } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;
  const [hoveredPoint, setHoveredPoint] = useState<EquityCurvePoint | null>(null);

  const filters: TimeFilter[] = ['7D', '30D', '3M', '6M', '1Y', 'ALL'];

  if (equityCurve.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-[#101522] p-6 text-center text-slate-400">
        No equity curve data available.
      </div>
    );
  }

  // Calculate SVG dimensions and coordinate mapping
  const width = 800;
  const height = 260;
  const padding = { top: 20, right: 30, bottom: 35, left: 65 };

  const equities = equityCurve.map((p) => p.equity);
  const minEquity = Math.min(...equities) * 0.995;
  const maxEquity = Math.max(...equities) * 1.005;
  const range = maxEquity - minEquity || 1;

  const points = equityCurve.map((p, i) => {
    const x =
      padding.left +
      (i / Math.max(1, equityCurve.length - 1)) * (width - padding.left - padding.right);
    const y =
      padding.top +
      (1 - (p.equity - minEquity) / range) * (height - padding.top - padding.bottom);
    return { x, y, point: p };
  });

  const pathD = points.reduce((acc, curr, idx) => {
    return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    height - padding.bottom
  } L ${points[0].x} ${height - padding.bottom} Z`;

  const latestPoint = equityCurve[equityCurve.length - 1];
  const initialPoint = equityCurve[0];
  const overallPnL = latestPoint.equity - user.preferences.startingCapital;
  const isUp = overallPnL >= 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5">
      {/* Header with Title and Timeframe Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight">Equity Curve</h2>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isUp
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {formatCurrency(overallPnL, currency, true)}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {hoveredPoint
              ? `${formatDate(hoveredPoint.date)} • Equity: ${formatCurrency(
                  hoveredPoint.equity,
                  currency
                )} • PnL: ${formatCurrency(hoveredPoint.pnl, currency, true)}`
              : `Current: ${formatCurrency(latestPoint.equity, currency)} • ${equityCurve.length} data points`}
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center bg-[#0a0d14] border border-slate-800 rounded-lg p-0.5 text-xs">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setTimeFilter(f)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                timeFilter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive SVG Chart */}
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64"
          onMouseLeave={() => setHoveredPoint(null)}
        >
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity="0.28" />
              <stop offset="100%" stopColor={isUp ? '#10b981' : '#f43f5e'} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = padding.top + ratio * (height - padding.top - padding.bottom);
            const val = maxEquity - ratio * range;
            return (
              <g key={ratio}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={padding.left - 8}
                  y={y + 4}
                  fill="#64748b"
                  fontSize="10"
                  textAnchor="end"
                  className="mono-nums"
                >
                  {formatCurrency(val, currency)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#equityGradient)" />

          {/* Line stroke */}
          <path
            d={pathD}
            fill="none"
            stroke={isUp ? '#10b981' : '#f43f5e'}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive hover tracking */}
          {points.map((pt, i) => (
            <circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={hoveredPoint?.date === pt.point.date ? 5 : 3}
              fill={isUp ? '#10b981' : '#f43f5e'}
              className="transition-all cursor-pointer opacity-70 hover:opacity-100"
              onMouseEnter={() => setHoveredPoint(pt.point)}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
