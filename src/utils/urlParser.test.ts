import { describe, it, expect } from 'vitest';
import { parseChartUrl } from './urlParser';

describe('Chart URL Parser', () => {
  it('parses TradingView symbol query parameter correctly', () => {
    const result = parseChartUrl('https://www.tradingview.com/chart/?symbol=NSE:NIFTY');
    expect(result.isValid).toBe(true);
    expect(result.provider).toBe('TradingView');
    expect(result.symbol).toBe('NIFTY');
    expect(result.exchange).toBe('NSE');
    expect(result.normalizedInstrument).toBe('NIFTY 50');
    expect(result.assetClass).toBe('Indian Indices');
  });

  it('parses TradingView symbols path correctly', () => {
    const result = parseChartUrl('https://www.tradingview.com/symbols/BTCUSDT/');
    expect(result.isValid).toBe(true);
    expect(result.symbol).toBe('BTCUSDT');
    expect(result.assetClass).toBe('Crypto');
  });

  it('handles invalid or generic chart URLs with clear fallback message', () => {
    const result = parseChartUrl('https://charts.example.com/unsupported');
    expect(result.isValid).toBe(false);
    expect(result.requiresFallback).toBe(true);
    expect(result.message).toContain('symbol could not be identified automatically');
  });

  it('parses Binance trade URLs correctly', () => {
    const result = parseChartUrl('https://www.binance.com/en/trade/ALICE_USDT');
    expect(result.isValid).toBe(true);
    expect(result.provider).toBe('Binance');
    expect(result.symbol).toBe('ALICEUSDT');
    expect(result.assetClass).toBe('Crypto');
  });

  it('parses TradingView snapshot URLs correctly', () => {
    const result = parseChartUrl('https://www.tradingview.com/x/abcd1234/');
    expect(result.isValid).toBe(true);
    expect(result.isSnapshot).toBe(true);
    expect(result.snapshotUrl).toContain('snapshots');
  });

  it('parses TradingView snapshot with explicit symbol parameter correctly', () => {
    const result = parseChartUrl('https://www.tradingview.com/x/e0CIWLuq/?symbol=BINANCE:MAGMAUSDT');
    expect(result.isValid).toBe(true);
    expect(result.isSnapshot).toBe(true);
    expect(result.symbol).toBe('MAGMAUSDT');
  });

  it('handles empty string gracefully', () => {
    const result = parseChartUrl('');
    expect(result.isValid).toBe(false);
    expect(result.requiresFallback).toBe(true);
  });
});
