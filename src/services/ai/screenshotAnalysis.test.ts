import { describe, it, expect } from 'vitest';
import { analyzeChartScreenshot } from './screenshotAnalysis';

describe('Screenshot Analysis Service', () => {
  it('accepts and analyses a TradingView snapshot image URL', async () => {
    const result = await analyzeChartScreenshot({
      imageFileOrDataUrl: 'https://s3.tradingview.com/snapshots/n/n1NmKXVv.png',
      userSpecifiedInstrument: 'GTCUSDT',
      userSpecifiedTimeframe: '15m',
    });

    expect(result).toBeDefined();
    expect(result.dataQuality).toBe('SCREENSHOT');
    expect(result.screenshotUrl).toBe('https://s3.tradingview.com/snapshots/n/n1NmKXVv.png');
    expect(result.instrument).toContain('GTC');
    expect(result.currentPrice).toBeGreaterThan(0);
    expect(result.entryZone.min).toBeGreaterThan(0);
  });

  it('rejects empty or very short invalid image strings', async () => {
    await expect(
      analyzeChartScreenshot({
        imageFileOrDataUrl: '',
        userSpecifiedInstrument: 'NIFTY',
      })
    ).rejects.toThrow('Invalid image data');

    await expect(
      analyzeChartScreenshot({
        imageFileOrDataUrl: 'data:too_short',
        userSpecifiedInstrument: 'NIFTY',
      })
    ).rejects.toThrow('Invalid image data');
  });
});
