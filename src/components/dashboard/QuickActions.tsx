import React from 'react';
import { Plus, LineChart, Calculator, FileUp, Download } from 'lucide-react';
import { useTrading } from '../../context/TradingContext';

interface QuickActionsProps {
  onAddTrade: () => void;
  onAnalyseMarket: () => void;
  onOpenRiskCalculator: () => void;
  onOpenCsvImport: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onAddTrade,
  onAnalyseMarket,
  onOpenRiskCalculator,
  onOpenCsvImport,
}) => {
  const { exportCsv } = useTrading();

  const actions = [
    {
      label: '+ Add Trade',
      desc: 'Rapid entry in <30 seconds',
      icon: Plus,
      onClick: onAddTrade,
      primary: true,
    },
    {
      label: 'Analyse Market',
      desc: 'Screenshot, ticker or URL',
      icon: LineChart,
      onClick: onAnalyseMarket,
    },
    {
      label: 'Risk Calculator',
      desc: 'Position size & capital risk',
      icon: Calculator,
      onClick: onOpenRiskCalculator,
    },
    {
      label: 'Import CSV',
      desc: 'Upload broker trade records',
      icon: FileUp,
      onClick: onOpenCsvImport,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.label}
            onClick={act.onClick}
            className={`p-3.5 rounded-xl border text-left transition-all group ${
              act.primary
                ? 'bg-emerald-600/10 border-emerald-500/30 hover:bg-emerald-600/20 text-white'
                : 'bg-[#101522] border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-[#141b2c]'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon
                className={`w-4 h-4 ${
                  act.primary ? 'text-emerald-400' : 'text-slate-400 group-hover:text-white'
                }`}
              />
              <span className="text-xs font-semibold tracking-tight">{act.label}</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">{act.desc}</p>
          </button>
        );
      })}
    </div>
  );
};
