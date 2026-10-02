import { describe, it, expect } from 'vitest';
import { marketDataProvider } from './provider';

describe('MarketDataProvider with Crypto Support', () => {
  it('should retrieve a quote for ALICE USDT with crypto asset class and positive price', async () => {
    const quote = await marketDataProvider.getQuote('ALICE USDT');
    expect(quote.symbol).toBe('ALICEUSDT');
    expect(quote.assetClass).toBe('Crypto');
    expect(quote.price).toBeGreaterThan(0);
    expect(quote.marketStatus).toBe('OPEN');
  });

  it('should retrieve technical data with proper precision for small prices', async () => {
    const technicals = await marketDataProvider.getTechnicalData('ALICE USDT');
    expect(technicals.supportLevels.length).toBe(3);
    expect(technicals.resistanceLevels.length).toBe(3);
    expect(technicals.atr14).toBeGreaterThan(0);
    // Support levels should not all be zero or identical
    expect(technicals.supportLevels[0]).toBeGreaterThan(technicals.supportLevels[2]);
  });

  it('should retrieve a live quote for MAGMA / MAGMAUSDT from Binance Futures', async () => {
    const quote = await marketDataProvider.getQuote('MAGMA USDT');
    expect(quote.symbol).toContain('MAGMA');
    expect(quote.price).toBeGreaterThan(0.1);
    expect(quote.assetClass).toBe('Crypto');
  });
});
