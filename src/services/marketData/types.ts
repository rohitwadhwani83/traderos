import { AssetClass, MarketStatusType, DataQualityType, SetupBias } from '../../types';

export interface MarketQuote {
  symbol: string;
  instrumentName: string;
  assetClass: AssetClass;
  price: number;
  change: number;
  changePercent: number;
  sessionHigh: number;
  sessionLow: number;
  open: number;
  previousClose: number;
  volume: number;
  marketStatus: MarketStatusType;
  dataQuality: DataQualityType;
  dataSource: string;
  timestamp: string;
}

export interface Candle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  macd: { macdLine: number; signalLine: number; histogram: number };
  atr14: number;
  vwap?: number;
  supportLevels: number[];
  resistanceLevels: number[];
  pdh: number; // Previous Day High
  pdl: number; // Previous Day Low
  trend: 'UPTREND' | 'DOWNTREND' | 'SIDEWAYS';
  structure: 'HIGHER_HIGHS' | 'LOWER_LOWS' | 'RANGE_BOUND';
}

export interface MultiTimeframeSummary {
  tf5m: { bias: SetupBias; structure: string };
  tf15m: { bias: SetupBias; structure: string };
  tf1h: { bias: SetupBias; structure: string };
  tf4h: { bias: SetupBias; structure: string };
  tfDaily: { bias: SetupBias; structure: string };
  alignmentScore: 'STRONG ALIGNMENT' | 'PARTIAL ALIGNMENT' | 'MIXED' | 'NO CLEAR SETUP';
}

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<MarketQuote>;
  getHistoricalCandles(symbol: string, timeframe: string, count?: number): Promise<Candle[]>;
  getTechnicalData(symbol: string): Promise<TechnicalIndicators>;
  getMultiTimeframeData(symbol: string): Promise<MultiTimeframeSummary>;
  getMarketStatus(assetClass: AssetClass): MarketStatusType;
}
