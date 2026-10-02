import React from 'react';
import { Star, Clock, Sparkles, X, Plus } from 'lucide-react';

interface QuickInstrumentChipsProps {
  currentSymbol: string;
  recents: string[];
  favorites: string[];
  onSelect: (symbol: string) => void;
  onToggleFavorite: (symbol: string) => void;
  onRemoveRecent: (symbol: string) => void;
  isFavorite: (symbol: string) => boolean;
}

export const QuickInstrumentChips: React.FC<QuickInstrumentChipsProps> = ({
  currentSymbol,
  recents,
  favorites,
  onSelect,
  onToggleFavorite,
  onRemoveRecent,
  isFavorite,
}) => {
  const normCurrent = currentSymbol.trim().toUpperCase();

  return (
    <div className="space-y-2.5 rounded-xl bg-[#090d16]/90 border border-slate-800/90 p-3">
      {/* 1. FAVORITES BAR (TradingView Style) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 mr-1 select-none">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>Favourites:</span>
        </div>

        {favorites.length === 0 ? (
          <span className="text-[11px] text-slate-500 italic">
            Star any script to pin it to your quick-access favourites bar.
          </span>
        ) : (
          favorites.map((sym) => {
            const isSelected = normCurrent === sym;
            return (
              <div
                key={`fav-${sym}`}
                className={`inline-flex items-center rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 shadow-sm'
                    : 'bg-[#141b2a] border-slate-700/80 text-slate-200 hover:border-slate-600 hover:text-white'
                }`}
              >
                {/* Star icon toggle */}
                <button
                  type="button"
                  title="Remove from favourites"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(sym);
                  }}
                  className="px-1.5 py-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                </button>

                {/* Symbol button - click to select & analyze */}
                <button
                  type="button"
                  onClick={() => onSelect(sym)}
                  className="pr-2.5 py-1 font-mono tracking-tight hover:underline"
                >
                  {sym}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* 2. RECENT / LAST USED BAR (Real-time last 5) */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1 border-t border-slate-800/60">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400 mr-1 select-none">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>Last Used (5):</span>
        </div>

        {recents.length === 0 ? (
          <span className="text-[11px] text-slate-500 italic">
            No recently inspected scripts yet.
          </span>
        ) : (
          recents.map((sym) => {
            const isSelected = normCurrent === sym;
            const fav = isFavorite(sym);

            return (
              <div
                key={`recent-${sym}`}
                className={`group inline-flex items-center rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-indigo-600/25 border-indigo-500 text-indigo-300 shadow-sm'
                    : 'bg-[#121824] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
                }`}
              >
                {/* Star toggle button (TradingView style) */}
                <button
                  type="button"
                  title={fav ? 'Favorited' : 'Click to add to favourites'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(sym);
                  }}
                  className="px-1.5 py-1 text-slate-500 hover:text-amber-400 transition-colors"
                >
                  <Star
                    className={`w-3 h-3 ${
                      fav ? 'fill-amber-400 text-amber-400' : 'text-slate-500 group-hover:text-slate-400'
                    }`}
                  />
                </button>

                {/* Symbol click to analyze */}
                <button
                  type="button"
                  onClick={() => onSelect(sym)}
                  className="px-1.5 py-1 font-mono tracking-tight hover:underline flex items-center gap-1"
                >
                  <span>{sym}</span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>

                {/* Quick dismiss from recents */}
                <button
                  type="button"
                  title="Remove from recents"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveRecent(sym);
                  }}
                  className="pr-1.5 pl-0.5 py-1 text-slate-600 hover:text-rose-400 opacity-60 hover:opacity-100 transition-all"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
