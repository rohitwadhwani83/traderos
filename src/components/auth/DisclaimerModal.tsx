import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { ShieldAlert, CheckCircle2, AlertOctagon, Scale, BookOpen } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAccept }) => {
  const [hasAgreed, setHasAgreed] = useState(false);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // User must explicitly accept, cannot close without accepting
      title="Mandatory Regulatory & Educational Disclaimer"
      subtitle="Please review and acknowledge before entering TraderOS"
      maxWidth="2xl"
    >
      <div className="space-y-4 text-xs leading-relaxed text-slate-300">
        {/* Warning Banner */}
        <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/30 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block text-xs mb-0.5">
              Educational Decision Support System • Not SEBI Registered
            </span>
            <p className="text-[11px] text-amber-200/90 leading-normal">
              TraderOS has been engineered exclusively as a personal trading journal, statistical
              analytics dashboard, and self-directed decision support utility.
            </p>
          </div>
        </div>

        {/* Detailed Disclaimer Clauses */}
        <div className="max-h-72 overflow-y-auto space-y-3.5 pr-2 p-3 rounded-xl bg-[#090d16] border border-slate-800 text-[11px]">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
              <Scale className="w-3.5 h-3.5 text-indigo-400" />
              <span>1. Regulatory Status & Non-Advisory Nature</span>
            </div>
            <p className="text-slate-400">
              Neither TraderOS nor its operators, developers, or affiliates are registered with the
              Securities and Exchange Board of India (SEBI) as Investment Advisers (RIA) under the
              SEBI (Investment Advisers) Regulations, 2013, or as Research Analysts (RA) under the
              SEBI (Research Analysts) Regulations, 2014. No communication, output, AI commentary,
              or calculation provided by this application constitutes financial advice, investment
              recommendation, endorsement, or research report.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
              <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />
              <span>2. Absolute Absence of Liability for Trading P/L</span>
            </div>
            <p className="text-slate-400">
              Trading in financial markets—including Indian equities, index futures, options (F&O),
              commodities, and digital assets—entails inherent and substantial capital risk. You
              solely assume full, unshared responsibility for every order placed and every rupee
              gained or lost. TraderOS expressly disclaims any and all liability for direct, indirect,
              punitive, or consequential financial losses, drawdown, or lost profits arising out of your
              trading decisions.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>3. Purpose: Decision Support & Behavioral Accountability</span>
            </div>
            <p className="text-slate-400">
              TraderOS exists purely to help retail traders systematically record their own trades,
              identify behavioral leaks (such as revenge trading, FOMO, or sizing up after losses),
              and evaluate potential setups with mathematical risk parameters. All indicators,
              support/resistance levels, and multi-timeframe structures are decision aids and should
              never replace independent verification.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 font-semibold text-white mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>4. Free Tier & Zero-Cost Analysis Commitment</span>
            </div>
            <p className="text-slate-400">
              TraderOS utilizes standard, non-commercial free-tier AI heuristics and client-side
              analytical engines. No token purchases, paid credit meters, or recurring subscriptions
              are required from users to analyze charts, paste URLs, or maintain journal data.
            </p>
          </div>
        </div>

        {/* Checkbox Agreement */}
        <div className="pt-2">
          <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0c101a] border border-slate-800 hover:border-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="mt-0.5 rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4"
            />
            <span className="text-[11px] text-slate-200 leading-snug">
              I have read, understood, and solemnly acknowledge that TraderOS is an educational tool,
              is not SEBI-registered, and bears zero responsibility for my trading profits or losses.
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={!hasAgreed}
            onClick={onAccept}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-all"
          >
            I Accept & Agree • Enter Platform
          </button>
        </div>
      </div>
    </Modal>
  );
};
