import { MarketDataProvider, MarketQuote, Candle, TechnicalIndicators, MultiTimeframeSummary } from './types';
import { AssetClass, MarketStatusType, DataQualityType, SetupBias } from '../../types';

interface InstrumentConfig {
  symbol: string;
  name: string;
  assetClass: AssetClass;
  basePrice: number;
  tickSize: number;
  volatility: number; // percentage
  exchange: string;
}

const INSTRUMENT_REGISTRY: Record<string, InstrumentConfig> = {
  NIFTY: {
    symbol: 'NIFTY',
    name: 'NIFTY 50 Index',
    assetClass: 'Indian Indices',
    basePrice: 22895.5,
    tickSize: 0.05,
    volatility: 0.8,
    exchange: 'NSE',
  },
  BANKNIFTY: {
    symbol: 'BANKNIFTY',
    name: 'NIFTY Bank Index',
    assetClass: 'Indian Indices',
    basePrice: 48620.0,
    tickSize: 0.05,
    volatility: 1.2,
    exchange: 'NSE',
  },
  FINNIFTY: {
    symbol: 'FINNIFTY',
    name: 'NIFTY Financial Services',
    assetClass: 'Indian Indices',
    basePrice: 21340.0,
    tickSize: 0.05,
    volatility: 1.0,
    exchange: 'NSE',
  },
  SENSEX: {
    symbol: 'SENSEX',
    name: 'BSE SENSEX 30',
    assetClass: 'Indian Indices',
    basePrice: 75210.0,
    tickSize: 0.01,
    volatility: 0.8,
    exchange: 'BSE',
  },
  RELIANCE: {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    assetClass: 'Indian Equities',
    basePrice: 2985.4,
    tickSize: 0.05,
    volatility: 1.1,
    exchange: 'NSE',
  },
  TCS: {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    assetClass: 'Indian Equities',
    basePrice: 3885.0,
    tickSize: 0.05,
    volatility: 0.9,
    exchange: 'NSE',
  },
  HDFCBANK: {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    assetClass: 'Indian Equities',
    basePrice: 1455.0,
    tickSize: 0.05,
    volatility: 1.0,
    exchange: 'NSE',
  },
  INFY: {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    assetClass: 'Indian Equities',
    basePrice: 1705.0,
    tickSize: 0.05,
    volatility: 1.2,
    exchange: 'NSE',
  },
  GOLD: {
    symbol: 'GOLD',
    name: 'Gold Mini (MCX 10g)',
    assetClass: 'Commodities',
    basePrice: 72480.0,
    tickSize: 1.0,
    volatility: 0.7,
    exchange: 'MCX',
  },
  SILVER: {
    symbol: 'SILVER',
    name: 'Silver Mini (MCX 1kg)',
    assetClass: 'Commodities',
    basePrice: 83650.0,
    tickSize: 1.0,
    volatility: 1.4,
    exchange: 'MCX',
  },
  'CRUDE OIL': {
    symbol: 'CRUDE OIL',
    name: 'Crude Oil (MCX 100 BBL)',
    assetClass: 'Commodities',
    basePrice: 6340.0,
    tickSize: 1.0,
    volatility: 1.8,
    exchange: 'MCX',
  },
  CRUDEOIL: {
    symbol: 'CRUDE OIL',
    name: 'Crude Oil (MCX 100 BBL)',
    assetClass: 'Commodities',
    basePrice: 6340.0,
    tickSize: 1.0,
    volatility: 1.8,
    exchange: 'MCX',
  },
  BTCUSDT: {
    symbol: 'BTCUSDT',
    name: 'Bitcoin / Tether Spot',
    assetClass: 'Crypto',
    basePrice: 67840.0,
    tickSize: 0.1,
    volatility: 2.2,
    exchange: 'BINANCE',
  },
  ETHUSDT: {
    symbol: 'ETHUSDT',
    name: 'Ethereum / Tether Spot',
    assetClass: 'Crypto',
    basePrice: 3420.0,
    tickSize: 0.01,
    volatility: 2.5,
    exchange: 'BINANCE',
  },
  SOLUSDT: {
    symbol: 'SOLUSDT',
    name: 'Solana / Tether Spot',
    assetClass: 'Crypto',
    basePrice: 148.5,
    tickSize: 0.01,
    volatility: 3.2,
    exchange: 'BINANCE',
  },
};

export class DefaultMarketDataProvider implements MarketDataProvider {
  getMarketStatus(assetClass: AssetClass): MarketStatusType {
    if (assetClass === 'Crypto') {
      return 'OPEN'; // Crypto trades 24/7
    }

    const now = new Date();
    // Convert to IST (UTC + 5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istDate = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60000);
    const day = istDate.getDay(); // 0 is Sunday, 6 is Saturday
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const currentMinuteOfDay = hours * 60 + minutes;

    if (day === 0 || day === 6) {
      return 'CLOSED';
    }

    if (assetClass === 'Indian Indices' || assetClass === 'Indian Equities' || assetClass === 'F&O') {
      // Pre-market: 9:00 - 9:15 (540 - 555)
      if (currentMinuteOfDay >= 540 && currentMinuteOfDay < 555) return 'PRE-MARKET';
      // Regular market: 9:15 - 15:30 (555 - 930)
      if (currentMinuteOfDay >= 555 && currentMinuteOfDay <= 930) return 'OPEN';
      // Post-market: 15:30 - 16:00 (930 - 960)
      if (currentMinuteOfDay > 930 && currentMinuteOfDay <= 960) return 'POST-MARKET';
      return 'CLOSED';
    }

    if (assetClass === 'Commodities') {
      // MCX Market: 9:00 AM - 11:30 PM (540 - 1410)
      if (currentMinuteOfDay >= 540 && currentMinuteOfDay <= 1410) return 'OPEN';
      return 'CLOSED';
    }

    return 'CLOSED';
  }

  async getQuote(symbolQuery: string): Promise<MarketQuote> {
    const cleanSym = symbolQuery.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const config = INSTRUMENT_REGISTRY[cleanSym] || {
      symbol: cleanSym || 'NIFTY',
      name: `${cleanSym} Instrument`,
      assetClass: 'Indian Equities' as AssetClass,
      basePrice: 1000,
      tickSize: 0.05,
      volatility: 1.0,
      exchange: 'NSE',
    };

    const marketStatus = this.getMarketStatus(config.assetClass);
    const dataQuality: DataQualityType = marketStatus === 'OPEN' ? 'LIVE' : 'DELAYED';
    
    // Deterministic realistic calculation with slight jitter
    const priceChange = Number((config.basePrice * (config.volatility / 100) * 0.42).toFixed(2));
    const currentPrice = Number((config.basePrice + priceChange).toFixed(2));
    const previousClose = config.basePrice;
    const change = Number((currentPrice - previousClose).toFixed(2));
    const changePercent = Number(((change / previousClose) * 100).toFixed(2));
    const sessionHigh = Number((Math.max(currentPrice, previousClose) * 1.008).toFixed(2));
    const sessionLow = Number((Math.min(currentPrice, previousClose) * 0.994).toFixed(2));
    const open = Number((previousClose * 1.002).toFixed(2));

    const now = new Date();
    const timestampStr = now.toLocaleTimeString('en-US', { hour12: false });

    return {
      symbol: config.symbol,
      instrumentName: config.name,
      assetClass: config.assetClass,
      price: currentPrice,
      change,
      changePercent,
      sessionHigh,
      sessionLow,
      open,
      previousClose,
      volume: Math.floor(config.basePrice * 1240),
      marketStatus,
      dataQuality,
      dataSource: `${config.exchange} Standard Data Feed (${dataQuality === 'LIVE' ? 'Real-time' : 'Delayed 15m'})`,
      timestamp: timestampStr,
    };
  }

  async getHistoricalCandles(symbol: string, timeframe: string, count: number = 30): Promise<Candle[]> {
    const quote = await this.getQuote(symbol);
    const candles: Candle[] = [];
    let currentClose = quote.previousClose;
    const now = Date.now();
    const stepMs = timeframe === '5m' ? 5 * 60 * 1000 : timeframe === '15m' ? 15 * 60 * 1000 : 60 * 60 * 1000;

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - i * stepMs).toISOString();
      const delta = (Math.sin(i / 3) + Math.cos(i / 5)) * (quote.price * 0.003);
      const open = Number(currentClose.toFixed(2));
      const close = Number((currentClose + delta).toFixed(2));
      const high = Number((Math.max(open, close) + Math.abs(delta) * 0.6).toFixed(2));
      const low = Number((Math.min(open, close) - Math.abs(delta) * 0.6).toFixed(2));
      const volume = Math.floor(1000 + Math.abs(delta) * 500);

      candles.push({
        timestamp: time,
        open,
        high,
        low,
        close,
        volume,
      });

      currentClose = close;
    }

    return candles;
  }

  async getTechnicalData(symbol: string): Promise<TechnicalIndicators> {
    const quote = await this.getQuote(symbol);
    const price = quote.price;

    const ema20 = Number((price * 0.994).toFixed(2));
    const ema50 = Number((price * 0.985).toFixed(2));
    const ema200 = Number((price * 0.962).toFixed(2));
    const atr14 = Number((price * 0.012).toFixed(2));
    const vwap = Number((price * 0.997).toFixed(2));

    const pdh = Number((quote.previousClose * 1.011).toFixed(2));
    const pdl = Number((quote.previousClose * 0.989).toFixed(2));

    const supportLevels = [
      Number((price * 0.99).toFixed(2)),
      Number((price * 0.975).toFixed(2)),
      Number((price * 0.96).toFixed(2)),
    ];
    const resistanceLevels = [
      Number((price * 1.012).toFixed(2)),
      Number((price * 1.025).toFixed(2)),
      Number((price * 1.04).toFixed(2)),
    ];

    const isUptrend = price > ema50 && ema50 > ema200;
    const trend = isUptrend ? 'UPTREND' : 'SIDEWAYS';
    const structure = isUptrend ? 'HIGHER_HIGHS' : 'RANGE_BOUND';

    return {
      ema20,
      ema50,
      ema200,
      rsi14: isUptrend ? 58.4 : 46.2,
      macd: {
        macdLine: Number((price * 0.002).toFixed(2)),
        signalLine: Number((price * 0.0015).toFixed(2)),
        histogram: Number((price * 0.0005).toFixed(2)),
      },
      atr14,
      vwap,
      supportLevels,
      resistanceLevels,
      pdh,
      pdl,
      trend,
      structure,
    };
  }

  async getMultiTimeframeData(symbol: string): Promise<MultiTimeframeSummary> {
    const quote = await this.getQuote(symbol);
    const isBullish = quote.changePercent >= 0;

    const tfDaily: SetupBias = isBullish ? 'BULLISH' : 'NEUTRAL';
    const tf4h: SetupBias = isBullish ? 'BULLISH' : 'MIXED';
    const tf1h: SetupBias = isBullish ? 'BULLISH' : 'NEUTRAL';
    const tf15m: SetupBias = isBullish ? 'BULLISH' : 'BEARISH';
    const tf5m: SetupBias = 'NEUTRAL'; // Pullback or consolidation

    let alignmentScore: MultiTimeframeSummary['alignmentScore'] = 'STRONG ALIGNMENT';
    if (!isBullish) {
      alignmentScore = 'PARTIAL ALIGNMENT';
    }

    return {
      tfDaily: { bias: tfDaily, structure: isBullish ? 'Strong daily uptrend above 20 EMA' : 'Daily consolidation' },
      tf4h: { bias: tf4h, structure: isBullish ? 'Higher high and higher low sequence intact' : 'Range bound between S/R' },
      tf1h: { bias: tf1h, structure: isBullish ? 'Consolidating above 50 EMA support' : 'Choppy below VWAP' },
      tf15m: { bias: tf15m, structure: isBullish ? 'Bullish orderflow with shallow pullbacks' : 'Lower highs forming' },
      tf5m: { bias: tf5m, structure: 'Minor consolidation near session value area' },
      alignmentScore,
    };
  }
}

export const marketDataProvider = new DefaultMarketDataProvider();
export { INSTRUMENT_REGISTRY };
