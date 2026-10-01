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
    expect(result.message).toContain('does not provide direct market data');
  });

  it('handles empty string gracefully', () => {
    const result = parseChartUrl('');
    expect(result.isValid).toBe(false);
    expect(result.requiresFallback).toBe(true);
  });
});
