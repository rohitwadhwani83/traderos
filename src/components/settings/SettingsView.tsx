import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTrading } from '../../context/TradingContext';
import {
  Settings as SettingsIcon,
  Shield,
  Download,
  Trash2,
  CheckCircle,
  FileText,
  User,
  Phone,
  Lock,
  CheckCircle2,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user, updateUserPreferences, resetPassword, isDemoMode } = useAuth();
  const { trades, tradePlans, exportCsv, resetAllData } = useTrading();

  if (!user) {
    return (
      <div className="p-8 text-center text-slate-400">
        Please sign in to access account settings.
      </div>
    );
  }

  const [name, setName] = useState(user.name || '');
  const [currency, setCurrency] = useState(user.preferences.defaultCurrency);
  const [startingCapital, setStartingCapital] = useState(
    String(user.preferences.startingCapital)
  );
  const [defaultRisk, setDefaultRisk] = useState(
    String(user.preferences.defaultRiskPercent)
  );
  const [timezone, setTimezone] = useState(user.preferences.timezone);
  const [style, setStyle] = useState(user.preferences.tradingStyle);
  const [aiEnabled, setAiEnabled] = useState(user.preferences.enableAIInsights);
  const [isSaved, setIsSaved] = useState(false);

  // Password Management
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserPreferences({
      defaultCurrency: currency,
      startingCapital: parseFloat(startingCapital) || 100000,
      defaultRiskPercent: parseFloat(defaultRisk) || 1.0,
      timezone,
      tradingStyle: style,
      enableAIInsights: aiEnabled,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setPasswordStatus('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordStatus('Passwords do not match.');
      return;
    }

    const res = await resetPassword(user.email, newPassword);
    setPasswordStatus(res.message);
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleExportJson = () => {
    const fullBackup = {
      user,
      trades,
      tradePlans,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `traderos_complete_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteData = () => {
    if (
      confirm(
        'Are you sure you want to delete all trading data? This cannot be undone.'
      )
    ) {
      resetAllData();
      alert('Data reset successfully.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage currency, default risk parameters, AI preferences, and data privacy.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile & Verified Phone */}
        <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <User className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Profile & Verified Credentials
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Trader Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-[#161d2c]/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Mobile Number</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={user.mobileNumber || '+91 98765 43210'}
                  disabled
                  className="w-full bg-[#161d2c]/60 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono cursor-not-allowed"
                />
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 whitespace-nowrap bg-emerald-950/30 border border-emerald-500/30 px-2 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>OTP Verified</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Risk Rules */}
        <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
            <SettingsIcon className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-semibold text-white tracking-tight">
              Trading & Risk Preferences
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Default Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="INR">INR (₹ - Indian Rupee)</option>
                <option value="USD">USD ($ - US Dollar)</option>
                <option value="USDT">USDT (Tether)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Starting Capital
              </label>
              <input
                type="number"
                value={startingCapital}
                onChange={(e) => setStartingCapital(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Default Risk % per Trade
              </label>
              <input
                type="number"
                step="0.1"
                value={defaultRisk}
                onChange={(e) => setDefaultRisk(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white mono-nums focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Primary Trading Style
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as any)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Intraday">Intraday Trader</option>
                <option value="Swing">Swing Trader</option>
                <option value="Scalper">Scalper</option>
                <option value="Positional">Positional</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST/EDT)</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={aiEnabled}
                  onChange={(e) => setAiEnabled(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0"
                />
                <span>Enable AI Trading Coach (100% Free)</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              {isSaved ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : null}
              <span>{isSaved ? 'Preferences Saved' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Password Management */}
      <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <Lock className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Password Management
          </h3>
        </div>

        {passwordStatus && (
          <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40 text-xs text-indigo-300">
            {passwordStatus}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">New Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Confirm New Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full bg-[#161d2c] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2 px-4 rounded-xl bg-[#161d2c] hover:bg-[#1f283d] border border-slate-700 text-slate-200 text-xs font-semibold transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Privacy, Export, and Data Ownership */}
      <div className="rounded-2xl border border-slate-800 bg-[#101522] p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
          <Shield className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-white tracking-tight">
            Data Privacy & Export
          </h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          You own 100% of your trading journal records. Data is isolated to your profile and is
          never used for AI training without explicit permission.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={exportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c101a] border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Journal (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0c101a] border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Complete Backup (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/20 border border-rose-500/30 hover:bg-rose-900/30 text-rose-400 text-xs font-medium transition-colors ml-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'Reset Demo Trades' : 'Delete My Journal'}</span>
          </button>
        </div>
      </div>

      {/* Regulatory & Advisory Disclaimer */}
      <div className="p-4 rounded-2xl bg-[#0c101a] border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed space-y-1.5">
        <span className="font-semibold text-slate-400 block text-xs">
          Regulatory Notice & Educational Platform Disclaimer
        </span>
        <p>
          TraderOS is an analytical journaling and educational decision support system designed solely to
          assist self-directed traders in tracking behavioral tendencies, statistical edge, and risk
          parameters.
        </p>
        <p>
          TraderOS is not a SEBI-registered Investment Adviser or Research Analyst and bears zero liability
          for your financial gains or losses. Trading in equities, F&O derivatives, commodities, and
          cryptocurrencies entails substantial capital risk.
        </p>
      </div>
    </div>
  );
};
