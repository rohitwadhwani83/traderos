import React from 'react';
import { Plus, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { marketDataProvider } from '../../services/marketData/provider';

interface NavbarProps {
  onOpenAddTrade: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddTrade, onOpenAuth }) => {
  const { user, currentUser, isDemoMode, setDemoMode, logout } = useAuth();
  const nseStatus = marketDataProvider.getMarketStatus('Indian Indices');

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-6 py-2.5 flex items-center justify-between">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block"></span>
            TraderOS
          </span>
          <span className="hidden md:inline-block text-[11px] text-slate-400 font-normal">
            Your Trading Intelligence Layer
          </span>
        </div>

        {/* Live Market Status Pill */}
        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                nseStatus === 'OPEN'
                  ? 'bg-emerald-400 animate-pulse'
                  : nseStatus === 'PRE-MARKET'
                  ? 'bg-amber-400'
                  : 'bg-slate-500'
              }`}
            />
            <span className="text-slate-400">NSE:</span>
            <span className="font-medium text-slate-200">{nseStatus}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-400">CRYPTO:</span>
            <span className="font-medium text-emerald-400">24/7 LIVE</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Demo Mode Toggle */}
        <div className="flex items-center bg-[#101522] border border-slate-800 rounded-lg p-0.5 text-xs">
          <button
            onClick={() => setDemoMode(true)}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demo Mode
          </button>
          <button
            onClick={() => setDemoMode(false)}
            className={`px-2.5 py-1 rounded-md transition-all font-medium ${
              !isDemoMode
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Data
          </button>
        </div>

        {/* Add Trade Fast Action */}
        <button
          onClick={onOpenAddTrade}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs sm:text-sm px-3 sm:px-3.5 py-1.5 rounded-lg shadow-sm transition-colors active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </button>

        {/* User Account / Profile */}
        <button
          onClick={onOpenAuth}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#121826] border border-slate-800 hover:border-slate-700 text-slate-300 text-xs transition-colors"
          title="Click to view Trader Profile"
        >
          <div className="w-5 h-5 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300">
            {currentUser?.name ? currentUser.name[0].toUpperCase() : 'U'}
          </div>
          <span className="hidden md:inline font-medium">
            {currentUser ? currentUser.name : 'Sign In'}
          </span>
        </button>

        {/* Logout Button */}
        {currentUser && (
          <button
            onClick={logout}
            title="Log Out"
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-300 text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        )}
      </div>
    </header>
  );
};
