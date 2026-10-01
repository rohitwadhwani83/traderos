import React, { useState, useEffect } from 'react';
import { useTrading } from '../../context/TradingContext';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/Modal';
import {
  AssetClass,
  TradeDirection,
  EmotionalState,
  StrategyType,
  Timeframe,
  Trade,
} from '../../types';
import {
  calculateGrossPnL,
  calculateNetPnL,
  calculateRisk,
  calculateReward,
  calculateRR,
} from '../../utils/calculations';
import { formatCurrency, formatPercent, formatRR } from '../../utils/formatters';
import { ChevronDown, Calculator, Sparkles, Upload } from 'lucide-react';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrade?: Trade | null;
}

const STRATEGIES: StrategyType[] = [
  'Breakout',
  'Pullback',
  'Support/Resistance',
  'Trend Following',
  'FVG',
  'VWAP',
  'EMA',
  'Price Action',
  'Options',
  'Scalping',
  'Swing',
  'Custom',
];

const EMOTIONAL_STATES: EmotionalState[] = [
  'Calm',
  'Confident',
  'Fearful',
  'Greedy',
  'FOMO',
  'Revenge',
  'Impulsive',
  'Disciplined',
];

const ASSET_CLASSES: AssetClass[] = [
  'Indian Indices',
  'Indian Equities',
  'Commodities',
  'Crypto',
  'F&O',
  'Forex',
];

export const AddTradeModal: React.FC<AddTradeModalProps> = ({
  isOpen,
  onClose,
  initialTrade,
}) => {
  const { addTrade, updateTrade } = useTrading();
  const { user } = useAuth();
  const currency = user.preferences.defaultCurrency;

  const todayStr = new Date().toISOString().split('T')[0];
  const nowTimeStr = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });

  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState(nowTimeStr);
  const [instrument, setInstrument] = useState('NIFTY');
  const [assetClass, setAssetClass] = useState<AssetClass>('Indian Indices');
  const [direction, setDirection] = useState<TradeDirection>('LONG');
  const [entryPrice, setEntryPrice] = useState<string>('22800');
  const [exitPrice, setExitPrice] = useState<string>('22920');
  const [quantity, setQuantity] = useState<string>('50');
  const [capitalUsed, setCapitalUsed] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('22740');
  const [target, setTarget] = useState<string>('22950');
  const [strategy, setStrategy] = useState<string>('Breakout');
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [emotionalState, setEmotionalState] = useState<EmotionalState>('Disciplined');
  const [entryReason, setEntryReason] = useState<string>('');
  const [exitReason, setExitReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [screenshotUrl, setScreenshotUrl] = useState<string>('');

  // Charges
  const [brokerage, setBrokerage] = useState<string>('40');
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Load initial trade when editing
  useEffect(() => {
    if (initialTrade) {
      setDate(initialTrade.date);
      setTime(initialTrade.time || nowTimeStr);
      setInstrument(initialTrade.instrument);
      setAssetClass(initialTrade.assetClass);
      setDirection(initialTrade.direction);
      setEntryPrice(String(initialTrade.entryPrice));
      setExitPrice(String(initialTrade.exitPrice));
      setQuantity(String(initialTrade.quantity));
      setCapitalUsed(String(initialTrade.capitalUsed));
      setStopLoss(initialTrade.stopLoss ? String(initialTrade.stopLoss) : '');
      setTarget(initialTrade.target ? String(initialTrade.target) : '');
      setStrategy(initialTrade.strategy);
      setTimeframe(initialTrade.timeframe || '5m');
      setEmotionalState(initialTrade.emotionalState || 'Disciplined');
      setEntryReason(initialTrade.entryReason || '');
      setExitReason(initialTrade.exitReason || '');
      setNotes(initialTrade.notes || '');
      setScreenshotUrl(initialTrade.screenshotUrl || '');
      setBrokerage(String(initialTrade.charges?.brokerage ?? 40));
    } else {
      // Reset form
      setDate(todayStr);
      setTime(nowTimeStr);
      setInstrument('NIFTY');
      setAssetClass('Indian Indices');
      setDirection('LONG');
      setEntryPrice('');
      setExitPrice('');
      setQuantity('1');
      setCapitalUsed('');
      setStopLoss('');
      setTarget('');
      setStrategy('Breakout');
      setTimeframe('5m');
      setEmotionalState('Disciplined');
      setEntryReason('');
      setExitReason('');
      setNotes('');
      setScreenshotUrl('');
      setBrokerage('40');
    }
  }, [initialTrade, isOpen]);

  // Numeric parsing
  const numEntry = parseFloat(entryPrice) || 0;
  const numExit = parseFloat(exitPrice) || 0;
  const numQty = parseFloat(quantity) || 0;
  const numStop = parseFloat(stopLoss) || undefined;
  const numTarget = parseFloat(target) || undefined;
  const numBrokerage = parseFloat(brokerage) || 0;

  // Auto-calculated fields
  const grossPnL = calculateGrossPnL(direction, numEntry, numExit, numQty);
  const totalCharges = Number((numBrokerage * 1.18).toFixed(2)); // Brokerage + 18% GST estimate
  const netPnL = calculateNetPnL(grossPnL, { totalCharges, brokerage: numBrokerage });

  const calculatedCapital =
    parseFloat(capitalUsed) > 0
      ? parseFloat(capitalUsed)
      : Number((numEntry * numQty * (assetClass.includes('Indices') ? 0.2 : 1)).toFixed(2));

  const pnlPercent =
    calculatedCapital > 0 ? Number(((netPnL / calculatedCapital) * 100).toFixed(2)) : 0;
  const riskAmount = calculateRisk(direction, numEntry, numStop, numQty);
  const rewardAmount = calculateReward(direction, numEntry, numTarget, numQty);
  const rrRatio = calculateRR(riskAmount, rewardAmount);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instrument.trim() || numEntry <= 0 || numExit <= 0 || numQty <= 0) {
      alert('Please fill in Instrument, Entry Price, Exit Price, and Quantity.');
      return;
    }

    const tradeData = {
      date,
      time,
      instrument: instrument.toUpperCase().trim(),
      assetClass,
      direction,
      entryPrice: numEntry,
      exitPrice: numExit,
      quantity: numQty,
      capitalUsed: calculatedCapital,
      stopLoss: numStop,
      target: numTarget,
      strategy,
      timeframe,
      entryReason,
      exitReason,
      notes,
      screenshotUrl,
      emotionalState,
      charges: {
        brokerage: numBrokerage,
        stt: 0,
        exchangeCharges: 0,
        gst: Number((numBrokerage * 0.18).toFixed(2)),
        sebiCharges: 0,
        otherCharges: 0,
        totalCharges,
      },
      grossPnL,
      netPnL,
      pnlPercentage: pnlPercent,
      riskAmount: riskAmount > 0 ? riskAmount : undefined,
      rewardAmount: rewardAmount > 0 ? rewardAmount : undefined,
      rrRatio: rrRatio > 0 ? rrRatio : undefined,
      isWin: netPnL > 0,
      isBreakEven: netPnL === 0,
    };

    if (initialTrade) {
      updateTrade({
        ...initialTrade,
        ...tradeData,
        updatedAt: new Date().toISOString(),
      });
    } else {
      addTrade(tradeData);
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTrade ? 'Edit Trade' : 'Add New Trade'}
      subtitle="Rapid trade logger • Automatic P/L and R:R calculations"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Dynamic Calculations Bar */}
        <div className="grid grid-cols-4 gap-2 p-3 rounded-xl bg-[#090d16] border border-slate-800">
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Net P/L</div>
            <div
              className={`text-sm sm:text-base font-bold mono-nums ${
                netPnL > 0 ? 'text-emerald-400' : netPnL < 0 ? 'text-rose-400' : 'text-slate-300'
              }`}
            >
              {formatCurrency(netPnL, currency, true)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Return</div>
            <div
              className={`text-sm sm:text-base font-semibold mono-nums ${
                pnlPercent > 0 ? 'text-emerald-400' : pnlPercent < 0 ? 'text-rose-400' : 'text-slate-400'
              }`}
            >
              {formatPercent(pnlPercent)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">R:R Ratio</div>
            <div className="text-sm sm:text-base font-semibold mono-nums text-slate-200">
              {formatRR(rrRatio)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wide">Capital</div>
            <div className="text-sm sm:text-base font-semibold mono-nums text-slate-300">
              {formatCurrency(calculatedCapital, currency)}
            </div>
          </div>
        </div>

        {/* Row 1: Date, Time, Instrument, Asset Class */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Instrument</label>
            <input
              type="text"
              placeholder="e.g. NIFTY, BTCUSDT"
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Asset Class</label>
            <select
              value={assetClass}
              onChange={(e) => setAssetClass(e.target.value as AssetClass)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {ASSET_CLASSES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Direction, Entry, Exit, Quantity */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Direction</label>
            <div className="grid grid-cols-2 gap-1 bg-[#161d2c] p-1 rounded-lg border border-slate-700/80">
              <button
                type="button"
                onClick={() => setDirection('LONG')}
                className={`py-1 text-xs font-semibold rounded ${
                  direction === 'LONG'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                LONG
              </button>
              <button
                type="button"
                onClick={() => setDirection('SHORT')}
                className={`py-1 text-xs font-semibold rounded ${
                  direction === 'SHORT'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SHORT
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Entry Price</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 mono-nums"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Exit Price</label>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 mono-nums"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Quantity</label>
            <input
              type="number"
              step="any"
              placeholder="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 mono-nums"
              required
            />
          </div>
        </div>

        {/* Row 3: Stop Loss, Target, Strategy, Emotional State */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Stop Loss (Optional)</label>
            <input
              type="number"
              step="any"
              placeholder="SL price"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 mono-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Target (Optional)</label>
            <input
              type="number"
              step="any"
              placeholder="Target price"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 mono-nums"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {STRATEGIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Emotional State</label>
            <select
              value={emotionalState}
              onChange={(e) => setEmotionalState(e.target.value as EmotionalState)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              {EMOTIONAL_STATES.map((es) => (
                <option key={es} value={es}>
                  {es}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Trade Thesis & Exit Reason */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Trader's Thesis (Why did I enter?)
            </label>
            <textarea
              rows={2}
              placeholder="Setup reasons, key level, pattern..."
              value={entryReason}
              onChange={(e) => setEntryReason(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 resize-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Exit Reason (Why did I exit?)
            </label>
            <textarea
              rows={2}
              placeholder="Target reached, trailing stop hit, momentum faded..."
              value={exitReason}
              onChange={(e) => setExitReason(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder:text-slate-400 resize-none"
            />
          </div>
        </div>

        {/* Screenshot Upload & Notes Toggle */}
        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{screenshotUrl ? 'Screenshot Attached ✓' : 'Attach Chart Screenshot'}</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <span>{showAdvanced ? 'Hide Advanced Settings' : 'Advanced & Fees'}</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
            />
          </button>
        </div>

        {/* Collapsible Advanced Settings (Capital override, Brokerage, Notes) */}
        {showAdvanced && (
          <div className="p-3.5 rounded-xl bg-[#0d121f] border border-slate-800 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Capital Override
                </label>
                <input
                  type="number"
                  placeholder="Auto-calculated if blank"
                  value={capitalUsed}
                  onChange={(e) => setCapitalUsed(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 mono-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Brokerage / Fee (₹)
                </label>
                <input
                  type="number"
                  value={brokerage}
                  onChange={(e) => setBrokerage(e.target.value)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 mono-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Timeframe
                </label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value as Timeframe)}
                  className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="1m">1m</option>
                  <option value="5m">5m</option>
                  <option value="15m">15m</option>
                  <option value="1h">1h</option>
                  <option value="4h">4h</option>
                  <option value="1D">1D</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Post-Trade Notes
              </label>
              <input
                type="text"
                placeholder="Discipline checks, mistakes, lessons learned..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-95"
          >
            {initialTrade ? 'Save Changes' : 'Save Trade'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
