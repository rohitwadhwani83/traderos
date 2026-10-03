import { describe, it, expect } from 'vitest';
import { generateIntradayAnalysis } from './intradayAnalysis';
import { MarketQuote, TechnicalIndicators, MultiTimeframeSummary } from '../marketData/types';

describe('Intraday Analysis Service', () => {
  const baseQuote: MarketQuote = {
    symbol: 'NIFTY',
    instrumentName: 'NIFTY 50 Index',
    assetClass: 'Indian Indices',
    price: 22500,
    change: 120,
    changePercent: 0.54,
    sessionHigh: 22550,
    sessionLow: 22420,
    open: 22440,
    previousClose: 22380,
    volume: 1500000,
    marketStatus: 'OPEN',
    dataQuality: 'LIVE',
    dataSource: 'NSE Live',
    timestamp: '11:30:00',
  };

  const baseTechnicals: TechnicalIndicators = {
    ema20: 22460,
    ema50: 22420,
    ema200: 22300,
    rsi14: 58.5,
    macd: { macdLine: 15, signalLine: 10, histogram: 5 },
    atr14: 80,
    vwap: 22470,
    supportLevels: [22420, 22350, 22280],
    resistanceLevels: [22560, 22620, 22700],
    pdh: 22520,
    pdl: 22380,
    trend: 'UPTREND',
    structure: 'HIGHER_HIGHS',
  };

  const bullishMtf: MultiTimeframeSummary = {
    tf5m: { bias: 'BULLISH', structure: 'Higher high sequence' },
    tf15m: { bias: 'BULLISH', structure: 'Bullish orderflow above 20 EMA' },
    tf1h: { bias: 'BULLISH', structure: 'Consolidating above 50 EMA' },
    tf4h: { bias: 'BULLISH', structure: 'Higher high sequence intact' },
    tfDaily: { bias: 'BULLISH', structure: 'Daily uptrend' },
    alignmentScore: 'STRONG ALIGNMENT',
  };

  it('generates BULLISH TRADE verdict when 15m and 5m are aligned bullish', () => {
    const analysis = generateIntradayAnalysis({
      quote: baseQuote,
      technicals: baseTechnicals,
      mtf: bullishMtf,
      capital: 100000,
    });

    expect(analysis.verdict).toBe('BULLISH TRADE');
    expect(analysis.verdictConfidence).toBe('HIGH PROBABILITY');
    expect(analysis.plan.bestPriceType).toBe('BEST BUYING PRICE');

    // 15% Risk and 30% / 45% Reward
    expect(analysis.plan.riskCapitalPercent).toBe(15);
    expect(analysis.plan.rewardTarget1Percent).toBe(30);
    expect(analysis.plan.rewardTarget2Percent).toBe(45);
    expect(analysis.plan.maxCapitalRiskAmount).toBe(15000); // 15% of 100,000
    expect(analysis.plan.potentialGainT1Amount).toBe(30000); // 30% of 100,000
    expect(analysis.plan.potentialGainT2Amount).toBe(45000); // 45% of 100,000

    // Exact RR ratios
    expect(analysis.plan.riskRewardRatioT1).toBe(2.0);
    expect(analysis.plan.riskRewardRatioT2).toBe(3.0);

    // Target calculation: Target 1 = Entry + 2 * StopDistance
    const stopDist = analysis.plan.entryPrice - analysis.plan.stopLoss;
    expect(analysis.plan.target1).toBe(Number((analysis.plan.entryPrice + stopDist * 2.0).toFixed(2)));
    expect(analysis.plan.target2).toBe(Number((analysis.plan.entryPrice + stopDist * 3.0).toFixed(2)));

    // Smart Money Concepts present
    expect(analysis.fvg.type).toContain('BULLISH');
    expect(analysis.liquiditySweep.type).toContain('SELL_SIDE');
    expect(analysis.trendline.type).toContain('ASCENDING');
  });

  it('generates BEARISH TRADE verdict when 15m is bearish', () => {
    const bearishQuote: MarketQuote = {
      ...baseQuote,
      price: 22350,
      change: -150,
      changePercent: -0.67,
    };
    const bearishMtf: MultiTimeframeSummary = {
      ...bullishMtf,
      tf15m: { bias: 'BEARISH', structure: 'Lower highs forming' },
      tf5m: { bias: 'BEARISH', structure: 'Breakdown below VWAP' },
      alignmentScore: 'PARTIAL ALIGNMENT',
    };

    const analysis = generateIntradayAnalysis({
      quote: bearishQuote,
      technicals: { ...baseTechnicals, vwap: 22420, ema20: 22400 },
      mtf: bearishMtf,
      capital: 200000,
    });

    expect(analysis.verdict).toBe('BEARISH TRADE');
    expect(analysis.plan.bestPriceType).toBe('BEST SELLING PRICE');
    expect(analysis.plan.maxCapitalRiskAmount).toBe(30000); // 15% of 200,000
    expect(analysis.plan.potentialGainT1Amount).toBe(60000); // 30% of 200,000
    expect(analysis.plan.potentialGainT2Amount).toBe(90000); // 45% of 200,000

    expect(analysis.fvg.type).toContain('BEARISH');
    expect(analysis.liquiditySweep.type).toContain('BUY_SIDE');
    expect(analysis.trendline.type).toContain('DESCENDING');
  });

  it('generates NO TRADE verdict when 15m and 5m are conflicting', () => {
    const conflictingMtf: MultiTimeframeSummary = {
      ...bullishMtf,
      tf15m: { bias: 'NEUTRAL', structure: 'Range bound' },
      tf5m: { bias: 'NEUTRAL', structure: 'Chop' },
      alignmentScore: 'NO CLEAR SETUP',
    };

    const analysis = generateIntradayAnalysis({
      quote: baseQuote,
      technicals: baseTechnicals,
      mtf: conflictingMtf,
      capital: 50000,
    });

    expect(analysis.verdict).toBe('NO TRADE');
    expect(analysis.verdictConfidence).toBe('NO TRADE / CHOP ZONE');
    expect(analysis.decisionRationale.some((r) => r.includes('Stay in cash'))).toBe(true);
  });

  it('calculates Stop Loss and Targets strictly as 15% risk and 30%/45% reward of capital deployed on micro-priced assets (0.078)', () => {
    const pennyQuote: MarketQuote = {
      ...baseQuote,
      symbol: 'MAGMA',
      price: 0.078,
    };

    const analysis = generateIntradayAnalysis({
      quote: pennyQuote,
      technicals: { ...baseTechnicals, atr14: 0.004, vwap: 0.077, ema20: 0.076 },
      mtf: bullishMtf,
      capital: 6000,
    });

    expect(analysis.verdict).toBe('BULLISH TRADE');
    expect(analysis.plan.entryPrice).toBe(0.078);

    // Stop Loss is strictly -15% of capital deployed: 0.078 * 0.85 = 0.0663
    expect(analysis.plan.stopLoss).toBe(0.0663);

    // Target 1 is strictly +30% of capital deployed: 0.078 * 1.30 = 0.1014
    expect(analysis.plan.target1).toBe(0.1014);

    // Target 2 is strictly +45% of capital deployed: 0.078 * 1.45 = 0.1131
    expect(analysis.plan.target2).toBe(0.1131);

    // Monetary amounts on 6000 deployed capital
    expect(analysis.plan.maxCapitalRiskAmount).toBe(900); // 15% of 6000
    expect(analysis.plan.potentialGainT1Amount).toBe(1800); // 30% of 6000
    expect(analysis.plan.potentialGainT2Amount).toBe(2700); // 45% of 6000
  });
});
