import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { AssetClass } from '../../types';
import { Sparkles, ArrowRight, Upload, PlayCircle } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCsvImport: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onOpenCsvImport,
}) => {
  const { completeOnboarding, user } = useAuth();

  const [selectedMarkets, setSelectedMarkets] = useState<AssetClass[]>([
    'Indian Indices',
    'Indian Equities',
  ]);
  const [tradingStyle, setTradingStyle] = useState<
    'Intraday' | 'Swing' | 'Scalper' | 'Positional'
  >('Intraday');
  const [defaultRisk, setDefaultRisk] = useState<number>(1.0);

  const toggleMarket = (market: AssetClass) => {
    if (selectedMarkets.includes(market)) {
      if (selectedMarkets.length > 1) {
        setSelectedMarkets(selectedMarkets.filter((m) => m !== market));
      }
    } else {
      setSelectedMarkets([...selectedMarkets, market]);
    }
  };

  const handleFinish = (openImport: boolean = false) => {
    completeOnboarding({
      preferredMarkets: selectedMarkets,
      tradingStyle,
      defaultRiskPercent: defaultRisk,
    });
    onClose();
    if (openImport) {
      onOpenCsvImport();
    }
  };

  const marketOptions: AssetClass[] = [
    'Indian Indices',
    'Indian Equities',
    'F&O',
    'Commodities',
    'Crypto',
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => handleFinish(false)}
      title="Welcome to TraderOS"
      subtitle="Set up your trading intelligence profile in 30 seconds"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Question 1: What do you trade? */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            1. What do you trade?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {marketOptions.map((m) => {
              const isSelected = selectedMarkets.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleMarket(m)}
                  className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                      : 'bg-[#0c101a] border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="block">{m}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Question 2: What type of trader are you? */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            2. What type of trader are you?
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Intraday', 'Swing', 'Scalper', 'Positional'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setTradingStyle(s)}
                className={`p-2 rounded-xl border text-xs font-medium text-center transition-all ${
                  tradingStyle === s
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
                    : 'bg-[#0c101a] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Question 3: What is your default risk per trade? */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            3. What is your default risk per trade?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[0.5, 1.0, 2.0].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDefaultRisk(r)}
                className={`p-2.5 rounded-xl border text-xs font-bold mono-nums text-center transition-all ${
                  defaultRisk === r
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-[#0c101a] border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {r}%
              </button>
            ))}
          </div>
        </div>

        {/* Choice: Import Existing Trades OR Start Fresh */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => handleFinish(true)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#161d2c] hover:bg-[#1b2436] border border-slate-700/80 text-xs font-semibold text-white transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import Existing Trades (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => handleFinish(false)}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Start Fresh</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
