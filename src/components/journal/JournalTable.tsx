import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { Trade, TradeDirection, AssetClass, EmotionalState } from '../../types';
import { formatCurrency, formatPercent, formatRR, formatDate } from '../../utils/formatters';
import { DirectionBadge, EmotionBadge, AssetBadge } from '../common/Badge';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Upload,
  Plus,
  Trash2,
  Copy,
  Edit2,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface JournalTableProps {
  onOpenAddTrade: () => void;
  onEditTrade: (trade: Trade) => void;
  onSelectTrade: (trade: Trade) => void;
  onOpenCsvImport: () => void;
}

type SortField = 'date' | 'pnl' | 'return' | 'capital' | 'instrument';
type SortOrder = 'asc' | 'desc';

export const JournalTable: React.FC<JournalTableProps> = ({
  onOpenAddTrade,
  onEditTrade,
  onSelectTrade,
  onOpenCsvImport,
}) => {
  const {
    filteredTrades,
    filters,
    setFilters,
    resetFilters,
    exportCsv,
    deleteTrade,
    duplicateTrade,
  } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;

  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Sorting
  const sortedTrades = useMemo(() => {
    return [...filteredTrades].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'date') {
        comparison = a.date.localeCompare(b.date);
        if (comparison === 0) comparison = (a.time || '').localeCompare(b.time || '');
      } else if (sortField === 'pnl') {
        const pnlA = a.netPnL ?? a.grossPnL;
        const pnlB = b.netPnL ?? b.grossPnL;
        comparison = pnlA - pnlB;
      } else if (sortField === 'return') {
        comparison = a.pnlPercentage - b.pnlPercentage;
      } else if (sortField === 'capital') {
        comparison = a.capitalUsed - b.capitalUsed;
      } else if (sortField === 'instrument') {
        comparison = a.instrument.localeCompare(b.instrument);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredTrades, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const hasActiveFilters =
    filters.search ||
    filters.assetClass !== 'ALL' ||
    filters.direction !== 'ALL' ||
    filters.strategy !== 'ALL' ||
    filters.emotionalState !== 'ALL' ||
    filters.winLoss !== 'ALL';

  return (
    <div className="space-y-3">
      {/* Top Search, Filter, and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search instrument, strategy, thesis, notes..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            className="w-full bg-[#101522] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400"
          />
          {filters.search && (
            <button
              onClick={() => setFilters((f) => ({ ...f, search: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
              hasActiveFilters || showFilters
                ? 'bg-indigo-600/15 border-indigo-500/30 text-indigo-400'
                : 'bg-[#101522] border-slate-800 text-slate-300 hover:bg-[#141b2c]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            )}
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#101522] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="Export Journal to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onOpenCsvImport}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#101522] border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
            title="Import Trades from CSV"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>

          <button
            onClick={onOpenAddTrade}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {/* Expandable Filter Panel */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-[#0e1320] border border-slate-800 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Journal Filters</span>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Reset All Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {/* Direction */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Direction</label>
              <select
                value={filters.direction || 'ALL'}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    direction: e.target.value as TradeDirection | 'ALL',
                  }))
                }
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="ALL">All Directions</option>
                <option value="LONG">Long</option>
                <option value="SHORT">Short</option>
              </select>
            </div>

            {/* Win / Loss */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Outcome</label>
              <select
                value={filters.winLoss || 'ALL'}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    winLoss: e.target.value as 'ALL' | 'WIN' | 'LOSS',
                  }))
                }
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="ALL">All Outcomes</option>
                <option value="WIN">Winning Trades</option>
                <option value="LOSS">Losing Trades</option>
              </select>
            </div>

            {/* Asset Class */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Asset Class</label>
              <select
                value={filters.assetClass || 'ALL'}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    assetClass: e.target.value as AssetClass | 'ALL',
                  }))
                }
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="ALL">All Assets</option>
                <option value="Indian Indices">Indian Indices</option>
                <option value="Indian Equities">Indian Equities</option>
                <option value="Crypto">Crypto</option>
                <option value="Commodities">Commodities</option>
              </select>
            </div>

            {/* Strategy */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Strategy</label>
              <select
                value={filters.strategy || 'ALL'}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, strategy: e.target.value }))
                }
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="ALL">All Strategies</option>
                <option value="Breakout">Breakout</option>
                <option value="Pullback">Pullback</option>
                <option value="Support/Resistance">Support/Resistance</option>
                <option value="Trend Following">Trend Following</option>
                <option value="FVG">FVG</option>
                <option value="VWAP">VWAP</option>
                <option value="Price Action">Price Action</option>
              </select>
            </div>

            {/* Emotion */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Emotional State</label>
              <select
                value={filters.emotionalState || 'ALL'}
                onChange={(e) =>
                  setFilters((f) => ({
                    ...f,
                    emotionalState: e.target.value as EmotionalState | 'ALL',
                  }))
                }
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="ALL">All Emotions</option>
                <option value="Calm">Calm</option>
                <option value="Disciplined">Disciplined</option>
                <option value="Confident">Confident</option>
                <option value="Fearful">Fearful</option>
                <option value="FOMO">FOMO</option>
                <option value="Revenge">Revenge</option>
                <option value="Impulsive">Impulsive</option>
                <option value="Greedy">Greedy</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Journal Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#101522] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-[#0c101a] text-slate-400 border-b border-slate-800 font-medium">
              <tr>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('instrument')}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Instrument</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Side</th>
                <th className="py-3 px-4 text-right">Entry</th>
                <th className="py-3 px-4 text-right">Exit</th>
                <th
                  onClick={() => handleSort('capital')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Capital</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('pnl')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Net P/L</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('return')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Return</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-center">R:R</th>
                <th className="py-3 px-4">Strategy</th>
                <th className="py-3 px-4">Emotion</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {sortedTrades.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <FileSpreadsheet className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-sm font-medium text-slate-300">No trades found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your filters or add a new trade to start journaling.
                    </p>
                  </td>
                </tr>
              ) : (
                sortedTrades.map((t) => {
                  const isProfit = (t.netPnL ?? t.grossPnL) > 0;
                  return (
                    <tr
                      key={t.id}
                      onClick={() => onSelectTrade(t)}
                      className="hover:bg-[#141b2c] transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {formatDate(t.date)}
                        {t.time && <span className="text-slate-400 ml-1.5 text-[11px]">{t.time}</span>}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white tracking-tight">
                            {t.instrument}
                          </span>
                          <span className="text-[10px] text-slate-400 hidden lg:inline">
                            {t.assetClass}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <DirectionBadge direction={t.direction} />
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(t.entryPrice, currency)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(t.exitPrice, currency)}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatCurrency(t.capitalUsed, currency)}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-mono font-semibold ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatCurrency(t.netPnL, currency, true)}
                      </td>

                      <td
                        className={`py-3 px-4 text-right font-mono font-medium ${
                          t.pnlPercentage >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {formatPercent(t.pnlPercentage)}
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-400">
                        {formatRR(t.rrRatio)}
                      </td>

                      <td className="py-3 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
                          {t.strategy}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <EmotionBadge emotion={t.emotionalState} />
                      </td>

                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTrade(t)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Edit Trade"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => duplicateTrade(t.id)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                            title="Duplicate Trade"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete trade on ${t.instrument}?`)) {
                                deleteTrade(t.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/30"
                            title="Delete Trade"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
