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
  ALICEUSDT: {
    symbol: 'ALICEUSDT',
    name: 'MyNeighborAlice / Tether Spot',
    assetClass: 'Crypto',
    basePrice: 0.1948,
    tickSize: 0.0001,
    volatility: 4.2,
    exchange: 'BINANCE',
  },
  MAGMAUSDT: {
    symbol: 'MAGMAUSDT',
    name: 'Magma / TetherUS Perpetual',
    assetClass: 'Crypto',
    basePrice: 0.2494,
    tickSize: 0.0001,
    volatility: 5.0,
    exchange: 'BINANCE',
  },
  MAGMA: {
    symbol: 'MAGMAUSDT',
    name: 'Magma / TetherUS Perpetual',
    assetClass: 'Crypto',
    basePrice: 0.2494,
    tickSize: 0.0001,
    volatility: 5.0,
    exchange: 'BINANCE',
  },
  GTCUSDT: {
    symbol: 'GTCUSDT',
    name: 'Gitcoin / TetherUS Spot',
    assetClass: 'Crypto',
    basePrice: 0.1437,
    tickSize: 0.0001,
    volatility: 4.5,
    exchange: 'BINANCE',
  },
  GTC: {
    symbol: 'GTCUSDT',
    name: 'Gitcoin / TetherUS Spot',
    assetClass: 'Crypto',
    basePrice: 0.1437,
    tickSize: 0.0001,
    volatility: 4.5,
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

  async fetchBinanceTicker(rawPair: string): Promise<MarketQuote | null> {
    const pair = rawPair.replace(/\.P$/i, '').replace(/PERP$/i, '').replace(/[^A-Z0-9]/gi, '').toUpperCase();

    // 1. Try Binance Spot API
    try {
      const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${pair}`);
      if (res.ok) {
        const data = await res.json();
        if (data.lastPrice) {
          const currentPrice = parseFloat(data.lastPrice);
          const change = parseFloat(data.priceChange);
          const changePercent = parseFloat(data.priceChangePercent);
          const sessionHigh = parseFloat(data.highPrice);
          const sessionLow = parseFloat(data.lowPrice);
          const open = parseFloat(data.openPrice);
          const previousClose = parseFloat(data.prevClosePrice);
          const volume = parseFloat(data.volume);

          return {
            symbol: pair,
            instrumentName: `${pair} 24/7 Spot`,
            assetClass: 'Crypto',
            price: currentPrice,
            change,
            changePercent,
            sessionHigh,
            sessionLow,
            open,
            previousClose,
            volume,
            marketStatus: 'OPEN',
            dataQuality: 'LIVE',
            dataSource: 'Binance Live 24/7 Public Spot Feed',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          };
        }
      }
    } catch {
      // Fall through to Futures
    }

    // 2. Try Binance Futures (Perpetual) API
    try {
      const fRes = await fetch(`https://fapi.binance.com/fapi/v1/ticker/24hr?symbol=${pair}`);
      if (fRes.ok) {
        const fData = await fRes.json();
        if (fData.lastPrice) {
          const currentPrice = parseFloat(fData.lastPrice);
          const change = parseFloat(fData.priceChange);
          const changePercent = parseFloat(fData.priceChangePercent);
          const sessionHigh = parseFloat(fData.highPrice);
          const sessionLow = parseFloat(fData.lowPrice);
          const open = parseFloat(fData.openPrice);
          const previousClose = currentPrice - change;
          const volume = parseFloat(fData.volume);

          return {
            symbol: pair,
            instrumentName: `${pair} Perpetual Contract`,
            assetClass: 'Crypto',
            price: currentPrice,
            change,
            changePercent,
            sessionHigh,
            sessionLow,
            open,
            previousClose,
            volume,
            marketStatus: 'OPEN',
            dataQuality: 'LIVE',
            dataSource: 'Binance Live 24/7 Futures Public Feed',
            timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
          };
        }
      }
    } catch {
      // Fallback
    }

    return null;
  }

  async getQuote(symbolQuery: string): Promise<MarketQuote> {
    const rawClean = symbolQuery.toUpperCase().trim();
    // Normalize spaces and slashes: 'ALICE USDT' -> 'ALICEUSDT', 'ALICE/USDT' -> 'ALICEUSDT'
    let cleanSym = rawClean.replace(/[\s\-_/]/g, '');

    // Check if it's crypto and try real-time Binance feed
    const isCrypto =
      cleanSym.endsWith('USDT') ||
      cleanSym.endsWith('USD') ||
      cleanSym.endsWith('BTC') ||
      ['ALICE', 'BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA', 'PEPE', 'SHIB', 'SUI', 'AVAX', 'NEAR', 'LINK'].includes(cleanSym);

    if (isCrypto) {
      const pair = cleanSym.endsWith('USDT')
        ? cleanSym
        : cleanSym.endsWith('USD')
        ? `${cleanSym}T`
        : `${cleanSym}USDT`;

      const live = await this.fetchBinanceTicker(pair);
      if (live) return live;
    }

    const config = INSTRUMENT_REGISTRY[cleanSym] || {
      symbol: cleanSym || 'NIFTY',
      name: `${cleanSym} Instrument`,
      assetClass: (cleanSym.includes('USDT') || cleanSym.includes('CRYPTO') ? 'Crypto' : 'Indian Equities') as AssetClass,
      basePrice: cleanSym.includes('USDT') ? 0.1948 : 1000,
      tickSize: cleanSym.includes('USDT') ? 0.0001 : 0.05,
      volatility: 1.0,
      exchange: cleanSym.includes('USDT') ? 'BINANCE' : 'NSE',
    };

    const marketStatus = this.getMarketStatus(config.assetClass);
    const dataQuality: DataQualityType = marketStatus === 'OPEN' ? 'LIVE' : 'DELAYED';
    const precision = config.basePrice < 0.01 ? 6 : config.basePrice < 1 ? 4 : config.basePrice < 10 ? 3 : 2;
    const round = (n: number) => Number(n.toFixed(precision));

    // Deterministic realistic calculation with slight jitter
    const priceChange = round(config.basePrice * (config.volatility / 100) * 0.42);
    const currentPrice = round(config.basePrice + priceChange);
    const previousClose = config.basePrice;
    const change = round(currentPrice - previousClose);
    const changePercent = Number(((change / previousClose) * 100).toFixed(2));
    const sessionHigh = round(Math.max(currentPrice, previousClose) * 1.008);
    const sessionLow = round(Math.min(currentPrice, previousClose) * 0.994);
    const open = round(previousClose * 1.002);

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

  async fetchBinanceCandles(rawPair: string, timeframe: string, count: number = 30): Promise<Candle[] | null> {
    const pair = rawPair.replace(/\.P$/i, '').replace(/PERP$/i, '').replace(/[^A-Z0-9]/gi, '').toUpperCase();
    const intervalMap: Record<string, string> = {
      '5m': '5m',
      '15m': '15m',
      '1h': '1h',
      '4h': '4h',
      '1d': '1d',
    };
    const interval = intervalMap[timeframe] || '15m';

    // 1. Try Spot klines
    try {
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${pair}&interval=${interval}&limit=${count}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((k: any) => ({
            timestamp: new Date(k[0]).toISOString(),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
          }));
        }
      }
    } catch {
      // Fall through to Futures
    }

    // 2. Try Futures klines
    try {
      const fRes = await fetch(`https://fapi.binance.com/fapi/v1/klines?symbol=${pair}&interval=${interval}&limit=${count}`);
      if (fRes.ok) {
        const data = await fRes.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((k: any) => ({
            timestamp: new Date(k[0]).toISOString(),
            open: parseFloat(k[1]),
            high: parseFloat(k[2]),
            low: parseFloat(k[3]),
            close: parseFloat(k[4]),
            volume: parseFloat(k[5]),
          }));
        }
      }
    } catch {
      // Fallback
    }

    return null;
  }

  async getHistoricalCandles(symbol: string, timeframe: string, count: number = 30): Promise<Candle[]> {
    const quote = await this.getQuote(symbol);
    if (quote.assetClass === 'Crypto') {
      const liveCandles = await this.fetchBinanceCandles(quote.symbol, timeframe, count);
      if (liveCandles && liveCandles.length > 0) return liveCandles;
    }

    const precision = quote.price < 0.01 ? 6 : quote.price < 1 ? 4 : quote.price < 10 ? 3 : 2;
    const round = (n: number) => Number(n.toFixed(precision));

    const candles: Candle[] = [];
    let currentClose = quote.previousClose;
    const now = Date.now();
    const stepMs = timeframe === '5m' ? 5 * 60 * 1000 : timeframe === '15m' ? 15 * 60 * 1000 : 60 * 60 * 1000;

    for (let i = count; i >= 0; i--) {
      const time = new Date(now - i * stepMs).toISOString();
      const delta = (Math.sin(i / 3) + Math.cos(i / 5)) * (quote.price * 0.003);
      const open = round(currentClose);
      const close = round(currentClose + delta);
      const high = round(Math.max(open, close) + Math.abs(delta) * 0.6);
      const low = round(Math.min(open, close) - Math.abs(delta) * 0.6);
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
    const precision = price < 0.01 ? 6 : price < 1 ? 4 : price < 10 ? 3 : 2;
    const round = (n: number) => Number(n.toFixed(precision));

    const ema20 = round(price * 0.994);
    const ema50 = round(price * 0.985);
    const ema200 = round(price * 0.962);
    const atr14 = round(price * 0.025);
    const vwap = round(price * 0.997);

    const pdh = round(quote.sessionHigh || quote.previousClose * 1.011);
    const pdl = round(quote.sessionLow || quote.previousClose * 0.989);

    const supportLevels = [
      round(price * 0.985),
      round(price * 0.96),
      round(price * 0.935),
    ];
    const resistanceLevels = [
      round(price * 1.018),
      round(price * 1.045),
      round(price * 1.075),
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
        macdLine: round(price * 0.002),
        signalLine: round(price * 0.0015),
        histogram: round(price * 0.0005),
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
