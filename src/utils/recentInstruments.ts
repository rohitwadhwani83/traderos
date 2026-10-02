/**
 * Pure helper functions for managing Recent (Last 5) and Favorite trading scripts
 */

export const MAX_RECENT_INSTRUMENTS = 5;

export const DEFAULT_FAVORITE_INSTRUMENTS = ['NIFTY', 'ALICE USDT', 'BTCUSDT'];
export const DEFAULT_RECENT_INSTRUMENTS = ['NIFTY', 'BANKNIFTY', 'ALICE USDT'];

/**
 * Normalizes an instrument symbol (trims whitespace, converts to uppercase)
 */
export function normalizeSymbol(symbol: string): string {
  if (!symbol) return '';
  return symbol.trim().toUpperCase().replace(/\s+/g, ' ');
}

/**
 * Adds an instrument to the front of recent list, removes duplicate, and caps to maxItems (default 5).
 */
export function addRecentInstrument(
  currentRecents: string[],
  newSymbol: string,
  maxItems = MAX_RECENT_INSTRUMENTS
): string[] {
  const clean = normalizeSymbol(newSymbol);
  if (!clean) return currentRecents;

  const filtered = currentRecents.filter((s) => normalizeSymbol(s) !== clean);
  return [clean, ...filtered].slice(0, maxItems);
}

/**
 * Toggles an instrument in or out of favorites list.
 */
export function toggleFavoriteInstrument(
  currentFavorites: string[],
  symbolToToggle: string
): string[] {
  const clean = normalizeSymbol(symbolToToggle);
  if (!clean) return currentFavorites;

  if (currentFavorites.some((s) => normalizeSymbol(s) === clean)) {
    return currentFavorites.filter((s) => normalizeSymbol(s) !== clean);
  } else {
    return [...currentFavorites, clean];
  }
}

/**
 * Checks whether an instrument is in the favorites list.
 */
export function isFavoriteInstrument(
  favorites: string[],
  symbol: string
): boolean {
  const clean = normalizeSymbol(symbol);
  if (!clean) return false;
  return favorites.some((s) => normalizeSymbol(s) === clean);
}

/**
 * Removes a specific instrument from recents list.
 */
export function removeRecentInstrument(
  currentRecents: string[],
  symbolToRemove: string
): string[] {
  const clean = normalizeSymbol(symbolToRemove);
  return currentRecents.filter((s) => normalizeSymbol(s) !== clean);
}
