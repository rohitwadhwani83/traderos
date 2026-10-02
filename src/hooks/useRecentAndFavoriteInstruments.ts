import { useState, useEffect, useCallback } from 'react';
import {
  addRecentInstrument,
  toggleFavoriteInstrument,
  isFavoriteInstrument,
  removeRecentInstrument,
  DEFAULT_FAVORITE_INSTRUMENTS,
  DEFAULT_RECENT_INSTRUMENTS,
  MAX_RECENT_INSTRUMENTS,
} from '../utils/recentInstruments';

export const STORAGE_KEY_RECENTS = 'traderos_recent_instruments_v1';
export const STORAGE_KEY_FAVORITES = 'traderos_favorite_instruments_v1';

export function useRecentAndFavoriteInstruments() {
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_RECENTS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, MAX_RECENT_INSTRUMENTS);
          }
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_RECENT_INSTRUMENTS;
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(STORAGE_KEY_FAVORITES);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_FAVORITE_INSTRUMENTS;
  });

  // Persist recents to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(recents));
      }
    } catch (e) {
      console.warn('Failed to save recents to localStorage', e);
    }
  }, [recents]);

  // Persist favorites to localStorage
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favorites));
      }
    } catch (e) {
      console.warn('Failed to save favorites to localStorage', e);
    }
  }, [favorites]);

  const addRecent = useCallback((symbol: string) => {
    setRecents((prev) => addRecentInstrument(prev, symbol, MAX_RECENT_INSTRUMENTS));
  }, []);

  const toggleFavorite = useCallback((symbol: string) => {
    setFavorites((prev) => toggleFavoriteInstrument(prev, symbol));
  }, []);

  const isFavorite = useCallback(
    (symbol: string) => isFavoriteInstrument(favorites, symbol),
    [favorites]
  );

  const removeRecent = useCallback((symbol: string) => {
    setRecents((prev) => removeRecentInstrument(prev, symbol));
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
  }, []);

  return {
    recents,
    favorites,
    addRecent,
    toggleFavorite,
    isFavorite,
    removeRecent,
    clearRecents,
  };
}
