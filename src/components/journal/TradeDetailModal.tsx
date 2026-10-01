import React, { useMemo } from 'react';
import { Trade } from '../../types';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useTrading } from '../../context/TradingContext';
import { formatCurrency, formatPercent, formatRR, formatDate } from '../../utils/formatters';
import { DirectionBadge, EmotionBadge, AssetBadge } from '../common/Badge';
import { generateTradeReview } from '../../services/ai/tradeReview';
import {
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Clock,
  Coins,
  TrendingUp,
  TrendingDown,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
} from 'lucide-react';

interface TradeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onEdit: (trade: Trade) => void;
}

export const TradeDetailModal: React.FC<TradeDetailModalProps> = ({
  isOpen,
  onClose,
  trade,
  onEdit,
}) => {
  const { user } = useAuth();
  const { trades, deleteTrade, duplicateTrade } = useTrading();
  const currency = user.preferences.defaultCurrency;

  const review = useMemo(() => {
    if (!trade) return null;
    return generateTradeReview(trade, trades);
  }, [trade, trades]);

  if (!trade || !review) return null;

  const isProfit = (trade.netPnL ?? trade.grossPnL) > 0;

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete this trade on ${trade.instrument}?`)) {
      deleteTrade(trade.id);
      onClose();
    }
  };

  const handleDuplicate = () => {
    duplicateTrade(trade.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${trade.instrument} Trade Detail`}
      subtitle={`${formatDate(trade.date)} ${trade.time || ''} • ${trade.strategy}`}
      maxWidth="2xl"
    >
      <div className="space-y-5">
        {/* Top Summary Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#090d16] border border-slate-800">
          <div className="flex items-center gap-3">
            <DirectionBadge direction={trade.direction} />
            <span className="text-xl font-bold text-white tracking-tight">{trade.instrument}</span>
            <AssetBadge assetClass={trade.assetClass} />
            <EmotionBadge emotion={trade.emotionalState} />
          </div>

          <div className="text-right">
            <div className="text-[11px] text-slate-400 uppercase tracking-wide">Net Outcome</div>
            <div
              className={`text-xl font-bold mono-nums ${
                isProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {formatCurrency(trade.netPnL, currency, true)}
              <span className="text-xs ml-1.5 font-medium">({formatPercent(trade.pnlPercentage)})</span>
            </div>
          </div>
        </div>

        {/* Execution Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Entry Price</div>
            <div className="text-sm font-semibold text-slate-200 mono-nums mt-0.5">
              {formatCurrency(trade.entryPrice, currency)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Exit Price</div>
            <div className="text-sm font-semibold text-slate-200 mono-nums mt-0.5">
              {formatCurrency(trade.exitPrice, currency)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Quantity / Size</div>
            <div className="text-sm font-semibold text-slate-200 mono-nums mt-0.5">
              {trade.quantity} units
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Capital Used</div>
            <div className="text-sm font-semibold text-slate-200 mono-nums mt-0.5">
              {formatCurrency(trade.capitalUsed, currency)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Stop Loss</div>
            <div className="text-sm font-semibold text-slate-200 mono-nums mt-0.5">
              {trade.stopLoss ? formatCurrency(trade.stopLoss, currency) : 'None'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Target</div>
            <div className="text-sm font-semibold text-slate-200 mono-nums mt-0.5">
              {trade.target ? formatCurrency(trade.target, currency) : 'None'}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">R:R Realized</div>
            <div className="text-sm font-semibold text-slate-200 mono-nums mt-0.5">
              {formatRR(trade.rrRatio)}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0e1320] border border-slate-800/80">
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Duration</div>
            <div className="text-sm font-semibold text-slate-200 mono-nums mt-0.5">
              {trade.holdingDurationMinutes ? `${trade.holdingDurationMinutes}m` : 'Intraday'}
            </div>
          </div>
        </div>

        {/* Screenshot View (if present) */}
        {trade.screenshotUrl && (
          <div className="rounded-xl border border-slate-800 overflow-hidden bg-black/40">
            <div className="p-2.5 bg-[#0e1320] border-b border-slate-800 text-xs font-medium text-slate-300">
              Attached Chart Screenshot
            </div>
            <img
              src={trade.screenshotUrl}
              alt="Trade Chart"
              className="max-h-72 w-full object-contain bg-black"
            />
          </div>
        )}

        {/* Trader's Thesis & Exit Reason */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-1">Trader's Thesis</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {trade.entryReason || 'No entry thesis recorded.'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800">
            <div className="text-xs font-semibold text-slate-300 mb-1">Exit Reason</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              {trade.exitReason || 'No exit reason recorded.'}
            </p>
          </div>
        </div>

        {trade.notes && (
          <div className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800 text-xs">
            <span className="font-semibold text-slate-300">Notes: </span>
            <span className="text-slate-400">{trade.notes}</span>
          </div>
        )}

        {/* AI Review Section */}
        <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-br from-[#121629] to-[#0a0d14] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h4 className="text-xs font-semibold text-white tracking-tight uppercase">
                AI Trade Review
              </h4>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                review.verdict === 'DISCIPLINED'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : review.verdict === 'LEAK_DETECTED'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}
            >
              {review.verdict.replace('_', ' ')}
            </span>
          </div>

          <div className="space-y-2 text-xs leading-relaxed">
            <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800/80">
              <span className="font-semibold text-emerald-400">What was done well: </span>
              <span className="text-slate-300">{review.whatDoneWell}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800/80">
              <span className="font-semibold text-amber-400">What could be improved: </span>
              <span className="text-slate-300">{review.whatCouldBeImproved}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800/80">
              <span className="font-semibold text-indigo-400">Position Sizing & Risk: </span>
              <span className="text-slate-300">{review.positionSizingAssessment}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#090d16] border border-slate-800/80">
              <span className="font-semibold text-slate-400">Historical Pattern: </span>
              <span className="text-slate-400">{review.patternMatch}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDuplicate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>
            <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/20 border border-rose-500/30 hover:bg-rose-900/30 text-rose-400 text-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(trade);
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Trade</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
