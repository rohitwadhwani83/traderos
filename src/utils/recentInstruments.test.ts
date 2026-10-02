import { describe, it, expect } from 'vitest';
import {
  addRecentInstrument,
  toggleFavoriteInstrument,
  isFavoriteInstrument,
  removeRecentInstrument,
  normalizeSymbol,
} from './recentInstruments';

describe('Recent & Favorite Instruments Utility', () => {
  it('normalizes symbols properly', () => {
    expect(normalizeSymbol(' alice usdt ')).toBe('ALICE USDT');
    expect(normalizeSymbol('btcUsdt')).toBe('BTCUSDT');
    expect(normalizeSymbol('')).toBe('');
  });

  it('adds a new instrument to the front of recents', () => {
    const initial = ['NIFTY', 'BANKNIFTY'];
    const updated = addRecentInstrument(initial, 'ALICE USDT');
    expect(updated).toEqual(['ALICE USDT', 'NIFTY', 'BANKNIFTY']);
  });

  it('moves existing instrument to front if already in recents without duplicating', () => {
    const initial = ['NIFTY', 'ALICE USDT', 'BTCUSDT'];
    const updated = addRecentInstrument(initial, 'ALICE USDT');
    expect(updated).toEqual(['ALICE USDT', 'NIFTY', 'BTCUSDT']);
  });

  it('caps recents to exactly 5 scripts (last 5 used)', () => {
    let list: string[] = [];
    list = addRecentInstrument(list, 'NIFTY');
    list = addRecentInstrument(list, 'BANKNIFTY');
    list = addRecentInstrument(list, 'ALICE USDT');
    list = addRecentInstrument(list, 'BTCUSDT');
    list = addRecentInstrument(list, 'ETHUSDT');
    expect(list).toHaveLength(5);
    expect(list[0]).toBe('ETHUSDT');

    // Adding 6th item should push out the oldest ('NIFTY')
    list = addRecentInstrument(list, 'SOLUSDT');
    expect(list).toHaveLength(5);
    expect(list).toEqual(['SOLUSDT', 'ETHUSDT', 'BTCUSDT', 'ALICE USDT', 'BANKNIFTY']);
    expect(list).not.toContain('NIFTY');
  });

  it('toggles favorites on and off (TradingView style)', () => {
    let favorites = ['NIFTY', 'ALICE USDT'];

    // Add BTCUSDT
    favorites = toggleFavoriteInstrument(favorites, 'BTCUSDT');
    expect(favorites).toContain('BTCUSDT');
    expect(isFavoriteInstrument(favorites, 'BTCUSDT')).toBe(true);

    // Remove ALICE USDT
    favorites = toggleFavoriteInstrument(favorites, 'ALICE USDT');
    expect(favorites).not.toContain('ALICE USDT');
    expect(isFavoriteInstrument(favorites, 'ALICE USDT')).toBe(false);

    // Case-insensitive toggle
    favorites = toggleFavoriteInstrument(favorites, 'nifty');
    expect(favorites).not.toContain('NIFTY');
  });

  it('removes instrument from recents correctly', () => {
    const initial = ['ALICE USDT', 'BTCUSDT', 'ETHUSDT'];
    const updated = removeRecentInstrument(initial, 'BTCUSDT');
    expect(updated).toEqual(['ALICE USDT', 'ETHUSDT']);
  });
});
